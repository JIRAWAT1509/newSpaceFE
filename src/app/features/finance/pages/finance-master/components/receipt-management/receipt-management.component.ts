// receipt-management.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt, CreditNote } from '@core/models/finance.model';
import { IssuedReceipt, FinanceStateService } from '@core/services/finance-state.service';
import { ReceiptDetailModalComponent } from '@shared/components/receipt-detail-modal/receipt-detail-modal.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { SuccessToastComponent } from '@shared/components/success-toast/success-toast.component';

type ReceiptSortField = 'contractNumber' | 'customerName' | 'collectionItem' | 'amount' | 'startDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;
type HistoryTab = 'receipt' | 'credit';

@Component({
  selector: 'app-receipt-management',
  standalone: true,
  imports: [
    CommonModule,
    ReceiptDetailModalComponent,
    ConfirmationModalComponent,
    SuccessToastComponent,
  ],
  templateUrl: './receipt-management.component.html',
  styleUrl: './receipt-management.component.css',
})
export class ReceiptManagementComponent implements OnInit {
  private readonly state = inject(FinanceStateService);

  // Tab State
  activeHistoryTab = signal<HistoryTab>('receipt');

  // Data — driven from state service, not stale mock copies
  // issuedReceipts: all receipts (both receipt_invoice and receipt_credit types)
  // issuedCreditNotes: only receipts that have refCreditNoteNumber (ใบลดหนี้ใบเสร็จ)
  // These are derived views; we keep local sorted copies for sorting support
  private _sortedReceipts     = signal<IssuedReceipt[] | null>(null);
  private _sortedCreditNotes  = signal<CreditNote[] | null>(null);

  selectedReceipts  = signal<Set<string>>(new Set());
  showBulkActions   = signal<boolean>(false);

  // Sorting
  sortField     = signal<ReceiptSortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // Toast
  showToast    = signal<boolean>(false);
  toastTitle   = signal<string>('สำเร็จ');
  toastMessage = signal<string>('');

  // Modals
  showDetailModal     = signal<boolean>(false);
  showConfirmModal    = signal<boolean>(false);
  currentReceipt      = signal<any>(null);
  pendingCancelReceipt = signal<Receipt | null>(null);

  // Kebab Menu
  showRowMenu  = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  // Search
  searchQuery = signal<string>('');

  ngOnInit(): void {
    this.resetSort();
  }

  resetSort(): void {
    this._sortedReceipts.set(null);
    this._sortedCreditNotes.set(null);
  }

