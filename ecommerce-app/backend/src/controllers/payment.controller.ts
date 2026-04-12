import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { asyncHandler } from "../middleware/error.middleware";

export class PaymentController {
  getPaymentForOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const orderId = Number(req.params.orderId);
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "admin";

    const data = await paymentService.getPaymentForOrder(orderId, userId, isAdmin);
    res.status(200).json(data);
  });

  getCustomerPayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = await paymentService.getCustomerPayments(userId);
    res.status(200).json(data);
  });

  updatePaymentStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "status is required." });
      return;
    }

    const data = await paymentService.updatePaymentStatus(orderId, status);
    res.status(200).json(data);
  });
}

export const paymentController = new PaymentController();