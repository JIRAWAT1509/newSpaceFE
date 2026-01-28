// add-contract-modal.component.ts - WITH EDIT MODE SUPPORT
import { Component, output, signal, input, OnInit, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contract } from '@core/models/contract.model';
import { GeneralDetailTabComponent } from './components/general-detail-tab/general-detail-tab.component';
import { ContractDetailTabComponent } from './components/contract-detail-tab/contract-detail-tab.component';
import { ConditionsTabComponent } from './components/conditions-tab/conditions-tab.component';
import { DocumentTabComponent } from './components/document-tab/document-tab.component';

interface Tab {
  id: string;
  label: string;
  completed: boolean;
}

@Component({
  selector: 'app-add-contract-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GeneralDetailTabComponent,
    ContractDetailTabComponent,
    ConditionsTabComponent,
    DocumentTabComponent
  ],
  templateUrl: './add-contract-modal.component.html',
  styleUrl: './add-contract-modal.component.css'
})
export class AddContractModalComponent implements OnInit {
  // Inputs for edit mode
  mode = input<'add' | 'edit'>('add');
  contractData = input<Contract | null>(null);

  // Outputs
  close = output<void>();
  save = output<any>();

  // Forms for each tab
  generalDetailForm!: FormGroup;
  conditionsForm!: FormGroup;
  documentForm!: FormGroup;

  // ViewChild for accessing contract detail form
  @ViewChild(ContractDetailTabComponent) contractDetailTab?: ContractDetailTabComponent;

  // Tab state
  activeTabIndex = signal<number>(0);
  tabs: Tab[] = [
    { id: 'general', label: 'รายละเอียดทั่วไป', completed: false },
    { id: 'contract', label: 'รายละเอียดสัญญา', completed: false },
    { id: 'conditions', label: 'เงื่อนไขอื่นๆ', completed: false },
    { id: 'attachments', label: 'เอกสารแนบ', completed: false },
    { id: 'summary', label: 'สรุป', completed: false }
  ];

  // Modal title based on mode
  modalTitle = signal<string>('เพิ่มสัญญาใหม่');

  constructor(private fb: FormBuilder) {
    // Update modal title when mode changes
    effect(() => {
      this.modalTitle.set(this.mode() === 'edit' ? 'แก้ไขข้อมูลสัญญา' : 'เพิ่มสัญญาใหม่');
    });

    // Load contract data when it changes (for edit mode)
    effect(() => {
      const contract = this.contractData();
      if (contract && this.mode() === 'edit') {
        this.loadContractData(contract);
      }
    });
  }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    // Tab 1: General Details (Q) - Updated structure
    this.generalDetailForm = this.fb.group({
      // Section A: ข้อมูลอ้างอิงเอกสาร
      branch: ['', Validators.required],
      contractType: ['', Validators.required],
      contractNumberMain: [''],
      contractNumberSub: [''],
      quotationStatus: [''],
      quotationLevelDate: [''],
      quotationDate: ['', Validators.required],
      approvalDate: [''],
      recordDate: [''],

      // Section B: ข้อมูลสินค้า/บริการ (ต้นทาง)
      subCategory: ['', Validators.required],
      category: [''],
      profitCenter: [''],
      businessName: [''],
      productType1: [''],
      productType2: [''],
      productType3: [''],
      productType4: [''],
      productType5: [''],
      productType6: [''],

      // Section C: ข้อมูลพื้นที่ (จากใบเสนอราคา)
      areaBuilding: ['', Validators.required],
      areaFloor: ['', Validators.required],
      areaUnitNumber: ['', Validators.required],
      areaTotal: [''],
      areaType: ['']
    });

    // Tab 3: Conditions (C) - Updated structure
    this.conditionsForm = this.fb.group({
      // Section 1: ระยะเวลา & การต่อสัญญา
      durationYears: [0, Validators.required],
      durationMonths: [0],
      durationDays: [0],
      contractStartDate: ['', Validators.required],
      contractEndDate: ['', Validators.required],
      renewalCondition: [''],
      renewalCount: [0],

      // Section 2: เงื่อนไขทางการเงิน
      rentRate: [0, Validators.required],
      serviceRate: [0],
      creditTermRent: [0, Validators.required],
      creditTermUtility: [0, Validators.required],
      paymentFrequency: [''],
      rentAdjustmentPercent: [0],
      depositAmount: [0],

      // Section 3: เงื่อนไขพิเศษ
      advanceNoticeDays: [0],
      closurePenalty: [0],
      excludedProducts: [''],

      // Section 4: บันทึกแนบท้ายสัญญา
      hasAddendum: [false],
      addendumNotes: ['']
    });

