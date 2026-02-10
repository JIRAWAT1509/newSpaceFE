// src/app/core/services/bookmark.service.ts
import { Injectable, signal } from '@angular/core';
import { NavigationSecondary } from '@core/models/navigation.model';

const BOOKMARK_STORAGE_KEY = 'space_bookmarks';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  // Signal เก็บรายการ bookmarks
  bookmarks = signal<NavigationSecondary[]>([]);

  constructor() {
    this.loadBookmarksFromStorage();
  }

  /**
   * โหลด bookmarks จาก localStorage
   */
  private loadBookmarksFromStorage(): void {
    try {
      const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.bookmarks.set(parsed);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      this.bookmarks.set([]);
    }
  }

  /**
   * บันทึก bookmarks ลง localStorage
   */
  private saveBookmarksToStorage(): void {
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(this.bookmarks()));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }

  /**
   * เพิ่ม bookmark
   */
  addBookmark(item: NavigationSecondary): void {
    const current = this.bookmarks();

    // เช็คว่ามีอยู่แล้วหรือไม่
    const exists = current.some(b => b.route === item.route);
    if (exists) return;

    // เพิ่มเข้าไป
    const newBookmark = {
      ...item,
      isBookmark: true
    };

    this.bookmarks.set([...current, newBookmark]);
    this.saveBookmarksToStorage();
  }

  /**
   * ลบ bookmark
   */
  removeBookmark(route: string): void {
    const current = this.bookmarks();
    const filtered = current.filter(b => b.route !== route);
    this.bookmarks.set(filtered);
    this.saveBookmarksToStorage();
  }

  /**
   * เช็คว่า route นี้ถูก bookmark หรือไม่
   */
  isBookmarked(route?: string): boolean {
    if (!route) return false;
    return this.bookmarks().some(b => b.route === route);
  }

  /**
   * Toggle bookmark
   */
  toggleBookmark(item: NavigationSecondary): void {
    if (this.isBookmarked(item.route)) {
      this.removeBookmark(item.route!);
    } else {
      this.addBookmark(item);
    }
  }

  /**
   * ล้าง bookmarks ทั้งหมด
   */
  clearAllBookmarks(): void {
    this.bookmarks.set([]);
    localStorage.removeItem(BOOKMARK_STORAGE_KEY);
  }
}
