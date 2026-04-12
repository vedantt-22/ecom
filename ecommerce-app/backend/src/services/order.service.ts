import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { Product } from "../entities/Product";
import { CartItem } from "../entities/CartItem";
import { Order, PaymentMethod } from "../entities/Order"; 
import { OrderItem } from "../entities/OrderItem";
import { paymentService } from "./payment.service";
import { Address } from "../entities/Address";

const cartRepo = () => AppDataSource.getRepository(Cart);
const orderRepo = () => AppDataSource.getRepository(Order);
const addressRepo = () => AppDataSource.getRepository(Address);

// Standardized formatter to include address details
function formatOrder(order: Order) {
    return {
        id: order.id,
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress ? {
            label: order.shippingAddress.label,
            fullName: order.shippingAddress.fullName,
            city: order.shippingAddress.city,
            addressLine1: order.shippingAddress.addressLine1
        } : null,
        items: (order.items || []).map(item => ({
            id: item.id,
            quantity: item.quantity,
            priceAtPurchase: Number(item.priceAtPurchase),
            lineTotal: Number(item.priceAtPurchase) * item.quantity,
            product: {
                id: item.product?.id,
                name: item.product?.name,
                imageUrl: item.product?.imagePath ? `/images/${item.product.imagePath}` : "/images/placeholder.png",
            }
        })),
    };
}

export class OrderService {

    async checkout(userId: number, paymentMethod: string, shippingAddressId: number) {
        // 1. Validate Address ownership
        const address = await addressRepo().findOne({
            where: { id: shippingAddressId, userId }
        });

        if (!address) {
            return { success: false, statusCode: 400, message: "Please select a valid shipping address." };
        }

        // 2. Load Cart with items and products
        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
        });

        if (!cart || cart.items.length === 0) {
            return { success: false, statusCode: 400, message: "Your cart is empty." };
        }

        // 3. Stock Validation
        for (const item of cart.items) {
            if (!item.product) {
                return { success: false, statusCode: 400, message: "One or more products no longer exist." };
            }
            if (item.quantity > item.product.stock) {
                return { 
                    success: false, 
                    statusCode: 409, 
                    message: `Not enough stock for "${item.product.name}".` 
                };
            }
        }

        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0);

        // 4. Database Transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create the Order
            const order = queryRunner.manager.create(Order, {
                userId, // Using the explicit userId column we added earlier
                totalAmount,
                paymentMethod: paymentMethod as PaymentMethod,
                shippingAddress: address, // Link to the Address entity
            });

            const savedOrder = await queryRunner.manager.save(Order, order);

            // Create OrderItems and Update Stock
            for (const item of cart.items) {
                const orderItem = queryRunner.manager.create(OrderItem, {
                    order: savedOrder,
                    product: { id: item.product.id },
                    quantity: item.quantity,
                    priceAtPurchase: item.product.price,
                });
                await queryRunner.manager.save(OrderItem, orderItem);

                // Atomic stock decrement
                await queryRunner.manager.createQueryBuilder()
                    .update(Product)
                    .set({ stock: () => `stock - ${item.quantity}` })
                    .where("id = :id AND stock >= :qty", { id: item.product.id, qty: item.quantity })
                    .execute();
            }

            // Clear Cart
            await queryRunner.manager.delete(CartItem, { cart: { id: cart.id } });

            await queryRunner.commitTransaction();

            // 5. Create Payment Record (After successful order commitment)
            await paymentService.createPaymentRecord(
                savedOrder.id,
                totalAmount,
                paymentMethod
            );

            // Fetch final order with all relations for the response
            const completeOrder = await orderRepo().findOne({
                where: { id: savedOrder.id },
                relations: ["items", "items.product", "shippingAddress"],
            });

            return {
                success: true,
                statusCode: 201,
                data: formatOrder(completeOrder!),
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Checkout failed:", error);
            return { success: false, statusCode: 500, message: "Checkout failed. Please try again." };
        } finally {
            await queryRunner.release();
        }
    }
}

export const orderService = new OrderService();