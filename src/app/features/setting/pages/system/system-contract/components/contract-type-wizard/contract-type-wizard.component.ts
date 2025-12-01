// contract-type-wizard.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

interface Condition {
  seq: number;
  title: string;
  content: string;
}

interface ContractTypeForm {
  OU_CODE: string;
  TYPE_CODE: string;
  TYPE_NAME: string;
  TYPE_NAME_EN: string;
  MAIN_TYPE: string;
  MAIN_TYPE_EN: string; // NEW
  TYPE_STATUS: 'R' | 'C' | '';
  DECORATION_INS_INC_VAT: '0' | '1';
  DOC_BILL_SALE: string;
  DOC_BILL_SALE_EN: string; // NEW
  DOC_CONTRACT: string;
  DOC_CONTRACT_EN: string; // NEW
  DOC_INV_RENEW_CONTACT: string;
  DOC_INV_RENEW_CONTACT_EN: string; // NEW
  DOC_ADD_CONTRACT: string;
  DOC_ADD_CONTRACT_EN: string; // NEW
  DOC_TERMINATE: string;
  DOC_TERMINATE_EN: string; // NEW
  DOC_WARRANTY: string;
  DOC_WARRANTY_EN: string; // NEW
  DOC_TRANSFER: string;
  DOC_TRANSFER_EN: string; // NEW
  DOC_RECEIPT: string;
  DOC_RECEIPT_EN: string; // NEW
  DOC_CERTIFICATE: string;
  DOC_CERTIFICATE_EN: string; // NEW
  conditions: Condition[];
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
}

