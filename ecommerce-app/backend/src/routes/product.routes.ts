// src/routes/product.routes.ts

import { Router }            from "express";
import { productController } from "../controllers/product.controller";
import { requireAuth }       from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";
import { upload }            from "../utils/multer.config";

const router = Router();

// ── Public read routes ────────────────────────────────────────

router.get("/", productController.getAllProducts);


router.get("/:id", productController.getProductById);


router.get("/subcategory/:subCategoryId", productController.getProductsBySubCategory);

// ── Admin-only write routes ───────────────────────────────────
// upload.single("image") is Multer middleware.
// "image" must match the field name Angular uses
// when sending the FormData — <input type="file" name="image">
// It runs before the controller, saves the file to disk,
// and puts file info on req.file.

router.post("/", requireAuth, requiredRole("admin"), upload.single("image"), productController.createProduct);

router.put("/:id", requireAuth, requiredRole("admin"), upload.single("image"), productController.updateProduct);

router.delete("/:id", requireAuth, requiredRole("admin"), productController.deleteProduct);
export default router;