import { Injectable, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // Signal to hold the active primary item name (e.g., 'service')
  private activePrimaryNavItem = signal<string>('service'); // Default to 'service'

  // Signal to hold the active sub-route URL
  private activeSubRoute = signal<string>('');
  private sidebarIsExpanded = signal<boolean>(true); // Default to true (expanded)

  // Public computed signal for components to read the active item
  public readonly activePrimaryItem = this.activePrimaryNavItem.asReadonly();

  // Public computed signal for components to read the active sub-route
  public readonly activeSubRouteItem = this.activeSubRoute.asReadonly();

// Public access to state
    public readonly isSidebarExpanded = this.sidebarIsExpanded.asReadonly();


  constructor(private router: Router) {
    // Listen to router events to automatically update the active sub-route
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activeSubRoute.set(event.urlAfterRedirects);
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
