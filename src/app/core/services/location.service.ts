// location.service.ts - Manage user's saved locations

import { Injectable, signal } from '@angular/core';
import { ActivityLocation, MOCK_DEFAULT_LOCATIONS } from '@core/data/activities.mock';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // Maximum saved locations per user
  private readonly MAX_SAVED_LOCATIONS = 4;

  // User's saved default locations (signal)
  private savedLocations = signal<ActivityLocation[]>([...MOCK_DEFAULT_LOCATIONS]);

  // Public readonly access
  public readonly locations = this.savedLocations.asReadonly();

  constructor() {
    // Load from localStorage on init
    this.loadSavedLocations();
  }

  /**
   * Get all saved locations
   */
  getSavedLocations(): ActivityLocation[] {
    return this.savedLocations();
  }

  /**
   * Check if location is saved
   */
  isLocationSaved(locationId: string): boolean {
    return this.savedLocations().some(loc => loc.id === locationId);
  }

  /**
   * Add location to saved list
   */
  addLocation(location: ActivityLocation): boolean {
    const current = this.savedLocations();

    // Check if already exists
    if (current.some(loc => loc.id === location.id)) {
      console.warn('Location already saved');
      return false;
    }

    // Check max limit
    if (current.length >= this.MAX_SAVED_LOCATIONS) {
      console.warn(`Maximum ${this.MAX_SAVED_LOCATIONS} locations allowed`);
      return false;
    }

    // Add new location
    const updated = [...current, { ...location, isDefault: true }];
    this.savedLocations.set(updated);
    this.persistLocations(updated);

    return true;
  }

  /**
   * Remove location from saved list
   */
  removeLocation(locationId: string): boolean {
    const current = this.savedLocations();
    const updated = current.filter(loc => loc.id !== locationId);

    if (updated.length === current.length) {
      console.warn('Location not found');
      return false;
    }

    this.savedLocations.set(updated);
    this.persistLocations(updated);

    return true;
  }

  /**
   * Toggle location save status
   */
  toggleLocation(location: ActivityLocation): boolean {
    if (this.isLocationSaved(location.id)) {
      return this.removeLocation(location.id);
    } else {
      return this.addLocation(location);
    }
  }

  /**
   * Search locations (simulated - in real app would use Google Places API)
   */
  searchLocations(query: string): Promise<ActivityLocation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query.trim()) {
          // Return saved locations if no query
          resolve(this.getSavedLocations());
          return;
        }

        // Mock search results based on query
        const mockResults: ActivityLocation[] = [
          {
            id: `search-${Date.now()}-1`,
            name: query,
            address: `123 ${query}, Bangkok, Thailand`,
            lat: 13.7367 + (Math.random() * 0.01),
            lng: 100.5606 + (Math.random() * 0.01),
            isDefault: false
          }
        ];

        // Also include matching saved locations
        const saved = this.getSavedLocations().filter(loc =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.address.toLowerCase().includes(query.toLowerCase())
        );

        resolve([...saved, ...mockResults]);
      }, 300); // Simulate network delay
    });
  }

  /**
   * Get static map URL (no API key needed)
   */
  getStaticMapUrl(lat: number, lng: number, width: number = 400, height: number = 200, zoom: number = 15): string {
    // OpenStreetMap static map (free, no API key)
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  }

  /**
   * Get Google Maps link
   */
  getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  /**
   * Get Google Maps search link
   */
  getGoogleMapsSearchUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  /**
   * Persist locations to localStorage
   */
  private persistLocations(locations: ActivityLocation[]): void {
    try {
      localStorage.setItem('user-saved-locations', JSON.stringify(locations));
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  }

  /**
   * Load locations from localStorage
   */
  private loadSavedLocations(): void {
    try {
      const stored = localStorage.getItem('user-saved-locations');
      if (stored) {
        const locations = JSON.parse(stored) as ActivityLocation[];
        this.savedLocations.set(locations);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
      // Use defaults if loading fails
      this.savedLocations.set([...MOCK_DEFAULT_LOCATIONS]);
    }
  }

  /**
   * Reset to default locations
   */
  resetToDefaults(): void {
    this.savedLocations.set([...MOCK_DEFAULT_LOCATIONS]);
    this.persistLocations(MOCK_DEFAULT_LOCATIONS);
  }

  /**
   * Get remaining slots
   */
  getRemainingSlots(): number {
    return this.MAX_SAVED_LOCATIONS - this.savedLocations().length;
  }
}
