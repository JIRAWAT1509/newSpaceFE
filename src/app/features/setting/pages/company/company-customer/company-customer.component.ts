import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
// import { InputSwitch } from 'primeng/inputswitch';

interface Customer {
  OU_CODE: string;
  CUSTOMER_CODE: string;
  CUSTOMER_NAME: string;
  REC_STATUS: string;
  SHOP_NAME: string;
  ADDRESS: string;
  CREATE_DATE: string;
  SAP_CUSTOMER_CODE: string;
  // Extended fields for add/edit
  CUSTOMER_TYPE?: string;
  NATIONALITY?: string;
  TAX_ID?: string;
  PHONE?: string;
  EMAIL?: string;
  [key: string]: any;

    selected?: boolean;          // ✅ ADD THIS
  statusActive?: boolean;       // ✅ ADD THIS

}

interface FilterCriteria {
  codeFrom: string;
  codeTo: string;
  name: string;
  customerType: string[];
  nationality: string[];
}

interface FormStep {
  id: number;
  label: string;
  icon: string;
  completed: boolean;
}

@Component({
  selector: 'app-company-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    DialogModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    TextareaModule,
    RadioButtonModule,
    ToggleButtonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './company-customer.component.html',
  styleUrl: './company-customer.component.css',
})
export class CompanyCustomerComponent implements OnInit {
  // Data
  customers: Customer[] = [];
  totalRecords = 0;
  selectedCustomers: Customer[] = [];

  // Pagination
  first = 0;
  rows = 20;
  rowsPerPageOptions = [20, 50, 100];

  // Filters
  filters: FilterCriteria = {
    codeFrom: '',
    codeTo: '',
    name: '',
    customerType: [],
    nationality: []
  };

  customerTypeOptions = [
    { label: 'บุคคลธรรมดา', value: 'INDIVIDUAL' },
    { label: 'นิติบุคคล', value: 'CORPORATE' },
    { label: 'ข้าราชการ', value: 'GOVERNMENT' }
  ];

  nationalityOptions = [
    { label: 'ไทย', value: 'TH' },
    { label: 'ต่างชาติ', value: 'FOREIGN' },
    { label: 'ต่างประเทศ', value: 'INTERNATIONAL' }
  ];

  statusOptions = [
    { label: 'Active', value: 'A' },
    { label: 'Inactive', value: 'I' }
  ];

  // Loading states
  isLoading = false;
  isSaving = false;

  showDetailsModal = false;
selectedCustomerDetails: Customer | null = null;
allSelected = false;

  // Dialog states
  showFormDialog = false;
  isEditMode = false;

  // Multi-step form
  currentStep = 1;
  steps: FormStep[] = [
    { id: 1, label: 'Basic Information', icon: 'pi pi-id-card', completed: false },
    { id: 2, label: 'Contact & Address', icon: 'pi pi-map-marker', completed: false },
    { id: 3, label: 'Business Details', icon: 'pi pi-briefcase', completed: false },
    { id: 4, label: 'Additional Data', icon: 'pi pi-file', completed: false },
    { id: 5, label: 'Summary', icon: 'pi pi-check-circle', completed: false }
  ];

  // Form data
  formData: Customer = this.getEmptyCustomer();
  originalData: Customer | null = null; // For comparison in summary
formErrors: { [key: string]: string } = {};

  // Draft handling
  draftKey = 'customer-draft';
  lastSavedTime: Date | null = null;
  autoSaveInterval: any;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  ngOnDestroy() {
    this.clearAutoSave();
  }

  // ==================== DATA LOADING ====================

loadCustomers(event?: any) {
  this.isLoading = true;

  setTimeout(() => {
    this.customers = this.generateMockData().map(c => ({
      ...c,
      selected: false,
      statusActive: c.REC_STATUS === 'A'
    }));
    this.totalRecords = 6384;
    this.isLoading = false;
    this.updateAllSelected();
  }, 500);
}


  loadCustomerDetail(customerCode: string) {
    this.isLoading = true;

    /* Real API call (when backend is ready):
    this.http.post('/API_URL/GetCustomer', { code: customerCode })
      .subscribe({
        next: (customer: Customer) => {
          this.formData = { ...customer };
          this.originalData = { ...customer };
          this.isLoading = false;
        },
        error: (error) => {
          this.showError('Failed to load customer details');
          this.isLoading = false;
        }
      });
    */

    // Mock - find customer
    const customer = this.customers.find(c => c.CUSTOMER_CODE === customerCode);
    if (customer) {
      this.formData = { ...customer };
      this.originalData = { ...customer };
    }
    this.isLoading = false;
  }