    // Tab 4: Documents (placeholder)
    this.documentForm = this.fb.group({});
  }

  // ==================== LOAD CONTRACT DATA (EDIT MODE) ====================

  loadContractData(contract: Contract): void {
    console.log('Loading contract data for edit:', contract);

    // Map contract data to general detail form
    this.generalDetailForm.patchValue({
      branch: contract.BRANCH_CODE,
      contractType: contract.CONTRACT_TYPE_CODE,
      contractNumberMain: contract.CONTRACT_NUMBER_MAIN,
      contractNumberSub: contract.CONTRACT_NUMBER_SUB,
      quotationStatus: contract.QUOTATION_STATUS,
      contractDate: contract.CONTRACT_DATE,
      recordDate: contract.RECORD_DATE,
      approvalDate: contract.APPROVAL_DATE,
      intentionLetter: contract.INTENTION_LETTER,
      transferToBooking: contract.TRANSFER_TO_BOOKING,

      contractLocation: contract.CONTRACT_LOCATION,
      headOfficeAddress: contract.HEAD_OFFICE_ADDRESS,
      representative: contract.REPRESENTATIVE,
      branchAddress: contract.BRANCH_ADDRESS,
      contactPerson: contract.CONTACT_PERSON,
      contactAddressType: contract.CONTACT_ADDRESS_TYPE,
      contactAddress: contract.CONTACT_ADDRESS,

      customerId: contract.CUSTOMER_ID,
      documentAddress: contract.DOCUMENT_ADDRESS,
      billingAddress: contract.BILLING_ADDRESS,
      companyName: contract.COMPANY_NAME,
      authorizedPerson1: contract.AUTHORIZED_PERSON_1,
      phone1: contract.PHONE_1,
      position1: contract.POSITION_1,
      authorizedPerson2: contract.AUTHORIZED_PERSON_2,
      phone2: contract.PHONE_2,
      position2: contract.POSITION_2,

      subCategory: contract.SUB_CATEGORY,
      category: contract.CATEGORY,
      profitCenter: contract.PROFIT_CENTER,
      businessName: contract.BUSINESS_NAME,
      productCategory: contract.PRODUCT_CATEGORY,
      productType1: contract.PRODUCT_TYPE_1,
      productType2: contract.PRODUCT_TYPE_2,
      productType3: contract.PRODUCT_TYPE_3,
      productType4: contract.PRODUCT_TYPE_4,
      productType5: contract.PRODUCT_TYPE_5,
      productType6: contract.PRODUCT_TYPE_6,

      provider1: contract.PROVIDER_1,
      providerPosition1: contract.PROVIDER_POSITION_1,
      provider2: contract.PROVIDER_2,
      providerPosition2: contract.PROVIDER_POSITION_2,
      witness1: contract.WITNESS_1,
      witness2: contract.WITNESS_2,
      contractCreator: contract.CONTRACT_CREATOR
    });

    // TODO: Load data for other tabs (will be implemented with mapping service)
    // Tab 2: Contract Details - complex arrays (renewal agreements, areas, revenue, etc.)
    // Tab 3: Conditions - subject, conditions list, internal notes
    // Tab 4: Documents - file list
  }

  // ==================== TAB NAVIGATION ====================

  goToTab(index: number): void {
    if (this.canNavigateToTab(index)) {
      this.activeTabIndex.set(index);
    }
  }

  nextTab(): void {
    if (this.activeTabIndex() < this.tabs.length - 1) {
      this.markTabCompleted(this.activeTabIndex());
      this.activeTabIndex.update(i => i + 1);
    }
  }

  previousTab(): void {
    if (this.activeTabIndex() > 0) {
      this.activeTabIndex.update(i => i - 1);
    }
  }

  canNavigateToTab(index: number): boolean {
    // Can always go back
    if (index < this.activeTabIndex()) return true;

    // Can go forward if current tab is valid
    if (index === this.activeTabIndex() + 1) {
      return this.isCurrentTabValid();
    }

    // Can jump to any completed tab
    return this.tabs[index].completed;
  }

  isCurrentTabValid(): boolean {
    switch (this.activeTabIndex()) {
      case 0: return this.generalDetailForm.valid;
      case 2: return this.conditionsForm.valid || true; // Placeholder always valid
      case 3: return this.documentForm.valid || true; // Placeholder always valid
      case 4: return true; // Summary tab is always valid (read-only)
      default: return false;
    }
  }

  isAllFormsValid(): boolean {
    return this.generalDetailForm.valid &&
           (this.conditionsForm.valid || true) &&
           (this.documentForm.valid || true);
  }

  isTabCompleted(index: number): boolean {
    return this.tabs[index].completed;
  }

  markTabCompleted(index: number): void {
    this.tabs[index].completed = true;
  }

  // ==================== ACTIONS ====================

  onSubmit(): void {
    if (this.isAllFormsValid()) {
      const formData = {
        mode: this.mode(),
        contractId: this.contractData()?.CONTRACT_ID,
        generalDetails: this.generalDetailForm.value,
        conditions: this.conditionsForm.value,
        documents: this.documentForm.value
      };

      console.log(`${this.mode() === 'edit' ? 'Updating' : 'Creating'} contract:`, formData);
      this.save.emit(formData);
      this.close.emit();
    } else {
      this.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  markAllAsTouched(): void {
    Object.keys(this.generalDetailForm.controls).forEach(key => {
      this.generalDetailForm.get(key)?.markAsTouched();
    });
  }

  // ==================== SUMMARY HELPERS ====================

  getFormValue(fieldName: string): any {
    const control = this.generalDetailForm.get(fieldName);
    return control ? control.value : null;
  }

  getConditionsValue(fieldName: string): any {
    const control = this.conditionsForm.get(fieldName);
    return control ? control.value : null;
  }

  getContractDetailValue(fieldName: string): any {
    if (!this.contractDetailTab || !this.contractDetailTab.contractInfoTab || !this.contractDetailTab.contractInfoTab.form) return null;
    const control = this.contractDetailTab.contractInfoTab.form.get(fieldName);
    return control ? control.value : null;
  }

  formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return '';
  }
}
