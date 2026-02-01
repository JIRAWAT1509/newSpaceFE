// src/app/features/setting/pages/finance/basic/basic.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { BranchMasterComponent } from './component/branch-master/branch-master.component';

// ใส่ interface ไว้ให้โครงมันชัด
interface VatOption {
  code: string;
  desc: string;
  rate?: number;
}

interface CurrencyOption {
  code: string;
  name: string;
}

interface CreditTermOption {
  code: string;
  name: string;
  days?: number;
}

interface HouseTaxOption {
  code: string;
  desc?: string;
  rate?: number;
}

interface InsuranceOption {
  code: string;
  desc?: string;
  rate?: number;
}

interface DropdownOption {
  code: string;
  name: string;
}

type FinanceFeatureKey =
  | 'master'
  | 'branch-master'
  | 'currency'
  | 'credit-note-reason'
  | 'credit-term';

@Component({
  selector: 'app-finance-basic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // primeng
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    TabsModule,
    SelectModule,
    RadioButtonModule,
    TableModule,
    BranchMasterComponent,
  ],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.css',
  providers: [MessageService, ConfirmationService],
})
export class BasicComponent implements OnInit {
  // which card is selected
  selectedFeature:
    | 'master'
    | 'branch-master'
    | 'currency'
    | 'credit-note-reason'
    | 'credit-term' = 'master';
  activeTab: 'company' | 'misc1' | 'misc2' | 'misc3' = 'company';
  
  // Form visibility states
  showBaseForm = false;
  isEditBaseMode = false;
  editingBaseMaster: any = null;
  
  // Form visibility for other features
  showCurrencyForm = false;
  isEditCurrencyMode = false;
  editingCurrency: any = null;
  
  showCreditNoteReasonForm = false;
  isEditCreditNoteReasonMode = false;
  editingCreditNoteReason: any = null;
  
  showCreditTermForm = false;
  isEditCreditTermMode = false;
  editingCreditTerm: any = null;
  
  @ViewChild(BranchMasterComponent) branchMasterComponent?: BranchMasterComponent;

  // search term (shared for now, can split later)
  searchQuery: string = '';

  // mock data placeholders – you will replace with real fetched data later
  baseMaster: any[] = [{}, {}];
  branchMaster = [
    { branch: 'ST03', name: 'Warehouse Tower 3', taxProfile: 'PTAX' },
    { branch: 'WBP1', name: 'Warehouse Bangphe 1', taxProfile: 'PTAX' },
    { branch: 'WBP2', name: 'Warehouse Bangphe 2', taxProfile: 'OTHN' },
  ];
  // drawer state
  showBranchDrawer = false;
  isEditBranch = false;

    // form model for branch-level basic
  branchForm: any = {
    branchCode: '',
    vatCode: '',
    houseTaxCode: '',
    houseTaxRate: null,
    stampCode: '',
    currencyCode: '',
    shortTermMonth: null,
    creditTerm: '',
    insuranceCode: '',
    insuranceRate: null,
    contractMonthFrom: null,
    costCenter: ''
  };

  branchOptions = this.branchMaster.map(b => ({ label: `${b.taxProfile} - ${b.name}`, value: b.taxProfile }));

  currencies: any[] = [{ code: 'THB', name: 'เงินบาท', rate: 1, active: true }];
  creditNoteReasons: any[] = [{ code: 'CN01', description: 'ลดหนี้ทั่วไป' }];
  creditTerms: any[] = [
    { code: 'C005', description: 'ชำระภายในวันที 5 ของทุกเดือน', days: 5 },
  ];
  
  // Form models
  currencyForm = {
    code: '',
    name: '',
    rate: 1,
    active: true
  };
  
  creditNoteReasonForm = {
    code: '',
    description: ''
  };
  
  creditTermForm = {
    code: '',
    description: '',
    days: 0
  };


