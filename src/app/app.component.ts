import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderService } from '@core/services/header.service';
import { NavigationService } from '@core/services/navigation.service';

const MOBILE_BREAKPOINT = 768;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'SpaceCRM';

  isScrolled;
  isSidebarExpanded;

  headerHeight = signal<number>(96);
  isMobile = signal<boolean>(false);

  private mediaQuery: MediaQueryList | null = null;
  private mediaListener?: () => void;
  private routerSub?: ReturnType<typeof filter>;

  @ViewChild('headerRef', { read: ElementRef }) headerRef?: ElementRef<HTMLElement>;

  constructor(
    private headerService: HeaderService,
    private navigationService: NavigationService,
    private router: Router
  ) {
    this.isScrolled = this.headerService.isScrolled;
    this.isSidebarExpanded = this.navigationService.isSidebarExpanded;

    effect(() => {
      this.isScrolled();
      this.updateHeaderHeight();
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      this.updateMobileState();
      if (this.isMobile()) {
        this.navigationService.setSidebarExpanded(false);
      }
      this.mediaListener = () => {
        this.updateMobileState();
        if (this.isMobile()) {
          this.navigationService.setSidebarExpanded(false);
        }
      };
      this.mediaQuery.addEventListener('change', this.mediaListener);
    }
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile()) {
        this.navigationService.setSidebarExpanded(false);
      }
    });
    setTimeout(() => this.updateHeaderHeight(), 0);
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
  }

  private updateMobileState(): void {
    this.isMobile.set(this.mediaQuery?.matches ?? (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT));
  }

  closeSidebar(): void {
    this.navigationService.setSidebarExpanded(false);
  }

  ngAfterViewInit(): void {
    // Calculate header height after view init
    this.updateHeaderHeight();

    // Set up ResizeObserver to track header height changes
    if (this.headerRef?.nativeElement) {
      const resizeObserver = new ResizeObserver(() => {
        this.updateHeaderHeight();
      });
      resizeObserver.observe(this.headerRef.nativeElement);
    }

    // Also recalculate on window resize
    window.addEventListener('resize', () => {
      this.updateHeaderHeight();
    });
  }

  private updateHeaderHeight(): void {
    // Find header element
    const header = document.querySelector('header');
    if (header) {
      const height = header.offsetHeight;
      this.headerHeight.set(height);
    }
  }

  onContentScroll(event: Event): void {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    this.headerService.setScrolledState(scrollTop > 50);
    // Recalculate header height after scroll state change
    setTimeout(() => this.updateHeaderHeight(), 100);
  }
}
