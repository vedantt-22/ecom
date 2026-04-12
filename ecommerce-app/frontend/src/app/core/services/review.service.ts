import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reviewmodel, CreateReviewRequestmodel, ReviewSummarymodel } from '../models';

export interface ReviewsResponse {
  reviews: Reviewmodel[];
  summary: ReviewSummarymodel;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${this.apiUrl}/products/${productId}/reviews`
    );
  }

  createReview(productId: number, data: CreateReviewRequestmodel): Observable<Reviewmodel> {
    return this.http.post<Reviewmodel>(
      `${this.apiUrl}/products/${productId}/reviews`,
      data
    );
  }

  updateReview(
    productId: number,
    reviewId:  number,
    data:      CreateReviewRequestmodel
  ): Observable<Reviewmodel> {
    return this.http.put<Reviewmodel>(
      `${this.apiUrl}/products/${productId}/reviews/${reviewId}`,
      data
    );
  }

  deleteReview(productId: number, reviewId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/products/${productId}/reviews/${reviewId}`
    );
  }
}