  private readonly serviceMock = {
    data: [
      {
        OU_CODE: '001',
        SERVICE_CODE: 'WATE',
        SERVICE_NAME: 'Service - Water',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'ELEU',
        SERVICE_NAME: 'Service - Electricity',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'GASS',
        SERVICE_NAME: 'Service - Gas',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'AMIN',
        SERVICE_NAME: 'Admin / Finance Service',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'DPRE',
        SERVICE_NAME: 'Deposit of Rental Fee',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'DPSE',
        SERVICE_NAME: 'Deposit of Service Fee',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'DPME',
        SERVICE_NAME: 'Deposit for Electricity / Water / Gas',
        VAT_CODE: 'DS',
      },
      {
        OU_CODE: '001',
        SERVICE_CODE: 'DPTE',
        SERVICE_NAME: 'Deposit for Telephone',
        VAT_CODE: 'DS',
      },
    ],
    total: 8,
  };

  private readonly docMock = {
    data: [
      { OU_CODE: '001', DOC_CODE: 'QO', DOC_NAME: 'ใบเสนอราคา' },
      { OU_CODE: '001', DOC_CODE: 'RS', DOC_NAME: 'สัญญาจอง' },
      { OU_CODE: '001', DOC_CODE: 'CO', DOC_NAME: 'สัญญาเช่า' },
      { OU_CODE: '001', DOC_CODE: 'MS', DOC_NAME: 'เอกสารจัดพื้นที่' },
      { OU_CODE: '001', DOC_CODE: 'CL', DOC_NAME: 'ใบปิดปรับปรุงพื้นที่' },
      { OU_CODE: '001', DOC_CODE: 'JO', DOC_NAME: 'เอกสารในแจ้งงาน' },
      { OU_CODE: '001', DOC_CODE: 'IV', DOC_NAME: 'ใบแจ้งหนี้' },
      { OU_CODE: '001', DOC_CODE: 'CI', DOC_NAME: 'ใบลดหนี้ในแจ้งหนี้' },
      { OU_CODE: '001', DOC_CODE: 'NN', DOC_NAME: 'ใบแจ้งเดือนชำระ' },
      { OU_CODE: '001', DOC_CODE: 'SL', DOC_NAME: 'เอกสารนำที่กยอดขายการเงิน' },
      { OU_CODE: '001', DOC_CODE: 'SA', DOC_NAME: 'เอกสารนำที่กยอดขายบัญชี' },
      // from your real mock
      { OU_CODE: '001', DOC_CODE: 'CV', DOC_NAME: 'ใบลดหนี้/ใบกำกับภาษี' },
    ],
    total: 12,
  };

  isLoadingBase = false;
  isLoadingBranch = false;
  isLoadingCurrency = false;
  isLoadingCreditReason = false;
  isLoadingCreditTerm = false;

  constructor(
    private messageService: MessageService,
    private confirmService: ConfirmationService
  ) {}

  // ---------- mock options from legacy ----------
  vatOptions: VatOption[] = [];
  houseTaxOptions: HouseTaxOption[] = [];
  stampOptions: HouseTaxOption[] = [];
  currencyOptions: CurrencyOption[] = [];
  creditTermOptions: CreditTermOption[] = [];
  insuranceOptions: InsuranceOption[] = [];
  receiptDocOptions: DropdownOption[] = [];
  receiptTaxDocOptions: DropdownOption[] = [];
  tempReceiptDocOptions: DropdownOption[] = [];
  creditNoteReceiptDocOptions: DropdownOption[] = [];
  creditNoteTaxDocOptions: DropdownOption[] = [];

