import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalstorageService {

  // Method to set data in local storage
  setItem(key: string, value: string, force: boolean = false): void {
    // if (this.ccService.hasConsented() || force) {
    localStorage.setItem(key, value);
    // } else {
    //   console.warn(`Consent not given. Cannot set ${key} in local storage.`);
    // }
  }

  // Method to get data from local storage
  getItem(key: string): string | null {
    // if (this.ccService.hasConsented()) {
      return localStorage.getItem(key);
    // } else {
    //   console.warn(`Consent not given. Cannot access ${key} in local storage.`);
    //   return null;
    // }
  }

  // Method to remove data from local storage
  removeItem(key: string): void {
    // if (this.ccService.hasConsented()) {
    localStorage.removeItem(key);
    // } else {
    //   console.warn(`Consent not given. Cannot remove ${key} from local storage.`);
    // }
  }

  clearStorage(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
