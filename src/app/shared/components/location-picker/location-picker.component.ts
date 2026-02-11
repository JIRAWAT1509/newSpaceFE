// location-picker.component.ts - Search and select location

import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityLocation } from '@core/data/activities.mock';
import { LocationService } from '@core/services/location.service';
import { SafeUrlPipe } from '@shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.css'
})
export class LocationPickerComponent {

  // ==================== INPUTS ====================
  @Input() selectedLocation: ActivityLocation | null = null;
  @Input() placeholder: string = 'ค้นหาสถานที่...';
  @Input() showMap: boolean = true;

  // ==================== OUTPUTS ====================
  @Output() locationSelect = new EventEmitter<ActivityLocation>();
  @Output() locationClear = new EventEmitter<void>();

  // ==================== SIGNALS ====================
  searchQuery = signal<string>('');
  searchResults = signal<ActivityLocation[]>([]);
  showResults = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Get saved locations from service
  savedLocations = computed(() => this.locationService.locations());

  constructor(private locationService: LocationService) {
    // Watch for search query changes
    effect(() => {
      const query = this.searchQuery();
      if (query.length >= 2 || query.length === 0) {
        this.performSearch(query);
      }
    });
  }

  // ==================== SEARCH ====================

  async performSearch(query: string): Promise<void> {
    this.isLoading.set(true);

    try {
      const results = await this.locationService.searchLocations(query);
      this.searchResults.set(results);
      this.showResults.set(true);
    } catch (error) {
      console.error('Search failed:', error);
      this.searchResults.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchFocus(): void {
    // Show saved locations when focused with empty query
    if (!this.searchQuery()) {
      this.searchResults.set(this.savedLocations());
      this.showResults.set(true);
    }
  }

  onSearchBlur(): void {
    // Delay to allow click on results
    setTimeout(() => {
      this.showResults.set(false);
    }, 200);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showResults.set(false);
  }

  // ==================== LOCATION SELECTION ====================

  selectLocation(location: ActivityLocation): void {
    this.locationSelect.emit(location);
    this.clearSearch();
  }

  clearLocation(): void {
    this.locationClear.emit();
  }

  // ==================== BOOKMARK MANAGEMENT ====================

  toggleBookmark(location: ActivityLocation, event: Event): void {
    event.stopPropagation();

    const success = this.locationService.toggleLocation(location);

    if (!success && !this.isLocationSaved(location.id)) {
      alert(`สามารถบันทึกได้สูงสุด 4 สถานที่เท่านั้น`);
    }
  }

  isLocationSaved(locationId: string): boolean {
    return this.locationService.isLocationSaved(locationId);
  }

  getRemainingSlots(): number {
    return this.locationService.getRemainingSlots();
  }

  // ==================== MAP ====================

  openInGoogleMaps(location: ActivityLocation, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const url = this.locationService.getGoogleMapsUrl(location.lat, location.lng);
    window.open(url, '_blank');
  }

  getStaticMapUrl(location: ActivityLocation): string {
    return this.locationService.getStaticMapUrl(location.lat, location.lng, 400, 200);
  }
}