  // แบบฟอร์มหลักของ “ข้อมูลพื้นฐาน”
  baseForm = {
    // tab Company
    taxId: '',
    compThai: '',
    compEng: '',
    addrThai1: '',
    addrThai2: '',
    addrEng1: '',
    addrEng2: '',
    postCode: '',
    tel: '',
    fax: '',
    telAcc: '',

    // tab เบ็ดเตล็ด 1 → ภาษี
    vatCode: '',
    houseTaxCode: '',
    houseTaxRate: 0,
    stampCode: '',
    canEditVat: 'Y', // Y or N

    // tab เบ็ดเตล็ด 1 → ค่าอื่นๆ
    currencyCode: '',
    shortTermMonth: 0,
    creditTermCode: '',
    insuranceCode: '',
    insuranceRate: 0,
    splitInvoiceType: 'D', // D | S

    // tab เบ็ดเตล็ด 1 → ระยะเวลายื่น notice
    prefixCust: '',
    priceDiff: 0,
    termCreNotice: 0,

    // service-based dropdowns (defaults so later spreads won't introduce unknown properties)
    waterFeeCode: '',
    electricFeeCode: '',
    gasFeeCode: '',
    financeServiceCode: '',
    phoneInstallCode: '',

    // deposits
    depositRentCode: '',
    depositServiceCode: '',
    depositMeterCode: '',
    depositTelephoneCode: '',

    // doc-based (left)
    quotationDocCode: '',
    reserveContractDoc: '',
    leaseContractDoc: '',
    areaDocCode: '',
    renovationDocCode: '',
    jobDocCode: '',

    // doc-based (right)
    invoiceDocCode: '',
    creditNoteDocCode: '',
    monthlyInvoiceDocCode: '',
    finTransferDocCode: '',
    accTransferDocCode: '',

    // UI
    invoiceAddressType: '',

    receiptDocCode: '',
    receiptTaxDocCode: '',
    tempReceiptDocCode: '',
    creditNoteReceiptDocCode: '',
    creditNoteTaxDocCode: '',
  };

  // service-based dropdowns
  waterFeeOptions: DropdownOption[] = [];
  electricFeeOptions: DropdownOption[] = [];
  gasFeeOptions: DropdownOption[] = [];
  financeServiceOptions: DropdownOption[] = [];
  phoneInstallOptions: DropdownOption[] = [];

  // deposits
  depositRentOptions: DropdownOption[] = [];
  depositServiceOptions: DropdownOption[] = [];
  depositMeterOptions: DropdownOption[] = [];
  depositTelephoneOptions: DropdownOption[] = [];

  // doc-based (left)
  quotationDocOptions: DropdownOption[] = [];
  reserveContractOptions: DropdownOption[] = [];
  leaseContractOptions: DropdownOption[] = [];
  areaDocOptions: DropdownOption[] = [];
  renovationDocOptions: DropdownOption[] = [];
  jobDocOptions: DropdownOption[] = [];

  // doc-based (right)
  invoiceDocOptions: DropdownOption[] = [];
  creditNoteDocOptions: DropdownOption[] = [];
  monthlyInvoiceDocOptions: DropdownOption[] = [];
  finTransferDocOptions: DropdownOption[] = [];
  accTransferDocOptions: DropdownOption[] = [];