  // ===================== TOAST =====================
  showSuccessToast(title: string, message: string): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.showToast.set(false);
    setTimeout(() => this.showToast.set(true), 10);
  }

  onToastClosed(): void { this.showToast.set(false); }

  // ===================== DATA VIEWS =====================

  /**
   * ประวัติการออกใบเสร็จ — all receipts from state
   * Receipts issued from invoice → refInvoiceNumber set
   * Receipts issued from credit note → refCreditNoteNumber set
   */
  get allReceipts(): IssuedReceipt[] {
    return this._sortedReceipts() ?? this.state.receipts();
  }

  /**
   * ประวัติการออกใบลดหนี้ใบเสร็จ — receipts that originated from a credit note
   * These are IssuedReceipts with refCreditNoteNumber populated
   */
  get receiptCreditNotes(): IssuedReceipt[] {
    const base = this._sortedReceipts() ?? this.state.receipts();
    return base.filter(r => !!r.refCreditNoteNumber);
  }

  // ===================== TAB MANAGEMENT =====================
  setHistoryTab(tab: HistoryTab): void {
    this.activeHistoryTab.set(tab);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
  }

  getCurrentViewReceipts(): any[] {
    const raw: IssuedReceipt[] =
      this.activeHistoryTab() === 'receipt'
        ? this.allReceipts
        : this.receiptCreditNotes;

    // Map to uniform table shape
    const data = raw.map(r => ({
      id: r.id,
      contractNumber: r.contractNumber,
      customerName: r.customerName,
      collectionItem: r.collectionItem,
      amount: r.amount,
      startDate: r.startDate,
      status: r.status,
      // Extra reference info for detail modal
      refInvoiceNumber: r.refInvoiceNumber,
      refCreditNoteNumber: r.refCreditNoteNumber,
      originalData: r,
    }));

    const query = this.searchQuery().toLowerCase();
    if (!query) return data;

    return data.filter(item =>
      (item.contractNumber || '').toLowerCase().includes(query) ||
      (item.customerName   || '').toLowerCase().includes(query) ||
      (item.collectionItem || '').toLowerCase().includes(query)
    );
  }

  // ===================== SORTING =====================
  sortBy(field: ReceiptSortField): void {
    const currentField = this.sortField();
    const currentDirection = this.sortDirection();

    if (currentField === field) {
      if (currentDirection === null)       this.sortDirection.set('asc');
      else if (currentDirection === 'asc') this.sortDirection.set('desc');
      else {
        this.sortDirection.set(null);
        this.sortField.set(null);
        this.resetSort();
        return;
      }
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.applySorting();
  }

  applySorting(): void {
    const field = this.sortField();
    const direction = this.sortDirection();
    if (!field || !direction) { this.resetSort(); return; }

    const sortFn = (a: IssuedReceipt, b: IssuedReceipt): number => {
      let aVal: any = (a as any)[field] ?? '';
      let bVal: any = (b as any)[field] ?? '';

      if (field === 'amount') {
        aVal = Number(aVal); bVal = Number(bVal);
      } else if (field === 'startDate') {
        aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase(); bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    };

    this._sortedReceipts.set([...this.state.receipts()].sort(sortFn));
  }

  getSortIcon(field: ReceiptSortField): string {
    if (this.sortField() !== field) return 'pi-sort-alt';
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down';
  }

  // ===================== SELECTION =====================
  toggleSelection(id: string): void {
    const selected = new Set(this.selectedReceipts());
    selected.has(id) ? selected.delete(id) : selected.add(id);
    this.selectedReceipts.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const selected = new Set<string>();
    if (checkbox.checked) {
      this.getCurrentViewReceipts().forEach(r => selected.add(r.id));
    }
    this.selectedReceipts.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  isSelected(id: string): boolean  { return this.selectedReceipts().has(id); }
  isAllSelected(): boolean {
    const current = this.getCurrentViewReceipts();
    return this.selectedReceipts().size === current.length && current.length > 0;
  }
  getSelectedCount(): number { return this.selectedReceipts().size; }

  // ===================== KEBAB MENU =====================
  toggleRowMenu(receiptId: string, event: MouseEvent): void {
    if (this.showRowMenu() === receiptId) { this.closeRowMenu(); return; }

    const receipt = this.getCurrentViewReceipts().find(r => r.id === receiptId);
    if (!receipt) return;

    this.currentReceipt.set(receipt);
    this.showRowMenu.set(receiptId);

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const menuWidth = 224;
    const menuHeight = 200;
    let top  = rect.bottom - 20;
    let left = rect.left - menuWidth + 20;
    if (window.innerHeight - rect.bottom < menuHeight) top = rect.top - menuHeight - 4;
    this.menuPosition.set({ top, left });
  }

  closeRowMenu(): void { this.showRowMenu.set(null); }

  onMenuAction(receipt: any, action: string): void {
    this.closeRowMenu();
    switch (action) {
      case 'Preview ใบเสร็จ':
        this.onPreview(receipt);
        break;
      case 'ยกเลิกใบเสร็จ':
        this.onCancelReceipt(receipt);
        break;
      case 'ออกใบลดหนี้ใบเสร็จ':
        // Issue a credit note receipt — switch to credit tab after
        this.issueReceiptCreditNote(receipt);
        break;
      case 'พิมพ์เอกสาร (PDF)':
        this.showSuccessToast('พิมพ์เอกสาร', `กำลังพิมพ์เอกสาร ${receipt.contractNumber}`);
        break;
      case 'ส่งทางอีเมล':
        this.showSuccessToast('ส่งอีเมล', `กำลังส่งอีเมล ${receipt.contractNumber}`);
        break;
    }
  }

  issueReceiptCreditNote(receipt: any): void {
    // Find the matching CreditNote in state for this customer
    const cn = this.state.creditNotes().find(
      c => c.customerName === receipt.customerName && c.status === 'open'
    );

    const source = cn ?? {
      ...receipt.originalData,
      cnNumber: `RCN-${Date.now()}`,
    };

    this.state.issueReceipt(source, 'credit_note', {
      rcCnDate: new Date().toISOString().split('T')[0],
    });

    this.showSuccessToast(
      'ออกใบลดหนี้ใบเสร็จสำเร็จ',
      `${receipt.customerName} · ปรากฏในประวัติใบลดหนี้ใบเสร็จแล้ว`
    );

    // Switch to credit tab so user sees the new entry
    this.activeHistoryTab.set('credit');
  }

  // ===================== ACTIONS =====================
  onPreview(receipt: any): void {
    this.currentReceipt.set(receipt);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    setTimeout(() => { if (!this.showDetailModal()) this.currentReceipt.set(null); }, 300);
  }

  onPrint(receipt: any): void {
    this.showSuccessToast('พิมพ์เอกสาร', `กำลังพิมพ์เอกสาร ${receipt.contractNumber}`);
  }

  onEmail(receipt: any): void {
    this.showSuccessToast('ส่งอีเมล', `กำลังส่งอีเมล ${receipt.contractNumber}`);
  }

  onCancelReceipt(receipt: any): void {
    this.pendingCancelReceipt.set(receipt);
    this.showConfirmModal.set(true);
  }

  onConfirmCancel(): void {
    const receipt = this.pendingCancelReceipt();
    if (receipt) {
      this._sortedReceipts.set(
        this.state.receipts().map(r => r.id === receipt.id ? { ...r, status: 'cancel' } : r)
      );
      this.showSuccessToast('ยกเลิกใบเสร็จสำเร็จ', `ใบเสร็จ ${receipt.contractNumber} ถูกยกเลิกแล้ว`);
    }
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  // ===================== BULK ACTIONS =====================
  onBulkEmail(): void {
    this.showSuccessToast('ส่งอีเมล', `กำลังส่งอีเมล ${this.getSelectedCount()} รายการ`);
  }

  onBulkPrint(): void {
    this.showSuccessToast('พิมพ์เอกสาร', `กำลังพิมพ์เอกสาร ${this.getSelectedCount()} รายการ`);
  }
}
