import { Component, OnInit, HostListener } from '@angular/core';
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
export class LoginComponent implements OnInit {
  /** Background image – set in template so angular-css-resource does not resolve at build */
  readonly bgImage = 'url("assets/images/auth/building-bg.jpg")';

  username = '';
  password = '';
  companyId = '001';
  loading = false;
  error = '';

  /** ป๊อปอัพลืมรหัสผ่าน – กรอก Username + Company ตามรูป */
  showForgotModal = false;
  forgotUsername = '';
  forgotCompanyId = '001';
  forgotLoading = false;
  forgotError = '';
  forgotSent = false;

  companyOptions = [
    { label: '001 : SC', value: '001' },
    { label: '002 : Branch 2', value: '002' },
    { label: '003 : Branch 3', value: '003' },
  ];

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const state = history.state as { openForgotModal?: boolean } | undefined;
    if (state?.openForgotModal) {
      this.showForgotModal = true;
    }
    const params = this.router.parseUrl(this.router.url).queryParamMap;
    if (params.get('forgot') === '1') {
      this.showForgotModal = true;
      this.router.navigate([], { replaceUrl: true, queryParams: {} });
    }
  }

  openForgotModal(): void {
    this.showForgotModal = true;
    this.forgotUsername = '';
    this.forgotCompanyId = this.companyId;
    this.forgotError = '';
    this.forgotSent = false;
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
    this.forgotError = '';
  }

  /** ส่งคำขอลืมรหัส (Username + Company) */
  onSubmitForgot(): void {
    this.forgotError = '';
    if (!this.forgotUsername.trim()) {
      this.forgotError = 'กรุณากรอก Username';
      return;
    }
    this.forgotLoading = true;
    this.auth.requestPasswordReset({
      username: this.forgotUsername.trim(),
      companyId: this.forgotCompanyId,
    }).subscribe({
      next: () => {
        this.forgotSent = true;
        this.forgotLoading = false;
      },
      error: () => {
        this.forgotError = 'ส่งไม่สำเร็จ กรุณาลองใหม่';
        this.forgotLoading = false;
      },
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showForgotModal) this.closeForgotModal();
  }

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
