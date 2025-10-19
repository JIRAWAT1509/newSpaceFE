import { Component, HostListener, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
          style({ height: '0', opacity: 100, overflow: 'hidden' })
        ),
      ]),
    ]),
    // Small search bar and greeting - slide down when appearing, slide up when hiding
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
  // Navigation data
  navigationItems: NavigationItem[] = NAVIGATION_CONTENT;
  // activeMenuItem: string = 'service';
  activeMenuItem: string = '';

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

  // Texts for multi-language support
  texts: HeaderTexts;

  constructor(
    private userService: UserService,
    private languageService: LanguageService,
    private searchService: SearchService,
    private navigationService: NavigationService,
    private headerService: HeaderService
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
  }

  ngOnInit(): void {
    // Load user data
    this.username = this.userService.getUsername();
    this.hasProfilePicture = this.userService.hasProfilePicture();
    this.profilePictureUrl = this.userService.getProfilePicture();
    this.userInitials = this.getUserInitials(this.username);

    // Load language data
    this.availableLanguages = this.languageService.getAvailableLanguages();
  }

  // @HostListener('window:scroll', [])
  // onWindowScroll(): void {
  //   const scrolled = window.scrollY > 50;
  //   this.isScrolled = scrolled;
  //   this.headerService.setScrolledState(scrolled);
  // }

  getUserInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  // setActiveMenuItem(item: string): void {
  //   this.activeMenuItem = item;
  //   this.navigationService.setActivePrimaryNavItem(item);
  // }
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
    }
  }


  onSearch(): void {
    this.searchService.setSearchQuery(this.searchQuery);
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
    return NAVIGATION_TEXTS[this.currentLanguage.code][key] || key;
  }

  logout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }

  getMenuItemWidth(itemName: string): string {
    // Approximate widths based on text length - adjust as needed
    const widths: { [key: string]: string } = {
      Area: '45px',
      Contract: '75px',
      Service: '65px',
      Finance: '70px',
      Dashboard: '95px',
    };
    return widths[itemName] || '60px';
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
// function trigger(arg0: string, arg1: any[]): any {
//   throw new Error('Function not implemented.');
// }
