// src/app/shared/components/receipt-entry-modal/receipt-entry-modal.component.ts

import {
  Component,
  input,
  output,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MOCK_RECEIPTS_WAITING, MOCK_DEBTS } from '@core/data/finance.mock';
import { Receipt, Debt } from '@core/models/finance.model';

// ─── Row Types ───────────────────────────────────────────────
export interface CheckRow {
  id: string;
  selected: boolean;
  bank: string;
  branch: string;
  checkNo: string;
  checkDate: string;
  checkAmount: number | null;
  deductAmount: number | null;
  detail: string;
}

export interface InvoiceRow {
  id: string;
  selected: boolean;
  branch: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  remainingDebt: number;
  payAmount: number;
  creditAmount: number;
  expanded: boolean;
  items: InvoiceItemRow[];
}

export interface InvoiceItemRow {
  item: string;
  amount: number;
  debt: number;
  payAmount: number;
  vat: number;
  invoiceValue: number;
  wht: number;
}

export const PAYMENT_TABS = [
  { key: 'check',     label: 'เช็ค' },
  { key: 'wht',       label: 'ภาษีหัก ณ ที่จ่าย' },
  { key: 'transfer',  label: 'เงินโอน' },
  { key: 'onAccount', label: 'On Account' },
  { key: 'fee',       label: 'ค่าธรรมเนียม' },
  { key: 'account',   label: 'เข้าบัญชี' },
];

@Component({
  selector: 'app-receipt-entry-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './receipt-entry-modal.component.html',
  styleUrl: './receipt-entry-modal.component.css',
})
export class ReceiptEntryModalComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs / Outputs ──────────────────────────────────────
  isOpen    = input<boolean>(false);
  /** receipt ที่ถูกเลือกจาก kebab menu (single) */
  receipt   = input<Receipt | null>(null);
  close     = output<void>();
  submit    = output<Record<string, any>>();

  // ── Source data ──────────────────────────────────────────
  readonly allWaiting: Receipt[] = MOCK_RECEIPTS_WAITING;
  readonly allDebts:   Debt[]    = MOCK_DEBTS;

  // ── Form ─────────────────────────────────────────────────
  form!: FormGroup;

  // ── Lookup state ──────────────────────────────────────────
  showBranchDropdown   = signal(false);
  showCustomerDropdown = signal(false);
  branchSearch         = signal('');
  customerSearch       = signal('');
  selectedDebt         = signal<Debt | null>(null);

