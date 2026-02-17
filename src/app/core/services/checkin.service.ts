// checkin.service.ts - Check-In Management Service

import { Injectable, signal } from '@angular/core';
import { DateTime } from 'luxon';
import { Activity, CheckInRecord, ActivityLocation } from '@core/data/activities.mock';

export interface CheckInStatus {
  canCheckIn: boolean;
  reason?: string;
  todayCheckIn?: CheckInRecord;
  requiredCheckIns: number;
  completedCheckIns: number;
  missingDates: string[]; // YYYY-MM-DD format
}

export interface CheckInResult {
  success: boolean;
  checkIn?: CheckInRecord;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckInService {

  // Signal for permission state
  locationPermission = signal<'granted' | 'denied' | 'prompt' | 'unavailable'>('prompt');

  constructor() {
    this.checkLocationPermission();
  }

  /**
   * Check browser location permission status
   */
  private async checkLocationPermission(): Promise<void> {
    if (!('geolocation' in navigator)) {
      this.locationPermission.set('unavailable');
      return;
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        this.locationPermission.set(permission.state as any);

        permission.onchange = () => {
          this.locationPermission.set(permission.state as any);
        };
      }
    } catch (error) {
      console.warn('Permission API not supported', error);
    }
  }

  /**
   * Get check-in status for an activity and user
   */
  getCheckInStatus(activity: Activity, userId: string): CheckInStatus {
    const now = DateTime.now();
    const startDate = DateTime.fromISO(activity.startDate);
    const endDate = DateTime.fromISO(activity.endDate);
    const today = now.toFormat('yyyy-MM-dd');

    // Calculate required check-in days
    const requiredDates = this.getRequiredCheckInDates(startDate, endDate);
    const requiredCheckIns = requiredDates.length;

    // Get user's check-ins for this activity
    const userCheckIns = activity.checkIns.filter(c => c.userId === userId);
    const completedDates = userCheckIns.map(c => c.date);
    const completedCheckIns = completedDates.length;

    // Find today's check-in
    const todayCheckIn = userCheckIns.find(c => c.date === today);

    // Missing dates
    const missingDates = requiredDates.filter(d => !completedDates.includes(d));

    // Determine if can check in today
    let canCheckIn = false;
    let reason: string | undefined;

    // Check 1: Activity must be active (in date range)
    if (now < startDate) {
      canCheckIn = false;
      reason = 'Activity has not started yet';
    } else if (now > endDate) {
      canCheckIn = false;
      reason = 'Activity has ended';
    }
    // Check 2: Must be activity day (today in range)
    else if (!requiredDates.includes(today)) {
      canCheckIn = false;
      reason = 'Today is not an activity day';
    }
    // Check 3: Already checked in today
    else if (todayCheckIn) {
      canCheckIn = false;
      reason = `Already checked in today at ${DateTime.fromISO(todayCheckIn.timestamp).toFormat('HH:mm')}`;
    }
    // Check 4: Activity must have location (optional check)
    else if (!activity.location) {
      canCheckIn = false;
      reason = 'No location set for this activity';
    }
    // All checks passed
    else {
      canCheckIn = true;
    }

    return {
      canCheckIn,
      reason,
      todayCheckIn,
      requiredCheckIns,
      completedCheckIns,
      missingDates
    };
  }

  /**
   * Get all required check-in dates for activity
   * Returns array of YYYY-MM-DD strings for each day in activity period
   */
  private getRequiredCheckInDates(startDate: DateTime, endDate: DateTime): string[] {
    const dates: string[] = [];
    let current = startDate.startOf('day');
    const end = endDate.startOf('day');

    while (current <= end) {
      dates.push(current.toFormat('yyyy-MM-dd'));
      current = current.plus({ days: 1 });
    }

    return dates;
  }

  /**
   * Perform check-in using browser geolocation
   */
  async performCheckIn(
    activity: Activity,
    userId: string,
    userName: string
  ): Promise<CheckInResult> {
    // Check if geolocation is available
    if (!('geolocation' in navigator)) {
      return {
        success: false,
        error: 'Geolocation not supported by browser'
      };
    }

    // Get current position
    try {
      const position = await this.getCurrentPosition();
      const now = DateTime.now();
      const today = now.toFormat('yyyy-MM-dd');

      // Create check-in record
      const checkIn: CheckInRecord = {
        id: `checkin-${Date.now()}`,
        userId,
        userName,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: now.toISO()!,
        date: today
      };

      // Calculate distance from expected location (if set)
      if (activity.location) {
        checkIn.distanceFromLocation = this.calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          activity.location.lat,
          activity.location.lng
        );
      }

      // Try to get address (optional - may fail)
      try {
        checkIn.address = await this.reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        // Address is optional, continue without it
      }

      return {
        success: true,
        checkIn
      };

    } catch (error: any) {
      console.error('Check-in failed:', error);

      // Map geolocation errors to user-friendly messages
      let errorMessage = 'Failed to get location';

      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'Location unavailable. Please check your device GPS.';
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = 'Location request timed out. Please try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get current GPS position
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0 // No cached position
        }
      );
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
  }

  /**
   * Reverse geocode coordinates to address (optional)
   * Uses browser's Geocoding API if available, or returns fallback
   */
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // For now, return a formatted coordinate string
    // In production, you'd call Google Geocoding API or similar
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    // Example with Google Geocoding API (requires API key):
    /*
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY`
    );
    const data = await response.json();
    return data.results[0]?.formatted_address || `${lat}, ${lng}`;
    */
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Get color indicator based on distance from expected location
   */
  getDistanceStatus(meters: number): 'success' | 'warning' | 'danger' {
    if (meters <= 50) return 'success';   // Within 50m - green
    if (meters <= 200) return 'warning';  // Within 200m - yellow
    return 'danger';                      // Over 200m - red
  }

  /**
   * Check if user can check in (permission granted)
   */
  canRequestLocation(): boolean {
    return this.locationPermission() !== 'denied' &&
           this.locationPermission() !== 'unavailable';
  }

  /**
   * Request location permission
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const position = await this.getCurrentPosition();
      this.locationPermission.set('granted');
      return true;
    } catch (error: any) {
      if (error.code === 1) {
        this.locationPermission.set('denied');
      }
      return false;
    }
  }
}
