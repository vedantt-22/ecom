import {Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
}                              from '@angular/forms';
import { AdminService }        from '../../core/services/admin.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  products:     any[]  = [];
  taxonomyTree: any[]  = [];
  isLoading   = true;
  errorMsg    = '';
  successMsg  = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 12;
  totalProducts: number = 0;
  totalPages: number = 0;

  // Form state
  showForm    = false;
  editingId:  number | null = null;
  form!:      FormGroup;
  submitting  = false;

  // Image file selected by the user
  selectedFile: File | null = null;

  // Reference to the hidden file input element
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private adminService: AdminService,
    private fb:           FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
    this.loadTaxonomy();
  }

  initForm(): void {
    this.form = this.fb.group({
      name:          ['', [Validators.required, Validators.minLength(2)]],
      description:   ['', [Validators.required, Validators.minLength(10)]],
      price:         ['', [Validators.required, Validators.min(0.01)]],
      stock:         ['0', [Validators.required, Validators.min(0)]],
      subCategoryId: ['', Validators.required],
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.adminService.getAllProducts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.products = response.items;
        this.totalProducts = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.goToPage(page);
  }

  loadTaxonomy(): void {
    this.adminService.getTaxonomyTree().subscribe({
      next: (tree) => { this.taxonomyTree = tree; },
    });
  }

  // Flatten taxonomy tree into a list of subcategories
  // with their full path for the dropdown
  get subCategoryOptions(): any[] {
    const options: any[] = [];
    for (const type of this.taxonomyTree) {
      for (const cat of type.categories ?? []) {
        for (const sub of cat.subCategories ?? []) {
          options.push({
            id:    sub.id,
            label: `${type.name} › ${cat.name} › ${sub.name}`,
          });
        }
      }
    }
    return options;
  }

  openCreateForm(): void {
    this.editingId    = null;
    this.selectedFile = null;
    this.showForm     = true;
    this.successMsg   = '';
    this.errorMsg     = '';
    this.form.reset({ stock: '0' });
  }

  openEditForm(product: any): void {
    this.editingId    = product.id;
    this.selectedFile = null;
    this.showForm     = true;
    this.successMsg   = '';
    this.errorMsg     = '';

    this.form.patchValue({
      name:          product.name,
      description:   product.description,
      price:         product.price,
      stock:         product.stock,
      subCategoryId: product.subCategory?.id ?? '',
    });
  }

  cancelForm(): void {
    this.showForm   = false;
    this.editingId  = null;
    this.selectedFile = null;
    this.form.reset({ stock: '0' });
  }

  // Called when user selects a file
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting = false;
    this.errorMsg   = '';
    this.successMsg = '';
    this.submitting = true;

    // Build FormData — required for multipart/form-data
    // (needed because we may be uploading an image file)
    const formData = new FormData();
    formData.append('name',          this.form.value.name);
    formData.append('description',   this.form.value.description);
    formData.append('price',         this.form.value.price.toString());
    formData.append('stock',         this.form.value.stock.toString());
    formData.append('subCategoryId', this.form.value.subCategoryId.toString());

    // Only append image if a file was selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request$ = this.editingId
      ? this.adminService.updateProduct(this.editingId, formData)
      : this.adminService.createProduct(formData);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.successMsg = this.editingId
          ? 'Product updated successfully.'
          : 'Product created successfully.';
        this.cancelForm();
        this.loadProducts();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg   = err.error?.error ?? 'Failed to save product.';
      },
    });
  }

  deleteProduct(id: number, name: string): void {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.successMsg = `"${name}" deleted.`;
        this.loadProducts();
      },
      error: (err) => {
        this.errorMsg = err.error?.error ?? 'Failed to delete product.';
      },
    });
  }
}