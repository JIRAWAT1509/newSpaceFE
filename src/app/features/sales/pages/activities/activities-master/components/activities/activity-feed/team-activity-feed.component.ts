// team-activity-feed.component.ts
import { Component, Input, Output, EventEmitter, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { TeamActivityFeedItem } from '@core/data/activities.mock';

@Component({
  selector: 'app-team-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-activity-feed.component.html',
  styleUrl: './team-activity-feed.component.css'
})
export class TeamActivityFeedComponent implements OnInit {

  // ==================== EXPOSE DateTime TO TEMPLATE ====================
  protected readonly DateTime = DateTime;

  // ==================== INPUTS ====================
  @Input() feedItems: TeamActivityFeedItem[] = [];
  @Input() maxItems: number = 10;
  @Input() autoRefresh: boolean = true;
  @Input() refreshInterval: number = 30000; // 30 seconds

  // ==================== OUTPUTS ====================
  @Output() activityClick = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  // ==================== SIGNALS ====================
  isLoading = signal<boolean>(false);
  lastRefreshTime = signal<DateTime>(DateTime.now());

  // ==================== LIFECYCLE ====================

  private refreshTimer?: any;

  ngOnInit(): void {
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // ==================== AUTO REFRESH ====================

  startAutoRefresh(): void {
    this.stopAutoRefresh(); // Clear any existing timer

    this.refreshTimer = setInterval(() => {
      this.refreshFeed();
    }, this.refreshInterval);
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  refreshFeed(): void {
    this.lastRefreshTime.set(DateTime.now());
    this.refresh.emit();
  }

  manualRefresh(): void {
    this.isLoading.set(true);
    this.refreshFeed();

    // Simulate loading delay
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  // ==================== EVENT HANDLERS ====================

  onFeedItemClick(activityId: string, event: Event): void {
    event.stopPropagation();
    this.activityClick.emit(activityId);
  }

  // ==================== UTILITY METHODS ====================

// Get relative time (e.g., "14 mins ago", "2 hours ago")
getRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Just now';  // ✅ ADD THIS LINE

  const time = DateTime.fromISO(timestamp);
  const now = DateTime.now();
  const diff = now.diff(time, ['days', 'hours', 'minutes', 'seconds']);

  if (diff.days >= 1) {
    const days = Math.floor(diff.days);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  if (diff.hours >= 1) {
    const hours = Math.floor(diff.hours);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  if (diff.minutes >= 1) {
    const minutes = Math.floor(diff.minutes);
    return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
  }

  return 'Just now';
}

// Get Thai relative time
getRelativeTimeTh(timestamp: string | null): string {
  if (!timestamp) return 'เมื่อสักครู่';  // ✅ ADD THIS LINE

  const time = DateTime.fromISO(timestamp);
  const now = DateTime.now();
  const diff = now.diff(time, ['days', 'hours', 'minutes', 'seconds']);

  if (diff.days >= 1) {
    const days = Math.floor(diff.days);
    return `${days} วันที่แล้ว`;
  }

  if (diff.hours >= 1) {
    const hours = Math.floor(diff.hours);
    return `${hours} ชั่วโมงที่แล้ว`;
  }

  if (diff.minutes >= 1) {
    const minutes = Math.floor(diff.minutes);
    return `${minutes} นาทีที่แล้ว`;
  }

  return 'เมื่อสักครู่';
}

  // Get action display text (English)
  getActionText(action: string): string {
    const actionMap: { [key: string]: string } = {
      'created': 'created',
      'updated': 'updated',
      'finished': 'completed',
      'canceled': 'canceled',
      'returned': 'returned'
    };
    return actionMap[action] || action;
  }

  // Get action display text (Thai)
  getActionTextTh(action: string): string {
    const actionMap: { [key: string]: string } = {
      'created': 'สร้าง',
      'updated': 'อัพเดท',
      'finished': 'เสร็จสิ้น',
      'canceled': 'ยกเลิก',
      'returned': 'ส่งคืน'
    };
    return actionMap[action] || action;
  }

  // Get action icon class
  getActionIconClass(action: string): string {
    const iconMap: { [key: string]: string } = {
      'created': 'pi-plus-circle',
      'updated': 'pi-refresh',
      'finished': 'pi-check-circle',
      'canceled': 'pi-times-circle',
      'returned': 'pi-replay'
    };
    return `pi ${iconMap[action] || 'pi-circle'}`;
  }

  // Get action color class
  getActionColorClass(action: string): string {
    const colorMap: { [key: string]: string } = {
      'created': 'action-created',
      'updated': 'action-updated',
      'finished': 'action-finished',
      'canceled': 'action-canceled',
      'returned': 'action-returned'
    };
    return colorMap[action] || 'action-default';
  }

  // Format full timestamp for tooltip
  getFullTimestamp(timestamp: string): string {
    return DateTime.fromISO(timestamp).toFormat('MMM d, yyyy HH:mm');
  }

  // Get user initials for avatar fallback
  getUserInitials(userName: string): string {
    const names = userName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  }

  // Truncate activity title if too long
  truncateTitle(title: string, maxLength: number = 40): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  // Check if item is recent (within last 5 minutes)
  isRecentItem(timestamp: string): boolean {
    const time = DateTime.fromISO(timestamp);
    const now = DateTime.now();
    const diff = now.diff(time, 'minutes');
    return diff.minutes < 5;
  }
}
