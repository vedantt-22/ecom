import { AppDataSource } from "../data-source";
import { Payment, PaymentStatus } from "../entities/Payment";
import { Order } from "../entities/Order";
import { v4 as uuidv4 } from "uuid";

const paymentRepo = () => AppDataSource.getRepository(Payment);
const orderRepo = () => AppDataSource.getRepository(Order);

export class PaymentService {
  async createPaymentRecord(orderId: number, amount: number, method: string) {
    const payment = paymentRepo().create({
      orderId,
      amount,
      method,
      transactionId: `TXN-${uuidv4().substring(0, 12).toUpperCase()}`,
      // Logical check: cash_on_delivery or bank_transfer usually start as pending
      status: (method === "cash_on_delivery" || method === "bank_transfer") 
        ? "pending" 
        : "completed",
    });

    return paymentRepo().save(payment);
  }

  async getPaymentForOrder(orderId: number, userId: number, isAdmin: boolean) {
    const order = await orderRepo().findOne({ where: { id: orderId } });

    if (!order) throw new Error("Order not found.");

    if (!isAdmin && order.userId !== userId) {
      throw new Error("Access denied.");
    }

    const payment = await paymentRepo().findOne({ where: { orderId } });
    if (!payment) throw new Error("Payment record not found.");

    return payment;
  }

  async updatePaymentStatus(orderId: number, newStatus: PaymentStatus) {
    const validStatuses: PaymentStatus[] = [
      "pending", "processing", "completed", "failed", "refunded",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid payment status.");
    }

    const payment = await paymentRepo().findOne({ where: { orderId } });
    if (!payment) throw new Error("Payment not found.");

    payment.status = newStatus;
    return paymentRepo().save(payment);
  }

  async getCustomerPayments(userId: number) {
    return paymentRepo()
      .createQueryBuilder("payment")
      .innerJoin("payment.order", "order")
      .where("order.userId = :userId", { userId })
      .orderBy("payment.createdAt", "DESC")
      .getMany();
  }
}

export const paymentService = new PaymentService();