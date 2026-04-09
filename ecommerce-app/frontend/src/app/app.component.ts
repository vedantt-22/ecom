import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from './core/services/cart-service';
import { AuthService } from './core/services/auth-service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Ecommerce App';

  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);
  
  ngOnInit() {
      this.authService.currentUser$.subscribe((user) => {
        if (user?.role === 'customer') {
          this.cartService.loadCart().subscribe();
        }
      });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.cartService.clearLocalState();
        this.router.navigate(['/login']);
      },
    });
  }
}
