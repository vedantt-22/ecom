import { Component, OnInit } from '@angular/core'; // Added OnInit
import { ProductService } from '../../core/services/product-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ProductTaxonomyPipe } from '../../core/pipes/product-taxonomy.pipe';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [
    FormsModule, 
    CommonModule,
    ProductTaxonomyPipe,
    RouterModule,
    ProductCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit { 

  featuredProducts: any[] = [];
  taxonomy: any[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService, 
    private router: Router
  ) {}  

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadTaxonomyTree();
  }

  loadFeaturedProducts(): void {
    this.productService.search({
      pageSize: 12, 
      sortBy: 'createdAt', 
      sortOrder: 'DESC'
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.featuredProducts = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.isLoading = false;
      }
    });
  }

  loadTaxonomyTree(): void {
    this.productService.getTaxonomyTree().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.taxonomy = res;
      },
      error: (err) => console.error('Failed to load taxonomy', err)
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) return;
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm } });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}