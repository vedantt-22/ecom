import { Router }          from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAuth }     from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";
import { upload }          from "../utils/multer.config";

const router = Router();

router.use(requireAuth, requiredRole("admin"));

// ── Dashboard ─────────────────────────────────────────────────
router.get("/dashboard", adminController.getDashboardStats);

// ── Customer Management ───────────────────────────────────────
router.get("/customers", adminController.getAllCustomers);

router.get("/customers/:id", adminController.getCustomerById);

router.patch("/customers/:id/lock", adminController.lockCustomer);

router.patch("/customers/:id/unlock", adminController.unlockCustomer);


// ── Order Management ──────────────────────────────────────────
router.get("/orders", adminController.getAllOrders);


router.get("/orders/:id", adminController.getOrderById);

router.get("/products", adminController.adminGetAllProducts);


router.get("/products/:id", adminController.adminGetProductById);

router.post("/products",
  upload.single("image"), adminController.adminCreateProduct);

router.put("/products/:id",
  upload.single("image"), adminController.adminUpdateProduct);

router.delete("/products/:id", adminController.adminDeleteProduct);

router.patch("/orders/:id/status", adminController.updateOrderStatus);
export default router;