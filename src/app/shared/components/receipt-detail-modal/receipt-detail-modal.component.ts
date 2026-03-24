import {
  Component, input, output, signal, computed,
  OnChanges, SimpleChanges, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CheckRow, InvoiceRow, InvoiceItemRow, PAYMENT_TABS,
} from '../receipt-entry-modal/receipt-entry-modal.component';

type ModalMode = 'preview' | 'edit';

@Component({
  selector: 'app-receipt-detail-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './receipt-detail-modal.component.html',
  styleUrls: [
    '../receipt-entry-modal/receipt-entry-modal.component.css',
    './receipt-detail-modal.component.css',
  ],
})
export class ReceiptDetailModalComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  receipt     = input.required<any>();
  initialMode = input<ModalMode>('preview');
  close       = output<void>();
  saved       = output<Record<string, any>>();

  // ── Mode ──────────────────────────────────────────────────
  mode = signal<ModalMode>('preview');

  get isPreview(): boolean { return this.mode() === 'preview'; }
  get isEdit():    boolean { return this.mode() === 'edit'; }

  // ── Form ──────────────────────────────────────────────────
  form!: FormGroup;

  // ── Payment tabs ──────────────────────────────────────────
  paymentTabs      = PAYMENT_TABS;
  activePaymentTab = signal<string>('check');

  // ── Table rows ────────────────────────────────────────────
  checkRows   = signal<CheckRow[]>([]);
  invoiceRows = signal<InvoiceRow[]>([]);

  // ── Computed summaries ────────────────────────────────────
  totalInvoiceAmount = computed(() =>
    this.invoiceRows().reduce((s, r) => s + (r.totalAmount ?? 0), 0));
  totalPaymentAmount = computed(() =>
    this.invoiceRows().reduce((s, r) => s + (r.payAmount ?? 0), 0));
  diffAmount = computed(() => this.totalInvoiceAmount() - this.totalPaymentAmount());
  beforeVat  = computed(() => +(this.totalPaymentAmount() / 1.07).toFixed(2));
  vatAmount  = computed(() => +(this.totalPaymentAmount() - this.beforeVat()).toFixed(2));

  get todayDisplay(): string {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    this.mode.set(this.initialMode());
    this.fillFromReceipt();
    document.addEventListener('click', this.closeDropdowns);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeDropdowns);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receipt'] && this.form) this.fillFromReceipt();
    if (changes['initialMode'])          this.mode.set(this.initialMode());
  }

  // ── Form builder ──────────────────────────────────────────
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

  private fillFromReceipt(): void {
    const r = this.receipt();
    if (!r || !this.form) return;

    const parts   = (r.contractNumber || '').split('-');
    const prefix  = parts.length > 1 ? parts[0] : 'RC';
    const running = parts.length > 1 ? parts.slice(1).join('-') : r.contractNumber;

    this.form.patchValue({
      branchCode:     r.branchId     || '',
      branchName:     r.branchId     || '',
      customerCode:   r.id           || '',
      customerName:   r.customerName || '',
      shopName:       r.shopName     || '',
      receiptPrefix:  prefix,
      receiptRunning: running,
      receiptDate:    r.startDate    || new Date().toISOString().split('T')[0],
      accountingDate: r.startDate    || new Date().toISOString().split('T')[0],
      currencyCode:   'THB',
      exchangeRate:   1.00,
    });

    if (r.amount) {
      this.invoiceRows.set([{
        id:            r.id || crypto.randomUUID(),
        selected:      false,
        branch:        r.branchId     || '',
        invoiceNo:     r.refInvoiceNumber || r.contractNumber || '',
        invoiceDate:   r.startDate    || '',
        totalAmount:   r.amount,
        remainingDebt: r.amount,
        payAmount:     r.amount,
        creditAmount:  0,
        expanded:      false,
        items: [{
          item:         r.collectionItem || '',
          amount:       r.amount,
          debt:         r.amount,
          payAmount:    r.amount,
          vat:          +(r.amount * 0.07 / 1.07).toFixed(2),
          invoiceValue: r.amount,
          wht:          0,
        }],
      }]);
    }
  }

  // ── Mode toggle ───────────────────────────────────────────
  enterEdit(): void   { this.mode.set('edit'); }
  cancelEdit(): void  { this.fillFromReceipt(); this.mode.set('preview'); }

  // ── Dropdown stubs ────────────────────────────────────────
  showBranchDropdown   = signal(false);
  showCustomerDropdown = signal(false);

  readonly closeDropdowns = (): void => {
    this.showBranchDropdown.set(false);
    this.showCustomerDropdown.set(false);
  };

  onLookup(field: string, event: MouseEvent): void {
    if (this.isPreview) return;
    event.stopPropagation();
  }

  // ── Check rows ────────────────────────────────────────────
  addCheckRow(): void {
    if (this.isPreview) return;
    this.checkRows.update(r => [...r, this.newCheckRow()]);
  }
  deleteSelectedCheckRows(): void {
    if (this.isPreview) return;
    this.checkRows.update(r => r.filter(x => !x.selected));
  }
  toggleAllCheckRows(e: Event): void {
    if (this.isPreview) return;
    const checked = (e.target as HTMLInputElement).checked;
    this.checkRows.update(r => r.map(x => ({ ...x, selected: checked })));
  }
  updateCheckRow(id: string, field: keyof CheckRow, value: any): void {
    if (this.isPreview) return;
    this.checkRows.update(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  // ── Invoice rows ──────────────────────────────────────────
  addInvoiceRow(): void {
    if (this.isPreview) return;
    this.invoiceRows.update(r => [...r, this.newInvoiceRow()]);
  }
  deleteSelectedInvoiceRows(): void {
    if (this.isPreview) return;
    this.invoiceRows.update(r => r.filter(x => !x.selected));
  }
  toggleAllInvoiceRows(e: Event): void {
    if (this.isPreview) return;
    const checked = (e.target as HTMLInputElement).checked;
    this.invoiceRows.update(r => r.map(x => ({ ...x, selected: checked })));
  }
  updateInvoiceRow(id: string, field: keyof InvoiceRow, value: any): void {
    if (this.isPreview) return;
    const numeric = ['totalAmount', 'remainingDebt', 'payAmount', 'creditAmount'];
    const parsed  = numeric.includes(field as string) ? (parseFloat(value) || 0) : value;
    this.invoiceRows.update(r => r.map(x => x.id === id ? { ...x, [field]: parsed } : x));
  }
  toggleInvoiceExpand(id: string): void {
    this.invoiceRows.update(r =>
      r.map(x => x.id === id ? { ...x, expanded: !x.expanded } : x));
  }
  updateItemRow(invoiceId: string, itemIdx: number,
                field: keyof InvoiceItemRow, value: any): void {
    if (this.isPreview) return;
    this.invoiceRows.update(rows => rows.map(r => {
      if (r.id !== invoiceId) return r;
      const items = r.items.map((it, i) =>
        i === itemIdx ? { ...it, [field]: parseFloat(value) || value } : it);
      return { ...r, items };
    }));
  }

  private newCheckRow(): CheckRow {
    return {
      id: crypto.randomUUID(), selected: false, bank: '', branch: '',
      checkNo: '', checkDate: '', checkAmount: null, deductAmount: null, detail: '',
    };
  }
  private newInvoiceRow(): InvoiceRow {
    return {
      id: crypto.randomUUID(), selected: false, branch: '', invoiceNo: '',
      invoiceDate: '', totalAmount: 0, remainingDebt: 0, payAmount: 0,
      creditAmount: 0, expanded: false, items: [this.newItemRow()],
    };
  }
  private newItemRow(): InvoiceItemRow {
    return { item: '', amount: 0, debt: 0, payAmount: 0, vat: 0, invoiceValue: 0, wht: 0 };
  }

  // ── Helpers ───────────────────────────────────────────────
  isInvalid(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop'))
      this.close.emit();
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saved.emit({
      ...this.form.getRawValue(),
      checkRows:   this.checkRows(),
      invoiceRows: this.invoiceRows(),
    });
    this.mode.set('preview');
  }

  onDownloadPDF(): void { alert('Mock: กำลังดาวน์โหลด PDF'); }
  onSendEmail():   void { alert('Mock: กำลังส่งอีเมล'); }
}
