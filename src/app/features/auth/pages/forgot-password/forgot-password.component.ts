import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  /** พื้นหลังรูปตึก – ใช้ path เดียวกับ login */
  readonly bgImage = 'url("assets/images/auth/building-bg.jpg")';

  email = '';
  sent = false;
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  onSubmit(): void {
    this.error = '';
    if (!this.email.trim()) {
      this.error = 'กรุณากรอกอีเมลหรือ Username';
      return;
    }
    this.loading = true;
    this.auth.requestPasswordReset({ email: this.email.trim() }).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
      },
      error: () => {
        this.sent = true;
        this.loading = false;
      },
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToReset(): void {
    this.router.navigate(['/reset-password']);
  }
}
