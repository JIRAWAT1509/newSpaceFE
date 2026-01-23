import { Component } from '@angular/core';
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
export class AppComponent {
  title = 'newSpaceFE';

  // Make the signal from the service available to the template
  isScrolled;
  isSidebarExpanded;

  constructor(
    private headerService: HeaderService,
    private navigationService: NavigationService
  ) {
    this.isScrolled = this.headerService.isScrolled;
    this.isSidebarExpanded = this.navigationService.isSidebarExpanded;
  } // <-- Inject new service

  onContentScroll(event: Event): void {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    this.headerService.setScrolledState(scrollTop > 50);
  }
}
