// activity-calendar.component.ts - FIXED VERSION WITH DAY CLICK
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { Activity } from '@core/data/activities.mock';

interface CalendarDay {
  date: DateTime;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  activities: Activity[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface WeekViewDay {
  date: DateTime;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  activities: ActivityWithTime[];
}

interface ActivityWithTime {
  activity: Activity;
  startTime: DateTime;
  endTime: DateTime;
  top: number;
  height: number;
  column: number;
  spansDays: number;
}

interface TimeSlot {
  hour: number;
  label: string;
}

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-calendar.component.html',
  styleUrl: './activity-calendar.component.css'
})
export class ActivityCalendarComponent implements OnInit, OnChanges {

  protected readonly DateTime = DateTime;

  // ==================== INPUTS ====================
  @Input() activities: Activity[] = [];
  @Input() view: 'month' | 'week' = 'month';
  @Input() currentDate: DateTime = DateTime.now();
  @Input() selectedDate: DateTime | null = null; // NEW: Selected date to highlight

  // ==================== OUTPUTS ====================
  @Output() activityClick = new EventEmitter<string>();
  @Output() dayClick = new EventEmitter<DateTime>(); // NEW: Emit when day is clicked

  // ==================== SIGNALS ====================
  calendarWeeks = signal<CalendarWeek[]>([]);
  weekViewDays = signal<WeekViewDay[]>([]);
  timeSlots = signal<TimeSlot[]>([]);
  monthLabel = signal<string>('');
  weekLabel = signal<string>('');

  // ==================== CONSTANTS ====================
  weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  weekdaysTh = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  // ==================== LIFECYCLE ====================

  constructor() {
    effect(() => {
      if (this.view === 'month') {
        this.generateMonthView();
      } else {
        this.generateWeekView();
      }
    });
  }

  ngOnInit(): void {
    this.generateTimeSlots();
    if (this.view === 'month') {
      this.generateMonthView();
    } else {
      this.generateWeekView();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activities'] || changes['currentDate'] || changes['view']) {
      if (this.view === 'month') {
        this.generateMonthView();
      } else {
        this.generateWeekView();
      }
    }
  }

  // ==================== MONTH VIEW ====================

  generateMonthView(): void {
    const start = this.currentDate.startOf('month').startOf('week');
    const end = this.currentDate.endOf('month').endOf('week');

    const weeks: CalendarWeek[] = [];
    let current = start;

    while (current <= end) {
      const week: CalendarWeek = { days: [] };

      for (let i = 0; i < 7; i++) {
        const dayActivities = this.getActivitiesForDate(current);

        week.days.push({
          date: current,
          day: current.day,
          isCurrentMonth: current.month === this.currentDate.month,
          isToday: current.hasSame(DateTime.now(), 'day'),
          isWeekend: current.weekday === 6 || current.weekday === 7,
          activities: dayActivities
        });

        current = current.plus({ days: 1 });
      }

      weeks.push(week);
    }

    this.calendarWeeks.set(weeks);
    this.monthLabel.set(this.currentDate.toFormat('MMMM yyyy'));
  }

  getActivitiesForDate(date: DateTime): Activity[] {
    const checkDate = date.startOf('day');

    return this.activities.filter(activity => {
      const startDate = DateTime.fromISO(activity.startDate).startOf('day');
      const endDate = DateTime.fromISO(activity.endDate).startOf('day');

      // Activity is on this date if the date falls within its range
      return checkDate >= startDate && checkDate <= endDate;
    }).slice(0, 3); // Show max 3 activities per day
  }

  // Check if activity is the first day in current week view
  isFirstDayInWeek(activity: Activity, currentDate: DateTime): boolean {
    const startDate = DateTime.fromISO(activity.startDate).startOf('day');
    const cellDate = currentDate.startOf('day');

    // Is first day if: it starts on this day OR this is Monday (start of week)
    return cellDate.equals(startDate) || cellDate.weekday === 1;
  }

  // Check if activity is the last day in current week view
  isLastDayInWeek(activity: Activity, currentDate: DateTime): boolean {
    const endDate = DateTime.fromISO(activity.endDate).startOf('day');
    const cellDate = currentDate.startOf('day');

    // Is last day if: it ends on this day OR this is Sunday (end of week)
    return cellDate.equals(endDate) || cellDate.weekday === 7;
  }

  // Get activity bar style for month view
  getActivityBarStyle(activity: Activity, currentDate: DateTime): any {
    const isFirst = this.isFirstDayInWeek(activity, currentDate);
    const isLast = this.isLastDayInWeek(activity, currentDate);

    let borderRadius = '0';
    if (isFirst && isLast) {
      borderRadius = '6px';
    } else if (isFirst) {
      borderRadius = '6px 0 0 6px';
    } else if (isLast) {
      borderRadius = '0 6px 6px 0';
    }

    return {
      'border-radius': borderRadius
    };
  }

