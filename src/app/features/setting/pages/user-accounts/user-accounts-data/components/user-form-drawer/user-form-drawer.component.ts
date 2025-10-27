// user-form-drawer.component.ts - Right drawer with user form
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';

import { User, UserFormData, DropdownOption } from '@core/models/user.model';
import { UserManagementService } from '@core/services/userManagement.service';
import { FormInputComponent } from '@shared/components/formInput/form-input.component';
import { FormTextareaComponent } from '@shared/components/formInput/form-textarea.component';
import { FormToggleComponent } from '@shared/components/formInput/form-toggle.component';
import { FormFileUploadComponent } from '@shared/components/formInput/form-file-upload.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';

@Component({
  selector: 'app-user-form-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    Button,
    FormInputComponent,
    FormTextareaComponent,
    FormToggleComponent,
    FormFileUploadComponent,
    WarningModalComponent
  ],
  templateUrl: './user-form-drawer.component.html',
  styleUrl: './user-form-drawer.component.css'
})
export class UserFormDrawerComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UserFormData>();

  formData: UserFormData = this.getEmptyFormData();
  roleOptions: DropdownOption[] = [];
  departmentOptions: DropdownOption[] = [];

  isSubmitting: boolean = false;
  showWarning: boolean = false;
  warningMessage: string = '';

  // Validation errors
  errors: { [key: string]: string } = {};

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit(): void {
    this.loadDropdownOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user && this.mode === 'edit') {
      this.populateFormFromUser(this.user);
    } else if (changes['mode'] && this.mode === 'create') {
      this.formData = this.getEmptyFormData();
      this.errors = {};
    }
  }

  loadDropdownOptions(): void {
    this.userManagementService.getRoleOptions().subscribe({
      next: (roles) => {
        // Remove 'All Roles' option for form
        this.roleOptions = roles.filter(r => r.value !== 'all');
      }
    });

    this.userManagementService.getDepartmentOptions().subscribe({
      next: (departments) => {
        this.departmentOptions = departments;
      }
    });
  }

  populateFormFromUser(user: User): void {
    this.formData = {
      userId: user.USER_ID,
      username: user.USER_NAME,
      displayName: user.USER_NAME, // Assuming same as username
      fullName: user.DEPARTMENT, // Adjust as needed
      position: '', // Not in API
      status: user.INACTIVE === 'N' ? 'active' : 'inactive',
      role: user.USER_GROUP,
      department: user.DEPARTMENT,
      maxSessions: user.EXP_WITHIN_DAY,
      warningDays: 0, // Default
      email: user.EMAIL || '',
      avatar: null,
      avatarPreview: user.PATH_IMG,
      password: '',
      confirmPassword: '',
      sendEmail: false
    };
  }

  getEmptyFormData(): UserFormData {
    return {
      userId: '',
      username: '',
      displayName: '',
      fullName: '',
      position: '',
      status: 'active',
      role: '',
      department: '',
      maxSessions: 90,
      warningDays: 0,
      email: '',
      avatar: null,
      avatarPreview: null,
      password: '',
      confirmPassword: '',
      sendEmail: false
    };
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Required fields validation
    if (!this.formData.userId.trim()) {
      this.errors['userId'] = 'User ID is required';
      isValid = false;
    }

    if (!this.formData.username.trim()) {
      this.errors['username'] = 'Username is required';
      isValid = false;
    }

    if (!this.formData.displayName.trim()) {
      this.errors['displayName'] = 'Display Name is required';
      isValid = false;
    }

    if (!this.formData.fullName.trim()) {
      this.errors['fullName'] = 'Full Name is required';
      isValid = false;
    }

    if (!this.formData.position.trim()) {
      this.errors['position'] = 'Position is required';
      isValid = false;
    }

    if (!this.formData.role) {
      this.errors['role'] = 'Role is required';
      isValid = false;
    }

    if (!this.formData.department) {
      this.errors['department'] = 'Department is required';
      isValid = false;
    }

    // Password validation (only for create mode or if password is entered in edit mode)
    if (this.mode === 'create' || this.formData.password) {
      if (!this.formData.password) {
        this.errors['password'] = 'Password is required';
        isValid = false;
      } else if (this.formData.password.length < 6) {
        this.errors['password'] = 'Password must be at least 6 characters';
        isValid = false;
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        this.errors['confirmPassword'] = 'Passwords do not match';
        isValid = false;
      }
    }

    // Email validation (optional but must be valid if provided)
    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      this.errors['email'] = 'Please enter a valid email address';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      this.showWarning = true;
      this.warningMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    if (this.mode === 'create') {
      this.userManagementService.createUser(this.formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.save.emit(this.formData);
          this.onClose();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.showWarning = true;
          this.warningMessage = 'Failed to create user. Please try again.';
        }
      });
    } else {
      this.userManagementService.updateUser(this.formData.userId, this.formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.save.emit(this.formData);
          this.onClose();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.showWarning = true;
          this.warningMessage = 'Failed to update user. Please try again.';
        }
      });
    }
  }

  onClose(): void {
    this.formData = this.getEmptyFormData();
    this.errors = {};
    this.close.emit();
  }

  closeWarning(): void {
    this.showWarning = false;
  }
}
