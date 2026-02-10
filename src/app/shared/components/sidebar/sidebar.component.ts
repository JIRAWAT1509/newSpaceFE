import { Component, OnInit, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { NavigationService } from '@core/services/navigation.service';
import { LanguageService } from '@core/services/language.service';
import { BookmarkService } from '@core/services/bookmark.service';
import { NAVIGATION_CONTENT } from '@core/data/content';
import { NavigationItem, NavigationSecondary, NavigationTertiary } from '@core/models/navigation.model';
import { SIDEBAR_TEXTS } from '@assets/language/sidebar.text';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {
  isMobileOverlay = input<boolean>(false);

  isHovering: boolean = false;
  openAccordion: string | null = null;

  navigationContent: NavigationItem[] = NAVIGATION_CONTENT;
  currentSecondaryNav: NavigationSecondary[] = [];
  displayNav: NavigationSecondary[] = [];

  // ✅ เพิ่ม bookmark section
  bookmarkSection: NavigationSecondary | null = null;

  // Signals
  isExpanded: any;
  activePrimaryItem: any;
  activeSubRoute: any;
  currentLanguage: any;
  bookmarks: any;

  texts: { [key: string]: string } = {};

  constructor(
    private navigationService: NavigationService,
    private languageService: LanguageService,
    private bookmarkService: BookmarkService
  ) {
    this.isExpanded = this.navigationService.isSidebarExpanded;
    this.activePrimaryItem = this.navigationService.activePrimaryItem;
    this.activeSubRoute = this.navigationService.activeSubRouteItem;
    this.currentLanguage = this.languageService.currentLanguage;
    this.bookmarks = this.bookmarkService.bookmarks;

    effect(() => {
      const langCode = this.currentLanguage().code;
      this.texts = SIDEBAR_TEXTS[langCode];
    });

    effect(() => {
      const activeItemName = this.activePrimaryItem();
      const newNavContent = this.navigationContent.find(item => item.primary_content === activeItemName);
      this.currentSecondaryNav = newNavContent ? newNavContent.secondary_content : [];
      this.updateDisplayNav();
      this.autoOpenActiveAccordion();
    });

    // ✅ Effect สำหรับ bookmarks
    effect(() => {
      const bookmarkList = this.bookmarks();
      this.updateBookmarkSection(bookmarkList);
      this.updateDisplayNav();
    });

    effect(() => {
      const isExpandedNow = this.isExpanded();
      if (this.isHovering) {
        this.isHovering = false;
      }
    });

    effect(() => {
      this.autoOpenActiveAccordion();
    });

    effect(() => {
      if (!this.isExpanded() && !this.isHovering) {
        this.openAccordion = null;
      }
    });
  }

  ngOnInit(): void {
    this.autoOpenActiveAccordion();
  }

  // ✅ สร้าง bookmark accordion section
  private updateBookmarkSection(bookmarks: NavigationSecondary[]): void {
    if (bookmarks.length > 0) {
      this.bookmarkSection = {
        name: 'bookmarks',
        icon: 'pi-bookmark-fill',
        sub: bookmarks.map(b => ({
          name: b.name,
          route: b.route || ''
        }))
      };
    } else {
      this.bookmarkSection = null;
    }
  }

  // ✅ Merge bookmark section + divider + normal nav
  private updateDisplayNav(): void {
    if (this.bookmarkSection) {
      this.displayNav = [
        this.bookmarkSection,
        { name: '__divider__', icon: '', isDivider: true } as any,
        ...this.currentSecondaryNav
      ];
    } else {
      this.displayNav = this.currentSecondaryNav;
    }
  }

  toggleBookmark(event: MouseEvent, item: NavigationSecondary): void {
    event.preventDefault();
    event.stopPropagation();

    if (item.route) {
      this.bookmarkService.toggleBookmark(item);
    }
  }

  isBookmarked(item: NavigationSecondary): boolean {
    return this.bookmarkService.isBookmarked(item.route);
  }

  isPrimeIcon(icon: string): boolean {
    return icon?.startsWith('pi-');
  }

  toggleAccordion(itemName: string): void {
    this.openAccordion = this.openAccordion === itemName ? null : itemName;
  }

  onSubItemClick(subItem: NavigationTertiary): void {
    this.navigationService.setSidebarExpanded(false);
  }

  onMouseEnter(): void {
    if (!this.isExpanded()) {
      this.isHovering = true;
      this.autoOpenActiveAccordion();
    }
  }

  onMouseLeave(): void {
    if (!this.isExpanded()) {
      this.isHovering = false;
      this.openAccordion = null;
    }
  }

  onIconClick(event: MouseEvent, itemName: string): void {
    event.stopPropagation();
    this.navigationService.setSidebarExpanded(true);
    this.openAccordion = itemName;
  }

  private autoOpenActiveAccordion(): void {
    const activeRoute = this.activeSubRoute();
    if (activeRoute) {
      // ✅ เช็ค bookmarks ด้วย
      if (this.bookmarkSection?.sub?.some(subItem => subItem.route === activeRoute)) {
        this.openAccordion = 'bookmarks';
        return;
      }

      for (const secondaryItem of this.currentSecondaryNav) {
        if (secondaryItem.sub && secondaryItem.sub.some(subItem => subItem.route === activeRoute)) {
          this.openAccordion = secondaryItem.name;
          return;
        }
      }
    }
    this.openAccordion = null;
  }

  handleItemClick(itemName: string): void {
    if (!this.isExpanded()) {
      this.isHovering = false;
      this.navigationService.setSidebarExpanded(true);
    }
    this.toggleAccordion(itemName);
  }

  handleDirectLinkClick(): void {
    this.navigationService.setSidebarExpanded(false);
  }

  isItemActive(item: NavigationSecondary): boolean {
    const activeRoute = this.activeSubRoute();
    if (!activeRoute) return false;
    if (item.route) return item.route === activeRoute;
    if (item.sub) return item.sub.some(subItem => subItem.route === activeRoute);
    return false;
  }

  isItemHighlighted(item: NavigationSecondary): boolean {
    const isActive = this.isItemActive(item);
    const isAccordionOpen = this.openAccordion === item.name;
    return isActive || isAccordionOpen;
  }

  translate(key: string): string {
    return this.texts[key] || key;
  }
}
