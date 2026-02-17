// activity-duplicate-dialog.component.ts

import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { Activity, ActivityType } from '@core/data/activities.mock';

@Component({
  selector: 'app-activity-duplicate-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-duplicate-dialog.component.html',
  styleUrl: './activity-duplicate-dialog.component.css'
})
export class ActivityDuplicateDialogComponent implements OnInit {

  @Input() activity!: Activity;
  @Output() duplicate = new EventEmitter<Partial<Activity>>();
  @Output() cancel = new EventEmitter<void>();

  // Signals
  newTitle = signal<string>('');
  startDate = signal<string>('');
  startTime = signal<string>('');
  endDate = signal<string>('');
  endTime = signal<string>('');

  // Quick date options
  selectedQuickOption = signal<string | null>(null);

  // Validation
  formErrors = signal<{ [key: string]: string }>({});

  ngOnInit(): void {
    // Initialize with original activity data
    this.newTitle.set(`${this.activity.title} (Copy)`);

    // Set dates to tomorrow by default
    const tomorrow = DateTime.now().plus({ days: 1 });
    const originalStart = DateTime.fromISO(this.activity.startDate);
    const originalEnd = DateTime.fromISO(this.activity.endDate);

    // Calculate duration to preserve it
    const duration = originalEnd.diff(originalStart);

    this.startDate.set(tomorrow.toFormat('yyyy-MM-dd'));
    this.startTime.set(originalStart.toFormat('HH:mm'));
    this.endDate.set(tomorrow.plus(duration).toFormat('yyyy-MM-dd'));
    this.endTime.set(originalEnd.toFormat('HH:mm'));
  }

  // Quick date selection
  onQuickDateSelect(option: string): void {
    this.selectedQuickOption.set(option);

    const originalStart = DateTime.fromISO(this.activity.startDate);
    const originalEnd = DateTime.fromISO(this.activity.endDate);
    const duration = originalEnd.diff(originalStart);

    let newStart: DateTime;

    switch(option) {
      case 'today':
        newStart = DateTime.now().set({
          hour: originalStart.hour,
          minute: originalStart.minute
        });
        break;
      case 'tomorrow':
        newStart = DateTime.now().plus({ days: 1 }).set({
          hour: originalStart.hour,
          minute: originalStart.minute
        });
        break;
      case 'next-week':
        newStart = DateTime.now().plus({ weeks: 1 }).set({
          hour: originalStart.hour,
          minute: originalStart.minute
        });
        break;
      case 'next-month':
        newStart = DateTime.now().plus({ months: 1 }).set({
          hour: originalStart.hour,
          minute: originalStart.minute
        });
        break;
      default:
        return;
    }

    const newEnd = newStart.plus(duration);

    this.startDate.set(newStart.toFormat('yyyy-MM-dd'));
    this.startTime.set(newStart.toFormat('HH:mm'));
    this.endDate.set(newEnd.toFormat('yyyy-MM-dd'));
    this.endTime.set(newEnd.toFormat('HH:mm'));
  }

  // Validation
  validateForm(): boolean {
    const errors: { [key: string]: string } = {};

    // Title validation
    if (!this.newTitle().trim()) {
      errors['title'] = 'กรุณากรอกชื่อกิจกรรม';
    }

    // Date validation
    if (!this.startDate()) {
      errors['startDate'] = 'กรุณาเลือกวันเริ่มต้น';
    }
    if (!this.endDate()) {
      errors['endDate'] = 'กรุณาเลือกวันสิ้นสุด';
    }

    // End date must be after start date
    if (this.startDate() && this.endDate()) {
      const start = DateTime.fromISO(`${this.startDate()}T${this.startTime()}`);
      const end = DateTime.fromISO(`${this.endDate()}T${this.endTime()}`);

      if (end < start) {
        errors['endDate'] = 'วันสิ้นสุดต้องมาหลังวันเริ่มต้น';
      }
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  // Submit
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const duplicatedActivity: Partial<Activity> = {
      // Copy all fields from original
      type: this.activity.type,
      title: this.newTitle(),
      description: this.activity.description,

      // New dates
      startDate: DateTime.fromISO(`${this.startDate()}T${this.startTime()}`).toISO()!,
      endDate: DateTime.fromISO(`${this.endDate()}T${this.endTime()}`).toISO()!,

      // Reset status
      status: 'pending',

      // Copy assignments
      assignedTo: this.activity.assignedTo,
      assignedToRoles: this.activity.assignedToRoles,
      finishRequirement: this.activity.finishRequirement,

      // Copy location
      location: this.activity.location,

      // Clear check-ins (new activity needs new check-ins)
      checkIns: [],

      // Clear files and comments
      files: [],
      comments: [],

      // Color
      color: this.activity.color
    };

    this.duplicate.emit(duplicatedActivity);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Computed
  activityDuration = computed(() => {
    const start = DateTime.fromISO(this.activity.startDate);
    const end = DateTime.fromISO(this.activity.endDate);
    const duration = end.diff(start, ['days', 'hours', 'minutes']);

    if (duration.days > 0) {
      return `${Math.floor(duration.days)} วัน ${Math.floor(duration.hours)} ชั่วโมง`;
    } else if (duration.hours > 0) {
      return `${Math.floor(duration.hours)} ชั่วโมง ${Math.floor(duration.minutes)} นาที`;
    } else {
      return `${Math.floor(duration.minutes)} นาที`;
    }
  });

  activityType = computed(() => {
    return this.activity.type === 'assignment' ? 'Assignment' : 'Personal Task';
  });

  hasLocation = computed(() => {
    return !!this.activity.location;
  });

  hasFinishRequirement = computed(() => {
    return this.activity.finishRequirement?.type !== 'none';
  });
}
