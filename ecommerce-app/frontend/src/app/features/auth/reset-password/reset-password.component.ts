import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { AbstractControl, ValidationErrors, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if(!value) return null;

  const hasUpperCase = /[A-Z]+/.test(value);
  const hasLowerCase = /[a-z]+/.test(value);
  const hasNumeric = /[0-9]+/.test(value);

  if (!hasUpperCase || !hasLowerCase || !hasNumeric) {
    return { passwordStrength: true };
  }

  return null;
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword && confirmPassword && password) {
    return { passwordMismatch: true };
  }

  return null;

}


@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  resetForm!: FormGroup;
  email = '';
  code = '';
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'] || '';
    this.code = navigation?.extras?.state?.['code'] || '';
  }

  ngOnInit(): void {
    if(!this.email || !this.code) {
      this.router.navigate(['/forget-password']);
      return;
    }

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    this.resetForm.markAllAsTouched();

    if(this.resetForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { newPassword } = this.resetForm.value;

    this.authService.resetPassword({ email: this.email, code: this.code, newPassword }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'Password reset successfully.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Failed to reset password.';
      }
    });
  }

}
