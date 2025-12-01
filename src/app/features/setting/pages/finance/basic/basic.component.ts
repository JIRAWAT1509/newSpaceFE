// src/app/features/setting/pages/finance/basic/basic.component.ts
import { Component, OnInit } from '@angular/core';
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
    // ไว้ยิง API ทีหลัง
    console.log('save basic form', this.baseForm);
  }
  // card click
  selectFeature(feature: FinanceFeatureKey): void {
    this.selectedFeature = feature;
    this.searchQuery = '';
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

  // ================== ACTIONS (stub) ==================
  openCreate(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'TODO',
      detail: 'open create panel for ' + this.selectedFeature,
    });
  }

  confirmDelete(row: any): void {
    this.confirmService.confirm({
      message: 'Delete this item?',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
        });
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
