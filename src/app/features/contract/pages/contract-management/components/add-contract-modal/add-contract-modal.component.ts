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
  /** Pre-fill data from external sources (e.g., customer quotation) */
  preFillData = input<any>(null);

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
  /** Track which tabs the user has visited (for navigation) */
  visitedTabs = signal<Set<number>>(new Set([0]));
  tabs: Tab[] = [
    { id: 'general', label: 'รายละเอียดทั่วไป', completed: false },
    { id: 'contract', label: 'รายละเอียดสัญญา', completed: false },
    { id: 'conditions', label: 'เงื่อนไขอื่นๆ', completed: false },
    { id: 'attachments', label: 'เอกสารแนบ', completed: false },
    { id: 'summary', label: 'สรุป', completed: false }
  ];

  // Modal title based on mode
  modalTitle = signal<string>('สร้างใบเสนอราคา');

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
    // Initialize forms FIRST before any effects try to patch data
    this.initForms();

    // Update modal title when mode changes
    effect(() => {
      const draft = this.draftData();
      if (draft) {
        this.modalTitle.set(`แก้ไขแบบร่าง: ${draft.name}`);
      } else {
        this.modalTitle.set(this.mode() === 'edit' ? 'แก้ไขข้อมูลสัญญา' : 'สร้างใบเสนอราคา');
      }
    });

    // Handle pre-fill data from customer quotation
    effect(() => {
      const preFill = this.preFillData();
      if (preFill && this.mode() === 'add') {
        console.log('🎨 [AddContractModal] Applying pre-fill data:', preFill);
        this.applyPreFillData(preFill);
      }
    });
  }

  /**
   * Apply pre-fill data to the form
   * IMPROVED VERSION with better debugging and timing
   */
  private applyPreFillData(preFill: any): void {
    console.log('🎨 [AddContractModal] === PRE-FILL DEBUG START ===');
    console.log('📦 Pre-fill data received:', preFill);
    console.log('📋 General form exists:', !!this.generalDetailForm);
    console.log('📋 General form controls:', this.generalDetailForm ? Object.keys(this.generalDetailForm.controls) : 'N/A');

    // Wait longer for form and child components to initialize
    setTimeout(() => {
      // Apply general details if present
      if (preFill.generalDetails && this.generalDetailForm) {
        console.log('📝 Attempting to patch general details...');
        console.log('  - Data keys:', Object.keys(preFill.generalDetails));
        console.log('  - Form controls:', Object.keys(this.generalDetailForm.controls));

        // Check which fields will match
        const dataKeys = Object.keys(preFill.generalDetails);
        const formKeys = Object.keys(this.generalDetailForm.controls);
        const matchingKeys = dataKeys.filter(k => formKeys.includes(k));
        const unmatchedKeys = dataKeys.filter(k => !formKeys.includes(k));

        console.log('  ✅ Matching fields:', matchingKeys);
        if (unmatchedKeys.length > 0) {
          console.warn('  ⚠️ Unmatched fields (will be ignored):', unmatchedKeys);
        }

        // Patch the form
        this.generalDetailForm.patchValue(preFill.generalDetails, { emitEvent: false });

        // Mark fields as touched to trigger validation display
        matchingKeys.forEach(key => {
          this.generalDetailForm.get(key)?.markAsTouched();
        });

        // Verify what was actually set
        console.log('📊 Form values after patch:');
        matchingKeys.forEach(key => {
          const value = this.generalDetailForm.get(key)?.value;
          console.log(`  - ${key}: ${value}`);
        });

        console.log('✅ [AddContractModal] Pre-filled general details');
      } else {
        console.error('❌ Cannot apply general details:');
        console.log('  - preFill.generalDetails exists:', !!preFill.generalDetails);
        console.log('  - generalDetailForm exists:', !!this.generalDetailForm);
      }

      // Apply conditions if present
      if (preFill.conditions && this.conditionsForm) {
        this.conditionsForm.patchValue(preFill.conditions, { emitEvent: false });
        console.log('✅ [AddContractModal] Pre-filled conditions');
      }

      // Store contract details for later (when tab is opened)
      if (preFill.contractDetails) {
        this.lastContractDetailValue.set(preFill.contractDetails);
        console.log('✅ [AddContractModal] Stored contract details for later');
      }

      console.log('🎨 [AddContractModal] === PRE-FILL DEBUG END ===');
    }, 300); // Increased timeout to 300ms
  }

  ngOnInit(): void {
    // Re-initialize tabs to clean state for new modal opening
    this.tabs.forEach(t => t.completed = false);
    this.activeTabIndex.set(0);

    // Load contract data for edit mode (inputs are guaranteed set by ngOnInit)
    const contract = this.contractData();
    if (contract && this.mode() === 'edit') {
      console.log('[AddContractModal] ngOnInit: loading contract data for edit', contract.CONTRACT_ID);
      this.loadContractData(contract);
    }

    // Load draft data if present
    const draft = this.draftData();
    if (draft) {
      console.log('[AddContractModal] ngOnInit: loading draft data', draft.id);
      this.loadDraftData(draft);
    }
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
      businessName: ['', Validators.required],
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
      areaType: [''],
      areaMonthlyRent: [''],

      // Section D: ข้อมูลผู้ติดต่อ (ชื่อ + เบอร์โทร)
      contactName: ['', Validators.required],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,10}$/)]]
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
      paymentFrequency: ['', Validators.required],
      rentAdjustmentPercent: [0],
      depositAmount: [0, Validators.required],

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
    console.log('[AddContractModal] loadContractData called:', contract.CONTRACT_ID, contract);

    // Helper: convert date string to Date object (for p-datepicker)
    const toDate = (val: unknown): Date | string => {
      if (!val) return '';
      if (val instanceof Date) return val;
      if (typeof val === 'string' && val.trim()) {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d;
      }
      return '';
    };

    // Map contract data to general detail form
    // Only patch fields that exist in the form definition
    const generalPatch: Record<string, any> = {
      branch: contract.BRANCH_CODE || '',
      contractType: contract.CONTRACT_TYPE_CODE || '',
      contractNumberMain: contract.CONTRACT_NUMBER_MAIN || '',
      contractNumberSub: contract.CONTRACT_NUMBER_SUB || '',
      quotationStatus: contract.QUOTATION_STATUS || '',
      quotationDate: toDate(contract.CONTRACT_DATE),
      quotationLevelDate: toDate((contract as any).QUOTATION_LEVEL_DATE || contract.RECORD_DATE),
      recordDate: toDate(contract.RECORD_DATE),
      approvalDate: toDate(contract.APPROVAL_DATE),

      subCategory: contract.SUB_CATEGORY || '',
      category: contract.CATEGORY || '',
      profitCenter: contract.PROFIT_CENTER || '',
      businessName: contract.BUSINESS_NAME || '',
      productType1: contract.PRODUCT_TYPE_1 || '',
      productType2: contract.PRODUCT_TYPE_2 || '',
      productType3: contract.PRODUCT_TYPE_3 || '',
      productType4: contract.PRODUCT_TYPE_4 || '',
      productType5: contract.PRODUCT_TYPE_5 || '',
      productType6: contract.PRODUCT_TYPE_6 || '',
    };

    // Map area info from AREA_DETAILS array → flat form fields
    const areas = (contract as any).AREA_DETAILS as { BUILDING?: string; FLOOR?: string; UNIT_NUMBER?: string; TOTAL_AREA?: number; STATUS?: string }[] | undefined;
    if (areas && areas.length > 0) {
      generalPatch['areaBuilding'] = areas[0].BUILDING ?? '';
      generalPatch['areaFloor'] = areas[0].FLOOR ?? '';
      generalPatch['areaUnitNumber'] = areas[0].UNIT_NUMBER ?? '';
      generalPatch['areaTotal'] = areas[0].TOTAL_AREA ?? '';
      generalPatch['areaType'] = areas[0].STATUS ?? '';
    }

    // Map contact info (fix operator precedence bug)
    generalPatch['contactName'] = (contract as any).CONTACT_PERSON || '';
    generalPatch['contactPhone'] = (contract as any).CONTACT_PHONE || '';

    this.generalDetailForm.patchValue(generalPatch);
    console.log('[AddContractModal] generalDetailForm patched, values:', this.generalDetailForm.value);

    // Map conditions from contract → conditionsForm
    this.conditionsForm.patchValue({
      durationYears: (contract as any).DURATION_YEARS ?? 0,
      durationMonths: (contract as any).DURATION_MONTHS ?? 0,
      durationDays: (contract as any).DURATION_DAYS ?? 0,
      contractStartDate: toDate((contract as any).START_DATE),
      contractEndDate: toDate((contract as any).END_DATE),
      rentRate: (contract as any).MONTHLY_RENT ?? 0,
      creditTermRent: (contract as any).CREDIT_TERM_RENT ?? 0,
      creditTermUtility: (contract as any).CREDIT_TERM_UTILITY ?? 0,
      depositAmount: (contract as any).DEPOSIT_AMOUNT ?? 0
    });

    // Pre-populate contract detail tab (tab 2) data for when user navigates to it
    this.lastContractDetailValue.set({
      bookingNumber: (contract as any).BOOKING_NUMBER ?? '',
      contractMaker: (contract as any).CONTRACT_MAKER ?? '',
      legalEntityName: (contract as any).LEGAL_ENTITY_NAME ?? '',
      registeredAddress: (contract as any).REGISTERED_ADDRESS ?? '',
      documentDeliveryAddress: (contract as any).DOCUMENT_DELIVERY_ADDRESS ?? '',
      phone: (contract as any).PHONE_DETAIL ?? '',
      email: (contract as any).EMAIL_DETAIL ?? '',
      contactPerson: (contract as any).CONTACT_PERSON_DETAIL ?? ''
    });
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
    const visited = new Set<number>([0]);
    draft.completedTabs.forEach(tabIndex => {
      if (tabIndex < this.tabs.length) {
        visited.add(tabIndex);
      }
    });
    visited.add(draft.currentTab);
    this.visitedTabs.set(visited);

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

    const completedTabs = Array.from(this.visitedTabs());

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
      this.saveCurrentTabState();
      this.markTabVisited(index);
      this.activeTabIndex.set(index);
    }
  }

  nextTab(): void {
    if (this.activeTabIndex() < this.tabs.length - 1) {
      this.saveCurrentTabState();
      const nextIndex = this.activeTabIndex() + 1;
      this.markTabVisited(nextIndex);
      this.activeTabIndex.set(nextIndex);
    }
  }

  previousTab(): void {
    if (this.activeTabIndex() > 0) {
      this.saveCurrentTabState();
      this.activeTabIndex.update(i => i - 1);
    }
  }

  /** Save current tab state before leaving */
  private saveCurrentTabState(): void {
    if (this.activeTabIndex() === 1 && this.contractDetailTab?.contractInfoTab?.form) {
      this.lastContractDetailValue.set(this.contractDetailTab.contractInfoTab.form.value);
    }
  }

  /** Mark a tab as visited (for navigation purposes) */
  private markTabVisited(index: number): void {
    this.visitedTabs.update(set => {
      const newSet = new Set(set);
      newSet.add(index);
      return newSet;
    });
  }

  canNavigateToTab(index: number): boolean {
    // Can always go to current tab
    if (index === this.activeTabIndex()) return true;

    // Can always go back
    if (index < this.activeTabIndex()) return true;

    // Can go to the next tab
    if (index === this.activeTabIndex() + 1) return true;

    // Can jump to any visited tab
    return this.visitedTabs().has(index);
  }

  /** Check if tab has been visited but not the current active tab */
  isTabVisited(index: number): boolean {
    return this.visitedTabs().has(index) && index !== this.activeTabIndex();
  }

  isAllFormsValid(): boolean {
    return this.generalDetailForm.valid;
  }

  /** รวบรวมรายชื่อฟิลด์บังคับที่ยังไม่ได้กรอก */
  getMissingRequiredFields(): string[] {
    const missing: string[] = [];
    const fieldLabels: Record<string, string> = {
      branch: 'สาขา',
      contractType: 'ประเภทสัญญา',
      quotationDate: 'วันที่ใบเสนอราคา',
      subCategory: 'หมวดหมู่ย่อย',
      areaBuilding: 'อาคาร',
      areaFloor: 'ชั้น',
      areaUnitNumber: 'เลขที่ยูนิต / ห้อง',
      contactName: 'ชื่อผู้ติดต่อ',
      contactPhone: 'เบอร์โทรผู้ติดต่อ',
    };

    Object.keys(fieldLabels).forEach(key => {
      const ctrl = this.generalDetailForm.get(key);
      if (ctrl && ctrl.hasError('required') && (!ctrl.value || String(ctrl.value).trim() === '')) {
        missing.push(fieldLabels[key]);
      }
    });

    return missing;
  }

  /** แสดงข้อความแจ้งเตือนฟิลด์ที่ยังกรอกไม่ครบ หรือกรอกผิดรูปแบบ */
  showValidationError(): void {
    const missing = this.getMissingRequiredFields();
    const errors: string[] = [...missing];

    // เช็ครูปแบบเบอร์โทร
    const phoneCtrl = this.generalDetailForm.get('contactPhone');
    if (phoneCtrl && phoneCtrl.value && phoneCtrl.hasError('pattern')) {
      errors.push('เบอร์โทรผู้ติดต่อ (รูปแบบไม่ถูกต้อง)');
    }

    if (errors.length > 0) {
      this.showMessage({
        title: 'ไม่สามารถบันทึกได้',
        message: `กรุณาตรวจสอบข้อมูลต่อไปนี้:\n• ${errors.join('\n• ')}`
      });
    } else {
      this.showMessage({
        title: 'ไม่สามารถบันทึกได้',
        message: 'กรุณากรอกข้อมูลในฟิลด์ที่จำเป็น (*) ให้ครบถ้วนก่อนบันทึก'
      });
    }
  }

  /** ตรวจสอบฟอร์มรายละเอียดสัญญา (tab 2) */
  isContractDetailFormValid(): boolean {
    const form = this.contractDetailTab?.contractInfoTab?.form;
    if (!form) {
      // ถ้ายังไม่ได้เข้า tab นี้ → ตรวจจากค่าที่เก็บไว้
      const saved = this.lastContractDetailValue();
      if (!saved || Object.keys(saved).length === 0) return false;
      // ตรวจว่าฟิลบังคับกรอกมีค่าหรือยัง
      const requiredFields = ['contractMaker', 'legalEntityName', 'registeredAddress', 'contactPerson', 'email'];
      return requiredFields.every(f => {
        const v = saved[f];
        return v !== null && v !== undefined && String(v).trim() !== '';
      });
    }
    return form.valid;
  }

  /** ตรวจสอบว่า tab นี้กรอกข้อมูลครบจริงหรือยัง (ตรวจจาก form validity) */
  isTabCompleted(index: number): boolean {
    switch (index) {
      case 0: // รายละเอียดทั่วไป
        return this.generalDetailForm.valid;
      case 1: // รายละเอียดสัญญา
        return this.isContractDetailFormValid();
      case 2: // เงื่อนไขอื่นๆ
        return this.conditionsForm.valid;
      case 3: // เอกสารแนบ (optional — ถือว่าเสร็จเมื่อเคยเข้าดูแล้ว)
        return this.visitedTabs().has(3);
      case 4: // สรุป (ไม่ต้องเช็ค)
        return false;
      default:
        return false;
    }
  }

  /** ตรวจว่า tab เคยเข้าดูแล้ว แต่ยังกรอกไม่ครบ */
  isTabIncomplete(index: number): boolean {
    return this.isTabVisited(index) && !this.isTabCompleted(index);
  }

  // ==================== ACTIONS ====================

  /** บันทึกเฉพาะรายละเอียดทั่วไป → แสดงในแท็บใบเสนอราคา */
  onSaveQuotationOnly(): void {
    if (!this.isAllFormsValid()) {
      this.markAllAsTouched();
      this.showValidationError();
      return;
    }
    const formData = {
      mode: this.mode(),
      contractId: this.mode() === 'edit' ? this.contractData()?.CONTRACT_ID : undefined,
      draftId: this.currentDraftId() || undefined,
      saveAsQuotationOnly: true,
      generalDetails: this.generalDetailForm.value,
      contractDetails: this.getContractDetailsPayload(),
      conditions: this.conditionsForm.value,
      documents: this.documentForm.value
    };
    this.save.emit(formData);
    this.close.emit();
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
        draftId: this.currentDraftId() || undefined,
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
      this.showValidationError();
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

    // เช็คว่าเคยไป tab อื่นแล้วหรือไม่
    if (this.visitedTabs().size > 1) return true;

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
