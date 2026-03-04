// add-contract-modal.component.ts - WITH EDIT MODE, DRAFT SUPPORT & PREFILL
import {
  Component,
  output,
  signal,
  input,
  OnInit,
  effect,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Contract } from '@core/models/contract.model';
import { GeneralDetailTabComponent } from './components/general-detail-tab/general-detail-tab.component';
import { ContractDetailTabComponent } from './components/contract-detail-tab/contract-detail-tab.component';
import { ConditionsTabComponent } from './components/conditions-tab/conditions-tab.component';
import { DocumentTabComponent } from './components/document-tab/document-tab.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';
import {
  DraftContractService,
  DraftContract,
} from '@core/services/draft-contract.service';

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
    WarningModalComponent,
  ],
  templateUrl: './add-contract-modal.component.html',
  styleUrl: './add-contract-modal.component.css',
})
export class AddContractModalComponent implements OnInit {
  // Inputs
  mode = input<'add' | 'edit'>('add');
  contractData = input<Contract | null>(null);
  draftData = input<DraftContract | null>(null);
  // ✅ เพิ่ม: รับ prefill data จาก area-list (ผ่าน contract-table)
  prefillData = input<Record<string, any> | null>(null);

  // Outputs
  close = output<void>();
  save = output<any>();
  draftSaved = output<DraftContract>();

  currentDraftId = signal<string | null>(null);

  // Forms
  generalDetailForm!: FormGroup;
  conditionsForm!: FormGroup;
  documentForm!: FormGroup;

  @ViewChild(ContractDetailTabComponent)
  contractDetailTab?: ContractDetailTabComponent;

  // Tab state
  activeTabIndex = signal<number>(0);
  lastContractDetailValue = signal<Record<string, unknown>>({});
  visitedTabs = signal<Set<number>>(new Set([0]));
  tabs: Tab[] = [
    { id: 'general', label: 'รายละเอียดทั่วไป', completed: false },
    { id: 'contract', label: 'รายละเอียดสัญญา', completed: false },
    { id: 'conditions', label: 'เงื่อนไขอื่นๆ', completed: false },
    { id: 'attachments', label: 'เอกสารแนบ', completed: false },
    { id: 'summary', label: 'สรุป', completed: false },
  ];

  modalTitle = signal<string>('สร้างใบเสนอราคา');

  showMessageModal = signal<boolean>(false);
  messageModalTitle = signal<string>('');
  messageModalMessage = signal<string>('');

