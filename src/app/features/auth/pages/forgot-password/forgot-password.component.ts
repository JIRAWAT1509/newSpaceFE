import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email = '';
  sent = false;
  loading = false;
  error = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    this.error = '';
    if (!this.email.trim()) {
      this.error = 'กรุณากรอกอีเมลหรือ Username';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.sent = true;
      this.loading = false;
    }, 800);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToReset(): void {
    this.router.navigate(['/reset-password']);
  }
}
