import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent implements OnInit {

  forgetForm!: FormGroup;  //The Reactive Forms Module used in Ts.
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.forgetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  OnSubmit(): void {
    this.forgetForm.markAllAsTouched();

    if(this.forgetForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { email } = this.forgetForm.value;

    this.authService.forgetPassword(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = 'Password reset code generated successfully';
        this.router.navigate(['/verify-code'], { state: { email, code: (res as any)?.code } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'Failed to send password reset link.';
      }
    });
  }
}