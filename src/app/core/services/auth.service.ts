// auth.service.ts - Mock authentication (ยังไม่เชื่อม API จริง)
import { Injectable, signal } from '@angular/core';

const MOCK_USER = { username: 'admin', displayName: 'Admin' };
const STORAGE_KEY = 'space_auth_mock';

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

  login(_username: string, _password: string, _companyId: string): boolean {
    // Mock: รับค่าอะไรก็ได้ แล้วถือว่าผ่าน
    this.loggedIn.set(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem('space_user_mock', JSON.stringify({ ...MOCK_USER, username: _username }));
    } catch {}
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
    return MOCK_USER;
  }
}
