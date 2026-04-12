import { Request, Response } from "express";
import { reviewService } from "../services/review.service";
import { asyncHandler } from "../middleware/error.middleware";

export class ReviewController {

  getProductReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = Number(req.params.productId);
    const data      = await reviewService.getProductReviews(productId);
    res.status(200).json(data);
  });

  createReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId       = Number(req.params.productId);
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      res.status(400).json({ error: "Rating and comment are required." });
      return;
    }

    const data = await reviewService.createReview(
      req.user!.id,
      productId,
      Number(rating),
      comment,
    );

    res.status(201).json(data);
  });

  updateReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { rating, comment } = req.body;
    const data = await reviewService.updateReview(
      req.user!.id,
      Number(req.params.reviewId),
      Number(rating),
      comment,
    );
    res.status(200).json(data);
  });

  deleteReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.role === "admin";
    await reviewService.deleteReview(
      req.user!.id,
      Number(req.params.reviewId),
      isAdmin,
    );
    res.status(200).json({ message: "Review deleted." });
  });
}

export const reviewController = new ReviewController();