import { SubCategorymodel } from "./taxonomy.model";
import { Reviewmodel } from './review.model';

export interface Productmodel {
  id:           number;
  name:         string;
  description:  string;
  price:        number;
  stock:        number;
  imagePath:    string | null;
  imageUrl:     string;
  createdAt:    string;
  subCategory:  SubCategorymodel;
  averageRating?: number;
  reviewCount?:   number;
  reviews?:       Reviewmodel[];
}

export interface ProductListItemmodel {
  id:          number;
  name:        string;
  price:       number;
  stock:       number;
  imageUrl:    string;
  subCategory: SubCategorymodel;
}

export interface RecentlyViewedItemmodel {
  viewedAt: string;
  product:  ProductListItemmodel;
}