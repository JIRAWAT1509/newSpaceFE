// add-contract-modal.component.ts - WITH EDIT MODE & DRAFT SUPPORT
import { Component, output, signal, input, OnInit, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contract } from '@core/models/contract.model';
import { GeneralDetailTabComponent } from './components/general-detail-tab/general-detail-tab.component';
import { ContractDetailTabComponent } from './components/contract-detail-tab/contract-detail-tab.component';
import { ConditionsTabComponent } from './components/conditions-tab/conditions-tab.component';
import { DocumentTabComponent } from './components/document-tab/document-tab.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';
import { DraftContractService, DraftContract } from '@core/services/draft-contract.service';

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
    DocumentTabComponent,
    WarningModalComponent
  ],
  templateUrl: './add-contract-modal.component.html',
  styleUrl: './add-contract-modal.component.css'
})
export class AddContractModalComponent implements OnInit {
  // Inputs for edit mode
  mode = input<'add' | 'edit'>('add');
  contractData = input<Contract | null>(null);
  /** Draft data to continue editing */
  draftData = input<DraftContract | null>(null);

  // Outputs
  close = output<void>();
  save = output<any>();
  /** Emitted when draft is saved */
  draftSaved = output<DraftContract>();

  // Current draft ID (if editing a draft)
  currentDraftId = signal<string | null>(null);

  // Forms for each tab
  generalDetailForm!: FormGroup;
  conditionsForm!: FormGroup;
  documentForm!: FormGroup;

  // ViewChild for accessing contract detail form
  @ViewChild(ContractDetailTabComponent) contractDetailTab?: ContractDetailTabComponent;

  // Tab state
  activeTabIndex = signal<number>(0);
  /** เก็บค่าฟอร์มรายละเอียดสัญญาเมื่อออกจากแท็บ 1 (ใช้ตอนส่งจากแท็บสรุป) */
  lastContractDetailValue = signal<Record<string, unknown>>({});
  tabs: Tab[] = [
    { id: 'general', label: 'รายละเอียดทั่วไป', completed: false },
    { id: 'contract', label: 'รายละเอียดสัญญา', completed: false },
    { id: 'conditions', label: 'เงื่อนไขอื่นๆ', completed: false },
    { id: 'attachments', label: 'เอกสารแนบ', completed: false },
    { id: 'summary', label: 'สรุป', completed: false }
  ];

  // Modal title based on mode
  modalTitle = signal<string>('เพิ่มสัญญาใหม่');

  // In-app message modal (for child tabs e.g. general-detail)
  showMessageModal = signal<boolean>(false);
  messageModalTitle = signal<string>('');
  messageModalMessage = signal<string>('');

