// header.component.ts - UPDATED: Sales-only navigation

import { Component, HostListener, OnInit, effect, input, ViewEncapsulation } from '@angular/core';
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
  // styles: [`
  //   /* ============================================
  //      INLINE STYLES - Guaranteed to work
  //      ============================================ */

  //   app-header .drop-shadow-lg {
  //     filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  //   }

  //   app-header .drop-shadow-md {
  //     filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  //   }

  //   app-header header {
  //     transition: all 0.3s ease-in-out;
  //   }

  //   app-header .scrollbar-hide {
  //     -ms-overflow-style: none;
  //     scrollbar-width: none;
  //   }

  //   app-header .scrollbar-hide::-webkit-scrollbar {
  //     display: none;
  //   }

  //   @media (max-width: 640px) {
  //     app-header .truncate {
  //       overflow: hidden;
  //       text-overflow: ellipsis;
  //       white-space: nowrap;
  //     }
  //   }

  //   /* Header nav */
  //   app-header .header-nav-item {
  //     align-items: center;
  //     color: rgb(var(--primary-foreground)) !important;
  //     cursor: pointer;
  //     display: flex;
  //     flex-direction: column;
  //     gap: 4px;
  //     min-height: 56px;
  //     justify-content: center;
  //     margin-top: 8px;
  //     min-width: 72px;
  //     max-width: 180px;
  //     padding: 8px 12px 10px;
  //     position: relative;
  //     text-align: center;
  //     transition: transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease, background 0.2s ease;
  //     user-select: none;
  //     flex-shrink: 0;
  //     border-radius: 12px;
  //     overflow: visible;
  //   }

  //   app-header .header-nav-item:hover {
  //     transform: translateY(-1px);
  //     opacity: 1;
  //     background: rgba(255, 255, 255, 0.08);
  //   }

  //   app-header .header-nav-item-active {
  //     background: rgba(255, 255, 255, 0.18) !important;
  //     border-radius: 12px;
  //     box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4), 0 2px 10px rgba(0, 0, 0, 0.12);
  //     filter: brightness(1.06);
  //   }

  //   app-header .header-nav-item:not(.header-nav-item-active) {
  //     opacity: 0.88;
  //   }

  //   app-header .header-nav-icon {
  //     align-items: center;
  //     display: inline-flex;
  //     font-size: 21px;
  //     height: 24px;
  //     justify-content: center;
  //     line-height: 1;
  //     text-align: center;
  //     transform: translateY(0.5px);
  //     width: 26px;
  //     flex-shrink: 0;
  //   }

  //   app-header .header-nav-label {
  //     font-size: 12px;
  //     font-weight: 600;
  //     letter-spacing: 0.02em;
  //     white-space: nowrap;
  //     line-height: 1.4;
  //     padding-bottom: 2px;
  //     max-width: 100%;
  //     overflow: visible;
  //     min-height: 1.4em;
  //   }

  //   app-header .header-nav-underline {
  //     bottom: 2px;
  //     height: 2px;
  //     left: 50%;
  //     position: absolute;
  //     transform: translateX(-50%);
  //     width: 24px;
  //     border-radius: 1px;
  //   }

  //   /* Bottom nav */
  //   app-header .bottom-nav {
  //     min-height: calc(72px + env(safe-area-inset-bottom, 0px));
  //     padding-left: env(safe-area-inset-left);
  //     padding-right: env(safe-area-inset-right);
  //     backdrop-filter: blur(12px);
  //     -webkit-backdrop-filter: blur(12px);
  //   }

  //   app-header .bottom-nav-item {
  //     display: flex;
  //     flex-direction: column;
  //     align-items: center;
  //     justify-content: center;
  //     gap: 4px;
  //     padding: 8px 6px 10px;
  //     min-width: 0;
  //     border-radius: 14px;
  //     color: rgb(var(--primary)) !important;
  //     opacity: 0.7;
  //     cursor: pointer;
  //     transition: opacity 0.2s ease, color 0.2s ease, background 0.2s ease, transform 0.15s ease;
  //     user-select: none;
  //     text-decoration: none;
  //     position: relative;
  //   }

  //   app-header .bottom-nav-item:hover {
  //     opacity: 1;
  //     background: rgba(var(--primary), 0.08);
  //   }

  //   app-header .bottom-nav-item:active {
  //     transform: scale(0.96);
  //   }

  //   app-header .bottom-nav-item-active {
  //     opacity: 1 !important;
  //     color: rgb(var(--primary)) !important;
  //     background: rgba(var(--primary), 0.12) !important;
  //     font-weight: 600;
  //   }

  //   app-header .bottom-nav-item-active::before {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     left: 50%;
  //     transform: translateX(-50%);
  //     width: 24px;
  //     height: 3px;
  //     border-radius: 0 0 4px 4px;
  //     background: rgb(var(--primary));
  //   }

  //   app-header .bottom-nav-item-active .bottom-nav-label {
  //     font-weight: 600;
  //     color: rgb(var(--primary)) !important;
  //   }

  //   app-header .bottom-nav-icon-wrap {
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     width: 28px;
  //     height: 28px;
  //     flex-shrink: 0;
  //   }

  //   app-header .bottom-nav-icon,
  //   app-header .bottom-nav-item i {
  //     color: inherit !important;
  //     -webkit-text-fill-color: inherit;
  //   }

  //   app-header .bottom-nav-icon {
  //     display: inline-flex;
  //     align-items: center;
  //     justify-content: center;
  //     font-size: 1.25rem;
  //     width: 24px;
  //     height: 24px;
  //     flex-shrink: 0;
  //   }

  //   app-header .bottom-nav-label {
  //     font-size: 10px;
  //     font-weight: 500;
  //     letter-spacing: 0.02em;
  //     line-height: 1.3;
  //     text-align: center;
  //     width: 100%;
  //     max-width: 68px;
  //     color: inherit !important;
  //     white-space: normal;
  //     word-break: break-word;
  //     overflow: visible;
  //     padding-bottom: 2px;
  //     min-height: 1.3em;
  //   }

  //   /* Search */
  //   app-header .usearch-root {
  //     width: 240px;
  //     position: relative;
  //   }

  //   @media (min-width: 1024px) {
  //     app-header .usearch-root {
  //       width: 300px;
  //     }
  //   }

  //   @media (min-width: 1280px) {
  //     app-header .usearch-root {
  //       width: 340px;
  //     }
  //   }

  //   app-header .usearch-bar {
  //     position: relative;
  //     display: flex;
  //     align-items: center;
  //     height: 38px;
  //     background: rgba(255, 255, 255, 0.18) !important;
  //     border: 1px solid rgba(255, 255, 255, 0.28) !important;
  //     border-radius: 10px;
  //     cursor: text;
  //     transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  //     overflow: visible;
  //   }

  //   app-header .usearch-bar:hover {
  //     background: rgba(255, 255, 255, 0.25) !important;
  //     border-color: rgba(255, 255, 255, 0.38) !important;
  //   }

  //   app-header .usearch-bar:focus-within {
  //     background: rgba(255, 255, 255, 0.28) !important;
  //     border-color: rgba(255, 255, 255, 0.5) !important;
  //     box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  //   }

  //   app-header .usearch-bar__icon {
  //     position: absolute;
  //     left: 12px;
  //     top: 50%;
  //     transform: translateY(-50%);
  //     font-size: 15px !important;
  //     color: rgba(255, 255, 255, 0.85) !important;
  //     pointer-events: none;
  //     z-index: 2;
  //     line-height: 1;
  //     display: flex !important;
  //     align-items: center;
  //     justify-content: center;
  //   }

  //   app-header .usearch-bar:focus-within .usearch-bar__icon {
  //     color: #ffffff !important;
  //   }

  //   app-header .usearch-bar__input,
  //   app-header .usearch-bar input,
  //   app-header .usearch-bar input[type="text"] {
  //     width: 100% !important;
  //     height: 100% !important;
  //     padding: 0 36px 0 38px !important;
  //     font-size: 13px !important;
  //     font-weight: 400 !important;
  //     color: #ffffff !important;
  //     background: transparent !important;
  //     background-color: transparent !important;
  //     border: none !important;
  //     outline: none !important;
  //     box-shadow: none !important;
  //     letter-spacing: 0.01em;
  //     border-radius: 10px !important;
  //   }

  //   app-header .usearch-bar__input::placeholder,
  //   app-header .usearch-bar input::placeholder {
  //     color: rgba(255, 255, 255, 0.55) !important;
  //     font-weight: 400 !important;
  //   }

  //   app-header .usearch-bar__clear {
  //     position: absolute;
  //     right: 6px;
  //     top: 50%;
  //     transform: translateY(-50%);
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     width: 24px;
  //     height: 24px;
  //     padding: 0;
  //     margin: 0;
  //     font-size: 11px;
  //     color: rgba(255, 255, 255, 0.7) !important;
  //     background: rgba(255, 255, 255, 0.15) !important;
  //     border: none;
  //     border-radius: 6px;
  //     cursor: pointer;
  //     transition: all 0.15s ease;
  //     z-index: 2;
  //   }

  //   app-header .usearch-bar__clear:hover {
  //     color: #fff !important;
  //     background: rgba(255, 255, 255, 0.28) !important;
  //   }

  //   /* Search dropdown */
  //   app-header .search-dropdown {
  //     position: absolute;
  //     top: calc(100% + 8px);
  //     left: 0;
  //     right: 0;
  //     background: white;
  //     border-radius: 12px;
  //     box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  //     max-height: 400px;
  //     overflow-y: auto;
  //     z-index: 100;
  //     animation: slideDownFade 0.2s ease-out;
  //   }

  //   @keyframes slideDownFade {
  //     from {
  //       opacity: 0;
  //       transform: translateY(-10px);
  //     }
  //     to {
  //       opacity: 1;
  //       transform: translateY(0);
  //     }
  //   }

  //   app-header .search-item {
  //     display: flex;
  //     align-items: center;
  //     gap: 12px;
  //     padding: 12px 16px;
  //     cursor: pointer;
  //     transition: background 0.15s ease;
  //     border-bottom: 1px solid #f3f4f6;
  //   }

  //   app-header .search-item:last-child {
  //     border-bottom: none;
  //   }

  //   app-header .search-item:hover {
  //     background: #f9fafb;
  //   }

  //   app-header .search-item-icon {
  //     width: 32px;
  //     height: 32px;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     background: #eff6ff;
  //     border-radius: 8px;
  //     color: #3b82f6;
  //     flex-shrink: 0;
  //   }

  //   app-header .search-item-content {
  //     flex: 1;
  //     min-width: 0;
  //   }

  //   app-header .search-item-title {
  //     font-size: 0.875rem;
  //     font-weight: 600;
  //     color: #1f2937;
  //     margin-bottom: 2px;
  //   }

  //   app-header .search-item-category {
  //     font-size: 0.75rem;
  //     color: #6b7280;
  //   }
  // `],
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
  encapsulation: ViewEncapsulation.None
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
  sales_dashboard: 'pi pi-chart-line',
  customer_management: 'pi pi-users',
  budget_management: 'pi pi-wallet',
  pipeline_management: 'pi pi-sitemap',
  activities_management: 'pi pi-calendar',
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
