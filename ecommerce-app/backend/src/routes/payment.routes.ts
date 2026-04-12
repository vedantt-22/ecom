import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { requiredRole } from "../middleware/rbac.middleware";

const router = Router();

// Customer: view payment for their order
router.get("/order/:orderId", requireAuth, paymentController.getPaymentForOrder);

// Customer: view all their payments
router.get("/my", requireAuth, requiredRole("customer"), paymentController.getCustomerPayments);

// Admin: update payment status
router.patch("/order/:orderId/status", requireAuth,  requiredRole("admin"), paymentController.updatePaymentStatus);

export default router;