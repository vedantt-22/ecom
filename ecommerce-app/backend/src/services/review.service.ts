import { AppDataSource } from "../data-source";
import { Review } from "../entities/Review";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import { validateInput } from "../utils/validation";

const reviewRepo = () => AppDataSource.getRepository(Review);
const orderRepo = () => AppDataSource.getRepository(Order);
const productRepo = () => AppDataSource.getRepository(Product);

export class ReviewService {

  async getProductReviews(productId: number) {
    const reviews = await reviewRepo().find({
      where: { productId },
      order: { createdAt: "DESC" },
      relations: ["user"],
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerifiedPurchase: true,
        createdAt: true,
        user: { id: true, name: true },
      },
    });

    const total = reviews.length;
    let sumRating = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((r) => {
      sumRating += r.rating;
      const rate = r.rating as keyof typeof distribution;
      if (distribution[rate] !== undefined) distribution[rate]++;
    });

    return {
      reviews,
      summary: {
        averageRating: total > 0 ? Math.round((sumRating / total) * 10) / 10 : 0,
        reviewCount: total,
        distribution,
      },
    };
  }

  async createReview(userId: number, productId: number, rating: number, comment: string) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error("Rating must be a whole number between 1 and 5.");
    }

    if (!comment || comment.trim().length < 10) {
      throw new Error("Review comment must be at least 10 characters.");
    }

    const product = await productRepo().findOne({ where: { id: productId } });
    if (!product) throw new Error("Product not found.");

    const existing = await reviewRepo().findOne({ where: { userId, productId } });
    if (existing) {
      throw new Error("SQLITE_CONSTRAINT: You have already reviewed this product.");
    }

    const verifiedOrder = await orderRepo()
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .where("order.userId = :userId", { userId })
      .andWhere("item.productId = :productId", { productId })
      .andWhere("order.status = 'delivered'")
      .getOne();

    const review = reviewRepo().create({
      userId,
      productId,
      rating,
      comment: validateInput(comment),
      isVerifiedPurchase: !!verifiedOrder,
    });

    return reviewRepo().save(review);
  }

  async updateReview(userId: number, reviewId: number, rating: number, comment: string) {
    const review = await reviewRepo().findOne({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found.");

    // Logic error check
    if (review.userId !== userId) {
      throw new Error("Unauthorized: You can only edit your own reviews.");
    }

    review.rating = rating;
    review.comment = validateInput(comment);

    return reviewRepo().save(review);
  }

  async deleteReview(userId: number, reviewId: number, isAdmin: boolean) {
    const review = await reviewRepo().findOne({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found.");

    if (!isAdmin && review.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own reviews.");
    }
    await reviewRepo().remove(review);
  }
}

export const reviewService = new ReviewService();