import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { AdminService }      from '../../core/services/admin.service';

@Component({
  selector: 'app-customers',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers:  any[]  = [];
  isLoading = true;
  errorMsg  = '';
  successMsg = '';

  // Track which customer's action is loading
  processingId: number | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.adminService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  lockCustomer(customer: any): void {
    const action = customer.isLocked ? 'unlock' : 'lock';
    if (!confirm(`${action === 'lock' ? 'Lock' : 'Unlock'} account for ${customer.name}?`)) return;

    this.processingId = customer.id;
    this.errorMsg     = '';
    this.successMsg   = '';

    const request$ = customer.isLocked
      ? this.adminService.unlockCustomer(customer.id)
      : this.adminService.lockCustomer(customer.id);

    request$.subscribe({
      next: (res: any) => {
        this.processingId = null;
        this.successMsg   = res.message;
        this.loadCustomers();
      },
      error: (err: any) => {
        this.processingId = null;
        this.errorMsg     = err.error?.error ?? 'Action failed.';
      },
    });
  }
}
