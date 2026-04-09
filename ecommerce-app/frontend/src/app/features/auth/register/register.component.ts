import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

/** Custom Validator: Password Strength **/
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]+/.test(value);

  if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecialChar) {
    return { passwordStrength: true };
  }
  return null;
}

/** Custom Validator: Password Match **/
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword && confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true, // Assuming standalone based on previous context
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMsg = '';
  
  // Storage for backend validation errors (e.g., { email: "Email already exists" })
  backendErrors: Record<string, string> = {};

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.backendErrors = {};

    const { name, email, password } = this.registerForm.value;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login'], {
          state: { message: 'Registration successful! Please login to continue.' }
        });
      },
      error: (err) => {
        this.isLoading = false;
        
        // Handle backend validation errors
        if (err.error?.errors) {
          this.backendErrors = err.error.errors;
        } else {
          this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
        }
        console.error('Registration error detail:', err);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
        if (control?.touched && control.errors) {
      if (control.errors['required']) return `${fieldName} is required.`;
      if (control.errors['email']) return 'Invalid email format.';
      if (control.errors['minlength']) return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters.`;
      if (control.errors['passwordStrength']) return 'Password must contain uppercase, lowercase, number, and special character.';
    }

    if (fieldName === 'confirmPassword' && this.registerForm.touched) {
      if (this.registerForm.errors?.['passwordMismatch']) return 'Passwords do not match.';
    }

    return this.backendErrors[fieldName] || '';
  }
}