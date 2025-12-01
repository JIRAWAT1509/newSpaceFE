// activities-section.component.ts - CORRECTED VERSION
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

// Import mock data
import {
  Activity,
  ActivityType,
  ActivityStatus,
  MOCK_ACTIVITIES,
  MOCK_TEAM_ACTIVITY_FEED,
  TeamActivityFeedItem
} from '@core/data/activities.mock';
import { User, CURRENT_USER, MOCK_USERS } from '@core/data/users.mock';
import { Role, MOCK_ROLES } from '@core/data/roles.mock';

// Import child components
import { ActivityCalendarComponent } from './calendar/activity-calendar.component';
import { TeamActivityFeedComponent } from './activity-feed/team-activity-feed.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityDrawerComponent } from './activity-drawer/activity-drawer.component';
import { ActivityFiltersComponent, ActivityFilters } from './activity-filters/activity-filters.component';

@Component({
  selector: 'app-activities-section',
  standalone: true,
  imports: [
    CommonModule,
    ActivityCalendarComponent,
    TeamActivityFeedComponent,
    ActivityListComponent,
    ActivityDrawerComponent,
    ActivityFiltersComponent,
  ],
  templateUrl: './activities-section.component.html',
  styleUrl: './activities-section.component.css'
})
export class ActivitiesSectionComponent implements OnInit {
  // ==================== SIGNALS ====================

  // Data
  activities = signal<Activity[]>([]);
  teamActivityFeed = signal<TeamActivityFeedItem[]>([]);
  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  currentUser = signal<User>(CURRENT_USER);

  // UI State
  isLoading = signal<boolean>(false);
  selectedActivityId = signal<string | null>(null);
  isDrawerOpen = signal<boolean>(false);
  drawerMode = signal<'create' | 'edit'>('create');

  // Calendar State
  calendarView = signal<'month' | 'week'>('month');
  currentDate = signal<DateTime>(DateTime.now());
  selectedDate = signal<DateTime | null>(null); // NEW: Track selected date

  // Filter State
  activeFilters = signal<ActivityFilters>({ types: [], statuses: [] });

  // ==================== COMPUTED ====================

