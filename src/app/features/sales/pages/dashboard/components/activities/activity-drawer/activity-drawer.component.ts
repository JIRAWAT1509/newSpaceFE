// activity-drawer.component.ts
import { Component, Input, Output, EventEmitter, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { Activity, ActivityType, ActivityRequirement } from '@core/data/activities.mock';
import { User } from '@core/data/users.mock';
import { Role } from '@core/data/roles.mock';

interface FormData {
  type: ActivityType;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  assignedTo: string[];
  assignedToRoles: string[];
  finishRequirement: ActivityRequirement;
}

@Component({
  selector: 'app-activity-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-drawer.component.html',
  styleUrl: './activity-drawer.component.css'
})
export class ActivityDrawerComponent implements OnInit {

  // ==================== EXPOSE DateTime TO TEMPLATE ====================
  protected readonly DateTime = DateTime;

  // ==================== INPUTS ====================
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() activity: Activity | null = null;
  @Input() users: User[] = [];
  @Input() roles: Role[] = [];
  @Input() currentUser!: User;

  // ==================== OUTPUTS ====================
  @Output() save = new EventEmitter<Partial<Activity>>();
  @Output() cancel = new EventEmitter<void>();

  // ==================== FORM SIGNALS ====================
  formData = signal<FormData>({
    type: 'personal',
    title: '',
    description: '',
    startDate: DateTime.now().toFormat('yyyy-MM-dd'),
    startTime: DateTime.now().toFormat('HH:mm'),
    endDate: DateTime.now().toFormat('yyyy-MM-dd'),
    endTime: DateTime.now().plus({ hours: 1 }).toFormat('HH:mm'),
    assignedTo: [],
    assignedToRoles: [],
    finishRequirement: {
      type: 'none',
      description: ''
    }
  });

  // UI State
  showAssigneeSearch = signal<boolean>(false);
  showRoleSearch = signal<boolean>(false);
  assigneeSearchQuery = signal<string>('');
  roleSearchQuery = signal<string>('');

  // Validation
  formErrors = signal<{ [key: string]: string }>({});

  // ==================== COMPUTED ====================

  // Filtered users for search
  filteredUsers = computed(() => {
    const query = this.assigneeSearchQuery().toLowerCase();
    if (!query) return this.users;

    return this.users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.nameTh.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  // Filtered roles for search
  filteredRoles = computed(() => {
    const query = this.roleSearchQuery().toLowerCase();
    if (!query) return this.roles;

    return this.roles.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.nameTh.toLowerCase().includes(query)
    );
  });

  // Selected users
  selectedUsers = computed(() => {
    const ids = this.formData().assignedTo;
    return this.users.filter(u => ids.includes(u.id));
  });

  // Selected roles
  selectedRoles = computed(() => {
    const ids = this.formData().assignedToRoles;
    return this.roles.filter(r => ids.includes(r.id));
  });

  // Check if form is valid
  isFormValid = computed(() => {
    const data = this.formData();

    // Required fields
    if (!data.title.trim()) return false;
    if (!data.startDate || !data.startTime) return false;
    if (!data.endDate || !data.endTime) return false;

    // Assignment must have assignees
    if (data.type === 'assignment') {
      if (data.assignedTo.length === 0 && data.assignedToRoles.length === 0) {
        return false;
      }
    }

    return true;
  });

  // ==================== LIFECYCLE ====================

  constructor() {
    // Watch for activity changes
    effect(() => {
      if (this.activity && this.mode === 'edit') {
        this.loadActivityData();
      }
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.activity) {
      this.loadActivityData();
    }
  }

  // ==================== FORM LOADING ====================

  loadActivityData(): void {
    if (!this.activity) return;

    const startDateTime = DateTime.fromISO(this.activity.startDate);
    const endDateTime = DateTime.fromISO(this.activity.endDate);

    this.formData.set({
      type: this.activity.type,
      title: this.activity.title,
      description: this.activity.description,
      startDate: startDateTime.toFormat('yyyy-MM-dd'),
      startTime: startDateTime.toFormat('HH:mm'),
      endDate: endDateTime.toFormat('yyyy-MM-dd'),
      endTime: endDateTime.toFormat('HH:mm'),
      assignedTo: this.activity.assignedTo || [],
      assignedToRoles: this.activity.assignedToRoles || [],
      finishRequirement: this.activity.finishRequirement || {
        type: 'none',
        description: ''
      }
    });
  }

  // ==================== FORM HANDLERS ====================

  updateField<K extends keyof FormData>(field: K, value: FormData[K]): void {
    this.formData.update(data => ({
      ...data,
      [field]: value
    }));

    // Clear error for this field
    this.formErrors.update(errors => {
      const newErrors = { ...errors };
      delete newErrors[field];
      return newErrors;
    });
  }

  onTypeChange(type: ActivityType): void {
    this.updateField('type', type);

    // Clear assignees if changing to personal
    if (type === 'personal') {
      this.updateField('assignedTo', []);
      this.updateField('assignedToRoles', []);
      this.updateField('finishRequirement', { type: 'none', description: '' });
    }
  }

  // ==================== ASSIGNEE MANAGEMENT ====================

  toggleAssignee(userId: string): void {
    const current = this.formData().assignedTo;
    const updated = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];

    this.updateField('assignedTo', updated);
  }

  removeAssignee(userId: string): void {
    const updated = this.formData().assignedTo.filter(id => id !== userId);
    this.updateField('assignedTo', updated);
  }

  toggleRole(roleId: string): void {
    const current = this.formData().assignedToRoles;
    const updated = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];

    this.updateField('assignedToRoles', updated);
  }

  removeRole(roleId: string): void {
    const updated = this.formData().assignedToRoles.filter(id => id !== roleId);
    this.updateField('assignedToRoles', updated);
  }

  isUserSelected(userId: string): boolean {
    return this.formData().assignedTo.includes(userId);
  }

  isRoleSelected(roleId: string): boolean {
    return this.formData().assignedToRoles.includes(roleId);
  }

  // ==================== SEARCH MANAGEMENT ====================

  toggleAssigneeSearch(): void {
    this.showAssigneeSearch.update(v => !v);
    if (this.showAssigneeSearch()) {
      this.showRoleSearch.set(false);
    }
  }

  toggleRoleSearch(): void {
    this.showRoleSearch.update(v => !v);
    if (this.showRoleSearch()) {
      this.showAssigneeSearch.set(false);
    }
  }

  closeSearches(): void {
    this.showAssigneeSearch.set(false);
    this.showRoleSearch.set(false);
    this.assigneeSearchQuery.set('');
    this.roleSearchQuery.set('');
  }

  // ==================== DATE/TIME MANAGEMENT ====================

  onStartDateChange(date: string): void {
    this.updateField('startDate', date);

    // If end date is before start date, update it
    if (date > this.formData().endDate) {
      this.updateField('endDate', date);
    }
  }

  onStartTimeChange(time: string): void {
    this.updateField('startTime', time);

    // If same day and end time is before start time, update end time
    const data = this.formData();
    if (data.startDate === data.endDate && time >= data.endTime) {
      const [hours, minutes] = time.split(':');
      const newEndTime = `${String(Number(hours) + 1).padStart(2, '0')}:${minutes}`;
      this.updateField('endTime', newEndTime);
    }
  }

  // ==================== FINISH REQUIREMENT ====================

  updateFinishRequirement(type: 'none' | 'text' | 'file' | 'both'): void {
    this.formData.update(data => ({
      ...data,
      finishRequirement: {
        ...data.finishRequirement,
        type
      }
    }));
  }

  updateFinishRequirementDescription(description: string): void {
    this.formData.update(data => ({
      ...data,
      finishRequirement: {
        ...data.finishRequirement,
        description
      }
    }));
  }

  // ==================== VALIDATION ====================

  validateForm(): boolean {
    const errors: { [key: string]: string } = {};
    const data = this.formData();

    // Title required
    if (!data.title.trim()) {
      errors['title'] = 'กรุณากรอกชื่อกิจกรรม';
    }

    // Dates required
    if (!data.startDate || !data.startTime) {
      errors['startDate'] = 'กรุณาเลือกวันและเวลาเริ่มต้น';
    }

    if (!data.endDate || !data.endTime) {
      errors['endDate'] = 'กรุณาเลือกวันและเวลาสิ้นสุด';
    }

    // End date must be after start date
    if (data.startDate && data.endDate && data.startTime && data.endTime) {
      const start = DateTime.fromISO(`${data.startDate}T${data.startTime}`);
      const end = DateTime.fromISO(`${data.endDate}T${data.endTime}`);

      if (end <= start) {
        errors['endDate'] = 'วันเวลาสิ้นสุดต้องมากกว่าวันเวลาเริ่มต้น';
      }
    }

    // Assignment must have assignees
    if (data.type === 'assignment') {
      if (data.assignedTo.length === 0 && data.assignedToRoles.length === 0) {
        errors['assignedTo'] = 'กรุณาเลือกผู้รับผิดชอบอย่างน้อย 1 คน/กลุ่ม';
      }
    }

    // Finish requirement description
    if (data.type === 'assignment' &&
        (data.finishRequirement.type === 'text' || data.finishRequirement.type === 'both') &&
        !data.finishRequirement.description?.trim()) {
      errors['finishRequirement'] = 'กรุณากรอกคำอธิบายข้อกำหนดการเสร็จสิ้น';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const data = this.formData();

    // Combine date and time into ISO strings
    const startDateTime = DateTime.fromISO(`${data.startDate}T${data.startTime}`);
    const endDateTime = DateTime.fromISO(`${data.endDate}T${data.endTime}`);

    const activityData: Partial<Activity> = {
      type: data.type,
      title: data.title.trim(),
      description: data.description.trim(),
      startDate: startDateTime.toISO() ?? undefined,
      endDate: endDateTime.toISO() ?? undefined,
    };

    // Add assignment-specific fields
    if (data.type === 'assignment') {
      activityData.assignedTo = data.assignedTo;
      activityData.assignedToRoles = data.assignedToRoles;
      activityData.finishRequirement = data.finishRequirement;
    }

    this.save.emit(activityData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // ==================== UTILITY METHODS ====================

  getDrawerTitle(): string {
    if (this.mode === 'create') {
      return this.formData().type === 'assignment'
        ? 'สร้าง Assignment ใหม่'
        : 'สร้าง Personal Task ใหม่';
    }
    return 'แก้ไขกิจกรรม';
  }

  getUserInitials(user: User): string {
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  getRoleColor(role: Role): string {
    return role.color || '#6b7280';
  }
}
