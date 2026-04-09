import { ProductListItemmodel } from "./product.model";

export interface SearchParamsmodel {
  q?:             string;
  typeId?:        number;
  categoryId?:    number;
  subCategoryId?: number;
  minPrice?:      number;
  maxPrice?:      number;
  inStock?:       boolean;
  sortBy?:        string;
  sortOrder?:     'ASC' | 'DESC';
  page?:          number;
  pageSize?:      number;
}

export interface SearchResultmodel {
  data:       ProductListItemmodel[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

export interface AutocompleteResultmodel {
  suggestions: Array<{ id: number; name: string }>;
}