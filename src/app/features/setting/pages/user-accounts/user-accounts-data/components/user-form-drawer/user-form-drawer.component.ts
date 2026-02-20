// user-form-drawer.component.ts - Right drawer with user form
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
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
    MultiSelect,
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
  titlePrefixOptions: DropdownOption[] = [
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Miss', value: 'Miss' },
    { label: 'Ms.', value: 'Ms.' },
    { label: 'Dr.', value: 'Dr.' },
  ];
  officeTypeOptions: DropdownOption[] = [
    { label: 'Head office', value: 'head' },
    { label: 'Branch', value: 'branch' },
  ];
  debtorTypeOptions: DropdownOption[] = [
    { label: 'Individual', value: 'individual' },
    { label: 'Company', value: 'company' },
    { label: 'Government', value: 'government' },
  ];

  /** ลำดับการอนุมัติ (1, 2, 3, ...) */
  approvalSequenceOptions: DropdownOption[] = [
    { label: 'Level 1', value: '1' },
    { label: 'Level 2', value: '2' },
    { label: 'Level 3', value: '3' },
    { label: 'Level 4', value: '4' },
    { label: 'Level 5', value: '5' },
  ];

  /** หน้าจอ/เมนูที่อนุญาต */
  screenOptions: DropdownOption[] = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Area Management', value: 'area' },
    { label: 'Contract', value: 'contract' },
    { label: 'Facilities', value: 'facilities' },
    { label: 'Finance', value: 'finance' },
    { label: 'Reports', value: 'reports' },
    { label: 'Setting', value: 'setting' },
    { label: 'Sales', value: 'sales' },
  ];

  /** ขอบเขตการเข้าถึงข้อมูล */
  dataAccessScopeOptions: DropdownOption[] = [
    { label: 'All data', value: 'all' },
    { label: 'Branch only', value: 'branch' },
    { label: 'Department only', value: 'department' },
    { label: 'Own data only', value: 'own' },
  ];

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
      displayName: user.USER_NAME,
      fullName: user.DEPARTMENT,
      position: '',
      status: user.INACTIVE === 'N' ? 'active' : 'inactive',
      role: user.USER_GROUP,
      department: user.DEPARTMENT,
      maxSessions: user.EXP_WITHIN_DAY,
      warningDays: 0,
      email: user.EMAIL || '',
      billingEmail: user.BILLING_EMAIL || '',
      sendInvoice: user.SEND_INVOICE === 'Y',
      sendCreditNote: user.SEND_CREDIT_NOTE === 'Y',
      sendReceipt: user.SEND_RECEIPT === 'Y',
      sendCreditReceipt: user.SEND_CREDIT_RECEIPT === 'Y',
      debtorType: user.DEBTOR_TYPE || '',
      titlePrefix: user.TITLE_PREFIX || '',
      officeType: user.OFFICE_TYPE || '',
      addressEn: user.ADDRESS_EN || '',
      approvalSequence: user.APPROVAL_SEQUENCE != null ? String(user.APPROVAL_SEQUENCE) : '',
      allowedScreens: user.ALLOWED_SCREENS ? (() => { try { return JSON.parse(user.ALLOWED_SCREENS) as string[]; } catch { return []; } })() : [],
      dataAccessScope: user.DATA_ACCESS_SCOPE || '',
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
      billingEmail: '',
      sendInvoice: false,
      sendCreditNote: false,
      sendReceipt: false,
      sendCreditReceipt: false,
      debtorType: '',
      titlePrefix: '',
      officeType: '',
      addressEn: '',
      approvalSequence: '',
      allowedScreens: [],
      dataAccessScope: '',
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

    // Customer & Documents – required fields
    if (!this.formData.billingEmail.trim()) {
      this.errors['billingEmail'] = 'Customer email for invoices is required';
      isValid = false;
    }
    if (!this.formData.debtorType) {
      this.errors['debtorType'] = 'Debtor type is required';
      isValid = false;
    }

    // Approval & Access – required fields
    if (!this.formData.approvalSequence) {
      this.errors['approvalSequence'] = 'Approval sequence is required';
      isValid = false;
    }
    if (!this.formData.dataAccessScope) {
      this.errors['dataAccessScope'] = 'Data access scope is required';
      isValid = false;
    }
    if (!this.formData.allowedScreens?.length) {
      this.errors['allowedScreens'] = 'Select at least one allowed screen';
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
    if (this.formData.billingEmail && !this.isValidEmail(this.formData.billingEmail)) {
      this.errors['billingEmail'] = 'Please enter a valid email address';
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