  toggleSelectAll(event: any) {
  const checked = event.checked;
  this.customers.forEach(c => c.selected = checked);
  this.allSelected = checked;
}

onRowSelect() {
  this.updateAllSelected();
}

updateAllSelected() {
  this.allSelected = this.customers.length > 0 && this.customers.every(c => c.selected);
  this.selectedCustomers = this.customers.filter(c => c.selected);
}

onStatusChange(customer: Customer) {
  customer.REC_STATUS = customer.statusActive ? 'A' : 'I';
  // API call here when ready
  this.messageService.add({
    severity: 'success',
    summary: 'Status Updated',
    detail: `${customer.CUSTOMER_NAME} is now ${customer.statusActive ? 'Active' : 'Inactive'}`,
    life: 2000
  });
}

viewCustomerDetails(customer: Customer) {
  this.selectedCustomerDetails = { ...customer };
  this.showDetailsModal = true;
}

closeDetailsModal() {
  this.showDetailsModal = false;
  this.selectedCustomerDetails = null;
}

editFromDetails() {
  if (this.selectedCustomerDetails) {
    this.openEditDialog(this.selectedCustomerDetails);
    this.closeDetailsModal();
  }
}

deleteFromDetails() {
  if (this.selectedCustomerDetails) {
    this.deleteCustomer(this.selectedCustomerDetails);
    this.closeDetailsModal();
  }
}


  // ==================== CRUD OPERATIONS ====================

openAddDialog() {
  this.isEditMode = false;
  this.formData = this.getEmptyCustomer();
  this.formData.statusActive = true; // ✅ Set default to active
  this.originalData = null;
  this.currentStep = 1;
  this.resetSteps();
  this.formErrors = {}; // ✅ Clear errors
  this.checkForDraft();
  this.showFormDialog = true;
  this.startAutoSave();
}

openEditDialog(customer: Customer) {
  this.isEditMode = true;
  this.loadCustomerDetail(customer.CUSTOMER_CODE);
  this.formData.statusActive = customer.statusActive; // ✅ Set from customer
  this.currentStep = 1;
  this.resetSteps();
  this.formErrors = {}; // ✅ Clear errors
  this.checkForDraft();
  this.showFormDialog = true;
  this.startAutoSave();
}

  deleteCustomer(customer: Customer) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${customer.CUSTOMER_NAME}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete(customer.CUSTOMER_CODE);
      }
    });
  }

  deleteSelected() {
    if (this.selectedCustomers.length === 0) return;

    this.confirmationService.confirm({
      message: `Delete ${this.selectedCustomers.length} selected customers?`,
      header: 'Confirm Bulk Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performBulkDelete();
      }
    });
  }

  performDelete(customerCode: string) {
    /* Real API call:
    this.http.post('/API_URL/DeleteCustomer', { code: customerCode })
      .subscribe({
        next: () => {
          this.showSuccess('Customer deleted successfully');
          this.loadCustomers();
        },
        error: () => this.showError('Failed to delete customer')
      });
    */

    // Mock
    this.customers = this.customers.filter(c => c.CUSTOMER_CODE !== customerCode);
    this.showSuccess('Customer deleted successfully');
  }

  performBulkDelete() {
    const codes = this.selectedCustomers.map(c => c.CUSTOMER_CODE);

    /* Real API call:
    this.http.post('/API_URL/BulkDeleteCustomers', { codes })
      .subscribe({
        next: () => {
          this.showSuccess(`${codes.length} customers deleted`);
          this.selectedCustomers = [];
          this.loadCustomers();
        },
        error: () => this.showError('Failed to delete customers')
      });
    */

    // Mock
    this.customers = this.customers.filter(c => !codes.includes(c.CUSTOMER_CODE));
    this.selectedCustomers = [];
    this.showSuccess(`${codes.length} customers deleted`);
  }

  // ==================== MULTI-STEP FORM ====================

