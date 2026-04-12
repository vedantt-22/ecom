import { Router }           from "express";
import { reviewController } from "../controllers/review.controller";
import { requireAuth }      from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";

const router = Router({ mergeParams: true });

// mergeParams: true lets us access :productId from the parent router

// Public — anyone can read reviews
router.get("/", reviewController.getProductReviews);

// Authenticated customers can create reviews
router.post("/", requireAuth, requiredRole("customer"), reviewController.createReview);

// Update and delete require auth
router.put("/:reviewId", requireAuth, reviewController.updateReview);

router.delete("/:reviewId", requireAuth, reviewController.deleteReview );

export default router;