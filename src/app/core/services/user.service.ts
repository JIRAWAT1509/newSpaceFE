import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  username?: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Using Angular signals for reactive state
  private userProfile = signal<UserProfile | null>(null);

  constructor() {
    // You can load user data from localStorage or session storage here
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    // Try to load user from storage
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
      try {
        this.userProfile.set(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user profile:', e);
      }
    }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile();
  }

  getUsername(): string {
    const profile = this.userProfile();
    return profile?.username || 'User';
  }

  getProfilePicture(): string | null {
    const profile = this.userProfile();
    return profile?.profilePicture || null;
  }

  hasProfilePicture(): boolean {
    return !!this.getProfilePicture();
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile.set(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  clearUserProfile(): void {
    this.userProfile.set(null);
    localStorage.removeItem('userProfile');
  }
}
