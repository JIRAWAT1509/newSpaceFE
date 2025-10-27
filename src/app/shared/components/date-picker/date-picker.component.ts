import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css'
})


export class DatePickerComponent implements OnInit, OnChanges {
  @Input() value: string = '';
  @Input() placeholder: string = 'DD/MM/YYYY';
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() pickerOpen = new EventEmitter<void>();

  isOpen: boolean = false;
  displayValue: string = '';

    get today(): DateTime {
    return DateTime.now();
  }

  // Calendar state
  currentMonth: DateTime = DateTime.now();
  selectedDate: DateTime | null = null;
  minDateTime: DateTime | null = null;
  maxDateTime: DateTime | null = null;

  // View modes: 'day' | 'month' | 'year'
  viewMode: 'day' | 'month' | 'year' = 'day';

  // For year range selection
  yearRangeStart: number = 2020;

  weeks: DateTime[][] = [];
  months: string[] = [];
  years: number[] = [];

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  dropdownTop: number = 0;
  dropdownLeft: number = 0;
  isPositioned: boolean = false; // New flag to track if positioned

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.value) {
      this.parseValue(this.value);
    }
    this.parseMinMaxDates();
    this.generateCalendar();
    this.generateMonths();
    this.generateYears();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minDate'] || changes['maxDate']) {
      this.parseMinMaxDates();

      // If picker is open and dates changed, navigate to appropriate month
      if (this.isOpen) {
        this.navigateToValidMonth();
        this.generateCalendar();
        this.generateMonths();
        this.generateYears();
      }
    }
  }

  navigateToValidMonth(): void {
    // Navigate to the first or last available date based on constraints
    if (this.minDateTime && this.maxDateTime) {
      // If we have both min and max, go to min date (start of valid range)
      this.currentMonth = this.minDateTime.startOf('month');
    } else if (this.minDateTime) {
      // If only min date, go to min date
      this.currentMonth = this.minDateTime.startOf('month');
    } else if (this.maxDateTime) {
      // If only max date, go to max date
      this.currentMonth = this.maxDateTime.startOf('month');
    }
  }

  parseMinMaxDates(): void {
    if (this.minDate) {
      const parts = this.minDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        this.minDateTime = DateTime.fromObject({ year, month, day });
      }
    } else {
      this.minDateTime = null;
    }

    if (this.maxDate) {
      const parts = this.maxDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        this.maxDateTime = DateTime.fromObject({ year, month, day });
      }
    } else {
      this.maxDateTime = null;
    }
  }

  parseValue(value: string): void {
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      this.selectedDate = DateTime.fromObject({ year, month, day });
      this.currentMonth = this.selectedDate.startOf('month');
      this.displayValue = this.selectedDate.toFormat('dd/MM/yyyy');
    }
  }

  toggleCalendar(): void {
    const wasOpen = this.isOpen;
    this.isOpen = !this.isOpen;

    if (this.isOpen && !wasOpen) {
      this.isPositioned = false; // Reset positioning flag

      // Emit open event when opening
      this.pickerOpen.emit();

      this.viewMode = 'day';
      this.generateCalendar();

      // Calculate dropdown position immediately
      this.calculateDropdownPosition();

      // Mark as positioned after calculation
      setTimeout(() => {
        this.isPositioned = true;
      }, 0);
    }
  }


  // Method to programmatically open the picker (used by parent component)
  public open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.isPositioned = false;

      this.viewMode = 'day';

      // Navigate to appropriate month based on constraints
      this.navigateToValidMonth();
      this.generateCalendar();

      // Calculate position
      this.calculateDropdownPosition();

      // Mark as positioned
      setTimeout(() => {
        this.isPositioned = true;
      }, 0);
    }
  }

  generateCalendar(): void {
    const startOfMonth = this.currentMonth.startOf('month');
    const endOfMonth = this.currentMonth.endOf('month');

    let current = startOfMonth.startOf('week');

    this.weeks = [];
    while (current <= endOfMonth.endOf('week')) {
      const week: DateTime[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = current.plus({ days: 1 });
      }
      this.weeks.push(week);
    }
  }

  generateMonths(): void {
    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }

  generateYears(): void {
    this.yearRangeStart = Math.floor(this.currentMonth.year / 12) * 12;
    this.years = [];
    for (let i = 0; i < 12; i++) {
      this.years.push(this.yearRangeStart + i);
    }
  }

  selectDate(date: DateTime): void {
    if (date.month !== this.currentMonth.month) {
      return;
    }

    if (this.isDateDisabled(date)) {
      return;
    }

    this.selectedDate = date;
    this.displayValue = date.toFormat('dd/MM/yyyy');
    this.value = date.toFormat('dd/MM/yyyy');
    this.valueChange.emit(this.value);
    this.isOpen = false;
    this.isPositioned = false;
  }

  isSelected(date: DateTime): boolean {
    return this.selectedDate?.hasSame(date, 'day') || false;
  }

  isToday(date: DateTime): boolean {
    return date.hasSame(DateTime.now(), 'day');
  }

  isCurrentMonth(date: DateTime): boolean {
    return date.month === this.currentMonth.month;
  }

  isDateDisabled(date: DateTime): boolean {
    const today = DateTime.now().endOf('day');

    if (date > today) {
      return true;
    }

    if (this.minDateTime && date < this.minDateTime.startOf('day')) {
      return true;
    }
    if (this.maxDateTime && date > this.maxDateTime.endOf('day')) {
      return true;
    }
    return false;
  }

  isMonthDisabled(monthIndex: number): boolean {
    const testDate = this.currentMonth.set({ month: monthIndex + 1 });
    const startOfMonth = testDate.startOf('month');
    const endOfMonth = testDate.endOf('month');
    const today = DateTime.now().endOf('day');

    if (startOfMonth > today) {
      return true;
    }

    if (this.minDateTime && endOfMonth < this.minDateTime) {
      return true;
    }
    if (this.maxDateTime && startOfMonth > this.maxDateTime) {
      return true;
    }
    return false;
  }

  isYearDisabled(year: number): boolean {
    const testDate = this.currentMonth.set({ year });
    const startOfYear = testDate.startOf('year');
    const endOfYear = testDate.endOf('year');
    const today = DateTime.now().endOf('day');

    if (startOfYear > today) {
      return true;
    }

    if (this.minDateTime && endOfYear < this.minDateTime) {
      return true;
    }
    if (this.maxDateTime && startOfYear > this.maxDateTime) {
      return true;
    }
    return false;
  }

  previousMonth(): void {
    const newMonth = this.currentMonth.minus({ months: 1 });
    if (this.minDateTime) {
      const newMonthEnd = newMonth.endOf('month');
      if (newMonthEnd < this.minDateTime) {
        return;
      }
    }
    this.currentMonth = newMonth;
    this.generateCalendar();
  }

  nextMonth(): void {
    const newMonth = this.currentMonth.plus({ months: 1 });
    const today = DateTime.now();

    if (newMonth.startOf('month') > today.endOf('month')) {
      return;
    }

    if (this.maxDateTime) {
      const newMonthStart = newMonth.startOf('month');
      if (newMonthStart > this.maxDateTime) {
        return;
      }
    }
    this.currentMonth = newMonth;
    this.generateCalendar();
  }

  switchToMonthView(): void {
    this.viewMode = 'month';
  }

  switchToYearView(): void {
    this.viewMode = 'year';
    this.generateYears();
  }

  selectMonth(monthIndex: number): void {
    if (this.isMonthDisabled(monthIndex)) {
      return;
    }
    this.currentMonth = this.currentMonth.set({ month: monthIndex + 1 });
    this.viewMode = 'day';
    this.generateCalendar();
  }

  selectYear(year: number): void {
    if (this.isYearDisabled(year)) {
      return;
    }
    this.currentMonth = this.currentMonth.set({ year });
    this.viewMode = 'month';
  }

  previousYearRange(): void {
    this.yearRangeStart -= 12;
    this.years = [];
    for (let i = 0; i < 12; i++) {
      this.years.push(this.yearRangeStart + i);
    }
  }

  nextYearRange(): void {
    this.yearRangeStart += 12;
    this.years = [];
    for (let i = 0; i < 12; i++) {
      this.years.push(this.yearRangeStart + i);
    }
  }

  calculateDropdownPosition(): void {
    const element = this.elementRef.nativeElement.querySelector('input');
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const dropdownHeight = 380;
    const dropdownWidth = 320;

    // Calculate vertical position
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= dropdownHeight) {
      this.dropdownTop = rect.bottom + window.scrollY + 8;
    } else if (spaceAbove >= dropdownHeight) {
      this.dropdownTop = rect.top + window.scrollY - dropdownHeight - 8;
    } else {
      this.dropdownTop = rect.bottom + window.scrollY + 8;
    }

    // Calculate horizontal position
    const spaceRight = window.innerWidth - rect.left;

    if (spaceRight >= dropdownWidth) {
      this.dropdownLeft = rect.left + window.scrollX;
    } else {
      this.dropdownLeft = rect.right + window.scrollX - dropdownWidth;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.isPositioned = false;
    }
  }
}
