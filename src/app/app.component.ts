import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component'; // <-- Import sidebar
import { HeaderService } from '@core/services/header.service';

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

  constructor(private headerService: HeaderService) {
    this.isScrolled = this.headerService.isScrolled;
  } // <-- Inject new service

  onContentScroll(event: Event): void {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    this.headerService.setScrolledState(scrollTop > 50);
  }
}
