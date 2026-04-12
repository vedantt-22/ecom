import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { Product } from "../entities/Product";
import { CartItem } from "../entities/CartItem";
import { Order, PaymentMethod } from "../entities/Order"; 
import { OrderItem } from "../entities/OrderItem";
import { paymentService } from "./payment.service";
import { Address } from "../entities/Address";
import path from "path";

const cartRepo = () => AppDataSource.getRepository(Cart);
const orderRepo = () => AppDataSource.getRepository(Order);
const addressRepo = () => AppDataSource.getRepository(Address);

function buildImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return "";

    const normalized = imagePath.trim();
    if (!normalized) return "";

    if (
        /^https?:\/\//i.test(normalized) ||
        normalized.startsWith("/images/") ||
        normalized.startsWith("data:image/")
    ) {
        return normalized;
    }

    return `/images/${path.basename(normalized)}`;
}

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
                imageUrl: buildImageUrl(item.product?.imagePath),
            }
        })),
    };
}

export class OrderService {

    async checkout(userId: number, paymentMethod: string, shippingAddressId?: number) {
        let address: Address | null = null;

        // 1. Resolve shipping address:
        //    - use provided id when present
        //    - otherwise fall back to default address, then first saved address
        if (shippingAddressId != null) {
            address = await addressRepo().findOne({
                where: { id: shippingAddressId, userId }
            });

            if (!address) {
                return { success: false, statusCode: 400, message: "Please select a valid shipping address." };
            }
        } else {
            address = await addressRepo().findOne({
                where: { userId, isDefault: true }
            });

            if (!address) {
                address = await addressRepo().findOne({
                    where: { userId },
                    order: { id: "ASC" },
                });
            }

            if (!address) {
                return { success: false, statusCode: 400, message: "Please add a shipping address before checkout." };
            }
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

    async getMyOrders(userId: number) {
        const orders = await orderRepo().find({
            where: { userId },
            relations: ["items", "items.product", "shippingAddress"],
            order: { createdAt: "DESC" },
        });

        return {
            success: true,
            statusCode: 200,
            data: orders.map(formatOrder),
        };
    }

    async getOrderById(userId: number, orderId: number, isAdmin: boolean) {
        const order = await orderRepo().findOne({
            where: { id: orderId },
            relations: ["items", "items.product", "shippingAddress", "user"],
        });

        if (!order) {
            return { success: false, statusCode: 404, message: "Order not found." };
        }

        if (!isAdmin && order.userId !== userId) {
            return { success: false, statusCode: 403, message: "Access denied for this order." };
        }

        return {
            success: true,
            statusCode: 200,
            data: formatOrder(order),
        };
    }

    async getAllOrders(isAdmin: boolean) {
        if (!isAdmin) {
            return { success: false, statusCode: 403, message: "Admin access required." };
        }

        const orders = await orderRepo().find({
            relations: ["items", "items.product", "shippingAddress", "user"],
            order: { createdAt: "DESC" },
        });

        return {
            success: true,
            statusCode: 200,
            data: orders.map((order) => ({
                ...formatOrder(order),
                user: order.user
                    ? {
                        id: order.user.id,
                        name: order.user.name,
                        email: order.user.email,
                    }
                    : null,
            })),
        };
    }
}

export const orderService = new OrderService();