// team-activity-feed.component.ts - FIXED
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
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
export class TeamActivityFeedComponent implements OnInit, OnDestroy, OnChanges {

  // ==================== EXPOSE DateTime TO TEMPLATE ====================
  protected readonly DateTime = DateTime;

  // ==================== INPUTS ====================
  @Input() feedItems: TeamActivityFeedItem[] = [];
  @Input() initialDisplayCount: number = 10;
  @Input() autoRefresh: boolean = true;
  @Input() refreshInterval: number = 30000;

  // ==================== OUTPUTS ====================
  @Output() activityClick = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  // ==================== SIGNALS ====================
  isLoading = signal<boolean>(false);
  lastRefreshTime = signal<DateTime>(DateTime.now());
  isExpanded = signal<boolean>(false);

  // ✅ NEW: Internal signal for feedItems
  private feedItemsSignal = signal<TeamActivityFeedItem[]>([]);

  // ✅ FIXED: Use internal signal in computed
  displayedItems = computed(() => {
    const items = this.feedItemsSignal(); // ✅ Use signal, not input
    const count = this.initialDisplayCount;
    const expanded = this.isExpanded();

    if (!items || items.length === 0) {
      return [];
    }

    return expanded ? items : items.slice(0, count);
  });

  hasMoreItems = computed(() => {
    const items = this.feedItemsSignal(); // ✅ Use signal
    return items.length > this.initialDisplayCount;
  });

  hiddenItemsCount = computed(() => {
    const items = this.feedItemsSignal(); // ✅ Use signal
    return Math.max(0, items.length - this.initialDisplayCount);
  });

  // ==================== LIFECYCLE ====================

  private refreshTimer?: any;

  ngOnInit(): void {
    // ✅ Initialize signal with input value
    this.feedItemsSignal.set(this.feedItems);

    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  // ✅ NEW: Update signal when input changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['feedItems']) {
      this.feedItemsSignal.set(this.feedItems);
      console.log('🔄 Feed items updated:', this.feedItems.length);
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // ==================== AUTO REFRESH ====================

  startAutoRefresh(): void {
    this.stopAutoRefresh();
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
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  // ==================== EXPAND/COLLAPSE ====================

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

  // ==================== EVENT HANDLERS ====================

  onFeedItemClick(activityId: string, event: Event): void {
    event.stopPropagation();
    this.activityClick.emit(activityId);
  }

  // ==================== UTILITY METHODS ====================
  // (keep all existing utility methods - getRelativeTime, etc.)

  getRelativeTime(timestamp: string | null): string {
    if (!timestamp) return 'Just now';
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

  getRelativeTimeTh(timestamp: string | null): string {
    if (!timestamp) return 'เมื่อสักครู่';
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

  getFullTimestamp(timestamp: string): string {
    return DateTime.fromISO(timestamp).toFormat('MMM d, yyyy HH:mm');
  }

  getUserInitials(userName: string): string {
    const names = userName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  }

  truncateTitle(title: string, maxLength: number = 40): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  isRecentItem(timestamp: string): boolean {
    const time = DateTime.fromISO(timestamp);
    const now = DateTime.now();
    const diff = now.diff(time, 'minutes');
    return diff.minutes < 5;
  }
}
