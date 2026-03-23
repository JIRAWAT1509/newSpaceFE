/* create-invoice-modal.component.ts */
import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  input,
  output,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MOCK_DEBTS } from '@core/data/finance.mock';
import { Debt } from '@core/models/finance.model';

export interface CreateInvoiceSubmitData {
  // Header
  branchCode: string;
  branchName: string;
  customerId: string;
  customerName: string;
  shopName: string;
  address: string;
  remark: string;
  // Invoice Info
  invoicePrefix: string;
  invoiceNumber: string;
  collectionItem: string;
  invoiceDate: string;
  accountingDate: string;
  systemDate: string;
  amount: number;
  // Payment
  isTempReceipt: boolean;
  cashAmount: number;
  currencyCode: string;
  exchangeRate: number;
  // Payment Tab data
  activePaymentTab: string;
  chequeRows: ChequeRow[];
  // Invoice rows
  invoiceRows: InvoiceRow[];
  // Summary
  profitCenter: string;
  diffAccountNo: string;
}

export interface ChequeRow {
  bank: string;
  branch: string;
  chequeNo: string;
  chequeDate: string;
  amount: number;
  holdLocation: string;
  detail: string;
}

export interface InvoiceRow {
  selected: boolean;
  branch: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  outstanding: number;
  payAmount: number;
  creditAmount: number;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  outstanding: number;
  payAmount: number;
  vat: number;
  invoiceAmount: number;
  wt: number;
}

type PaymentTabKey =
  | 'cheque'
  | 'wht'
  | 'transfer'
  | 'unaccount'
  | 'fee'
  | 'account';