@Component({
  selector: 'app-contract-type-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './contract-type-wizard.component.html',
  styleUrl: './contract-type-wizard.component.css'
})
export class ContractTypeWizardComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() contractType: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // Form state
  currentStep: number = 1;
  formData: ContractTypeForm = this.getEmptyForm();
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  // Condition management
  showConditionModal: boolean = false;
  conditionEditMode: boolean = false;
  conditionForm: Condition = { seq: 0, title: '', content: '' };
  conditionEditIndex: number = -1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractType'] && this.contractType && this.mode === 'edit') {
      this.populateForm(this.contractType);
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }

    if (changes['isOpen'] && this.isOpen) {
      this.currentStep = 1;
    }
  }

  getEmptyForm(): ContractTypeForm {
    return {
      OU_CODE: '001',
      TYPE_CODE: '',
      TYPE_NAME: '',
      TYPE_NAME_EN: '',
      MAIN_TYPE: '',
      MAIN_TYPE_EN: '',
      TYPE_STATUS: '',
      DECORATION_INS_INC_VAT: '0',
      DOC_BILL_SALE: '',
      DOC_BILL_SALE_EN: '',
      DOC_CONTRACT: '',
      DOC_CONTRACT_EN: '',
      DOC_INV_RENEW_CONTACT: '',
      DOC_INV_RENEW_CONTACT_EN: '',
      DOC_ADD_CONTRACT: '',
      DOC_ADD_CONTRACT_EN: '',
      DOC_TERMINATE: '',
      DOC_TERMINATE_EN: '',
      DOC_WARRANTY: '',
      DOC_WARRANTY_EN: '',
      DOC_TRANSFER: '',
      DOC_TRANSFER_EN: '',
      DOC_RECEIPT: '',
      DOC_RECEIPT_EN: '',
      DOC_CERTIFICATE: '',
      DOC_CERTIFICATE_EN: '',
      conditions: []
    };
  }

  populateForm(contractType: any): void {
    this.formData = {
      ...contractType,
      conditions: contractType.conditions || []
    };
  }

  resetForm(): void {
    this.formData = this.getEmptyForm();
    this.errors = {};
    this.currentStep = 1;
  }

  // ==================== STEP NAVIGATION ====================

  nextStep(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ==================== VALIDATION ====================

  validateCurrentStep(): boolean {
    this.errors = {};

    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      case 4:
        return true; // Summary step has no validation
      default:
        return true;
    }
  }

  validateStep1(): boolean {
    let isValid = true;

    // รหัสประเภทสัญญา (required)
    if (!this.formData.TYPE_CODE?.trim()) {
      this.errors['TYPE_CODE'] = 'กรุณากรอกรหัสประเภทสัญญา';
      isValid = false;
    }

    // ชื่อประเภทสัญญา (ไทย) (required)
    if (!this.formData.TYPE_NAME?.trim()) {
      this.errors['TYPE_NAME'] = 'กรุณากรอกชื่อประเภทสัญญา (ไทย)';
      isValid = false;
    }

    // Type Status (required)
    if (!this.formData.TYPE_STATUS) {
      this.errors['TYPE_STATUS'] = 'กรุณาเลือก Type';
      isValid = false;
    }

    return isValid;
  }

  validateStep2(): boolean {
    // Step 2 (Files) - all fields are optional
    return true;
  }

  validateStep3(): boolean {
    // Step 3 (Conditions) - conditions are optional
    return true;
  }

  // ==================== FILE PATH HANDLERS ====================

  onFilePathChange(field: string, value: string): void {
    (this.formData as any)[field] = value;
  }

  // ==================== CONDITION MANAGEMENT ====================

  addCondition(): void {
    this.conditionEditMode = false;
    this.conditionForm = {
      seq: this.formData.conditions.length + 1,
      title: '',
      content: ''
    };
    this.showConditionModal = true;
  }

  editCondition(condition: Condition): void {
    this.conditionEditMode = true;
    this.conditionForm = { ...condition };
    this.conditionEditIndex = this.formData.conditions.findIndex(c => c.seq === condition.seq);
    this.showConditionModal = true;
  }

  deleteCondition(seq: number): void {
    this.formData.conditions = this.formData.conditions
      .filter(c => c.seq !== seq)
      .map((c, index) => ({ ...c, seq: index + 1 })); // Reorder seq numbers
  }

  saveCondition(): void {
    if (!this.conditionForm.title.trim() || !this.conditionForm.content.trim()) {
      return;
    }

    if (this.conditionEditMode && this.conditionEditIndex !== -1) {
      // Edit existing condition
      this.formData.conditions[this.conditionEditIndex] = { ...this.conditionForm };
    } else {
      // Add new condition
      this.formData.conditions.push({ ...this.conditionForm });
    }

    this.closeConditionModal();
  }

  closeConditionModal(): void {
    this.showConditionModal = false;
    this.conditionForm = { seq: 0, title: '', content: '' };
    this.conditionEditIndex = -1;
  }

  // ==================== SUMMARY HELPERS ====================

  hasAnyFilePath(): boolean {
    return !!(
      this.formData.DOC_BILL_SALE ||
      this.formData.DOC_BILL_SALE_EN ||
      this.formData.DOC_CONTRACT ||
      this.formData.DOC_CONTRACT_EN ||
      this.formData.DOC_INV_RENEW_CONTACT ||
      this.formData.DOC_INV_RENEW_CONTACT_EN ||
      this.formData.DOC_ADD_CONTRACT ||
      this.formData.DOC_ADD_CONTRACT_EN ||
      this.formData.DOC_TERMINATE ||
      this.formData.DOC_TERMINATE_EN ||
      this.formData.DOC_WARRANTY ||
      this.formData.DOC_WARRANTY_EN ||
      this.formData.DOC_TRANSFER ||
      this.formData.DOC_TRANSFER_EN ||
      this.formData.DOC_RECEIPT ||
      this.formData.DOC_RECEIPT_EN ||
      this.formData.DOC_CERTIFICATE ||
      this.formData.DOC_CERTIFICATE_EN
    );
  }

  getFileCount(): number {
    let count = 0;
    if (this.formData.DOC_BILL_SALE) count++;
    if (this.formData.DOC_BILL_SALE_EN) count++;
    if (this.formData.DOC_CONTRACT) count++;
    if (this.formData.DOC_CONTRACT_EN) count++;
    if (this.formData.DOC_INV_RENEW_CONTACT) count++;
    if (this.formData.DOC_INV_RENEW_CONTACT_EN) count++;
    if (this.formData.DOC_ADD_CONTRACT) count++;
    if (this.formData.DOC_ADD_CONTRACT_EN) count++;
    if (this.formData.DOC_TERMINATE) count++;
    if (this.formData.DOC_TERMINATE_EN) count++;
    if (this.formData.DOC_WARRANTY) count++;
    if (this.formData.DOC_WARRANTY_EN) count++;
    if (this.formData.DOC_TRANSFER) count++;
    if (this.formData.DOC_TRANSFER_EN) count++;
    if (this.formData.DOC_RECEIPT) count++;
    if (this.formData.DOC_RECEIPT_EN) count++;
    if (this.formData.DOC_CERTIFICATE) count++;
    if (this.formData.DOC_CERTIFICATE_EN) count++;
    return count;
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isSubmitting = true;

    // Add timestamps
    const now = '/Date(' + new Date().getTime() + ')/';

    if (this.mode === 'create') {
      this.formData.CREATE_BY = 'SPACE';
      this.formData.CREATE_DATE = now;
    }

    this.formData.UPD_BY = 'SPACE';
    this.formData.UPD_DATE = now;

    // Simulate API call delay
    setTimeout(() => {
      this.save.emit({
        data: this.formData,
        mode: this.mode
      });
      this.isSubmitting = false;
      this.onClose();
    }, 500);
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onBackdropClick(): void {
    if (!this.isSubmitting) {
      this.onClose();
    }
  }
}
