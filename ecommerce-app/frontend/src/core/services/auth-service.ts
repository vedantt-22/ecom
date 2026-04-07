import { Injectable }          from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id:    number;
  name:  string;
  email: string;
  role:  'customer' | 'admin';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public  currentUser$       = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  get isCustomer(): boolean {
    return this.currentUserSubject.value?.role === 'customer';
  }

  private checkSession(): void {
    this.http
      .get<{ user: User }>(`${this.apiUrl}/profile`)
      .subscribe({
        next: (res) => {
          this.currentUserSubject.next(res.user);
        },
        error: () => {
          this.currentUserSubject.next(null);
        },
      });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      name, email, password,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<{ user: User }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.currentUserSubject.next(res.user);
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          // Clear the local user state regardless of server response
          this.currentUserSubject.next(null);
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  getResetCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/get-reset-code`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, {
      email, code, newPassword,
    });
  }
}