  // Filtered activities with all filters applied
  filteredActivities = computed(() => {
    let filtered = this.activities();
    const filters = this.activeFilters();
    const selectedDate = this.selectedDate();
    const currentUserId = this.currentUser().id;

    // Apply date filter first (if a date is selected)
    if (selectedDate) {
      const dayStart = selectedDate.startOf('day');
      const dayEnd = selectedDate.endOf('day');

      filtered = filtered.filter(activity => {
        const startDate = DateTime.fromISO(activity.startDate);
        const endDate = DateTime.fromISO(activity.endDate);

        return (startDate >= dayStart && startDate <= dayEnd) ||
               (endDate >= dayStart && endDate <= dayEnd) ||
               (startDate <= dayStart && endDate >= dayEnd);
      });
    }

    // Apply type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(activity => {
        // Check regular types
        if (filters.types.includes('assignment') && activity.type === 'assignment') {
          return true;
        }
        if (filters.types.includes('personal') && activity.type === 'personal') {
          return true;
        }

        // Check "assigned by me"
        if (filters.types.includes('assigned-by-me')) {
          return activity.type === 'assignment' &&
                 activity.createdBy === currentUserId;
        }

        return false;
      });
    }

    // Apply status filters
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(activity => {
        // Check regular statuses
        if (filters.statuses.includes(activity.status)) {
          return true;
        }

        // Check overdue
        if (filters.statuses.includes('overdue')) {
          const isOverdue = activity.status !== 'finished' &&
                           activity.status !== 'canceled' &&
                           DateTime.fromISO(activity.endDate) < DateTime.now();
          return isOverdue;
        }

        return false;
      });
    }

    return filtered;
  });

  // Selected activity details
  selectedActivity = computed(() => {
    const id = this.selectedActivityId();
    if (!id) return null;
    return this.activities().find(a => a.id === id) || null;
  });

  // Activities for calendar view (all activities)
  calendarActivities = computed(() => {
    return this.activities();
  });

  // Selected date text for display
  selectedDateText = computed(() => {
    const date = this.selectedDate();
    if (!date) return null;

    const today = DateTime.now();
    const tomorrow = today.plus({ days: 1 });
    const yesterday = today.minus({ days: 1 });

    if (date.hasSame(today, 'day')) {
      return 'วันนี้';
    } else if (date.hasSame(tomorrow, 'day')) {
      return 'พรุ่งนี้';
    } else if (date.hasSame(yesterday, 'day')) {
      return 'เมื่อวาน';
    } else {
      return date.setLocale('th').toFormat('dd MMM yyyy');
    }
  });

  // Activity counts for display
  activityCounts = computed(() => {
    const filtered = this.filteredActivities();
    return {
      total: filtered.length,
      hasActivities: filtered.length > 0
    };
  });

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadActivitiesData();
    this.startAutoRefresh();
  }

  // ==================== DATA LOADING ====================

  loadActivitiesData(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.activities.set([...MOCK_ACTIVITIES]);
      this.teamActivityFeed.set([...MOCK_TEAM_ACTIVITY_FEED].slice(0, 10));
      this.users.set([...MOCK_USERS]);
      this.roles.set([...MOCK_ROLES]);

      this.isLoading.set(false);
      console.log('Activities data loaded:', this.activities().length);
    }, 500);
  }

  // Auto-refresh team activity feed every 30 seconds
  startAutoRefresh(): void {
    setInterval(() => {
      this.refreshTeamActivityFeed();
    }, 30000);
  }

  refreshTeamActivityFeed(): void {
    console.log('Team activity feed refreshed');
  }

  // ==================== FILTER MANAGEMENT ====================

  onFiltersChange(filters: ActivityFilters): void {
    this.activeFilters.set(filters);
  }

  // ==================== CALENDAR MANAGEMENT ====================

  onDayClick(date: DateTime): void {
    this.selectedDate.set(date);
  }

  clearDateFilter(): void {
    this.selectedDate.set(null);
  }

  toggleCalendarView(): void {
    const current = this.calendarView();
    this.calendarView.set(current === 'month' ? 'week' : 'month');
  }

  navigateCalendar(direction: 'prev' | 'next'): void {
    const current = this.currentDate();
    const view = this.calendarView();

    if (view === 'month') {
      this.currentDate.set(
        direction === 'next'
          ? current.plus({ months: 1 })
          : current.minus({ months: 1 })
      );
    } else {
      this.currentDate.set(
        direction === 'next'
          ? current.plus({ weeks: 1 })
          : current.minus({ weeks: 1 })
      );
    }
  }

  goToToday(): void {
    this.currentDate.set(DateTime.now());
    this.selectedDate.set(null); // Clear date filter when going to today
  }

  // ==================== ACTIVITY SELECTION ====================

  selectActivity(activityId: string): void {
    if (this.selectedActivityId() === activityId) {
      this.selectedActivityId.set(null);
    } else {
      this.selectedActivityId.set(activityId);
    }
  }

  deselectActivity(): void {
    this.selectedActivityId.set(null);
  }

  // ==================== DRAWER MANAGEMENT ====================

  openCreateDrawer(type?: ActivityType): void {
    this.drawerMode.set('create');
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(activity: Activity): void {
    this.selectedActivityId.set(activity.id);
    this.drawerMode.set('edit');
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => {
      this.selectedActivityId.set(null);
    }, 300);
  }

  // ==================== ACTIVITY CRUD ====================

  createActivity(activityData: Partial<Activity>): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: activityData.type || 'personal',
        title: activityData.title || '',
        description: activityData.description || '',
        startDate: activityData.startDate || DateTime.now().toISO(),
        endDate: activityData.endDate || DateTime.now().toISO(),
        status: 'pending',
        createdBy: this.currentUser().id,
        createdByName: this.currentUser().name,
        assignedTo: activityData.assignedTo || [],
        assignedToRoles: activityData.assignedToRoles || [],
        finishRequirement: activityData.finishRequirement,
        files: [],
        comments: [],
        createdAt: DateTime.now().toISO(),
        updatedAt: DateTime.now().toISO(),
        color: activityData.type === 'assignment' ? '#3b82f6' : '#8b5cf6'
      };

      this.activities.update(activities => [...activities, newActivity]);

      if (newActivity.type === 'assignment') {
        this.addTeamActivityFeedItem({
          activityId: newActivity.id,
          activityTitle: newActivity.title,
          action: 'created',
          description: 'Created new assignment'
        });
      }

      this.isLoading.set(false);
      this.closeDrawer();

      console.log('Activity created:', newActivity);
    }, 500);
  }

  updateActivity(activityId: string, updates: Partial<Activity>): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.activities.update(activities =>
        activities.map(a =>
          a.id === activityId
            ? { ...a, ...updates, updatedAt: DateTime.now().toISO() }
            : a
        )
      );

      this.isLoading.set(false);
      this.closeDrawer();

      console.log('Activity updated:', activityId);
    }, 500);
  }

  deleteActivity(activityId: string): void {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?')) {
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      this.activities.update(activities =>
        activities.filter(a => a.id !== activityId)
      );

      this.isLoading.set(false);
      this.deselectActivity();

      console.log('Activity deleted:', activityId);
    }, 300);
  }

  // ==================== ACTIVITY STATUS UPDATES ====================

  updateActivityStatus(
    activityId: string,
    status: ActivityStatus,
    reason?: string,
    finishNote?: string
  ): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const updates: Partial<Activity> = {
        status,
        updatedAt: DateTime.now().toISO()
      };

      if (status === 'finished') {
        updates.finishedAt = DateTime.now().toISO();
      } else if (status === 'canceled') {
        updates.canceledAt = DateTime.now().toISO();
        updates.cancelReason = reason;
      } else if (status === 'returned') {
        updates.returnReason = reason;
      }

      this.activities.update(activities =>
        activities.map(a =>
          a.id === activityId ? { ...a, ...updates } : a
        )
      );

      const activity = this.activities().find(a => a.id === activityId);
      if (activity?.type === 'assignment') {
        this.addTeamActivityFeedItem({
          activityId,
          activityTitle: activity.title,
          action: status as any,
          description: reason || finishNote || `Updated status to ${status}`
        });
      }

      this.isLoading.set(false);
      console.log('Activity status updated:', activityId, status);
    }, 500);
  }

  // ==================== TEAM ACTIVITY FEED ====================

  addTeamActivityFeedItem(data: {
    activityId: string;
    activityTitle: string;
    action: 'created' | 'updated' | 'finished' | 'canceled' | 'returned';
    description: string;
  }): void {
    const newItem: TeamActivityFeedItem = {
      id: `feed-${Date.now()}`,
      activityId: data.activityId,
      activityTitle: data.activityTitle,
      userId: this.currentUser().id,
      userName: this.currentUser().name,
      userAvatar: this.currentUser().avatar,
      action: data.action,
      description: data.description,
      timestamp: DateTime.now().toISO()
    };

    this.teamActivityFeed.update(feed => [newItem, ...feed].slice(0, 10));
  }

  // ==================== UTILITY ====================

  getUserById(userId: string): User | undefined {
    return this.users().find(u => u.id === userId);
  }

  getRoleById(roleId: string): Role | undefined {
    return this.roles().find(r => r.id === roleId);
  }
}
