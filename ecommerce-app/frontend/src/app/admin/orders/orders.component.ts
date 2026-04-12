

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { AdminService }      from '../../core/services/admin.service';

@Component({
  selector: 'app-orders',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

  orders:     any[]  = [];
  isLoading = true;
  errorMsg  = '';
  successMsg = '';

  // Track which order is expanded for detail view
  expandedOrderId: number | null = null;
  expandedOrder:   any           = null;
  loadingDetail  = false;

  // Track which order's status is being updated
  updatingStatusId: number | null = null;

  readonly statuses = [
    'pending', 'processing', 'shipped', 'delivered', 'cancelled',
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders    = orders;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  toggleOrder(orderId: number): void {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
      this.expandedOrder   = null;
      return;
    }

    this.expandedOrderId = orderId;
    this.loadingDetail   = true;

    this.adminService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.expandedOrder = order;
        this.loadingDetail = false;
      },
      error: () => { this.loadingDetail = false; },
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.updatingStatusId = orderId;
    this.errorMsg         = '';
    this.successMsg       = '';

    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: (res: any) => {
        this.updatingStatusId = null;
        this.successMsg       = res.message;
        this.loadOrders();

        if (this.expandedOrderId === orderId) {
          this.expandedOrder.status = status;
        }
      },
      error: (err: any) => {
        this.updatingStatusId = null;
        this.errorMsg = err.error?.error ?? 'Failed to update status.';
      },
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending:    '#f0ad4e',
      processing: '#5bc0de',
      shipped:    '#337ab7',
      delivered:  '#5cb85c',
      cancelled:  '#d9534f',
    };
    return colors[status] ?? '#888';
  }

  formatPaymentMethod(method: string): string {
    const labels: Record<string, string> = {
      credit_card:      'Credit Card',
      debit_card:       'Debit Card',
      cash_on_delivery: 'Cash on Delivery',
      bank_transfer:    'Bank Transfer',
    };
    return labels[method] ?? method;
  }
}