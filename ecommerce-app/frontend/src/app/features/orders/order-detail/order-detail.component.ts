import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order-service';
import { Ordermodel } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: Ordermodel | null = null;
  isLoading = true;
  errorMsg = '';
  isConfirmation = false;
  
  // Track subscription for cleanup
  private sub: Subscription | null = null;

  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private router = inject(Router);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { isConfirmation?: boolean, order?: Ordermodel };

    if (state?.isConfirmation && state.order) {
      this.isConfirmation = true;
      this.order = state.order;
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
    const placed = this.route.snapshot.queryParamMap.get('placed');
    if (placed === '1') {
      this.isConfirmation = true;
    }

    // If we already have the order from navigation state, don't API call
    if (this.order) return;

    const orderId = Number(this.route.snapshot.params['id']);
    if (!orderId || isNaN(orderId)) {
      this.errorMsg = 'Invalid Order ID.';
      this.isLoading = false;
      return;
    }
    this.loadOrder(orderId);
  }

  loadOrder(orderId: number): void {
  this.sub = this.orderService.getOrderById(orderId).subscribe({
    next: (orderData: Ordermodel) => {
      // Direct assignment because the service already extracted 'data'
      this.order = orderData; 
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Order load error:', err);
      this.errorMsg = 'Order not found or access denied.';
      this.isLoading = false;
    }
  });
}

  // order-detail.component.ts

formatPaymentMethod(method: Ordermodel['paymentMethod'] | undefined | string): string {
  if (!method) return 'N/A';
  
  const labels: Record<string, string> = {
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'cash_on_delivery': 'Cash on Delivery',
    'bank_transfer': 'Bank Transfer',
  };
  return labels[method as string] ?? method;
}

  getStatusColor(status: string | undefined): string {
    const colors: Record<string, string> = {
      'pending': '#f39c12',
      'processing': '#3498db',
      'shipped': '#9b59b6',
      'delivered': '#2ecc71',
      'cancelled': '#e74c3c',
    };
    return colors[status || ''] ?? '#95a5a6';
  }

  // Helper for the template to calculate line totals safely
  calculateLineTotal(price: number, qty: number): number {
    return price * qty;
  }

  printInvoice() {
  window.print();
}
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}