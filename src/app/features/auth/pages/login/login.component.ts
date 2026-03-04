import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  /** Background image – set in template so angular-css-resource does not resolve at build */
  readonly bgImage = 'url("assets/images/auth/building-bg.jpg")';

  username = '';
  password = '';
  companyId = '001';
  loading = false;
  error = '';

  companyOptions = [
    { label: '001 : SC', value: '001' },
    { label: '002 : Branch 2', value: '002' },
    { label: '003 : Branch 3', value: '003' },
  ];

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  onSubmit(): void {
    this.error = '';
    if (!this.username.trim()) {
      this.error = 'กรุณากรอก Username';
      return;
    }
    if (!this.password) {
      this.error = 'กรุณากรอก Password';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.auth.loginLegacy(this.username.trim(), this.password, this.companyId);
      this.loading = false;
      this.router.navigate(['/dashboard/overview']);
    }, 600);
  }
}
