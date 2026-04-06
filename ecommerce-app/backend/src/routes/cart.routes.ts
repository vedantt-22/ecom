import { Router } from "express";
import { cartController } from "../controllers/cart.controller"; // Import the instance (lowercase 'c')
import { requireAuth } from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";

const router = Router();

// Apply global middleware to all routes in this router
router.use(requireAuth);
router.use(requiredRole("customer"));

// Defining routes
router.get("/", cartController.getCart);
router.get("/count", cartController.getItemCount);
router.post("/items", cartController.addToCart); 
router.put("/items/:cartItemId", cartController.updateCartItem); 
router.delete("/items/:cartItemId", cartController.removeCartItem);
router.post("/clear", cartController.clearCart);

export default router;