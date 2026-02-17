// activity-calendar.component.ts - BOTH FIXES: Z-INDEX + SCROLL
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, effect, untracked } from '@angular/core';
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

  @Input() activities: Activity[] = [];
  @Input() view: 'month' | 'week' = 'month';
  @Input() currentDate: DateTime = DateTime.now();
  @Input() selectedDate: DateTime | null = null;

  @Output() activityClick = new EventEmitter<string>();
  @Output() dayClick = new EventEmitter<DateTime>();

  calendarWeeks = signal<CalendarWeek[]>([]);
  weekViewDays = signal<WeekViewDay[]>([]);
  timeSlots = signal<TimeSlot[]>([]);
  monthLabel = signal<string>('');
  weekLabel = signal<string>('');

  weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  weekdaysTh = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  private hasScrolled = false;

  constructor() {
    effect(() => {
      const days = this.weekViewDays();

      if (this.view === 'week' && days && days.length > 0 && !this.hasScrolled) {
        this.hasScrolled = true;

        // ✅ ใช้ untracked เพื่อป้องกัน infinite loop
        untracked(() => {
          setTimeout(() => {
            this.scrollToFirstEvent();
          }, 200);
        });
      }

      if (this.view === 'month') {
        this.hasScrolled = false;
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
    if (changes['currentDate'] || changes['view']) {
      this.hasScrolled = false;
    }

    if (changes['activities'] || changes['currentDate'] || changes['view']) {
      if (this.view === 'month') {
        this.generateMonthView();
      } else {
        this.generateWeekView();
      }
    }
  }

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

      return checkDate >= startDate && checkDate <= endDate;
    }).slice(0, 3);
  }

  isFirstDayInWeek(activity: Activity, currentDate: DateTime): boolean {
    const startDate = DateTime.fromISO(activity.startDate).startOf('day');
    const cellDate = currentDate.startOf('day');

    return cellDate.equals(startDate) || cellDate.weekday === 1;
  }

  isLastDayInWeek(activity: Activity, currentDate: DateTime): boolean {
    const endDate = DateTime.fromISO(activity.endDate).startOf('day');
    const cellDate = currentDate.startOf('day');

    return cellDate.equals(endDate) || cellDate.weekday === 7;
  }

getActivityBarStyle(activity: Activity, currentDate: DateTime): any {
  const start = DateTime.fromISO(activity.startDate).startOf('day');
  const end = DateTime.fromISO(activity.endDate).startOf('day');
  const current = currentDate.startOf('day');

  // ✅ Multi-day: ซ่อนในวันที่ไม่ใช่วันแรก
  if (!start.equals(end) && !current.equals(start)) {
    return { 'display': 'none' };
  }

  // Single-day: ปกติ
  return {};
}

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

      let effectiveStart: DateTime;
      let effectiveEnd: DateTime;

      if (startDate.hasSame(date, 'day')) {
        effectiveStart = startDate;
      } else {
        effectiveStart = dayStart;
      }

      if (endDate.hasSame(date, 'day')) {
        effectiveEnd = endDate;
      } else {
        effectiveEnd = dayEnd;
      }

      const startMinutes = effectiveStart.hour * 60 + effectiveStart.minute;
      const endMinutes = effectiveEnd.hour * 60 + effectiveEnd.minute;
      const durationMinutes = endMinutes - startMinutes;

      const top = 60 + startMinutes;
      const height = Math.max(durationMinutes, 30);

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

    for (let hour = 0; hour <= 23; hour++) {
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

scrollToFirstEvent(): void {
  if (this.view !== 'week') return;

  const container = document.querySelector('.week-grid-container') as HTMLElement;
  if (!container) return;

  const allActivities: ActivityWithTime[] = [];
  this.weekViewDays().forEach(day => allActivities.push(...day.activities));

  if (allActivities.length === 0) {
    container.scrollTop = 60 + (8 * 60);
    return;
  }

  // ✅ กรอง events ที่เริ่มหลังเที่ยงคืน (ไม่ใช่ multi-day continuations)
  const todayStartingEvents = allActivities.filter(act => {
    return act.startTime.hour > 0 || act.startTime.minute > 0;
  });

  // ใช้ events ที่เริ่มวันนั้นจริงๆ ถ้ามี
  const eventsToConsider = todayStartingEvents.length > 0
    ? todayStartingEvents
    : allActivities;

  eventsToConsider.sort((a, b) => a.top - b.top);
  const firstActivity = eventsToConsider[0];

  const scrollTop = Math.max(0, firstActivity.top - 100);
  container.scrollTop = scrollTop;

  console.log('🎯 Scrolled to:', firstActivity.activity.title, 'at', firstActivity.startTime.toFormat('HH:mm'));
}

  scrollToTime(hour: number, minute: number = 0): void {
    const container = document.querySelector('.week-grid-container') as HTMLElement;
    if (!container) return;

    container.scrollTop = 60 + (hour * 60 + minute);
  }

  onActivityClick(activityId: string, event: Event): void {
    event.stopPropagation();
    this.activityClick.emit(activityId);
  }

  onDayClick(date: DateTime, event: Event): void {
    event.stopPropagation();
    this.dayClick.emit(date);
  }

  isSelectedDate(date: DateTime): boolean {
    if (!this.selectedDate) return false;
    return date.hasSame(this.selectedDate, 'day');
  }

  getActivityTimeDisplay(activity: Activity): string {
    const startDate = DateTime.fromISO(activity.startDate);
    const endDate = DateTime.fromISO(activity.endDate);

    if (!startDate.hasSame(endDate, 'day')) return '';

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
  const baseZ = 100 - Math.floor(activityWithTime.height / 10);
  const limitedZ = Math.min(baseZ, 40); // ✅ เปลี่ยนจาก 90 → 40

  return {
    'top': `${activityWithTime.top}px`,
    'height': `${activityWithTime.height}px`,
    'z-index': limitedZ.toString()
  };
}

  isOverdue(activity: Activity): boolean {
    if (activity.status === 'finished' || activity.status === 'canceled') {
      return false;
    }
    const endDate = DateTime.fromISO(activity.endDate);
    return endDate < DateTime.now();
  }

  getMultiDayClasses(activity: Activity, currentDate: DateTime): { [key: string]: boolean } {
  const start = DateTime.fromISO(activity.startDate).startOf('day');
  const end = DateTime.fromISO(activity.endDate).startOf('day');
  const current = currentDate.startOf('day');

  if (start.equals(end)) {
    return { 'single-day': true };
  }

  return {
    'multi-day-start': current.equals(start),
    'multi-day-end': current.equals(end),
    'multi-day-middle': current > start && current < end
  };
}
}
