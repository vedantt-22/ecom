import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth-service';
import { environment } from '../../../environments/environment';
import { ProfileResponsemodel, Sessionmodel } from '../../core/models';

/** * Custom Validators 
 */
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  return !hasUpper || !hasLower || !hasNumber ? { passwordStrength: true } : null;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cnp = group.get('confirmPassword')?.value;
  return np && cnp && np !== cnp ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = environment.apiUrl;

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // UI State
  profileMsg = '';
  profileError = '';
  savingProfile = false;

  passwordMsg = '';
  passwordError = '';
  savingPassword = false;

  sessions: Sessionmodel[] = [];
  loadingSessions = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    const user = this.authService.currentUser;

    this.profileForm = this.fb.group({
      name: [user?.name ?? '', [Validators.required, Validators.minLength(2)]],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  // Getters for easy template access
  get pf() { return this.profileForm.controls; }
  get pwf() { return this.passwordForm.controls; }

  /**
   * Data Loading
   */
  loadSessions(): void {
    this.loadingSessions = true;
    this.http.get<ProfileResponsemodel>(`${this.apiUrl}/profile`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.sessions = res.sessions ?? [];
          this.loadingSessions = false;
        },
        error: (err: Error) => {
          // err.message is already formatted by your Global Interceptor
          this.profileError = err.message;
          this.loadingSessions = false;
        },
      });
  }

  /**
   * Profile Update
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile = true;
    this.profileMsg = '';
    this.profileError = '';

    this.http.put<{ user: any }>(`${this.apiUrl}/profile`, this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.savingProfile = false;
          this.profileMsg = 'Profile updated successfully.';
          // Update the global auth state through the service
          this.authService.updateLocalUser(res.user);
        },
        error: (err: Error) => {
          this.savingProfile = false;
          this.profileError = err.message; 
        },
      });
  }

  /**
   * Password Change
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword = true;
    this.passwordMsg = '';
    this.passwordError = '';

    this.http.put(`${this.apiUrl}/profile/change-password`, this.passwordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.savingPassword = false;
          this.passwordMsg = 'Password changed successfully.';
          this.passwordForm.reset();
          this.loadSessions();
        },
        error: (err: Error) => {
          this.savingPassword = false;
          this.passwordError = err.message;
        },
      });
  }

  /**
   * Session Management
   */
  terminateSession(jti: string): void {
    this.http.post(`${this.apiUrl}/auth/logout/${jti}`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadSessions(),
        error: (err: Error) => alert(err.message),
      });
  }
}