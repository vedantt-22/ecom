import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent implements OnInit {
  email = '';
  code = '';
  codeShown = false;
  isLoading = false;
  errorMsg = '';

  constructor(private router: Router, private authService: AuthService) { 
  const navigation = this.router.getCurrentNavigation();
  this.email = navigation?.extras?.state?.['email'] || '';
  this.code = navigation?.extras?.state?.['code'] || '';
  }

  ngOnInit(): void {
    if(!this.email) {
      this.router.navigate(['/forget-password']);
      return;
    }

    if(this.code) {
      this.codeShown = true;
    }
  }

  showCode(): void {
    if (this.code) {
      this.codeShown = true;
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.getResetCode(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.code = res.code;
        this.codeShown = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'Failed to retrieve reset code.';
      },
    });
  }

  proceedToResest(): void {
    this.router.navigate(['/reset-password'], { state: { email: this.email, code: this.code } });
  }
}