  // Confirm close modal (when clicking outside with unsaved data)
  showConfirmCloseModal = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private draftService: DraftContractService
  ) {
    // Update modal title when mode changes
    effect(() => {
      const draft = this.draftData();
      if (draft) {
        this.modalTitle.set(`แก้ไขแบบร่าง: ${draft.name}`);
      } else {
        this.modalTitle.set(this.mode() === 'edit' ? 'แก้ไขข้อมูลสัญญา' : 'เพิ่มสัญญาใหม่');
      }
    });

    // Load contract data when it changes (for edit mode or copy mode)
    effect(() => {
      const contract = this.contractData();
      if (contract && (this.mode() === 'edit' || this.mode() === 'add')) {
        this.loadContractData(contract);
      }
    });

    // Load draft data when it changes
    effect(() => {
      const draft = this.draftData();
      if (draft) {
        this.loadDraftData(draft);
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
      quotationDate: contract.CONTRACT_DATE,
      quotationLevelDate: (contract as any).QUOTATION_LEVEL_DATE ?? contract.RECORD_DATE ?? '',
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

  // ==================== DRAFT MANAGEMENT ====================

  /** โหลดข้อมูลจาก Draft */
  loadDraftData(draft: DraftContract): void {
    console.log('Loading draft data:', draft);
    this.currentDraftId.set(draft.id);

    // Load general details
    if (draft.formData.generalDetails) {
      this.generalDetailForm.patchValue(draft.formData.generalDetails);
    }

    // Load conditions
    if (draft.formData.conditions) {
      this.conditionsForm.patchValue(draft.formData.conditions);
    }

    // Load documents
    if (draft.formData.documents) {
      this.documentForm.patchValue(draft.formData.documents);
    }

    // Restore tab state
    this.activeTabIndex.set(draft.currentTab);
    draft.completedTabs.forEach(tabIndex => {
      if (tabIndex < this.tabs.length) {
        this.tabs[tabIndex].completed = true;
      }
    });

    // Contract details will be loaded when the tab is visited
    if (draft.formData.contractDetails) {
      this.lastContractDetailValue.set(draft.formData.contractDetails);
    }
  }

  /** บันทึกเป็นแบบร่าง */
  onSaveDraft(): void {
    const formData = {
      generalDetails: this.generalDetailForm.value,
      contractDetails: this.getContractDetailsPayload(),
      conditions: this.conditionsForm.value,
      documents: this.documentForm.value
    };

    const completedTabs = this.tabs
      .map((tab, index) => tab.completed ? index : -1)
      .filter(index => index !== -1);

    let draft: DraftContract;

    if (this.currentDraftId()) {
      // Update existing draft
      const updated = this.draftService.updateDraft(
        this.currentDraftId()!,
        formData,
        this.activeTabIndex(),
        completedTabs
      );
      if (updated) {
        draft = updated;
      } else {
        // If update failed, create new
        draft = this.draftService.createDraft(formData, this.activeTabIndex(), completedTabs);
        this.currentDraftId.set(draft.id);
      }
    } else {
      // Create new draft
      draft = this.draftService.createDraft(formData, this.activeTabIndex(), completedTabs);
      this.currentDraftId.set(draft.id);
    }

    // Emit draft saved event
    this.draftSaved.emit(draft);

    // Show success message
    this.showMessage({
      title: 'บันทึกแบบร่างสำเร็จ',
      message: `แบบร่าง "${draft.name}" ถูกบันทึกแล้ว คุณสามารถกลับมาแก้ไขต่อได้ภายหลัง`
    });
  }

  // ==================== TAB NAVIGATION ====================

  goToTab(index: number): void {
    if (this.canNavigateToTab(index)) {
      if (this.activeTabIndex() === 1 && this.contractDetailTab?.contractInfoTab?.form) {
        this.lastContractDetailValue.set(this.contractDetailTab.contractInfoTab.form.value);
      }
      this.activeTabIndex.set(index);
    }
  }

  nextTab(): void {
    if (this.activeTabIndex() < this.tabs.length - 1) {
      if (this.activeTabIndex() === 1 && this.contractDetailTab?.contractInfoTab?.form) {
        this.lastContractDetailValue.set(this.contractDetailTab.contractInfoTab.form.value);
      }
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
      case 1: return true; // Contract detail tab – sub-forms validated on submit
      case 2: return this.conditionsForm.valid || true;
      case 3: return this.documentForm.valid || true;
      case 4: return true;
      default: return false;
    }
  }

  isAllFormsValid(): boolean {
    // ตรวจสอบทุกฟอร์มที่จำเป็น
    const generalValid = this.generalDetailForm.valid;
    const contractDetailValid = this.isContractDetailFormValid();
    
    return generalValid && contractDetailValid;
  }

  /** ตรวจสอบฟอร์มรายละเอียดสัญญา (tab 2) */
  isContractDetailFormValid(): boolean {
    const form = this.contractDetailTab?.contractInfoTab?.form;
    if (!form) {
      // ถ้ายังไม่ได้เข้า tab นี้ ให้ผ่านไปก่อน
      return true;
    }
    return form.valid;
  }

  isTabCompleted(index: number): boolean {
    return this.tabs[index].completed;
  }

  markTabCompleted(index: number): void {
    this.tabs[index].completed = true;
  }

  // ==================== ACTIONS ====================

  /** บันทึกเฉพาะรายละเอียดทั่วไป → แสดงในแท็บใบเสนอราคา */
  onSaveQuotationOnly(): void {
    if (this.generalDetailForm.valid) {
      const formData = {
        mode: this.mode(),
        contractId: this.mode() === 'edit' ? this.contractData()?.CONTRACT_ID : undefined,
        saveAsQuotationOnly: true,
        generalDetails: this.generalDetailForm.value,
        conditions: this.conditionsForm.value,
        documents: this.documentForm.value
      };
      this.save.emit(formData);
      this.close.emit();
    }
  }

  /** ตรวจว่า tab รายละเอียดสัญญา (contract detail) กรอกครบหรือไม่ */
  isContractDetailValid(): boolean {
    const form = this.contractDetailTab?.contractInfoTab?.form;
    const value = form ? form.value : this.lastContractDetailValue();
    const required = ['bookingNumber', 'legalEntityName', 'contractMaker'];
    return required.every(f => {
      const v = value[f];
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
  }

  /** ค่าฟอร์มรายละเอียดสัญญา (จาก tab ปัจจุบันหรือค่าที่เก็บไว้) */
  getContractDetailsPayload(): Record<string, unknown> {
    if (this.contractDetailTab?.contractInfoTab?.form) {
      return this.contractDetailTab.contractInfoTab.form.value;
    }
    return this.lastContractDetailValue();
  }

  onSubmit(): void {
    if (this.isAllFormsValid()) {
      // กด "บันทึกสัญญา" จากแท็บสรุป (ขั้นตอนสุดท้าย) = ส่งไปหน้าสัญญาจองเสมอ
      // ถ้าต้องการแค่ใบเสนอราคา ให้กดปุ่ม "บันทึก" ที่แท็บรายละเอียดทั่วไป
      const formData = {
        mode: this.mode(),
        contractId: this.mode() === 'edit' ? this.contractData()?.CONTRACT_ID : undefined,
        saveAsQuotationOnly: false,
        saveAsBooking: true,
        generalDetails: this.generalDetailForm.value,
        contractDetails: this.getContractDetailsPayload(),
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

  /** ตรวจสอบว่าฟอร์มมีข้อมูลที่กรอกแล้วหรือไม่ */
  hasUnsavedData(): boolean {
    // เช็ค generalDetailForm
    const gv = this.generalDetailForm.value;
    const hasGeneralData = Object.keys(gv).some(k => {
      const v = gv[k];
      return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    });
    if (hasGeneralData) return true;

    // เช็ค conditionsForm
    const cv = this.conditionsForm.value;
    const hasConditionsData = Object.keys(cv).some(k => {
      const v = cv[k];
      return v !== null && v !== undefined && v !== '' && v !== false;
    });
    if (hasConditionsData) return true;

    // เช็ค documentForm
    const dv = this.documentForm.value;
    const hasDocData = Object.keys(dv).some(k => {
      const v = dv[k];
      return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    });
    if (hasDocData) return true;

    // เช็คว่ามี tab ที่ completed แล้วหรือไม่
    if (this.tabs.some(t => t.completed)) return true;

    return false;
  }

  /** คลิกนอก modal หรือปุ่ม X */
  onCancel(): void {
    if (this.hasUnsavedData()) {
      // มีข้อมูลที่ยังไม่บันทึก → ขอยืนยันก่อนปิด
      this.showConfirmCloseModal.set(true);
    } else {
      this.close.emit();
    }
  }

  /** ยืนยันปิดโดยไม่บันทึก */
  confirmClose(): void {
    this.showConfirmCloseModal.set(false);
    this.close.emit();
  }

  /** ยกเลิกการปิด → กลับไปกรอกต่อ */
  cancelClose(): void {
    this.showConfirmCloseModal.set(false);
  }

  showMessage(event: { title: string; message: string }): void {
    this.messageModalTitle.set(event.title);
    this.messageModalMessage.set(event.message);
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
  }

  markAllAsTouched(): void {
    // Mark general detail form
    Object.keys(this.generalDetailForm.controls).forEach(key => {
      this.generalDetailForm.get(key)?.markAsTouched();
    });
    
    // Mark contract detail form (if exists)
    const contractForm = this.contractDetailTab?.contractInfoTab?.form;
    if (contractForm) {
      Object.keys(contractForm.controls).forEach(key => {
        contractForm.get(key)?.markAsTouched();
      });
    }
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
