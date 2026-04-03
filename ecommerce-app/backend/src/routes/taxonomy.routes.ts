import { Router } from "express";
import { TaxonomyController } from "../controllers/taxonomy.controller";
import { requiredRole } from "../middleware/rbac.middleware";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();

// ── Public read routes ────────────────────────────────────────
// These are accessed by Guests, Customers, and Admins alike.
// No authentication required — anyone can browse the store.
router.get("/tree", TaxonomyController.getFullTree);

// ProductTypes
router.get("/types", TaxonomyController.getAllTypes);
router.get("/types/:id", TaxonomyController.getTypesWithCategories);

// Categories
router.get("/categories", TaxonomyController.getAllCategories);
router.get("/categories/:id", TaxonomyController.getCategoriesWithSubCategories);

// SubCategories
router.get("/subcategories", TaxonomyController.getAllSubCategories);
router.get("/subcategories/:id", TaxonomyController.getSubCategoryWithProducts);

// ── Admin-only write routes ───────────────────────────────────
// requireAuth runs first — confirms the user is logged in.
// requireRole("admin") runs second — confirms they are admin.
// If either fails, the controller method never runs.


// Product Type Routes (Admin Only)
router.post("/types", requireAuth, requiredRole("admin"), TaxonomyController.createType);
router.put("/types/:id", requireAuth, requiredRole("admin"), TaxonomyController.updateType);
router.delete("/types/:id", requireAuth, requiredRole("admin"), TaxonomyController.deleteType);

// Category Routes
router.post("/categories", requireAuth, requiredRole("admin"), TaxonomyController.createCategory);
router.put("/categories/:id", requireAuth, requiredRole("admin"), TaxonomyController.updateCategory);
router.delete("/categories/:id", requireAuth, requiredRole("admin"), TaxonomyController.deleteCategory);

// Subcategory Routes
router.post("/subcategories", requireAuth, requiredRole("admin"), TaxonomyController.createSubCategory);
router.put("/subcategories/:id", requireAuth, requiredRole("admin"), TaxonomyController.updateSubCategory);
router.delete("/subcategories/:id", requireAuth, requiredRole("admin"), TaxonomyController.deleteSubCategory);

export default router;