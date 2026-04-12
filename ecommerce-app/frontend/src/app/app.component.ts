import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CartService } from './core/services/cart-service';
import { AuthService } from './core/services/auth-service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule, 
    RouterOutlet, 
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Ecommerce App';

  // Dependencies
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); 

  ngOnInit() {
    this.authService.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef), 
        filter(user => user?.role === 'customer'), 
        switchMap(() => this.cartService.loadCart()) 
      )
      .subscribe({
        error: (err) => console.error('Failed to sync cart:', err)
      });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.cartService.clearLocalState();
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }
}