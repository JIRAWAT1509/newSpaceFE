// activity-location-map.component.ts - Mini map for activity cards

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLocation } from '@core/data/activities.mock';
import { LocationService } from '@core/services/location.service';
import { SafeUrlPipe } from '@shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-activity-location-map',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './activity-location-map.component.html',
  styleUrl: './activity-location-map.component.css'
})
export class ActivityLocationMapComponent {

  @Input() location!: ActivityLocation;
  @Input() compact: boolean = false;

  constructor(private locationService: LocationService) {}

  openInGoogleMaps(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const url = this.locationService.getGoogleMapsUrl(
      this.location.lat,
      this.location.lng
    );
    window.open(url, '_blank');
  }

  getStaticMapUrl(): string {
    const width = this.compact ? 300 : 400;
    const height = this.compact ? 150 : 200;
    return this.locationService.getStaticMapUrl(
      this.location.lat,
      this.location.lng,
      width,
      height
    );
  }
}
