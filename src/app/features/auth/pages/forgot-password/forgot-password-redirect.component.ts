import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Redirect /forgot-password → /login และเปิดป๊อปอัพลืมรหัสผ่าน
 */
@Component({
  selector: 'app-forgot-password-redirect',
  standalone: true,
  template: `<div class="auth-page"><div class="auth-bg"></div></div>`,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .auth-bg { min-height: 100vh; background: #081420; }
  `],
})
export class ForgotPasswordRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/login'], {
      replaceUrl: true,
      state: { openForgotModal: true },
    });
  }
}