filteredBranches = computed(() => {
  const q = this.branchSearch().toLowerCase();
  const unique = [...new Set(this.allDebts.map(d => d.branchId))]
    .filter((b): b is string => b != null);
  return unique.filter(b => b.toLowerCase().includes(q));
});

  filteredCustomers = computed(() => {
    const branch = this.form?.get('branchCode')?.value || '';
    const q = this.customerSearch().toLowerCase();
    return this.allDebts
      .filter(d => !branch || d.branchId === branch)
      .filter(d => d.customerName.toLowerCase().includes(q));
  });

  // ── Tab ──────────────────────────────────────────────────
  paymentTabs = PAYMENT_TABS;
  activePaymentTab = signal<string>('check');

  // ── Table rows ───────────────────────────────────────────
  checkRows    = signal<CheckRow[]>([]);
  invoiceRows  = signal<InvoiceRow[]>([]);

  // ── Computed summaries ────────────────────────────────────
  totalInvoiceAmount = computed(() =>
    this.invoiceRows().reduce((s, r) => s + (r.totalAmount ?? 0), 0)
  );
  totalPaymentAmount = computed(() =>
    this.invoiceRows().reduce((s, r) => s + (r.payAmount ?? 0), 0)
  );
  diffAmount = computed(() =>
    this.totalInvoiceAmount() - this.totalPaymentAmount()
  );
  beforeVat = computed(() =>
    +(this.totalPaymentAmount() / 1.07).toFixed(2)
  );
  vatAmount = computed(() =>
    +(this.totalPaymentAmount() - this.beforeVat()).toFixed(2)
  );

  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    document.addEventListener('click', this.closeDropdowns);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeDropdowns);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.resetAll();
      // auto-fill จาก receipt ที่ส่งเข้ามา (single kebab action)
      const r = this.receipt();
      if (r) this.autoFillFromReceipt(r);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Form
  // ─────────────────────────────────────────────────────────
  private buildForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      branchCode:       ['', Validators.required],
      branchName:       [''],
      customerCode:     [''],
      customerName:     ['', Validators.required],
      shopName:         [''],
      address1:         [''],
      address2:         [''],
      remark:           [''],
      receiptPrefix:    ['RC'],
      receiptRunning:   ['', Validators.required],
      receiptDate:      [today, Validators.required],
      accountingDate:   [today, Validators.required],
      systemDate:       [{ value: today, disabled: true }],
      cashAmount:       [null],
      currencyCode:     ['THB', Validators.required],
      exchangeRate:     [1.00, Validators.required],
      profitCenterCode: [''],
      profitCenterName: [''],
      diffAccCode:      [''],
      diffAccName:      [''],
    });
  }

  private resetAll(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form?.reset({
      receiptPrefix:  'RC',
      receiptDate:    today,
      accountingDate: today,
      systemDate:     today,
      currencyCode:   'THB',
      exchangeRate:   1.00,
    });
    this.checkRows.set([]);
    this.invoiceRows.set([]);
    this.activePaymentTab.set('check');
    this.selectedDebt.set(null);
    this.branchSearch.set('');
    this.customerSearch.set('');
  }

  /** Auto-fill จาก Receipt (เปิดจาก pre-receipt kebab) */
  private autoFillFromReceipt(r: Receipt): void {
    // หา debt ที่ตรงกับ customer เพื่อดึง branchId
    const matchedDebt = this.allDebts.find(d => d.customerName === r.customerName);

    this.form.patchValue({
      branchCode:    matchedDebt?.branchId ?? '',
      branchName:    matchedDebt?.branchId ?? '',
      customerName:  r.customerName,
      customerCode:  r.id,
    });

    // pre-fill invoice row จาก receipt
    this.invoiceRows.set([{
      id:            r.id,
      selected:      true,
      branch:        matchedDebt?.branchId ?? '',
      invoiceNo:     r.contractNumber,
      invoiceDate:   r.startDate,
      totalAmount:   r.amount,
      remainingDebt: r.amount,
      payAmount:     r.amount,
      creditAmount:  0,
      expanded:      false,
      items: [{
        item:         r.collectionItem,
        amount:       r.amount,
        debt:         r.amount,
        payAmount:    r.amount,
        vat:          +(r.amount * 0.07 / 1.07).toFixed(2),
        invoiceValue: r.amount,
        wht:          0,
      }],
    }]);
  }

  // ─────────────────────────────────────────────────────────
  // Lookup
  // ─────────────────────────────────────────────────────────
  readonly closeDropdowns = (): void => {
    this.showBranchDropdown.set(false);
    this.showCustomerDropdown.set(false);
  };

  onLookup(field: string, event: MouseEvent): void {
    event.stopPropagation();
    if (field === 'branch') {
      this.showBranchDropdown.update(v => !v);
      this.showCustomerDropdown.set(false);
    } else if (field === 'customer') {
      this.showCustomerDropdown.update(v => !v);
      this.showBranchDropdown.set(false);
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
    // reset customer
    this.form.patchValue({ customerCode: '', customerName: '' });
    this.customerSearch.set('');
  }

  onCustomerInput(value: string): void {
    this.customerSearch.set(value);
    this.form.get('customerName')?.setValue(value);
    this.showCustomerDropdown.set(true);
  }

  onSelectCustomer(debt: Debt): void {
    this.selectedDebt.set(debt);
    this.form.patchValue({
      customerCode: debt.id,
      customerName: debt.customerName,
    });
    this.customerSearch.set(debt.customerName);
    this.showCustomerDropdown.set(false);

    // auto-fill invoice row จาก debt ที่เลือก
    this.invoiceRows.set([{
      id:            debt.id,
      selected:      true,
      branch:        debt.branchId ?? '',
      invoiceNo:     debt.contractFile.replace('.pdf', ''),
      invoiceDate:   debt.dueDate,
      totalAmount:   debt.amount,
      remainingDebt: debt.amount,
      payAmount:     debt.amount,
      creditAmount:  0,
      expanded:      false,
      items: [{
        item:         debt.description,
        amount:       debt.amount,
        debt:         debt.amount,
        payAmount:    debt.amount,
        vat:          +(debt.amount * 0.07 / 1.07).toFixed(2),
        invoiceValue: debt.amount,
        wht:          0,
      }],
    }]);
  }

  // ─────────────────────────────────────────────────────────
  // Check rows
  // ─────────────────────────────────────────────────────────
  private newCheckRow(): CheckRow {
    return {
      id:           crypto.randomUUID(),
      selected:     false,
      bank:         '',
      branch:       '',
      checkNo:      '',
      checkDate:    '',
      checkAmount:  null,
      deductAmount: null,
      detail:       '',
    };
  }

  addCheckRow(): void    { this.checkRows.update(r => [...r, this.newCheckRow()]); }
  deleteSelectedCheckRows(): void { this.checkRows.update(r => r.filter(x => !x.selected)); }
  toggleAllCheckRows(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.checkRows.update(r => r.map(x => ({ ...x, selected: checked })));
  }
  updateCheckRow(id: string, field: keyof CheckRow, value: any): void {
    this.checkRows.update(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  // ─────────────────────────────────────────────────────────
  // Invoice rows
  // ─────────────────────────────────────────────────────────
  private newInvoiceRow(): InvoiceRow {
    return {
      id:            crypto.randomUUID(),
      selected:      false,
      branch:        '',
      invoiceNo:     '',
      invoiceDate:   '',
      totalAmount:   0,
      remainingDebt: 0,
      payAmount:     0,
      creditAmount:  0,
      expanded:      false,
      items:         [this.newItemRow()],
    };
  }

  private newItemRow(): InvoiceItemRow {
    return { item: '', amount: 0, debt: 0, payAmount: 0, vat: 0, invoiceValue: 0, wht: 0 };
  }

  addInvoiceRow(): void  { this.invoiceRows.update(r => [...r, this.newInvoiceRow()]); }
  deleteSelectedInvoiceRows(): void { this.invoiceRows.update(r => r.filter(x => !x.selected)); }
  toggleAllInvoiceRows(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.invoiceRows.update(r => r.map(x => ({ ...x, selected: checked })));
  }
  updateInvoiceRow(id: string, field: keyof InvoiceRow, value: any): void {
    const numeric = ['totalAmount', 'remainingDebt', 'payAmount', 'creditAmount'];
    const parsed  = numeric.includes(field as string) ? (parseFloat(value) || 0) : value;
    this.invoiceRows.update(r => r.map(x => x.id === id ? { ...x, [field]: parsed } : x));
  }
  toggleInvoiceExpand(id: string): void {
    this.invoiceRows.update(r => r.map(x => x.id === id ? { ...x, expanded: !x.expanded } : x));
  }
  updateItemRow(invoiceId: string, itemIdx: number, field: keyof InvoiceItemRow, value: any): void {
    this.invoiceRows.update(rows => rows.map(r => {
      if (r.id !== invoiceId) return r;
      const items = r.items.map((it, i) => i === itemIdx ? { ...it, [field]: parseFloat(value) || value } : it);
      return { ...r, items };
    }));
  }

  // ─────────────────────────────────────────────────────────
  // Payment / Cash
  // ─────────────────────────────────────────────────────────
  onCashRef():     void { alert('เงินสดอ้างถึงใบเสร็จฯ ชั่วคราว'); }
  onClearPayment(): void { this.form.get('cashAmount')?.setValue(null); }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────
  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  getDisplayDate(controlName: string): string {
    const v = this.form.get(controlName)?.value;
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get todayDisplay(): string {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  }

  // ─────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────
  onSaveDraft(): void { alert('บันทึกร่างสำเร็จ'); }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = {
      ...this.form.getRawValue(),
      checkRows:   this.checkRows(),
      invoiceRows: this.invoiceRows(),
    };
    this.submit.emit(payload);
  }
}
