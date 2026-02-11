// header.component.ts - UPDATED: Sales-only navigation

import { Component, HostListener, OnInit, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

import { NAVIGATION_CONTENT } from '@core/data/content';
import { NavigationSecondary } from '@core/models/navigation.model';
import { UserService } from '@core/services/user.service';
import { LanguageService } from '@core/services/language.service';
import { SearchService } from '@core/services/search.service';
import { Language } from '@core/models/language.model';
import { HEADER_TEXTS, HeaderTexts } from '@assets/language/header.text';
import { NAVIGATION_TEXTS } from '@assets/language/navigation.text';

import { NavigationService } from '@core/services/navigation.service';
import { HeaderService } from '@core/services/header.service';
import { getLabelOverride } from '@core/services/ui-settings';

// ✅ Searchable items - ONLY Sales + Settings
interface SearchableItem {
  id: string;
  title: string;
  route: string;
  category: string;
  module: 'sales' | 'setting';
}

const SEARCHABLE_ITEMS: SearchableItem[] = [
  // Sales items
  { id: 's1', title: 'Sales Dashboard', route: '/sales/dashboard', category: 'Sales', module: 'sales' },
  { id: 's2', title: 'Customer Management', route: '/sales/customer', category: 'Sales', module: 'sales' },
  { id: 's3', title: 'Budget Management', route: '/sales/budget', category: 'Sales', module: 'sales' },
  { id: 's4', title: 'Pipeline Management', route: '/sales/pipeline', category: 'Sales', module: 'sales' },
  { id: 's5', title: 'Activities Management', route: '/sales/activities', category: 'Sales', module: 'sales' },

  // Settings items
  { id: 'set1', title: 'User Accounts', route: '/setting/user-accounts/data', category: 'Settings', module: 'setting' },
  { id: 'set2', title: 'Roles Management', route: '/setting/user-accounts/roles', category: 'Settings', module: 'setting' },
  { id: 'set3', title: 'Company Data', route: '/setting/company/data', category: 'Settings', module: 'setting' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 100, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ height: '0', opacity: 100, overflow: 'hidden' })
        ),
      ]),
    ]),
    trigger('slideDownSmall', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 100 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 100 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-50px)', opacity: 100 })
        ),
      ]),
    ]),
    trigger('slideDownSmallFaded', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-20px)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  isMobile = input<boolean>(false);

  // ✅ NEW: Navigation data - ONLY Sales secondary items
  navigationItems: NavigationSecondary[] =
    NAVIGATION_CONTENT
      .find(item => item.primary_content === 'sales')
      ?.secondary_content || [];

  activeRoute: string = '';

  navIconMap: Record<string, string> = {
    // Sales icons
    dashboard: 'pi pi-chart-line',
    customer: 'pi pi-users',
    budget: 'pi pi-wallet',
    pipeline: 'pi pi-sitemap',
    activities: 'pi pi-calendar',
  };

  // UI state
  isScrolled: boolean = false;
  isLanguageDropdownOpen: boolean = false;
  isProfileDropdownOpen: boolean = false;

  // User data
  username: string = 'User';
  userInitials: string = 'U';
  hasProfilePicture: boolean = false;
  profilePictureUrl: string | null = null;

  // Language data
  availableLanguages: Language[] = [];
  currentLanguage: Language;

  // Search
  searchQuery: string = '';
  searchResults: SearchableItem[] = [];
  showSearchResults: boolean = false;

  // Texts for multi-language support
  texts: HeaderTexts;

  constructor(
    private userService: UserService,
    private languageService: LanguageService,
    private searchService: SearchService,
    private navigationService: NavigationService,
    private headerService: HeaderService,
    private router: Router
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.texts = HEADER_TEXTS[this.currentLanguage.code];

    // ✅ Watch for route changes to update active state
    effect(() => {
      this.activeRoute = this.router.url;
    });

    effect(() => {
      this.isScrolled = this.headerService.isScrolled();
    });
  }

  ngOnInit(): void {
    // Load user data
    this.username = this.userService.getUsername();
    this.hasProfilePicture = this.userService.hasProfilePicture();
    this.profilePictureUrl = this.userService.getProfilePicture();
    this.userInitials = this.getUserInitials(this.username);

    // Load language data
    this.availableLanguages = this.languageService.getAvailableLanguages();

    // Set initial active route
    this.activeRoute = this.router.url;
  }

  getUserInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  /**
   * ✅ NEW: Direct navigation - no sidebar logic
   */
  setActiveMenuItem(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * ✅ REMOVED: No more home button
   */
  // onHomeClick(): void { ... }

  /**
   * ✅ REMOVED: No more sidebar toggle
   */
  // toggleSidebar(): void { ... }

  /**
   * ✅ NEW: Check if route is active
   */
  isRouteActive(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }

  /**
   * ✅ NEW: Get icon for navigation item
   */
  getNavIcon(itemName: string): string {
    return this.navIconMap[itemName] || 'pi pi-circle';
  }

  /**
   * ✅ UPDATED: Search with filtered items (Sales + Settings only)
   */
  onSearchGlobal(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.searchResults = SEARCHABLE_ITEMS.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
    this.showSearchResults = true;
  }

  clearSearchSimple(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

// header.component.ts - Fix search result selection

selectSearchResult(item: SearchableItem, event?: Event): void {
  // ✅ Stop event propagation
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  console.log('🔍 Navigating to:', item.route); // Debug log

  // Clear search first
  this.clearSearchSimple();

  // Navigate after a short delay to ensure dropdown closes
  setTimeout(() => {
    this.router.navigate([item.route]);
  }, 50);
}

  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    if (this.isLanguageDropdownOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isProfileDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }

  selectLanguage(language: Language): void {
    this.languageService.setLanguage(language.code);
    this.currentLanguage = language;
    this.texts = HEADER_TEXTS[language.code];
    this.isLanguageDropdownOpen = false;
  }

  translateNav(key: string): string {
    const override = getLabelOverride(key);
    if (override) {
      return override;
    }
    return NAVIGATION_TEXTS[this.currentLanguage.code][key] || key;
  }

  goToSettings(): void {
    this.router.navigate(['/setting/user-accounts/data']);
    this.isProfileDropdownOpen = false;
  }

  logout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.language-dropdown') &&
      !target.closest('.profile-dropdown') &&
      !target.closest('.usearch-root')
    ) {
      this.isLanguageDropdownOpen = false;
      this.isProfileDropdownOpen = false;
      this.showSearchResults = false;
    }
  }
}
