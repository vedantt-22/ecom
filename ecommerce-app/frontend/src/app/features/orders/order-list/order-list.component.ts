import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink }        from '@angular/router';
import { OrderService } from '../../../core/services/order-service';

@Component({
  selector:    'app-order-list',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrls:   ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {

  orders:     any[]  = [];
  isLoading = true;
  errorMsg  = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders    = orders;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg  = 'Failed to load orders.';
        this.isLoading = false;
      },
    });
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
}