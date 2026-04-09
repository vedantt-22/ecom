import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { Product } from "../entities/Product";
import { CartItem } from "../entities/CartItem";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";

const VALID_PAYMENT_METHODS = ["credit_card", "debit_card", "pay_on_delivery", "bank_transfer"] as const;
type PaymentMethods = typeof VALID_PAYMENT_METHODS[number];

const cartRepo = () => AppDataSource.getRepository(Cart);
const orderRepo = () => AppDataSource.getRepository(Order);

function formatOrder(order: Order) {
    return {
        id: order.id,
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
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

    async checkout(userId: number, paymentMethod: PaymentMethods) {
        // Fix 1: Properly check includes (cast to string to avoid TS errors)
        if (!VALID_PAYMENT_METHODS.includes(paymentMethod as any)) {
            return { success: false, statusCode: 400, message: "Invalid payment method" };
        }

        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
        });

        if (!cart) {
            return { success: false, statusCode: 404, message: "Cart not found" };
        }

        if (cart.items.length === 0) {
            return { success: false, statusCode: 400, message: "Your cart is empty." };
        }

        // Fix 2: Validation Loop - item.product check was accessing .id on null
        for (const item of cart.items) {
            if (!item.product) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "One or more products in your cart no longer exist.",
                };
            }
            if (item.quantity > item.product.stock) {
                return {
                    success: false,
                    statusCode: 409,
                    message: `Not enough stock for "${item.product.name}". Available: ${item.product.stock}`,
                };
            }
        }

        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0);

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = queryRunner.manager.create(Order, {
                user: { id: userId },
                totalAmount,
                paymentMethod,
            });

            const savedOrder = await queryRunner.manager.save(order);

            for (const item of cart.items) {
                const orderItem = queryRunner.manager.create(OrderItem, {
                    order: savedOrder,
                    product: { id: item.product.id },
                    quantity: item.quantity,
                    priceAtPurchase: item.product.price,
                });
                await queryRunner.manager.save(OrderItem, orderItem);

                // Fix 3: Atomic stock update (Prevent negative stock)
                await queryRunner.manager.createQueryBuilder()
                    .update(Product)
                    .set({ stock: () => `stock - ${item.quantity}` })
                    .where("id = :id AND stock >= :qty", { id: item.product.id, qty: item.quantity })
                    .execute();
            }

            await queryRunner.manager.delete(CartItem, { cart: { id: cart.id } });

            await queryRunner.commitTransaction();

            const completeOrder = await orderRepo().findOne({
                where: { id: savedOrder.id },
                relations: ["items", "items.product"],
            });

            return {
                success: true,
                statusCode: 201,
                data: formatOrder(completeOrder!),
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Checkout failed:", error);
            return { success: false, statusCode: 500, message: "An error occurred during checkout." };
        } finally {
            await queryRunner.release();
        }
    }

    async getMyOrders(userId: number) {
        const orders = await orderRepo().find({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
            order: { createdAt: "DESC" },
        });
        return { success: true, statusCode: 200, data: orders.map(formatOrder) };
    }

    async getOrderById(userId: number, orderId: number, isAdmin: boolean) {
        // Fix 4: If admin, don't restrict the 'where' clause by userId
        const order = await orderRepo().findOne({
            where: isAdmin ? { id: orderId } : { id: orderId, user: { id: userId } },
            relations: ["items", "items.product", "user"],
        });

        if (!order) {
            return { success: false, statusCode: 404, message: "Order not found" };
        }

        return {
            success: true,
            statusCode: 200,
            data: {
                ...formatOrder(order),
                user: isAdmin ? { id: order.user?.id, name: order.user?.name } : undefined
            },
        };
    }

    getAllOrders = async (isAdmin: boolean) => {
        if (!isAdmin) {
            return { success: false, statusCode: 403, message: "Forbidden" };
        }

        const orders = await orderRepo().find({
            relations: ["items", "items.product", "user"],
            order: { createdAt: "DESC" },
        });

        return {
            success: true,
            statusCode: 200,
            data: orders.map((order) => ({
                ...formatOrder(order),
                user: {
                    id: order.user?.id,
                    name: order.user?.name,
                    email: order.user?.email,
                }
            })),
        };
    }
}

export const orderService = new OrderService();