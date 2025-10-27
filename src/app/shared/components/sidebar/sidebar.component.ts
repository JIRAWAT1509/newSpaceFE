import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { NavigationService } from '@core/services/navigation.service';
import { LanguageService } from '@core/services/language.service';
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
  // --- Component State ---
  // REMOVED: Local isExpanded property is gone.
  isHovering: boolean = false;
  openAccordion: string | null = null;

  // --- Data ---
  navigationContent: NavigationItem[] = NAVIGATION_CONTENT;
  currentSecondaryNav: NavigationSecondary[] = [];

  // --- Signals from Services ---
  isExpanded: any;
  activePrimaryItem: any;
  activeSubRoute: any;
  currentLanguage: any;

  // --- i18n ---
  texts: { [key: string]: string } = {};

  constructor(
    private navigationService: NavigationService,
    private languageService: LanguageService
  ) {
    this.isExpanded = this.navigationService.isSidebarExpanded;
    this.activePrimaryItem = this.navigationService.activePrimaryItem;
    this.activeSubRoute = this.navigationService.activeSubRouteItem;
    this.currentLanguage = this.languageService.currentLanguage;
    effect(() => {
      const langCode = this.currentLanguage().code;
      this.texts = SIDEBAR_TEXTS[langCode];
    });

    effect(() => {
      const activeItemName = this.activePrimaryItem();
      const newNavContent = this.navigationContent.find(item => item.primary_content === activeItemName);
      this.currentSecondaryNav = newNavContent ? newNavContent.secondary_content : [];
      this.autoOpenActiveAccordion();
    });
  effect(() => {
      // This line is a "guard" to prevent the effect from running on initial setup.
      const isExpandedNow = this.isExpanded();

      // If the sidebar's permanent state changes (e.g., from the header),
      // the temporary hover state is no longer valid and must be reset.
      if (this.isHovering) {
        this.isHovering = false;
      }
    });
    effect(() => {
      this.autoOpenActiveAccordion();
    });

    effect(() => {
      // When the sidebar is collapsed (and not being hovered),
      // ensure any open accordion is closed.
      if (!this.isExpanded() && !this.isHovering) {
        this.openAccordion = null;
      }
    });


  }

  ngOnInit(): void {
    this.autoOpenActiveAccordion();
  }

  // --- State Change and Event Handlers (Updated to use the service) ---

  toggleAccordion(itemName: string): void {
    this.openAccordion = this.openAccordion === itemName ? null : itemName;
  }

onSubItemClick(subItem: NavigationTertiary): void {
    this.navigationService.setSidebarExpanded(false); // Always hide on click
  }

  onMouseEnter(): void {
    if (!this.isExpanded()) { // Read signal with ()
      this.isHovering = true;
      this.autoOpenActiveAccordion();
    }
  }

  onMouseLeave(): void {
    if (!this.isExpanded()) { // Read signal with ()
      this.isHovering = false;
      this.openAccordion = null;
    }
  }

  onIconClick(event: MouseEvent, itemName: string): void {
    event.stopPropagation();
    this.navigationService.setSidebarExpanded(true); // Tell service to show
    this.openAccordion = itemName;
  }

  // --- Helper Functions ---

  private autoOpenActiveAccordion(): void {
    const activeRoute = this.activeSubRoute();
    if (activeRoute) {
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
      this.isHovering = false; // <-- ADD THIS LINE
      this.navigationService.setSidebarExpanded(true);
    }
    this.toggleAccordion(itemName);
  }

handleDirectLinkClick(): void {
    this.navigationService.setSidebarExpanded(false); // Always hide on click
  }

  isItemActive(item: NavigationSecondary): boolean {
    const activeRoute = this.activeSubRoute();
    if (!activeRoute) return false;
    if (item.route) return item.route === activeRoute;
    if (item.sub) return item.sub.some(subItem => subItem.route === activeRoute);
    return false;
  }



  isItemHighlighted(item: NavigationSecondary): boolean {
    // An item is highlighted if its route is active OR if its accordion is open.
    const isActive = this.isItemActive(item);
    const isAccordionOpen = this.openAccordion === item.name;
    return isActive || isAccordionOpen;
  }


  translate(key: string): string {
    return this.texts[key] || key;
  }
}
