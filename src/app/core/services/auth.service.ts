// auth.service.ts – Mock auth (ยังไม่เชื่อม API จริง) – เปลี่ยนเป็น HTTP ได้เมื่อพร้อม
import { Injectable, signal } from '@angular/core';
import { Observable, of, tap, delay } from 'rxjs';
import type { LoginPayload, AuthResponse, ForgotPasswordPayload } from '@core/models/auth.model';

const STORAGE_KEY = 'space_auth_mock';
const MOCK_DELAY_MS = 500;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = signal<boolean>(false);

  readonly isLoggedIn = this.loggedIn.asReadonly();

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.loggedIn.set(stored === 'true');
    } catch {
      this.loggedIn.set(false);
    }
  }

  /**
   * Login – mock: รับอะไรก็ถือว่าผ่าน
   * เมื่อมี API จริง: เปลี่ยนเป็น this.http.post<AuthResponse>(`${AUTH_BASE}/login`, payload).pipe(...)
   */
  login(payload: LoginPayload): Observable<AuthResponse> {
    const mockRes: AuthResponse = {
      accessToken: 'mock-token',
      user: { username: payload.email, displayName: payload.email, email: payload.email },
    };
    return of(mockRes).pipe(
      delay(MOCK_DELAY_MS),
      tap((res) => {
        this.loggedIn.set(true);
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
          if (res.user) {
            localStorage.setItem('space_user_mock', JSON.stringify(res.user));
          }
        } catch {}
      })
    );
  }

  /**
   * Request password reset – mock: ส่งอีเมลอะไรก็ถือว่าสำเร็จ
   * เมื่อมี API จริง: เปลี่ยนเป็น this.http.post<void>(`${AUTH_BASE}/forgot-password`, payload).pipe(...)
   */
  requestPasswordReset(_payload: ForgotPasswordPayload): Observable<void> {
    return of(undefined).pipe(delay(MOCK_DELAY_MS));
  }

  /** Legacy sync login สำหรับหน้า login เดิม */
  loginLegacy(username: string, password: string, _companyId: string): boolean {
    this.login({ email: username, password }).subscribe({
      next: () => {},
      error: () => {
        this.loggedIn.set(true);
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
          localStorage.setItem('space_user_mock', JSON.stringify({ username, displayName: username }));
        } catch {}
      },
    });
    return true;
  }

  logout(): void {
    this.loggedIn.set(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('space_user_mock');
    } catch {}
  }

  getMockUser(): { username: string; displayName: string } {
    try {
      const raw = localStorage.getItem('space_user_mock');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) return { username: parsed.username, displayName: parsed.displayName || parsed.username };
      }
    } catch {}
    return { username: 'admin', displayName: 'Admin' };
  }
}
