import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product-service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { 
  ProductListItemmodel, 
  ProductTypemodel, 
  SearchResultmodel, 
  SearchParamsmodel 
} from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    ProductCardComponent, 
    PaginationComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: ProductListItemmodel[] = [];
  taxonomyTree: ProductTypemodel[] = [];
  isLoading = true;
  errorMsg = '';

  // Filter & Pagination State 
  searchQuery = '';
  selectedTypeId?: number;
  selectedCategoryId?: number;
  selectedSubCategoryId?: number; 
  minPrice?: number;              
  maxPrice?: number;              
  inStockOnly = false;            
  sortBy = 'createdAt';           
  sortOrder: 'ASC' | 'DESC' = 'DESC'; 
  
  currentPage = 1;
  totalPages = 1;                 
  pageSize = 12;                  
  total = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getTaxonomyTree()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tree) => this.taxonomyTree = tree,
        error: () => console.error('Failed to load taxonomy')
      });

    this.route.queryParams.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMsg = '';
      }),
      switchMap((params: Params) => {
        this.syncParamsToState(params);
        return this.productService.search(this.getSearchPayload());
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result: SearchResultmodel) => {
        this.products = result.data;
        this.total = result.total;
        this.totalPages = result.totalPages;
        this.pageSize = result.pageSize;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load products.';
        this.isLoading = false;
      }
    });
  }

  private syncParamsToState(params: Params): void {
    this.searchQuery = params['q'] ?? '';
    this.selectedTypeId = params['typeId'] ? Number(params['typeId']) : undefined;
    this.selectedCategoryId = params['categoryId'] ? Number(params['categoryId']) : undefined;
    this.selectedSubCategoryId = params['subCategoryId'] ? Number(params['subCategoryId']) : undefined;
    this.minPrice = params['minPrice'] ? Number(params['minPrice']) : undefined;
    this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : undefined;
    this.inStockOnly = params['inStock'] === 'true';
    this.sortBy = params['sortBy'] ?? 'createdAt';
    this.sortOrder = (params['sortOrder'] as 'ASC' | 'DESC') ?? 'DESC';
    this.currentPage = params['page'] ? Number(params['page']) : 1;
  }

  private getSearchPayload(): SearchParamsmodel {
    return {
      q: this.searchQuery || undefined,
      typeId: this.selectedTypeId || undefined,
      categoryId: this.selectedCategoryId || undefined,
      subCategoryId: this.selectedSubCategoryId || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      inStock: this.inStockOnly || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: this.currentPage,
      pageSize: this.pageSize,

    };
  }

  onFilterChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery || null,
        typeId: this.selectedTypeId || null,
        categoryId: this.selectedCategoryId || null,
        subCategoryId: this.selectedSubCategoryId || null,
        minPrice: this.minPrice || null,
        maxPrice: this.maxPrice || null,
        inStock: this.inStockOnly || null,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        page: null // Reset to page 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onSearch(): void {
    this.onFilterChange();
  }

  clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {} 
    });
  }

  get filteredCategories(): any[] {
    if (!this.selectedTypeId) return [];
    return this.taxonomyTree.find(t => t.id === this.selectedTypeId)?.categories ?? [];
  }

  get filteredSubCategories(): any[] {
    if (!this.selectedCategoryId) return [];
    return this.filteredCategories.find(c => c.id === this.selectedCategoryId)?.subCategories ?? [];
  }
  
  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedTypeId || this.selectedCategoryId || this.minPrice || this.maxPrice || this.inStockOnly);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}