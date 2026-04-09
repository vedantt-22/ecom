export interface Reviewmodel {
  id:        number;
  rating:    number;        // 1-5
  comment:   string;
  createdAt: string;
  user: {
    id:   number;
    name: string;
  };
  isVerifiedPurchase: boolean;
}

export interface CreateReviewRequestmodel {
  rating:  number;
  comment: string;
}

export interface ReviewSummarymodel {
  averageRating: number;
  reviewCount:   number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}