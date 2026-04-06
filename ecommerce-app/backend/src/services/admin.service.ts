import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { OrderStatus } from "../entities/Order";
import { sessionStore } from "../store/sessionStore";

const userRepo = () => AppDataSource.getRepository(User);
const orderRepo = () => AppDataSource.getRepository(Order);


const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export class AdminService {

    async getAllCustomers() {
        const users = await userRepo().find({ where: { role: "customer" } , select: ["id", "name", "email", "isLocked", "createdAt"], order: { createdAt: "DESC" } });

        const data = users.map((user) => ({
            ...user,
            activeSessions: sessionStore.getForUser(user.id),
        }));

        return {success: true, statusCode: 200, data};
    }

    async getCustomerById(userId: number) {
        const user = await userRepo().findOne({ where: { id: userId, role: "customer" }, select: ["id", "name", "email", "isLocked", "createdAt"] });

        if (!user) {
            return { success: false, statusCode: 404, message: "Customer not found" };
        }

        return { success: true, statusCode: 200, data: { ...user, activeSessions: sessionStore.getForUser(user.id) }, };
    }

    async lockCustomer(userId: number, adminId: number) {
        if(userId === adminId) {
            return { success: false, statusCode: 400, message: "You cannot lock your own account" };
        }

        const user = await userRepo().findOne({ where: { id: userId, role: "customer" } });

        if (!user) {
            return { success: false, statusCode: 404, message: "Customer not found" };
        }

        if (user.isLocked) {
            return { success: false, statusCode: 400, message: "Customer account is already locked" };
        }

        user.isLocked = true;
        await userRepo().save(user);

        sessionStore.deleteAllForUser(userId);

        return { success: true, statusCode: 200, message: "Customer locked successfully" };
    }

    async unlockCustomer(userId: number, adminId: number) {
        if(userId === adminId) {
            return { success: false, statusCode: 400, message: "You cannot unlock your own account" };
        }

        const user = await userRepo().findOne({ where: { id: userId, role: "customer" } });

        if (!user) {
            return { success: false, statusCode: 404, message: "Customer not found" };
        }

        if (!user.isLocked) {
            return { success: false, statusCode: 400, message: "Customer account is not locked" };
        }
        user.isLocked = false;
        await userRepo().save(user);

        sessionStore.deleteAllForUser(userId);

        return { success: true, statusCode: 200, message: "Customer unlocked successfully" };
    }


    async updateOrderStatus(orderId: number, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return {
      success:    false,
      statusCode: 400,
      message:    `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`,
    };
  }

  const order = await orderRepo().findOne({
    where: { id: orderId },
  });

  if (!order) {
    return {
      success:    false,
      statusCode: 404,
      message:    "Order not found.",
    };
  }

  // Business rule: cannot un-cancel an order
  if (order.status === "cancelled" && status !== "cancelled") {
    return {
      success:    false,
      statusCode: 409,
      message:    "Cannot change status of a cancelled order.",
    };
  }

  order.status = status as OrderStatus;
  await orderRepo().save(order);

  return {
    success:    true,
    statusCode: 200,
    message:    `Order status updated to "${status}".`,
    data:       { id: order.id, status: order.status },
  };
}

    async getAllOrders() {
        const orders = await orderRepo().find({ relations: ["user", "items", "items.product"], order: { createdAt: "DESC" } });

        const data = orders.map((order) => ({
            id: order.id,
            user: { id: order.user.id, name: order.user.name, email: order.user.email },
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            itemCount: order.items.length,
        }));

        return { success: true, statusCode: 200, data };
    }

    async getOrderById(orderId: number) {
        const order = await orderRepo().findOne({ where: { id: orderId }, relations: ["user", "items", "items.product"] });

        if (!order) {
            return { success: false, statusCode: 404, message: "Order not found" };
        }

        return {
      success:    true,
      statusCode: 200,
      data: {
        id:            order.id,
        totalAmount:   Number(order.totalAmount),
        paymentMethod: order.paymentMethod,
        createdAt:     order.createdAt,
        customer: {
          id:    order.user.id,
          name:  order.user.name,
          email: order.user.email,
        },
        items: order.items.map((item) => ({
          id:              item.id,
          quantity:        item.quantity,
          priceAtPurchase: Number(item.priceAtPurchase),
          lineTotal:       Number(item.priceAtPurchase) * item.quantity,
          product: item.product ? {
            id:   item.product.id,
            name: item.product.name,
          } : null,
        })),
      },
    };
}

    async getDashboardStats() {
        const userRepo_ = userRepo();
        const orderRepo_ = orderRepo();

        const[totalCustomers, totalOrders, lockedCustomers] = await Promise.all([
            userRepo_.count({ where: { role: "customer" } }),
            orderRepo_.count(),
            userRepo_.count({ where: { role: "customer", isLocked: true } }),
        ]);

        const activeSessions = sessionStore.size;

        return {
            success: true,
            statusCode: 200,
            data: {
                totalCustomers,
                totalOrders,
                lockedCustomers,
                activeSessions
            },
        };
    }
}

export const adminService = new AdminService();