@Component({
  selector: 'app-create-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-invoice-modal.component.html',
  styleUrl: './create-invoice-modal.component.css',
})
export class CreateInvoiceModalComponent
  implements OnInit, OnChanges, OnDestroy
{
  private readonly fb = inject(FormBuilder);

  // ── Inputs / Outputs ──
  isOpen = input<boolean>(false);
  close = output<void>();
  submit = output<CreateInvoiceSubmitData>();

  // ── Form ──
  form!: FormGroup;

  // ── State ──
  activePaymentTab = signal<PaymentTabKey>('cheque');
  expandedRow = signal<number | null>(null);
  submitted = signal<boolean>(false);
  // เพิ่ม signals และ methods ใหม่ในส่วน State (ต่อจาก submitted signal)

  // ── Lookup Dropdown State ──
  showBranchDropdown = signal<boolean>(false);
  showCustomerDropdown = signal<boolean>(false);
  showInvoiceDropdown = signal<boolean>(false);

  branchSearch = signal<string>('');
  customerSearch = signal<string>('');
  invoiceSearch = signal<string>('');

  selectedDebt = signal<Debt | null>(null);

  // ── Derived data from MOCK_DEBTS ──
  readonly allDebts: Debt[] = MOCK_DEBTS;

  // unique branches
  uniqueBranches = computed(() => {
    const map = new Map<string, string>();
    this.allDebts.forEach((d) => {
      if (d.branchId) map.set(d.branchId, d.branchId);
    });
    return Array.from(map.keys());
  });

  filteredBranches = computed(() => {
    const q = this.branchSearch().toLowerCase();
    return this.uniqueBranches().filter((b) => b.toLowerCase().includes(q));
  });

  filteredCustomers = computed(() => {
    const branchCode = this.form?.get('branchCode')?.value || '';
    const q = this.customerSearch().toLowerCase();
    return this.allDebts
      .filter((d) => !branchCode || d.branchId === branchCode)
      .filter((d) => d.customerName.toLowerCase().includes(q));
  });

  filteredInvoices = computed(() => {
    const branchCode = this.form?.get('branchCode')?.value || '';
    const customerId = this.form?.get('customerId')?.value || '';
    const q = this.invoiceSearch().toLowerCase();
    return this.allDebts
      .filter((d) => !branchCode || d.branchId === branchCode)
      .filter((d) => !customerId || d.customerName === customerId)
      .filter(
        (d) =>
          d.contractFile.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q),
      );
  });

  chequeRows = signal<ChequeRow[]>([this.emptyChequeRow()]);

  invoiceRows = signal<InvoiceRow[]>([this.emptyInvoiceRow()]);

  readonly paymentTabs: { key: PaymentTabKey; label: string }[] = [
    { key: 'cheque', label: 'เช็ค' },
    { key: 'wht', label: 'ภาษีหัก ณ ที่จ่าย' },
    { key: 'transfer', label: 'เงินโอน' },
    { key: 'unaccount', label: 'Un Account' },
    { key: 'fee', label: 'ค่าธรรมเนียม' },
    { key: 'account', label: 'เข้าบัญชี' },
  ];

  // ── Computed summaries ──
  totalInvoiceAmount = computed(() =>
    this.invoiceRows().reduce((s, r) => s + (r.totalAmount || 0), 0),
  );
  totalPayAmount = computed(() =>
    this.invoiceRows().reduce((s, r) => s + (r.payAmount || 0), 0),
  );
  difference = computed(
    () => +(this.totalInvoiceAmount() - this.totalPayAmount()).toFixed(2),
  );
  beforeVat = computed(() => +(this.totalPayAmount() / 1.07).toFixed(2));
  vatAmount = computed(
    () => +(this.totalPayAmount() - this.beforeVat()).toFixed(2),
  );

  // ── Lifecycle ──
  ngOnInit(): void {
    this.buildForm();
    // close dropdowns on outside click
    document.addEventListener('click', () => this.closeAllDropdowns());
  }


  ngOnDestroy(): void {
    document.removeEventListener('click', () => this.closeAllDropdowns());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.resetAll();
    }
  }

  private buildForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      // Header
      branchCode: ['', Validators.required],
      branchName: [''],
      customerId: ['', Validators.required],
      customerName: ['', Validators.required],
      shopName: [''],
      address: [''],
      remark: [''],
      // Invoice info
      invoiceNumber: ['', Validators.required],
      collectionItem: [''],
      invoiceDate: [today, Validators.required],
      accountingDate: [today, Validators.required],
      systemDate: [{ value: today, disabled: true }],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      // Payment
      isTempReceipt: [false],
      cashAmount: [0],
      currencyCode: ['THB', Validators.required],
      exchangeRate: [1, Validators.required],
      // Summary
      profitCenter: [''],
      diffAccountNo: [''],
    });
  }

  private resetAll(): void {
    this.submitted.set(false);
    this.expandedRow.set(null);
    this.activePaymentTab.set('cheque');
    this.chequeRows.set([this.emptyChequeRow()]);
    this.invoiceRows.set([this.emptyInvoiceRow()]);
    const today = new Date().toISOString().split('T')[0];
    this.form?.reset({
      invoicePrefix: 'INV',
      invoiceDate: today,
      accountingDate: today,
      systemDate: today,
      currencyCode: 'THB',
      exchangeRate: 1,
      cashAmount: 0,
      amount: 0,
      isTempReceipt: false,
    });
  }

  // ── Helpers ──
  get todayDisplay(): string {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getDisplayDate(controlName: string): string {
    const v = this.form.get(controlName)?.value;
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime())
      ? v
      : d.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
  }

  onNativeDateChange(controlName: string, value: string): void {
    this.form.get(controlName)?.setValue(value);
    this.form.get(controlName)?.markAsTouched();
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || this.submitted()));
  }

  // ── Payment Tab ──
  setPaymentTab(key: PaymentTabKey): void {
    this.activePaymentTab.set(key);
  }

  // ── Cheque Rows ──
  emptyChequeRow(): ChequeRow {
    return {
      bank: '',
      branch: '',
      chequeNo: '',
      chequeDate: '',
      amount: 0,
      holdLocation: '',
      detail: '',
    };
  }

  addChequeRow(): void {
    this.chequeRows.update((rows) => [...rows, this.emptyChequeRow()]);
  }

  removeChequeRow(index: number): void {
    this.chequeRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateChequeRow(index: number, field: keyof ChequeRow, value: any): void {
    this.chequeRows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  // ── Invoice Rows ──
  emptyInvoiceRow(): InvoiceRow {
    return {
      selected: false,
      branch: '',
      invoiceNo: '',
      invoiceDate: '',
      totalAmount: 0,
      outstanding: 0,
      payAmount: 0,
      creditAmount: 0,
      items: [
        {
          description: '',
          amount: 0,
          outstanding: 0,
          payAmount: 0,
          vat: 0,
          invoiceAmount: 0,
          wt: 0,
        },
      ],
    };
  }

  addInvoiceRow(): void {
    this.invoiceRows.update((rows) => [...rows, this.emptyInvoiceRow()]);
  }

  removeInvoiceRow(index: number): void {
    this.invoiceRows.update((rows) => rows.filter((_, i) => i !== index));
    if (this.expandedRow() === index) this.expandedRow.set(null);
  }

  toggleInvoiceRow(index: number, checked: boolean): void {
    this.invoiceRows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, selected: checked } : r)),
    );
  }

  updateInvoiceRow(index: number, field: keyof InvoiceRow, value: any): void {
    const parsed = [
      'totalAmount',
      'outstanding',
      'payAmount',
      'creditAmount',
    ].includes(field as string)
      ? parseFloat(value) || 0
      : value;
    this.invoiceRows.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: parsed } : r)),
    );
  }

  toggleRowDetail(index: number): void {
    this.expandedRow.update((v) => (v === index ? null : index));
  }

  // ── Lookup Methods (แทนที่ onLookup เดิม) ──

  onLookup(field: string): void {
    // close all first
    this.showBranchDropdown.set(false);
    this.showCustomerDropdown.set(false);
    this.showInvoiceDropdown.set(false);

    if (field === 'branch') {
      this.branchSearch.set('');
      this.showBranchDropdown.set(true);
    }
    if (field === 'customer') {
      this.customerSearch.set('');
      this.showCustomerDropdown.set(true);
    }
    if (field === 'currency') {
      console.log('currency lookup');
    }
    if (field === 'profitCenter') {
      console.log('profitCenter lookup');
    }
    if (field === 'diffAccountNo') {
      console.log('diffAccountNo lookup');
    }
  }

  onBranchInput(value: string): void {
    this.branchSearch.set(value);
    this.form.get('branchCode')?.setValue(value);
    this.showBranchDropdown.set(true);
  }

  onSelectBranch(branchId: string): void {
    this.form.patchValue({ branchCode: branchId, branchName: branchId });
    this.branchSearch.set(branchId);
    this.showBranchDropdown.set(false);
    // reset customer when branch changes
    this.form.patchValue({ customerId: '', customerName: '' });
    this.customerSearch.set('');
    this.selectedDebt.set(null);
  }

  onCustomerInput(value: string): void {
    this.customerSearch.set(value);
    this.form.get('customerId')?.setValue(value);
    this.form.get('customerName')?.setValue(value);
    this.showCustomerDropdown.set(true);
  }

  onSelectCustomer(debt: Debt): void {
    this.selectedDebt.set(debt);
    this.form.patchValue({
      customerId: debt.customerName,
      customerName: debt.customerName,
    });
    this.customerSearch.set(debt.customerName);
    this.showCustomerDropdown.set(false);
    // auto-fill invoice fields
    this.autoFillFromDebt(debt);
  }

  onInvoiceInput(value: string): void {
    this.invoiceSearch.set(value);
    this.form.get('invoiceNumber')?.setValue(value);
    this.showInvoiceDropdown.set(true);
  }

  onSelectInvoice(debt: Debt): void {
    this.selectedDebt.set(debt);
    this.form.patchValue({
      invoiceNumber: debt.contractFile.replace('.pdf', ''),
    });
    this.invoiceSearch.set(debt.contractFile.replace('.pdf', ''));
    this.showInvoiceDropdown.set(false);
    this.autoFillFromDebt(debt);
  }

  private autoFillFromDebt(debt: Debt): void {
    this.form.patchValue({
      collectionItem: debt.description,
      amount: debt.amount,
      invoiceDate: debt.dueDate,
    });
  }

  closeAllDropdowns(): void {
    this.showBranchDropdown.set(false);
    this.showCustomerDropdown.set(false);
    this.showInvoiceDropdown.set(false);
  }

  // ── Submit / Cancel ──
  onCancel(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.submit.emit({
      ...v,
      activePaymentTab: this.activePaymentTab(),
      chequeRows: this.chequeRows(),
      invoiceRows: this.invoiceRows(),
    } as CreateInvoiceSubmitData);
  }
  getActiveTabLabel(): string {
    return (
      this.paymentTabs.find((t) => t.key === this.activePaymentTab())?.label ??
      ''
    );
  }
}