  ngOnInit(): void {
    // later you will call real services here
    this.loadBaseMaster();
    this.loadBranchMaster();
    this.loadCurrencies();
    this.loadCreditNoteReasons();
    this.loadCreditTerms();

    // mock ตามที่นายแปะมา
    this.vatOptions = [
      { code: 'DS', desc: 'Deferred Output Tax rate 7%', rate: 7 },
      { code: 'OX', desc: 'Output Tax rate 0%(Non tax relevent)', rate: 0 },
      // เพิ่มตัวอื่นจาก API จริงได้เลย
    ];

    // house / stamp / insurance ของเก่าใช้ฟอร์แมตเดียวกัน ผมแยกเป็น 3 ชุดไว้ก่อน
    this.houseTaxOptions = [
      { code: 'PTAX', desc: 'ภาษีโรงเรือน', rate: 20 },
      { code: 'H001', desc: 'House Tax 1', rate: 15 },
    ];

    this.stampOptions = [
      { code: 'OTHN', desc: 'Other stamp' },
      { code: 'ST01', desc: 'Stamp 1' },
    ];

    this.currencyOptions = [
      { code: 'THB', name: 'เงินบาท' },
      { code: 'USD', name: 'US Dollar' },
    ];

    this.creditTermOptions = [
      { code: 'C000', name: 'Due immediately', days: 1 },
      { code: 'C05', name: 'ชำระเงินภายใน 5 วัน', days: 5 },
      { code: 'C005', name: 'ชำระเงินภายในวันที่ 5 ของทุกเดือน' },
    ];

    this.insuranceOptions = [
      { code: 'ISSU', desc: 'อัตราเบี้ยประกันเริ่มต้น', rate: 15 },
    ];

    const serviceOpts = this.toServiceOptions(this.serviceMock.data);
    const docOpts = this.toDocOptions(this.docMock.data);
    // add missing 3 codes that old system has but mock doesn't
    const extraDoc: DropdownOption[] = [
      { code: 'NT', name: 'ใบเสร็จรับเงิน' },
      { code: 'VT', name: 'ใบเสร็จรับเงิน/ใบกำกับภาษี' },
      { code: 'TR', name: 'ใบรับเงินชั่วคราว' },
    ];

    // merge
    const allDocs: DropdownOption[] = [...extraDoc, ...docOpts];

    // map to each field
    this.receiptDocOptions = allDocs.filter((o) => o.code === 'NT');
    this.receiptTaxDocOptions = allDocs.filter((o) => o.code === 'VT');
    this.tempReceiptDocOptions = allDocs.filter((o) => o.code === 'TR');
    this.creditNoteReceiptDocOptions = allDocs.filter((o) => o.code === 'CN');
    this.creditNoteTaxDocOptions = allDocs.filter((o) => o.code === 'CV');

    // --- service-based (all use the same source for now) ---
    this.waterFeeOptions = serviceOpts;
    this.electricFeeOptions = serviceOpts;
    this.gasFeeOptions = serviceOpts;
    this.financeServiceOptions = serviceOpts;
    this.phoneInstallOptions = serviceOpts;

    // deposits (also service-based)
    this.depositRentOptions = serviceOpts.filter((o) =>
      ['DPRE'].includes(o.code)
    );
    this.depositServiceOptions = serviceOpts.filter((o) =>
      ['DPSE'].includes(o.code)
    );
    this.depositMeterOptions = serviceOpts.filter((o) =>
      ['DPME'].includes(o.code)
    );
    this.depositTelephoneOptions = serviceOpts.filter((o) =>
      ['DPTE'].includes(o.code)
    );

    // --- doc-based (reuse docMock) ---
    this.quotationDocOptions = docOpts.filter(
      (o) => o.code === 'QO' || o.name.includes('เสนอราคา')
    );
    this.reserveContractOptions = docOpts.filter((o) => o.code === 'RS');
    this.leaseContractOptions = docOpts.filter(
      (o) => o.code === 'CO' || o.code === 'CT'
    );
    this.areaDocOptions = docOpts.filter((o) => o.code === 'MS');
    this.renovationDocOptions = docOpts.filter((o) => o.code === 'CL');
    this.jobDocOptions = docOpts.filter((o) => o.code === 'JO');

    this.invoiceDocOptions = docOpts.filter((o) => o.code === 'IV');
    this.creditNoteDocOptions = docOpts.filter(
      (o) => o.code === 'CI' || o.code === 'CV'
    );
    this.monthlyInvoiceDocOptions = docOpts.filter((o) => o.code === 'NN');
    this.finTransferDocOptions = docOpts.filter((o) => o.code === 'SL');
    this.accTransferDocOptions = docOpts.filter((o) => o.code === 'SA');
    this.baseForm = {
      ...this.baseForm,
      waterFeeCode: this.waterFeeOptions[0]?.code || '',
      electricFeeCode: this.electricFeeOptions[0]?.code || '',
      gasFeeCode: this.gasFeeOptions[0]?.code || '',
      financeServiceCode: this.financeServiceOptions[0]?.code || '',
      phoneInstallCode: this.phoneInstallOptions[0]?.code || '',
      depositRentCode: this.depositRentOptions[0]?.code || '',
      depositServiceCode: this.depositServiceOptions[0]?.code || '',
      depositMeterCode: this.depositMeterOptions[0]?.code || '',
      depositTelephoneCode: this.depositTelephoneOptions[0]?.code || '',
      quotationDocCode: this.quotationDocOptions[0]?.code || '',
      reserveContractDoc: this.reserveContractOptions[0]?.code || '',
      leaseContractDoc: this.leaseContractOptions[0]?.code || '',
      areaDocCode: this.areaDocOptions[0]?.code || '',
      renovationDocCode: this.renovationDocOptions[0]?.code || '',
      jobDocCode: this.jobDocOptions[0]?.code || '',
      invoiceDocCode: this.invoiceDocOptions[0]?.code || '',
      creditNoteDocCode: this.creditNoteDocOptions[0]?.code || '',
      monthlyInvoiceDocCode: this.monthlyInvoiceDocOptions[0]?.code || '',
      finTransferDocCode: this.finTransferDocOptions[0]?.code || '',
      accTransferDocCode: this.accTransferDocOptions[0]?.code || '',
      invoiceAddressType: 'H',
    };
  }

