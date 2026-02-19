import { Injectable, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // Signal to hold the active primary item name (e.g., 'service')
  private activePrimaryNavItem = signal<string>('dashboard'); // Default to 'service'

  // Signal to hold the active sub-route URL
  private activeSubRoute = signal<string>('');
  private sidebarIsExpanded = signal<boolean>(true); // Default to true (expanded)

  // Public computed signal for components to read the active item
  public readonly activePrimaryItem = this.activePrimaryNavItem.asReadonly();

  // Public computed signal for components to read the active sub-route
  public readonly activeSubRouteItem = this.activeSubRoute.asReadonly();

// Public access to state
    public readonly isSidebarExpanded = this.sidebarIsExpanded.asReadonly();


  /** Map URL path segment to primary nav (sidebar ต้องแสดงเมนูให้ตรงกับหน้าที่อยู่) */
  private getPrimaryFromUrl(url: string): string | null {
    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const first = segments[0] || '';
    const segmentToPrimary: Record<string, string> = {
      setting: 'setting',
      sales: 'sales',
      area: 'area',
      contract: 'contract',
      collection: 'collection_finance',
      finance: 'collection_finance',
      facilities: 'facilities',
      reports: 'report_dashboard',
      dashboard: 'dashboard',
    };
    return segmentToPrimary[first] ?? null;
  }

  constructor(private router: Router) {
    // Sync active sub-route AND primary nav from URL (แก้ปัญหาเมนูซ้ายหายเมื่อเข้าโดยตรง/รีเฟรช)
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.activeSubRoute.set(url);
      const primary = this.getPrimaryFromUrl(url);
      if (primary) {
        this.activePrimaryNavItem.set(primary);
      }
    });
  }

  /**
   * Called by the HeaderComponent to set the new active primary navigation item.
   * @param itemName - The name of the primary item, e.g., 'area', 'contract'.
   */
  setActivePrimaryNavItem(itemName: string): void {
    this.activePrimaryNavItem.set(itemName);
  }

  // NEW: Method to toggle the sidebar state
  toggleSidebar(): void {
    this.sidebarIsExpanded.update(value => !value);
  }

  // NEW: Method to explicitly set the sidebar state
  setSidebarExpanded(isExpanded: boolean): void {
    this.sidebarIsExpanded.set(isExpanded);
  }

}