  showConfirmCloseModal = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private draftService: DraftContractService,
  ) {
    this.initForms();

    effect(() => {
      const draft = this.draftData();
      if (draft) {
        this.modalTitle.set(`แก้ไขแบบร่าง: ${draft.name}`);
      } else {
        this.modalTitle.set(
          this.mode() === 'edit' ? 'แก้ไขข้อมูลสัญญา' : 'สร้างใบเสนอราคา',
        );
      }
    });
  }

  ngOnInit(): void {
    this.tabs.forEach((t) => (t.completed = false));
    this.activeTabIndex.set(0);

    // โหลดข้อมูลตาม priority: edit > draft > prefill
    const contract = this.contractData();
    if (contract && this.mode() === 'edit') {
      this.loadContractData(contract);
      return; // edit mode ไม่ต้องสนใจ prefill
    }

    const draft = this.draftData();
    if (draft) {
      this.loadDraftData(draft);
      return; // draft มี priority เหนือ prefill
    }

    // ✅ ถ้าไม่มี contract/draft → ตรวจ prefill จาก area
    const prefill = this.prefillData();
    if (prefill && this.mode() === 'add') {
      this.applyPrefillData(prefill);
    }
  }

  // ==================== PREFILL FROM AREA ====================

  /**
   * Apply pre-fill data จากหน้าอื่น (area-list → ทำใบเสนอราคา)
   * patch เฉพาะ field ที่มีค่า เพื่อไม่ override default ที่ตั้งไว้
   */
  private applyPrefillData(data: Record<string, any>): void {
    console.log('[AddContractModal] applyPrefillData:', data);

    // field ใน generalDetailForm ที่รับค่าจาก area ได้
    const generalFields = [
      'areaBuilding',
      'areaFloor',
      'areaUnitNumber',
      'areaTotal',
      'areaMonthlyRent',
      'areaType',
      'contactName',
      'contactPhone',
    ];

    const generalPatch: Record<string, any> = {};
    generalFields.forEach((field) => {
      const val = data[field];
      if (val !== undefined && val !== null && val !== '') {
        generalPatch[field] = val;
      }
    });

    if (Object.keys(generalPatch).length > 0) {
      this.generalDetailForm.patchValue(generalPatch);
      console.log(
        '[AddContractModal] generalDetailForm pre-filled:',
        generalPatch,
      );
    }

    // ✅ ถ้ามี monthlyRent ส่งไปที่ conditionsForm → rentRate ด้วย
    if (data['areaMonthlyRent']) {
      const rent = Number(data['areaMonthlyRent']);
      if (!isNaN(rent) && rent > 0) {
        this.conditionsForm.patchValue({ rentRate: rent });
        console.log(
          '[AddContractModal] conditionsForm rentRate pre-filled:',
          rent,
        );
      }
    }
  }

  // ==================== LOAD CONTRACT DATA (EDIT MODE) ====================

  loadContractData(contract: Contract): void {
    console.log(
      '[AddContractModal] loadContractData called:',
      contract.CONTRACT_ID,
      contract,
    );

    const toDate = (val: unknown): Date | string => {
      if (!val) return '';
      if (val instanceof Date) return val;
      if (typeof val === 'string' && val.trim()) {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d;
      }
      return '';
    };

    const generalPatch: Record<string, any> = {
      branch: contract.BRANCH_CODE || '',
      contractType: contract.CONTRACT_TYPE_CODE || '',
      contractNumberMain: contract.CONTRACT_NUMBER_MAIN || '',
      contractNumberSub: contract.CONTRACT_NUMBER_SUB || '',
      quotationStatus: contract.QUOTATION_STATUS || '',
      quotationDate: toDate(contract.CONTRACT_DATE),
      quotationLevelDate: toDate(
        (contract as any).QUOTATION_LEVEL_DATE || contract.RECORD_DATE,
      ),
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

    const areas = (contract as any).AREA_DETAILS as
      | {
          BUILDING?: string;
          FLOOR?: string;
          UNIT_NUMBER?: string;
          TOTAL_AREA?: number;
          STATUS?: string;
        }[]
      | undefined;
    if (areas && areas.length > 0) {
      generalPatch['areaBuilding'] = areas[0].BUILDING ?? '';
      generalPatch['areaFloor'] = areas[0].FLOOR ?? '';
      generalPatch['areaUnitNumber'] = areas[0].UNIT_NUMBER ?? '';
      generalPatch['areaTotal'] = areas[0].TOTAL_AREA ?? '';
      generalPatch['areaType'] = areas[0].STATUS ?? '';
    }

    generalPatch['contactName'] = (contract as any).CONTACT_PERSON || '';
    generalPatch['contactPhone'] = (contract as any).CONTACT_PHONE || '';

    this.generalDetailForm.patchValue(generalPatch);

    this.conditionsForm.patchValue({
      durationYears: (contract as any).DURATION_YEARS ?? 0,
      durationMonths: (contract as any).DURATION_MONTHS ?? 0,
      durationDays: (contract as any).DURATION_DAYS ?? 0,
      contractStartDate: toDate((contract as any).START_DATE),
      contractEndDate: toDate((contract as any).END_DATE),
      rentRate: (contract as any).MONTHLY_RENT ?? 0,
      creditTermRent: (contract as any).CREDIT_TERM_RENT ?? 0,
      creditTermUtility: (contract as any).CREDIT_TERM_UTILITY ?? 0,
      depositAmount: (contract as any).DEPOSIT_AMOUNT ?? 0,
    });

    this.lastContractDetailValue.set({
      bookingNumber: (contract as any).BOOKING_NUMBER ?? '',
      contractMaker: (contract as any).CONTRACT_MAKER ?? '',
      legalEntityName: (contract as any).LEGAL_ENTITY_NAME ?? '',
      registeredAddress: (contract as any).REGISTERED_ADDRESS ?? '',
      documentDeliveryAddress:
        (contract as any).DOCUMENT_DELIVERY_ADDRESS ?? '',
      phone: (contract as any).PHONE_DETAIL ?? '',
      email: (contract as any).EMAIL_DETAIL ?? '',
      contactPerson: (contract as any).CONTACT_PERSON_DETAIL ?? '',
    });
  }

  // ==================== DRAFT MANAGEMENT ====================

  loadDraftData(draft: DraftContract): void {
    console.log('Loading draft data:', draft);
    this.currentDraftId.set(draft.id);

    if (draft.formData.generalDetails) {
      this.generalDetailForm.patchValue(draft.formData.generalDetails);
    }
    if (draft.formData.conditions) {
      this.conditionsForm.patchValue(draft.formData.conditions);
    }
    if (draft.formData.documents) {
      this.documentForm.patchValue(draft.formData.documents);
    }

    this.activeTabIndex.set(draft.currentTab);
    const visited = new Set<number>([0]);
    draft.completedTabs.forEach((tabIndex) => {
      if (tabIndex < this.tabs.length) visited.add(tabIndex);
    });
    visited.add(draft.currentTab);
    this.visitedTabs.set(visited);

    if (draft.formData.contractDetails) {
      this.lastContractDetailValue.set(draft.formData.contractDetails);
    }
  }

  onSaveDraft(): void {
    const formData = {
      generalDetails: this.generalDetailForm.value,
      contractDetails: this.getContractDetailsPayload(),
      conditions: this.conditionsForm.value,
      documents: this.documentForm.value,
    };

    const completedTabs = Array.from(this.visitedTabs());
    let draft: DraftContract;

    if (this.currentDraftId()) {
      const updated = this.draftService.updateDraft(
        this.currentDraftId()!,
        formData,
        this.activeTabIndex(),
        completedTabs,
      );
      draft =
        updated ??
        this.draftService.createDraft(
          formData,
          this.activeTabIndex(),
          completedTabs,
        );
      if (!updated) this.currentDraftId.set(draft.id);
    } else {
      draft = this.draftService.createDraft(
        formData,
        this.activeTabIndex(),
        completedTabs,
      );
      this.currentDraftId.set(draft.id);
    }

    this.draftSaved.emit(draft);
    this.showMessage({
      title: 'บันทึกแบบร่างสำเร็จ',
      message: `แบบร่าง "${draft.name}" ถูกบันทึกแล้ว คุณสามารถกลับมาแก้ไขต่อได้ภายหลัง`,
    });
  }

  // ==================== FORM INIT ====================

  initForms(): void {
    this.generalDetailForm = this.fb.group({
      branch: ['', Validators.required],
      contractType: ['', Validators.required],
      contractNumberMain: [''],
      contractNumberSub: [''],
      quotationStatus: [''],
      quotationLevelDate: [''],
      quotationDate: ['', Validators.required],
      approvalDate: [''],
      recordDate: [''],
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
      areaBuilding: ['', Validators.required],
      areaFloor: ['', Validators.required],
      areaUnitNumber: ['', Validators.required],
      areaTotal: [''],
      areaType: [''],
      areaMonthlyRent: [''],
      contactName: ['', Validators.required],
      contactPhone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{9,10}$/)],
      ],
    });

    this.conditionsForm = this.fb.group({
      durationYears: [0, Validators.required],
      durationMonths: [0],
      durationDays: [0],
      contractStartDate: ['', Validators.required],
      contractEndDate: ['', Validators.required],
      renewalCondition: [''],
      renewalCount: [0],
      rentRate: [0, Validators.required],
      serviceRate: [0],
      creditTermRent: [0, Validators.required],
      creditTermUtility: [0, Validators.required],
      paymentFrequency: ['', Validators.required],
      rentAdjustmentPercent: [0],
      depositAmount: [0, Validators.required],
      advanceNoticeDays: [0],
      closurePenalty: [0],
      excludedProducts: [''],
      hasAddendum: [false],
      addendumNotes: [''],
    });

    this.documentForm = this.fb.group({});
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
      this.activeTabIndex.update((i) => i - 1);
    }
  }

  private saveCurrentTabState(): void {
    if (
      this.activeTabIndex() === 1 &&
      this.contractDetailTab?.contractInfoTab?.form
    ) {
      this.lastContractDetailValue.set(
        this.contractDetailTab.contractInfoTab.form.value,
      );
    }
  }

  private markTabVisited(index: number): void {
    this.visitedTabs.update((set) => {
      const newSet = new Set(set);
      newSet.add(index);
      return newSet;
    });
  }

  canNavigateToTab(index: number): boolean {
    if (index === this.activeTabIndex()) return true;
    if (index < this.activeTabIndex()) return true;
    if (index === this.activeTabIndex() + 1) return true;
    return this.visitedTabs().has(index);
  }

  isTabVisited(index: number): boolean {
    return this.visitedTabs().has(index) && index !== this.activeTabIndex();
  }

  isAllFormsValid(): boolean {
    return this.generalDetailForm.valid;
  }

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
    Object.keys(fieldLabels).forEach((key) => {
      const ctrl = this.generalDetailForm.get(key);
      if (
        ctrl &&
        ctrl.hasError('required') &&
        (!ctrl.value || String(ctrl.value).trim() === '')
      ) {
        missing.push(fieldLabels[key]);
      }
    });
    return missing;
  }

  showValidationError(): void {
    const missing = this.getMissingRequiredFields();
    const errors: string[] = [...missing];
    const phoneCtrl = this.generalDetailForm.get('contactPhone');
    if (phoneCtrl && phoneCtrl.value && phoneCtrl.hasError('pattern')) {
      errors.push('เบอร์โทรผู้ติดต่อ (รูปแบบไม่ถูกต้อง)');
    }
    if (errors.length > 0) {
      this.showMessage({
        title: 'ไม่สามารถบันทึกได้',
        message: `กรุณาตรวจสอบข้อมูลต่อไปนี้:\n• ${errors.join('\n• ')}`,
      });
    } else {
      this.showMessage({
        title: 'ไม่สามารถบันทึกได้',
        message: 'กรุณากรอกข้อมูลในฟิลด์ที่จำเป็น (*) ให้ครบถ้วนก่อนบันทึก',
      });
    }
  }

  isContractDetailFormValid(): boolean {
    const form = this.contractDetailTab?.contractInfoTab?.form;
    if (!form) {
      const saved = this.lastContractDetailValue();
      if (!saved || Object.keys(saved).length === 0) return false;
      const requiredFields = [
        'contractMaker',
        'legalEntityName',
        'registeredAddress',
        'contactPerson',
        'email',
      ];
      return requiredFields.every((f) => {
        const v = saved[f];
        return v !== null && v !== undefined && String(v).trim() !== '';
      });
    }
    return form.valid;
  }

  isTabCompleted(index: number): boolean {
    switch (index) {
      case 0:
        return this.generalDetailForm.valid;
      case 1:
        return this.isContractDetailFormValid();
      case 2:
        return this.conditionsForm.valid;
      case 3:
        return this.visitedTabs().has(3);
      default:
        return false;
    }
  }

  isTabIncomplete(index: number): boolean {
    return this.isTabVisited(index) && !this.isTabCompleted(index);
  }

  // ==================== ACTIONS ====================

  onSaveQuotationOnly(): void {
    if (!this.isAllFormsValid()) {
      this.markAllAsTouched();
      this.showValidationError();
      return;
    }
    const formData = {
      mode: this.mode(),
      contractId:
        this.mode() === 'edit' ? this.contractData()?.CONTRACT_ID : undefined,
      draftId: this.currentDraftId() || undefined,
      saveAsQuotationOnly: true,
      generalDetails: this.generalDetailForm.value,
      contractDetails: this.getContractDetailsPayload(),
      conditions: this.conditionsForm.value,
      documents: this.documentForm.value,
    };
    this.save.emit(formData);
    this.close.emit();
  }

  isContractDetailValid(): boolean {
    const form = this.contractDetailTab?.contractInfoTab?.form;
    const value = form ? form.value : this.lastContractDetailValue();
    const required = ['bookingNumber', 'legalEntityName', 'contractMaker'];
    return required.every((f) => {
      const v = value[f];
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
  }

  getContractDetailsPayload(): Record<string, unknown> {
    if (this.contractDetailTab?.contractInfoTab?.form) {
      return this.contractDetailTab.contractInfoTab.form.value;
    }
    return this.lastContractDetailValue();
  }

  onSubmit(): void {
    if (this.isAllFormsValid()) {
      const formData = {
        mode: this.mode(),
        contractId:
          this.mode() === 'edit' ? this.contractData()?.CONTRACT_ID : undefined,
        draftId: this.currentDraftId() || undefined,
        saveAsQuotationOnly: false,
        saveAsBooking: true,
        generalDetails: this.generalDetailForm.value,
        contractDetails: this.getContractDetailsPayload(),
        conditions: this.conditionsForm.value,
        documents: this.documentForm.value,
      };
      console.log(
        `${this.mode() === 'edit' ? 'Updating' : 'Creating'} contract:`,
        formData,
      );
      this.save.emit(formData);
      this.close.emit();
    } else {
      this.markAllAsTouched();
      this.showValidationError();
    }
  }

  hasUnsavedData(): boolean {
    const gv = this.generalDetailForm.value;
    const hasGeneralData = Object.keys(gv).some((k) => {
      const v = gv[k];
      return (
        v !== null &&
        v !== undefined &&
        v !== '' &&
        !(Array.isArray(v) && v.length === 0)
      );
    });
    if (hasGeneralData) return true;

    const cv = this.conditionsForm.value;
    const hasConditionsData = Object.keys(cv).some((k) => {
      const v = cv[k];
      return v !== null && v !== undefined && v !== '' && v !== false;
    });
    if (hasConditionsData) return true;

    const dv = this.documentForm.value;
    const hasDocData = Object.keys(dv).some((k) => {
      const v = dv[k];
      return (
        v !== null &&
        v !== undefined &&
        v !== '' &&
        !(Array.isArray(v) && v.length === 0)
      );
    });
    if (hasDocData) return true;

    if (this.visitedTabs().size > 1) return true;
    return false;
  }

  onCancel(): void {
    if (this.hasUnsavedData()) {
      this.showConfirmCloseModal.set(true);
    } else {
      this.close.emit();
    }
  }

  confirmClose(): void {
    this.showConfirmCloseModal.set(false);
    this.close.emit();
  }

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
    Object.keys(this.generalDetailForm.controls).forEach((key) => {
      this.generalDetailForm.get(key)?.markAsTouched();
    });
    const contractForm = this.contractDetailTab?.contractInfoTab?.form;
    if (contractForm) {
      Object.keys(contractForm.controls).forEach((key) => {
        contractForm.get(key)?.markAsTouched();
      });
    }
  }

  // ==================== SUMMARY HELPERS ====================

  getFormValue(fieldName: string): any {
    return this.generalDetailForm.get(fieldName)?.value ?? null;
  }

  getConditionsValue(fieldName: string): any {
    return this.conditionsForm.get(fieldName)?.value ?? null;
  }

  getContractDetailValue(fieldName: string): any {
    if (!this.contractDetailTab?.contractInfoTab?.form) return null;
    return (
      this.contractDetailTab.contractInfoTab.form.get(fieldName)?.value ?? null
    );
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
