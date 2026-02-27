// header.component.ts - UPDATED with logo navigation

import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  effect,
  input,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

import { NAVIGATION_CONTENT } from '@core/data/content';
import { NavigationItem } from '@core/models/navigation.model';
import { UserService } from '@core/services/user.service';
import { LanguageService } from '@core/services/language.service';
import { SearchService } from '@core/services/search.service';
import { Language } from '@core/models/language.model';
import { HEADER_TEXTS, HeaderTexts } from '@assets/language/header.text';
import { NAVIGATION_TEXTS } from '@assets/language/navigation.text';

import { NavigationService } from '@core/services/navigation.service';
import { HeaderService } from '@core/services/header.service';
import { getLabelOverride } from '@core/services/ui-settings';

import { TranslatorService } from '@/app/core/services/settings/translator.service';
import { TranslateParser, TranslatePipe } from '@ngx-translate/core';

import { ApprovalNotificationService } from '@core/services/approval-notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export interface SearchResultItem {
  title: string;
  category: string;
  route: string;
  icon: string;
  keywords: string[];
}

/** All searchable pages in the system */
const SEARCHABLE_ITEMS: SearchResultItem[] = [
  // Dashboard
  { title: 'Dashboard Overview', category: 'Home > Dashboard', route: '/dashboard/overview', icon: 'pi-chart-bar', keywords: ['dashboard', 'overview', 'home', 'หน้าแรก', 'แดชบอร์ด', 'ภาพรวม'] },

  // Sales
  { title: 'Sales Dashboard', category: 'Sales > Dashboard', route: '/sales/dashboard', icon: 'pi-chart-line', keywords: ['sales', 'dashboard', 'การขาย', 'แดชบอร์ด'] },
  { title: 'Customer Management', category: 'Sales > Customer', route: '/sales/customer', icon: 'pi-users', keywords: ['customer', 'management', 'ลูกค้า', 'จัดการลูกค้า', 'ผู้เช่า'] },
  { title: 'Budget Management', category: 'Sales > Budget', route: '/sales/budget', icon: 'pi-wallet', keywords: ['budget', 'งบประมาณ', 'งบ'] },
  { title: 'Pipeline Management', category: 'Sales > Pipeline', route: '/sales/pipeline', icon: 'pi-sitemap', keywords: ['pipeline', 'ไปป์ไลน์', 'lead', 'โอกาส'] },
  { title: 'Activities Management', category: 'Sales > Activities', route: '/sales/activities', icon: 'pi-calendar', keywords: ['activities', 'กิจกรรม', 'นัดหมาย', 'activity'] },

  // Area
  { title: 'Area Layout Master', category: 'Area > Layout', route: '/area/layout/master', icon: 'pi-map', keywords: ['area', 'layout', 'master', 'พื้นที่', 'แผนผัง', 'ตึก', 'building', 'floor', 'ชั้น', 'ห้อง', 'room'] },

  // Contract
  { title: 'Contract Management', category: 'Contract > Management', route: '/contract/management', icon: 'pi-file-edit', keywords: ['contract', 'สัญญา', 'management', 'ใบเสนอราคา', 'quotation', 'สัญญาจอง', 'booking', 'lease'] },

  // Finance
  { title: 'Finance Master', category: 'Finance > Master', route: '/finance/master', icon: 'pi-wallet', keywords: ['finance', 'การเงิน', 'invoice', 'ใบแจ้งหนี้', 'ใบเสร็จ', 'receipt'] },

  // Facilities
  { title: 'Utilities Management', category: 'Facilities > Utilities', route: '/facilities/utilities/master', icon: 'pi-cog', keywords: ['facilities', 'utilities', 'meter', 'มิเตอร์', 'สาธารณูปโภค', 'ไฟฟ้า', 'น้ำ', 'electric', 'water'] },

  // Reports
  { title: 'All Reports', category: 'Report > All', route: '/reports', icon: 'pi-chart-bar', keywords: ['report', 'รายงาน', 'reports'] },
  { title: 'Area Reports', category: 'Report > Area', route: '/reports/category/area', icon: 'pi-chart-bar', keywords: ['report', 'area', 'รายงานพื้นที่'] },
  { title: 'Service Reports', category: 'Report > Service', route: '/reports/category/service', icon: 'pi-chart-bar', keywords: ['report', 'service', 'รายงานบริการ'] },
  { title: 'Contract Reports', category: 'Report > Contract', route: '/reports/category/contract', icon: 'pi-chart-bar', keywords: ['report', 'contract', 'รายงานสัญญา'] },
  { title: 'Budget Reports', category: 'Report > Budget', route: '/reports/category/budget', icon: 'pi-chart-bar', keywords: ['report', 'budget', 'รายงานงบประมาณ'] },
  { title: 'Finance Reports', category: 'Report > Finance', route: '/reports/category/finance', icon: 'pi-chart-bar', keywords: ['report', 'finance', 'รายงานการเงิน'] },
  { title: 'Collection Reports', category: 'Report > Collection', route: '/reports/category/collection', icon: 'pi-chart-bar', keywords: ['report', 'collection', 'รายงานเก็บเงิน'] },

  // Settings
  { title: 'User Account Management', category: 'Setting > User', route: '/setting/user-accounts/data', icon: 'pi-user-edit', keywords: ['user', 'account', 'ผู้ใช้', 'บัญชี', 'setting', 'ตั้งค่า'] },
  { title: 'Roles & Permissions', category: 'Setting > User', route: '/setting/user-accounts/roles', icon: 'pi-lock', keywords: ['role', 'permission', 'สิทธิ์', 'บทบาท'] },
  { title: 'Company Information', category: 'Setting > Company', route: '/setting/company/data', icon: 'pi-building', keywords: ['company', 'บริษัท', 'สาขา', 'branch'] },
  { title: 'Bank Information', category: 'Setting > Company', route: '/setting/company/bank', icon: 'pi-credit-card', keywords: ['bank', 'ธนาคาร'] },
  { title: 'Contract Preparation Data', category: 'Setting > System', route: '/setting/system/contract', icon: 'pi-sliders-h', keywords: ['contract', 'preparation', 'profit center', 'business type', 'ตั้งค่าสัญญา'] },
  { title: 'Finance Document Type', category: 'Setting > Finance', route: '/setting/system/finance/document-type', icon: 'pi-file', keywords: ['document', 'type', 'ประเภทเอกสาร', 'finance'] },
  { title: 'Finance Basic Data', category: 'Setting > Finance', route: '/setting/system/finance/basic', icon: 'pi-database', keywords: ['finance', 'basic', 'พื้นฐาน'] },
  { title: 'Finance Revenue Data', category: 'Setting > Finance', route: '/setting/system/finance/revenue', icon: 'pi-money-bill', keywords: ['revenue', 'รายได้'] },
  { title: 'Finance Tax Data', category: 'Setting > Finance', route: '/setting/system/finance/tax', icon: 'pi-percentage', keywords: ['tax', 'ภาษี', 'vat', 'wht'] },
  { title: 'Interface Configuration', category: 'Setting > System', route: '/setting/system/interface', icon: 'pi-link', keywords: ['interface', 'configuration', 'api', 'ftp', 'rpa'] },
];
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    // Big search bar - slide UP from bottom when appearing, slide DOWN when hiding
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 100, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ height: '0', opacity: 100, overflow: 'hidden' }),
        ),
      ]),
    ]),
    // Small search bar and greeting - slide down when appearing, slide up when hiding
    trigger('slideDownSmall', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 100 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 100 }),
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-50px)', opacity: 100 }),
        ),
      ]),
    ]),
    trigger('slideDownSmallFaded', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 }),
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-20px)', opacity: 0 }),
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private translatorService = inject(TranslatorService);
  langAbbreviation = computed(() => this.translatorService.abbreviation);

  isMobile = input<boolean>(false);

  // Navigation data
  navigationItems: NavigationItem[] = NAVIGATION_CONTENT.filter(
    (item) => item.primary_content !== 'setting',
  );
  activeMenuItem: string = '';
  navIconMap: Record<string, string> = {
    sales: 'pi pi-chart-line',
    area: 'pi pi-map',
    contract: 'pi pi-file-edit',
    Collection: 'pi pi-wallet',
    Facilities: 'pi pi-cog',
    report_dashboard: 'pi pi-chart-bar',
    setting: 'pi pi-sliders-h',
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

    /** จำนวนเอกสารรออนุมัติ (สำหรับแสดง badge ที่ MY TASK) */
  pendingApprovalCount = 0;

  private routerSubscription?: Subscription;

  // Texts for multi-language support
  texts: HeaderTexts;

  constructor(
    private userService: UserService,
    private languageService: LanguageService,
    private searchService: SearchService,
    private navigationService: NavigationService,
    private headerService: HeaderService,
    private router: Router,
    public approvalNotification: ApprovalNotificationService,
    private auth: AuthService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.texts = HEADER_TEXTS[this.currentLanguage.code];

    // This makes the local activeMenuItem property reactive to service changes
    effect(() => {
      this.activeMenuItem = this.navigationService.activePrimaryItem();
    });

    effect(() => {
      this.isScrolled = this.headerService.isScrolled();
    });

    effect(() => {
      this.pendingApprovalCount = this.approvalNotification.count();
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

        // โหลดจำนวนรออนุมัติให้ badge MY TASK แสดงทุกหน้า
    this.approvalNotification.refreshPendingCount();
    this.setupRouterSubscription();
  }

    private setupRouterSubscription(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.approvalNotification.refreshPendingCount();
      }
    });
  }

  getUserInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  /**
   * Navigate to home page when logo is clicked
   */
  onLogoClick(): void {
    this.router.navigate(['/dashboard/overview']);
    this.navigationService.setSidebarExpanded(false);
  }

  /**
   * Home button in nav bar – navigate to dashboard overview
   */
  onHomeClick(): void {
    this.activeMenuItem = '__home__';
    this.router.navigate(['/dashboard/overview']);
    this.navigationService.setSidebarExpanded(false);
  }

  toggleSidebar(): void {
    this.navigationService.toggleSidebar();
  }

  setActiveMenuItem(item: string): void {
    // Get the currently active item from the service
    const currentActive = this.navigationService.activePrimaryItem();

    if (item === currentActive) {
      // If the same item is clicked, toggle the sidebar
      this.navigationService.toggleSidebar();
    } else {
      // If a new item is clicked, change the category AND ensure the sidebar is expanded
      this.navigationService.setActivePrimaryNavItem(item);
      this.navigationService.setSidebarExpanded(true);
      const targetRoute = this.getPrimaryRoute(item);
      if (targetRoute) {
        this.router.navigate([targetRoute]);
      }
    }
  }

  // ========== Universal Search Methods ==========

  /** Press Enter → navigate to the best matching page */
  onSearchGlobal(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = this.findBestMatch(query);
    if (match) {
      this.router.navigate([match.route]);
      this.searchQuery = '';
    }
    this.searchService.setSearchQuery(this.searchQuery);
  }

  clearSearchSimple(): void {
    this.searchQuery = '';
  }

  private findBestMatch(query: string): SearchResultItem | null {
    const terms = query.split(/\s+/).filter((t) => t.length > 0);

    const scored = SEARCHABLE_ITEMS.map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const categoryLower = item.category.toLowerCase();
      const keywordsJoined = item.keywords.join(' ').toLowerCase();

      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        if (titleLower.startsWith(term)) score += 5;
        if (categoryLower.includes(term)) score += 3;
        if (keywordsJoined.includes(term)) score += 5;
      }
      return { item, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.length > 0 ? scored[0].item : null;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
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
    this.translatorService.setLanguage(language.code, true);
  }

  translateNav(key: string): string {
    const lookupKey = key === 'report_dashboard' ? 'report' : key;
    const override = getLabelOverride(lookupKey);
    if (override) {
      return override;
    }
    return NAVIGATION_TEXTS[this.currentLanguage.code][key] || key;
  }

  goToSettings(): void {
    this.navigationService.setActivePrimaryNavItem('setting');
    this.navigationService.setSidebarExpanded(true);
    this.router.navigate(['/setting/user-accounts/data']);
    this.isProfileDropdownOpen = false;
  }

  private getPrimaryRoute(key: string): string | null {
    const navItem = this.navigationItems.find(
      (item) => item.primary_content === key,
    );
    if (!navItem) {
      return null;
    }

    for (const secondary of navItem.secondary_content || []) {
      if (secondary.route) {
        return secondary.route;
      }
      if (secondary.sub && secondary.sub.length > 0) {
        const firstSubRoute = secondary.sub.find((sub) => !!sub.route)?.route;
        if (firstSubRoute) {
          return firstSubRoute;
        }
      }
    }

    return null;
  }

  getNavIcon(key: string): string {
    return this.navIconMap[key] || 'pi pi-circle';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.language-dropdown') &&
      !target.closest('.profile-dropdown')
    ) {
      this.isLanguageDropdownOpen = false;
      this.isProfileDropdownOpen = false;
    }
  }
}

