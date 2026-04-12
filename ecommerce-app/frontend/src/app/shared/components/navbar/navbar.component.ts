import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { CartService } from '../../../core/services/cart-service';
import { Usermodel } from '../../../core/models';

@Component({
  selector:    'app-navbar',
  standalone:  true,
  imports:     [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls:   ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {

  currentUser: Usermodel | null = null;
  cartCount   = 0;

  // Track whether the mobile menu is open
  menuOpen    = false;
  private userSub!: Subscription;
  private cartSub!: Subscription;

  constructor(
    public  authService: AuthService,
    private cartService: CartService,
    private router:      Router,
  ) {}

  ngOnInit(): void {

    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;

      if (user?.role === 'customer') {
        this.cartService.loadCart().subscribe();
      }

      if (!user) {
        this.cartService.clearLocalState();
      }
    });

    this.cartSub = this.cartService.cart$.subscribe((cart) => {
      this.cartCount = cart?.itemCount ?? 0;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  // ── Auth helpers ──────────────────────────────────────────────────

  get isGuest(): boolean {
    return !this.currentUser;
  }

  get isCustomer(): boolean {
    return this.currentUser?.role === 'customer';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get userInitial(): string {
    return this.currentUser?.name?.[0]?.toUpperCase() ?? '?';
  }

  // ── Actions ───────────────────────────────────────────────────────

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.cartService.clearLocalState();
        this.menuOpen = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.cartService.clearLocalState();
        this.router.navigate(['/login']);
      },
    });
  }


  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
