// activity-checkin-button.component.ts - Check-In Button Component

import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity } from '@core/data/activities.mock';
import { User } from '@core/data/users.mock';
import { CheckInService, CheckInStatus } from '@core/services/checkin.service';

@Component({
  selector: 'app-activity-checkin-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-checkin-button.component.html',
  styleUrl: './activity-checkin-button.component.css'
})
export class ActivityCheckInButtonComponent implements OnInit {

  @Input() activity!: Activity;
  @Input() currentUser!: User;
  @Output() checkInSuccess = new EventEmitter<void>();

  // Signals
  checkInStatus = signal<CheckInStatus | null>(null);
  isCheckingIn = signal<boolean>(false);
  error = signal<string | null>(null);
  showPermissionModal = signal<boolean>(false);

  constructor(private checkInService: CheckInService) {}

  ngOnInit(): void {
    this.loadCheckInStatus();
  }

  loadCheckInStatus(): void {
    const status = this.checkInService.getCheckInStatus(
      this.activity,
      this.currentUser.id
    );
    this.checkInStatus.set(status);
  }

  async onCheckIn(event: Event): Promise<void> {
    event.stopPropagation();

    // Check permission first
    if (!this.checkInService.canRequestLocation()) {
      this.showPermissionModal.set(true);
      return;
    }

    this.isCheckingIn.set(true);
    this.error.set(null);

    try {
      const result = await this.checkInService.performCheckIn(
        this.activity,
        this.currentUser.id,
        this.currentUser.name
      );

      if (result.success && result.checkIn) {
        // Emit success event to parent
        this.checkInSuccess.emit();

        // Reload status
        this.loadCheckInStatus();
      } else {
        this.error.set(result.error || 'Check-in failed');
      }
    } catch (error: any) {
      this.error.set(error.message || 'Unexpected error occurred');
    } finally {
      this.isCheckingIn.set(false);
    }
  }

  closeError(): void {
    this.error.set(null);
  }

  closePermissionModal(): void {
    this.showPermissionModal.set(false);
  }

  openLocationSettings(): void {
    alert('Please enable location access in your browser settings:\n\n' +
          '1. Click the location icon in the address bar\n' +
          '2. Select "Always allow" for location access\n' +
          '3. Refresh the page and try again');
  }

  // Computed
  canCheckIn = computed(() => {
    const status = this.checkInStatus();
    return status?.canCheckIn || false;
  });

  buttonText = computed(() => {
    const status = this.checkInStatus();
    if (!status) return 'Check-In';

    if (status.todayCheckIn) {
      return 'เช็คอินแล้ว';
    }

    return 'Check-In';
  });

  progressText = computed(() => {
    const status = this.checkInStatus();
    if (!status) return '';

    return `${status.completedCheckIns}/${status.requiredCheckIns} วัน`;
  });
}
