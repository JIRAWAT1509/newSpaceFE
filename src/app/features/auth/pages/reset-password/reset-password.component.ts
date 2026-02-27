import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PasswordModule, ButtonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  password = '';
  confirmPassword = '';
  done = false;
  loading = false;
  error = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    this.error = '';
    if (!this.password) {
      this.error = 'กรุณากรอกรหัสผ่านใหม่';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.done = true;
      this.loading = false;
    }, 700);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
