import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usermodel, ProfileResponsemodel, ResetPasswordPayload } from '../models';

type RegisterRequest = Pick<Usermodel, 'name' | 'email'> & { password: string };
type LoginRequest = Pick<Usermodel, 'name'> & { password: string };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private currentUserSubject = new BehaviorSubject<Usermodel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkSession();
  }

  // --- Getters ---
  get currentUser(): Usermodel | null {
    return this.currentUserSubject.value;
  }

  get isCustomer(): boolean {
    return this.currentUser?.role === 'customer';
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // --- State Checks ---
  hasRole(role: Usermodel['role']): boolean {
    return this.currentUser?.role === role;
  }

  // --- Auth Actions ---

  private checkSession(): void {
    this.http.get<ProfileResponsemodel>(`${this.apiUrl}/profile`)
      .subscribe({
        next: (res) => this.currentUserSubject.next(res.user),
        error: () => this.currentUserSubject.next(null),
      });
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/register`, data);
  }

  login(credentials: LoginRequest): Observable<{ user: Usermodel }> {
    return this.http
      .post<{ user: Usermodel }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => this.currentUserSubject.next(res.user))
      );
  }

  updateLocalUser(updatedData: Partial<Usermodel>): void {
    const current = this.currentUser;
    if (current) {
      const updatedUser = { ...current, ...updatedData };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => this.currentUserSubject.next(null))
      );
  }

  // --- Password Logic ---

  forgetPassword(email: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forget-password`, { email });
  }

  resetPassword(data: ResetPasswordPayload): Observable<void> {
  return this.http.post<void>(`${this.apiUrl}/auth/reset-password`, data);
  }

  getResetCode(email: string): Observable<{ code: string }> {
  return this.http.post<{ code: string }>(`${this.apiUrl}/auth/get-reset-code`, { email });
  }
}