  // ==================== WEEK VIEW ====================

  generateWeekView(): void {
    const startOfWeek = this.currentDate.startOf('week');
    const days: WeekViewDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.plus({ days: i });
      const dayActivities = this.getActivitiesWithTimeForDate(date);

      days.push({
        date,
        dayName: date.toFormat('EEE'),
        dayNumber: date.day,
        isToday: date.hasSame(DateTime.now(), 'day'),
        activities: dayActivities
      });
    }

    this.weekViewDays.set(days);

    const endOfWeek = startOfWeek.plus({ days: 6 });
    this.weekLabel.set(
      `${startOfWeek.toFormat('MMM d')} - ${endOfWeek.toFormat('MMM d, yyyy')}`
    );
  }

  getActivitiesWithTimeForDate(date: DateTime): ActivityWithTime[] {
    const dayStart = date.startOf('day');
    const dayEnd = date.endOf('day');

    const activities = this.activities.filter(activity => {
      const startDate = DateTime.fromISO(activity.startDate);
      const endDate = DateTime.fromISO(activity.endDate);

      return (startDate >= dayStart && startDate <= dayEnd) ||
             (endDate >= dayStart && endDate <= dayEnd) ||
             (startDate <= dayStart && endDate >= dayEnd);
    });

    return activities.map(activity => {
      const startDate = DateTime.fromISO(activity.startDate);
      const endDate = DateTime.fromISO(activity.endDate);

      const effectiveStart = startDate < dayStart ? dayStart : startDate;
      const effectiveEnd = endDate > dayEnd ? dayEnd : endDate;

      const startMinutes = effectiveStart.hour * 60 + effectiveStart.minute;
      const endMinutes = effectiveEnd.hour * 60 + effectiveEnd.minute;
      const durationMinutes = endMinutes - startMinutes;

      const top = (startMinutes / 60) * 60;
      const height = Math.max((durationMinutes / 60) * 60, 30);

      const spansDays = Math.ceil(endDate.diff(startDate, 'days').days);

      return {
        activity,
        startTime: effectiveStart,
        endTime: effectiveEnd,
        top,
        height,
        column: date.weekday - 1,
        spansDays
      };
    });
  }

  generateTimeSlots(): void {
    const slots: TimeSlot[] = [];

    slots.push({ hour: -1, label: 'GMT+07' });

    for (let hour = 1; hour <= 23; hour++) {
      slots.push({ hour, label: `${hour} ${hour < 12 ? 'AM' : 'PM'}` });
    }

    this.timeSlots.set(slots);
  }

  getTimeLabel(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  // ==================== EVENT HANDLERS ====================

  onActivityClick(activityId: string, event: Event): void {
    event.stopPropagation();
    this.activityClick.emit(activityId);
  }

  onDayClick(date: DateTime, event: Event): void {
    event.stopPropagation();
    this.dayClick.emit(date);
  }

  // Check if date is the selected date
  isSelectedDate(date: DateTime): boolean {
    if (!this.selectedDate) return false;
    return date.hasSame(this.selectedDate, 'day');
  }

  // ==================== DISPLAY HELPERS ====================

  getActivityTimeDisplay(activity: Activity): string {
    const startDate = DateTime.fromISO(activity.startDate);
    const endDate = DateTime.fromISO(activity.endDate);

    if (!startDate.hasSame(endDate, 'day')) {
      return '';
    }

    return `${startDate.toFormat('HH:mm')} - ${endDate.toFormat('HH:mm')}`;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'in-progress': 'status-in-progress',
      'finished': 'status-finished',
      'canceled': 'status-canceled',
      'returned': 'status-returned'
    };
    return statusMap[status] || 'status-pending';
  }

  getTypeClass(type: string): string {
    return type === 'assignment' ? 'type-assignment' : 'type-personal';
  }

  formatActivityTitle(title: string, maxLength: number = 30): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  getWeekViewActivityStyle(activityWithTime: ActivityWithTime): any {
    return {
      'top.px': activityWithTime.top,
      'height.px': activityWithTime.height,
      'z-index': 10
    };
  }

  // Check if activity is overdue
  isOverdue(activity: Activity): boolean {
    if (activity.status === 'finished' || activity.status === 'canceled') {
      return false;
    }
    const endDate = DateTime.fromISO(activity.endDate);
    return endDate < DateTime.now();
  }
}
