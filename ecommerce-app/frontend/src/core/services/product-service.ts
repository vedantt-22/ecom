// src/app/core/services/product.service.ts

import { Injectable }  from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id:          number;
  name:        string;
  description: string;
  price:       number;
  stock:       number;
  imageUrl:    string;
  subCategory: {
    id:   number;
    name: string;
    category: {
      id:   number;
      name: string;
      type: { id: number; name: string };
    };
  };
}

export interface SearchParams {
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

export interface SearchResult {
  data:       Product[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  search(params: SearchParams): Observable<SearchResult> {
    let httpParams = new HttpParams();

    if (params.q)             httpParams = httpParams.set('q', params.q);
    if (params.typeId)        httpParams = httpParams.set('typeId', params.typeId.toString());
    if (params.categoryId)    httpParams = httpParams.set('categoryId', params.categoryId.toString());
    if (params.subCategoryId) httpParams = httpParams.set('subCategoryId', params.subCategoryId.toString());
    if (params.minPrice)      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice)      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.inStock)       httpParams = httpParams.set('inStock', 'true');
    if (params.sortBy)        httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder)     httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.page)          httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize)      httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<SearchResult>(`${this.apiUrl}/search`, { params: httpParams });
  }

  getTaxonomyTree(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taxonomy/tree`);
  }
}