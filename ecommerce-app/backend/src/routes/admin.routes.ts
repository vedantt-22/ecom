// src/routes/admin.routes.ts
//
// CRITICAL SECURITY NOTE:
// router.use(requireAuth, requireRole("admin")) at the top
// applies BOTH middleware to every single route in this file.
// It is physically impossible to add a new route here and
// forget to protect it — the router-level middleware catches
// everything automatically.
//
// This is why admin routes are in their own file — one line
// of protection covers the entire surface area.

import { Router }          from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAuth }     from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";
import { upload }          from "../utils/multer.config";

const router = Router();

// ── Apply auth + admin role to ALL routes in this file ────────
// Any request that does not pass both checks never reaches
// any handler below this line.
router.use(requireAuth, requiredRole("admin"));

// ── Dashboard ─────────────────────────────────────────────────
router.get("/dashboard", adminController.getDashboardStats);

// ── Customer Management ───────────────────────────────────────
router.get("/customers", adminController.getAllCustomers);

router.get("/customers/:id", adminController.getCustomerById);

// PATCH is semantically correct for partial updates.
// We are only changing isLocked — not replacing the whole user.
// PUT would imply replacing the entire resource.
router.patch("/customers/:id/lock", adminController.lockCustomer);

router.patch("/customers/:id/unlock", adminController.unlockCustomer);


// ── Order Management ──────────────────────────────────────────
router.get("/orders", adminController.getAllOrders);


router.get("/orders/:id", adminController.getOrderById);
// ── Product Management ────────────────────────────────────────
// These are admin-specific product endpoints.
// The public product endpoints (GET /api/products) still exist
// and are accessible to everyone. These admin endpoints sit
// under /api/admin/products for clear separation of concerns.

router.get("/products", adminController.adminGetAllProducts);


router.get("/products/:id", adminController.adminGetProductById);

router.post("/products",
  upload.single("image"), adminController.adminCreateProduct);

router.put("/products/:id",
  upload.single("image"), adminController.adminUpdateProduct);

router.delete("/products/:id", adminController.adminDeleteProduct);

router.patch("/orders/:id/status", adminController.updateOrderStatus);
export default router;