nextStep() {
  // Validate current step before proceeding
  if (!this.validateCurrentStep()) {
    this.showValidationError();
    return;
  }

  if (this.currentStep < this.steps.length) {
    this.steps[this.currentStep - 1].completed = true;
    this.currentStep++;
    this.saveDraft();
  }
}

validateCurrentStep(): boolean {
  this.formErrors = {};

  switch (this.currentStep) {
    case 1: // Basic Information
      return this.validateStep1();
    case 2: // Contact & Address
      return this.validateStep2();
    case 3: // Business Details
      return this.validateStep3();
    case 4: // Additional Data
      return this.validateStep4();
    default:
      return true;
  }
}

validateStep1(): boolean {
  let isValid = true;

  // Customer Name is required
  if (!this.formData.CUSTOMER_NAME || this.formData.CUSTOMER_NAME.trim() === '') {
    this.formErrors['CUSTOMER_NAME'] = 'Customer Name is required';
    isValid = false;
  }

  // Shop Name is required
  if (!this.formData.SHOP_NAME || this.formData.SHOP_NAME.trim() === '') {
    this.formErrors['SHOP_NAME'] = 'Shop Name is required';
    isValid = false;
  }

  // Customer Type is required
  if (!this.formData.CUSTOMER_TYPE) {
    this.formErrors['CUSTOMER_TYPE'] = 'Customer Type is required';
    isValid = false;
  }

  // Nationality is required
  if (!this.formData.NATIONALITY) {
    this.formErrors['NATIONALITY'] = 'Nationality is required';
    isValid = false;
  }

  return isValid;
}

validateStep2(): boolean {
  let isValid = true;

  // Address is required
  if (!this.formData.ADDRESS || this.formData.ADDRESS.trim() === '') {
    this.formErrors['ADDRESS'] = 'Address is required';
    isValid = false;
  }

  // Email validation (if provided)
  if (this.formData.EMAIL && this.formData.EMAIL.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.EMAIL)) {
      this.formErrors['EMAIL'] = 'Please enter a valid email address';
      isValid = false;
    }
  }

  return isValid;
}

validateStep3(): boolean {
  // Add validation for step 3 if needed
  return true;
}

validateStep4(): boolean {
  // Add validation for step 4 if needed
  return true;
}

showValidationError() {
  const errorMessages = Object.values(this.formErrors).join('\n');
  this.messageService.add({
    severity: 'error',
    summary: 'Validation Error',
    detail: 'Please fill in all required fields',
    life: 3000
  });
}

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(stepId: number) {
    // Can only jump to completed steps or next step
    const targetStep = this.steps.find(s => s.id === stepId);
    if (targetStep && (targetStep.completed || stepId === this.currentStep + 1 || stepId < this.currentStep)) {
      this.currentStep = stepId;
    }
  }

  resetSteps() {
    this.steps.forEach(step => step.completed = false);
  }

  isStepAccessible(stepId: number): boolean {
    if (stepId === 1) return true;
    if (stepId === this.currentStep) return true;
    if (stepId < this.currentStep) return true;
    return this.steps[stepId - 2]?.completed || false;
  }

  // ==================== DRAFT MANAGEMENT ====================

  startAutoSave() {
    this.clearAutoSave();
    this.autoSaveInterval = setInterval(() => {
      this.saveDraft(true);
    }, 30000); // Auto-save every 30 seconds
  }

  clearAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  saveDraft(isAuto = false) {
    const draft = {
      formData: this.formData,
      currentStep: this.currentStep,
      steps: this.steps,
      timestamp: new Date().toISOString(),
      isEditMode: this.isEditMode
    };

    localStorage.setItem(this.draftKey, JSON.stringify(draft));
    this.lastSavedTime = new Date();

    if (isAuto) {
      this.messageService.add({
        severity: 'info',
        summary: 'Draft Saved',
        detail: 'Your changes have been auto-saved',
        life: 2000
      });
    }
  }

  checkForDraft() {
    const draftStr = localStorage.getItem(this.draftKey);
    if (draftStr) {
      const draft = JSON.parse(draftStr);

      this.confirmationService.confirm({
        message: 'Found unsaved draft. Do you want to restore it?',
        header: 'Restore Draft',
        icon: 'pi pi-question-circle',
        accept: () => {
          this.formData = draft.formData;
          this.currentStep = draft.currentStep;
          this.steps = draft.steps;
          this.lastSavedTime = new Date(draft.timestamp);
        },
        reject: () => {
          this.clearDraft();
        }
      });
    }
  }

  clearDraft() {
    localStorage.removeItem(this.draftKey);
    this.lastSavedTime = null;
  }

  // ==================== FORM SUBMISSION ====================
