// src/routes/order.routes.ts

import { Router }          from "express";
import { orderController } from "../controllers/order.controller";
import { requireAuth }     from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";

const router = Router();

// ── Customer routes ───────────────────────────────────────────
// POST /api/orders/checkout    → place an order
// GET  /api/orders/my          → customer's own order history
// GET  /api/orders/:id         → one specific order

router.post("/checkout",
  requireAuth,
  requiredRole("customer"), orderController.checkout);

router.get("/my",
  requireAuth,
  requiredRole("customer"), orderController.getMyOrders);

// ── Shared route — both customer and admin can access ─────────
// Customer: can only see their own order (service enforces this)
// Admin: can see any order

router.get("/:id",
  requireAuth,
  requiredRole("customer", "admin"), orderController.getOrderById);

// ── Admin-only routes ─────────────────────────────────────────
// GET /api/orders → all orders from all customers

router.get("/",
  requireAuth,
  requiredRole("admin"), orderController.getAllOrders);

export default router;