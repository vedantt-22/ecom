import { Productmodel } from "./product.model";
export interface ProductTypemodel {
  id:         number;
  name:       string;
  categories?: Categorymodel[];
}

export interface Categorymodel {
  id:             number;
  name:           string;
  type?:          ProductTypemodel;
  subCategories?: SubCategorymodel[];
}

export interface SubCategorymodel {
  id:       number;
  name:     string;
  category?: Categorymodel;
  products?: Productmodel[];
}