  saveBaseForm(): void {
    // TODO: ไว้ยิง API ทีหลัง
    console.log('save basic form', this.baseForm);
    
    if (this.isEditBaseMode && this.editingBaseMaster) {
      // Update existing record
      const index = this.baseMaster.findIndex(item => item === this.editingBaseMaster);
      if (index !== -1) {
        this.baseMaster[index] = {
          ...this.baseMaster[index],
          taxId: this.baseForm.taxId,
          compThai: this.baseForm.compThai,
          compEng: this.baseForm.compEng,
          addrThai1: this.baseForm.addrThai1,
        };
      }
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'แก้ไขข้อมูลพื้นฐานเรียบร้อยแล้ว',
      });
    } else {
      // Add new record
      const newRecord = {
        taxId: this.baseForm.taxId,
        compThai: this.baseForm.compThai,
        compEng: this.baseForm.compEng,
        addrThai1: this.baseForm.addrThai1,
      };
      this.baseMaster.push(newRecord);
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'เพิ่มข้อมูลพื้นฐานเรียบร้อยแล้ว',
      });
    }
    
    // Close form and reset
    this.showBaseForm = false;
    this.isEditBaseMode = false;
    this.editingBaseMaster = null;
  }
  // card click
  selectFeature(feature: FinanceFeatureKey): void {
    this.selectedFeature = feature;
    this.searchQuery = '';
    // Reset all form states
    this.showBaseForm = false;
    this.isEditBaseMode = false;
    this.editingBaseMaster = null;
    this.showCurrencyForm = false;
    this.isEditCurrencyMode = false;
    this.editingCurrency = null;
    this.showCreditNoteReasonForm = false;
    this.isEditCreditNoteReasonMode = false;
    this.editingCreditNoteReason = null;
    this.showCreditTermForm = false;
    this.isEditCreditTermMode = false;
    this.editingCreditTerm = null;
  }

  // ================== LOADERS (stub) ==================
  loadBaseMaster(): void {
    this.isLoadingBase = true;
    // TODO: replace with real service
    setTimeout(() => {
      this.baseMaster = [
        { code: 'FIN01', name: 'ตั้งค่าระบบการเงินหลัก', active: true },
      ];
      this.isLoadingBase = false;
    }, 200);
  }

  loadBranchMaster(): void {
    this.isLoadingBranch = true;
    setTimeout(() => {
      this.branchMaster = [
        { branch: 'B001', name: 'สาขากลาง', taxProfile: 'STD' },
      ];
      this.isLoadingBranch = false;
    }, 200);
  }

  loadCurrencies(): void {
    this.isLoadingCurrency = true;
    setTimeout(() => {
      this.currencies = [
        { code: 'THB', name: 'Thai Baht', rate: 1, active: true },
        { code: 'USD', name: 'US Dollar', rate: 35.5, active: true },
      ];
      this.isLoadingCurrency = false;
    }, 200);
  }

  loadCreditNoteReasons(): void {
    this.isLoadingCreditReason = true;
    setTimeout(() => {
      this.creditNoteReasons = [{ code: 'CN01', description: 'ส่วนลดพิเศษ' }];
      this.isLoadingCreditReason = false;
    }, 200);
  }

  loadCreditTerms(): void {
    this.isLoadingCreditTerm = true;
    setTimeout(() => {
      this.creditTerms = [
        { code: '30D', description: 'เครดิต 30 วัน', days: 30 },
      ];
      this.isLoadingCreditTerm = false;
    }, 200);
  }

  // ================== ACTIONS ==================
  openCreate(): void {
    if (this.selectedFeature === 'master') {
      this.showBaseForm = true;
      this.isEditBaseMode = false;
      this.editingBaseMaster = null;
      // Reset form
      this.baseForm = {
        taxId: '',
        compThai: '',
        compEng: '',
        addrThai1: '',
        addrThai2: '',
        addrEng1: '',
        addrEng2: '',
        postCode: '',
        tel: '',
        fax: '',
        telAcc: '',
        vatCode: '',
        houseTaxCode: '',
        houseTaxRate: 0,
        stampCode: '',
        canEditVat: 'Y',
        currencyCode: '',
        shortTermMonth: 0,
        creditTermCode: '',
        insuranceCode: '',
        insuranceRate: 0,
        splitInvoiceType: 'D',
        prefixCust: '',
        priceDiff: 0,
        termCreNotice: 0,
        waterFeeCode: '',
        electricFeeCode: '',
        gasFeeCode: '',
        financeServiceCode: '',
        phoneInstallCode: '',
        depositRentCode: '',
        depositServiceCode: '',
        depositMeterCode: '',
        depositTelephoneCode: '',
        quotationDocCode: '',
        reserveContractDoc: '',
        leaseContractDoc: '',
        areaDocCode: '',
        renovationDocCode: '',
        jobDocCode: '',
        invoiceDocCode: '',
        creditNoteDocCode: '',
        monthlyInvoiceDocCode: '',
        finTransferDocCode: '',
        accTransferDocCode: '',
        invoiceAddressType: '',
        receiptDocCode: '',
        receiptTaxDocCode: '',
        tempReceiptDocCode: '',
        creditNoteReceiptDocCode: '',
        creditNoteTaxDocCode: '',
      };
      this.activeTab = 'company';
    } else if (this.selectedFeature === 'currency') {
      this.showCurrencyForm = true;
      this.isEditCurrencyMode = false;
      this.editingCurrency = null;
      this.currencyForm = {
        code: '',
        name: '',
        rate: 1,
        active: true
      };
    } else if (this.selectedFeature === 'credit-note-reason') {
      this.showCreditNoteReasonForm = true;
      this.isEditCreditNoteReasonMode = false;
      this.editingCreditNoteReason = null;
      this.creditNoteReasonForm = {
        code: '',
        description: ''
      };
    } else if (this.selectedFeature === 'credit-term') {
      this.showCreditTermForm = true;
      this.isEditCreditTermMode = false;
      this.editingCreditTerm = null;
      this.creditTermForm = {
        code: '',
        description: '',
        days: 0
      };
    } else if (this.selectedFeature === 'branch-master') {
      // Call openAddPanel on BranchMasterComponent
      if (this.branchMasterComponent) {
        this.branchMasterComponent.openAddPanel();
      }
    }
  }

  editBaseMaster(row: any): void {
    this.showBaseForm = true;
    this.isEditBaseMode = true;
    this.editingBaseMaster = row;
    // Load data into form (you'll need to map row data to baseForm)
    // For now, just set some basic fields
    if (row.taxId) this.baseForm.taxId = row.taxId;
    if (row.compThai) this.baseForm.compThai = row.compThai;
    if (row.compEng) this.baseForm.compEng = row.compEng;
    if (row.addrThai1) this.baseForm.addrThai1 = row.addrThai1;
    this.activeTab = 'company';
  }

  deleteBaseMaster(row: any): void {
    this.confirmService.confirm({
      message: 'ยืนยันการลบข้อมูลพื้นฐานนี้?',
      accept: () => {
        // TODO: Implement delete logic
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบข้อมูลพื้นฐานเรียบร้อยแล้ว',
        });
        this.loadBaseMaster();
      },
    });
  }

  cancelBaseForm(): void {
    this.showBaseForm = false;
    this.isEditBaseMode = false;
    this.editingBaseMaster = null;
  }

  editCurrency(row: any): void {
    this.showCurrencyForm = true;
    this.isEditCurrencyMode = true;
    this.editingCurrency = row;
    this.currencyForm = {
      code: row.code || '',
      name: row.name || '',
      rate: row.rate || 1,
      active: row.active !== undefined ? row.active : true
    };
  }

  editCreditNoteReason(row: any): void {
    this.showCreditNoteReasonForm = true;
    this.isEditCreditNoteReasonMode = true;
    this.editingCreditNoteReason = row;
    this.creditNoteReasonForm = {
      code: row.code || '',
      description: row.description || ''
    };
  }

  editCreditTerm(row: any): void {
    this.showCreditTermForm = true;
    this.isEditCreditTermMode = true;
    this.editingCreditTerm = row;
    this.creditTermForm = {
      code: row.code || '',
      description: row.description || '',
      days: row.days || 0
    };
  }
  
  saveCurrencyForm(): void {
    // TODO: Implement save logic with API
    console.log('save currency form', this.currencyForm);
    
    if (this.isEditCurrencyMode && this.editingCurrency) {
      // Update existing record
      const index = this.currencies.findIndex(item => item.code === this.editingCurrency.code);
      if (index !== -1) {
        this.currencies[index] = {
          ...this.currencyForm
        };
      }
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'แก้ไขข้อมูลสกุลเงินเรียบร้อยแล้ว',
      });
    } else {
      // Add new record
      const newRecord = {
        code: this.currencyForm.code,
        name: this.currencyForm.name,
        rate: this.currencyForm.rate,
        active: this.currencyForm.active
      };
      this.currencies.push(newRecord);
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'เพิ่มข้อมูลสกุลเงินเรียบร้อยแล้ว',
      });
    }
    
    // Close form and reset
    this.showCurrencyForm = false;
    this.isEditCurrencyMode = false;
    this.editingCurrency = null;
    this.currencyForm = {
      code: '',
      name: '',
      rate: 1,
      active: true
    };
  }
  
  saveCreditNoteReasonForm(): void {
    // TODO: Implement save logic with API
    console.log('save credit note reason form', this.creditNoteReasonForm);
    
    if (this.isEditCreditNoteReasonMode && this.editingCreditNoteReason) {
      // Update existing record
      const index = this.creditNoteReasons.findIndex(item => item.code === this.editingCreditNoteReason.code);
      if (index !== -1) {
        this.creditNoteReasons[index] = {
          ...this.creditNoteReasonForm
        };
      }
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'แก้ไขข้อมูลสาเหตุการลดหนี้เรียบร้อยแล้ว',
      });
    } else {
      // Add new record
      const newRecord = {
        code: this.creditNoteReasonForm.code,
        description: this.creditNoteReasonForm.description
      };
      this.creditNoteReasons.push(newRecord);
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'เพิ่มข้อมูลสาเหตุการลดหนี้เรียบร้อยแล้ว',
      });
    }
    
    // Close form and reset
    this.showCreditNoteReasonForm = false;
    this.isEditCreditNoteReasonMode = false;
    this.editingCreditNoteReason = null;
    this.creditNoteReasonForm = {
      code: '',
      description: ''
    };
  }
  
  saveCreditTermForm(): void {
    // TODO: Implement save logic with API
    console.log('save credit term form', this.creditTermForm);
    
    if (this.isEditCreditTermMode && this.editingCreditTerm) {
      // Update existing record
      const index = this.creditTerms.findIndex(item => item.code === this.editingCreditTerm.code);
      if (index !== -1) {
        this.creditTerms[index] = {
          ...this.creditTermForm
        };
      }
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'แก้ไขข้อมูล Credit Term เรียบร้อยแล้ว',
      });
    } else {
      // Add new record
      const newRecord = {
        code: this.creditTermForm.code,
        description: this.creditTermForm.description,
        days: this.creditTermForm.days
      };
      this.creditTerms.push(newRecord);
      this.messageService.add({
        severity: 'success',
        summary: 'บันทึกสำเร็จ',
        detail: 'เพิ่มข้อมูล Credit Term เรียบร้อยแล้ว',
      });
    }
    
    // Close form and reset
    this.showCreditTermForm = false;
    this.isEditCreditTermMode = false;
    this.editingCreditTerm = null;
    this.creditTermForm = {
      code: '',
      description: '',
      days: 0
    };
  }
  
  cancelCurrencyForm(): void {
    this.showCurrencyForm = false;
    this.isEditCurrencyMode = false;
    this.editingCurrency = null;
  }
  
  cancelCreditNoteReasonForm(): void {
    this.showCreditNoteReasonForm = false;
    this.isEditCreditNoteReasonMode = false;
    this.editingCreditNoteReason = null;
  }
  
  cancelCreditTermForm(): void {
    this.showCreditTermForm = false;
    this.isEditCreditTermMode = false;
    this.editingCreditTerm = null;
  }

  confirmDelete(row: any): void {
    this.confirmService.confirm({
      message: 'คุณต้องการลบรายการนี้หรือไม่?',
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        // Determine which array to delete from based on selectedFeature
        if (this.selectedFeature === 'currency') {
          const index = this.currencies.findIndex(item => item.code === row.code);
          if (index !== -1) {
            this.currencies.splice(index, 1);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'ลบสำเร็จ',
            detail: 'ลบข้อมูลสกุลเงินเรียบร้อยแล้ว',
          });
        } else if (this.selectedFeature === 'credit-note-reason') {
          const index = this.creditNoteReasons.findIndex(item => item.code === row.code);
          if (index !== -1) {
            this.creditNoteReasons.splice(index, 1);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'ลบสำเร็จ',
            detail: 'ลบข้อมูลสาเหตุการลดหนี้เรียบร้อยแล้ว',
          });
        } else if (this.selectedFeature === 'credit-term') {
          const index = this.creditTerms.findIndex(item => item.code === row.code);
          if (index !== -1) {
            this.creditTerms.splice(index, 1);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'ลบสำเร็จ',
            detail: 'ลบข้อมูล Credit Term เรียบร้อยแล้ว',
          });
        }
      },
    });
  }

  // filter helper
  filterData<T extends { [key: string]: any }>(data: T[]) {
    if (!this.searchQuery) return data;
    const q = this.searchQuery.toLowerCase();
    return data.filter((d) =>
      Object.values(d).some((v) => String(v).toLowerCase().includes(q))
    );
  }
  // service -> dropdown
  private toServiceOptions(raw: any[]) {
    return raw.map((item) => ({
      code: item.SERVICE_CODE,
      name:
        item.SERVICE_NAME && item.SERVICE_NAME !== '-'
          ? item.SERVICE_NAME
          : item.SERVICE_CODE,
    }));
  }

  // doc -> dropdown
  private toDocOptions(raw: any[]) {
    return raw.map((item) => ({
      code: item.DOC_CODE,
      name:
        item.DOC_NAME && item.DOC_NAME !== '-' ? item.DOC_NAME : item.DOC_CODE,
    }));
  }
}
