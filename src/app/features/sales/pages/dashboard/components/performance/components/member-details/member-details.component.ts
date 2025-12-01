// member-details.component.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { SalesTeamMember, SalesActivity } from '@core/data/sales-performance.mock';

// Import the existing activity-calendar component
// You'll need to adjust the path based on your actual structure
import { ActivityCalendarComponent } from './../../../activities/calendar/activity-calendar.component';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [
    CommonModule,
    ActivityCalendarComponent, // Uncomment when you have the correct path
  ],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.css'
})
export class MemberDetailsComponent {

  // ==================== INPUTS ====================
  @Input() member: SalesTeamMember | null = null;
  @Input() activities: SalesActivity[] = [];

  // ==================== OUTPUTS ====================
  @Output() close = new EventEmitter<void>();

  // ==================== SIGNALS ====================
  calendarView = signal<'month' | 'week'>('month');
  currentDate = signal<DateTime>(DateTime.now());

  // ==================== EXPOSE TO TEMPLATE ====================
  DateTime = DateTime;

  // ==================== EVENT HANDLERS ====================

  onClose(): void {
    this.close.emit();
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
  }

  onActivityClick(activityId: string): void {
    console.log('Activity clicked:', activityId);
    // Handle activity click if needed
  }

  onDayClick(date: DateTime): void {
    console.log('Day clicked:', date.toISO());
    // Handle day click if needed
  }

  // ==================== FORMATTING ====================

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  formatPercentage(value: number): string {
    return `${value}%`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  // ==================== STATISTICS ====================

  getStatCards() {
    if (!this.member) return [];

    return [
      {
        icon: 'pi-dollar',
        label: 'Pipeline Value',
        labelTh: 'มูลค่า Pipeline',
        value: this.formatCurrency(this.member.pipelineValue),
        color: 'blue'
      },
      {
        icon: 'pi-chart-line',
        label: 'Coverage',
        labelTh: 'ความครอบคลุม',
        value: this.formatPercentage(this.member.coverage),
        color: 'green',
        subValue: this.member.coverage >= 100 ? 'Above Target' : 'Below Target'
      },
      {
        icon: 'pi-percentage',
        label: 'Win Rate',
        labelTh: 'อัตราการชนะ',
        value: this.formatPercentage(this.member.winRate),
        color: 'purple'
      },
      {
        icon: 'pi-users',
        label: 'Coaching Hours',
        labelTh: 'ชั่วโมงโค้ช',
        value: this.member.coachingHours.toString(),
        color: 'orange',
        subValue: 'this month'
      }
    ];
  }

  // ==================== ACTIVITY CONVERSION ====================

  // Convert SalesActivity to Activity format for calendar
  convertActivitiesForCalendar() {
    return this.activities.map(activity => ({
      id: activity.id,
      type: 'assignment', // All sales activities are assignments
      title: activity.title,
      description: `${activity.clientName || ''} - ${activity.dealValue ? this.formatCurrency(activity.dealValue) : ''}`,
      startDate: activity.startDate,
      endDate: activity.endDate,
      status: activity.status === 'completed' ? 'finished' : activity.status === 'canceled' ? 'canceled' : 'pending',
      color: activity.color,
      createdBy: activity.createdBy,
      createdByName: activity.createdByName,
      assignedTo: [activity.assignedTo],
      assignedToRoles: [],
      files: [],
      comments: [],
      createdAt: activity.startDate,
      updatedAt: activity.startDate
    }));
  }

  // Get current month display
  getCurrentMonthDisplay(): string {
    return this.currentDate().toFormat('MMMM yyyy');
  }

  getWeeklyAverage(member: SalesTeamMember): number {
  if (!member.weeklySalesHistory || member.weeklySalesHistory.length === 0) {
    return 0;
  }
  const total = member.weeklySalesHistory.reduce((sum, value) => sum + value, 0);
  return total / member.weeklySalesHistory.length;
}
}