saveCustomer() {
  // Final validation
  if (!this.validateCurrentStep()) {
    this.showValidationError();
    return;
  }

  this.isSaving = true;

  // Update REC_STATUS based on statusActive
  this.formData.REC_STATUS = this.formData.statusActive ? 'A' : 'I';

  // Mock
  setTimeout(() => {
    if (this.isEditMode) {
      const index = this.customers.findIndex(c => c.CUSTOMER_CODE === this.formData.CUSTOMER_CODE);
      if (index !== -1) {
        this.customers[index] = { ...this.formData };
      }
    } else {
      this.formData.CUSTOMER_CODE = 'A' + String(Date.now()).slice(-7);
      this.customers = [this.formData, ...this.customers];
    }

    this.showSuccess(this.isEditMode ? 'Customer updated' : 'Customer created');
    this.closeFormDialog();
    this.isSaving = false;
  }, 1000);
}
  closeFormDialog() {
    this.showFormDialog = false;
    this.clearAutoSave();
    this.clearDraft();
    this.formData = this.getEmptyCustomer();
    this.originalData = null;
    this.currentStep = 1;
    this.resetSteps();
  }

  // ==================== FILTERS ====================

  applyFilters() {
    this.loadCustomers();
  }

clearFilters() {
  this.filters = {
    codeFrom: '',
    codeTo: '',
    name: '',
    customerType: [],
    nationality: []
  };
  this.loadCustomers();
}

  onFilterChange() {
  // Debounce the filter to avoid too many calls
  if (this.filterTimeout) {
    clearTimeout(this.filterTimeout);
  }

  this.filterTimeout = setTimeout(() => {
    this.loadCustomers();
  }, 300); // Wait 300ms after user stops typing
}

hasActiveFilters(): boolean {
  return !!(
    this.filters.codeFrom ||
    this.filters.codeTo ||
    this.filters.name ||
    this.filters.customerType.length > 0 ||
    this.filters.nationality.length > 0
  );
}

private filterTimeout: any;

  // ==================== HELPERS ====================

getEmptyCustomer(): Customer {
  return {
    OU_CODE: '001',
    CUSTOMER_CODE: '',
    CUSTOMER_NAME: '',
    REC_STATUS: 'A',
    SHOP_NAME: '',
    ADDRESS: '',
    CREATE_DATE: new Date().toISOString(),
    SAP_CUSTOMER_CODE: '',
    CUSTOMER_TYPE: 'INDIVIDUAL',
    NATIONALITY: 'TH',
    TAX_ID: '',
    PHONE: '',
    EMAIL: '',
    selected: false,
    statusActive: true // ✅ ADD THIS
  };
}

  generateMockData(): Customer[] {
    // Generate mock data for testing
    const mock: Customer[] = [];
    for (let i = 1; i <= 20; i++) {
      mock.push({
        OU_CODE: '001',
        CUSTOMER_CODE: `A${String(100 + i).padStart(7, '0')}`,
        CUSTOMER_NAME: `ลูกค้าคนที่ ${100 + i}`,
        REC_STATUS: 'A',
        SHOP_NAME: `ร้านค้าที่ ${100 + i}`,
        ADDRESS: `${100 + i} ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900`,
        CREATE_DATE: '/Date(1474942149000)/',
        SAP_CUSTOMER_CODE: `${1000000 + i}`
      });
    }
    return mock;
  }

  getStatusLabel(status: string): string {
    return status === 'A' ? 'Active' : 'Inactive';
  }

  getStatusSeverity(status: string): string {
    return status === 'A' ? 'success' : 'danger';
  }

  hasChanges(): boolean {
    if (!this.originalData) return true;
    return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
  }

  getChangedFields(): string[] {
    if (!this.originalData) return [];

    const changed: string[] = [];
    Object.keys(this.formData).forEach(key => {
      if (this.formData[key] !== this.originalData![key]) {
        changed.push(key);
      }
    });
    return changed;
  }

  // ==================== MESSAGES ====================

  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  }
}
