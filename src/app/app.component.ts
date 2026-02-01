import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component'; // <-- Import sidebar
import { HeaderService } from '@core/services/header.service';
import { NavigationService } from '@core/services/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'newSpaceFE';

  // Make the signal from the service available to the template
  isScrolled;
  isSidebarExpanded;

  // Header height tracking
  headerHeight = signal<number>(96); // Default to 96px (not scrolled)
  
  @ViewChild('headerRef', { read: ElementRef }) headerRef?: ElementRef<HTMLElement>;

  constructor(
    private headerService: HeaderService,
    private navigationService: NavigationService
  ) {
    this.isScrolled = this.headerService.isScrolled;
    this.isSidebarExpanded = this.navigationService.isSidebarExpanded;

    // Update header height when scroll state changes
    effect(() => {
      const scrolled = this.isScrolled();
      this.updateHeaderHeight();
    });
  }

  ngOnInit(): void {
    // Initial header height calculation
    setTimeout(() => this.updateHeaderHeight(), 0);
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
