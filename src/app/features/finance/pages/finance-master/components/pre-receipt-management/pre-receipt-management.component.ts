// src/app/features/finance/components/pre-receipt-management/pre-receipt-management.component.ts

import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt } from '@core/models/finance.model';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { ReceiptDetailModalComponent } from '@shared/components/receipt-detail-modal/receipt-detail-modal.component';
import { ReceiptEntryModalComponent } from '@shared/components/receipt-entry-modal/receipt-entry-modal.component';
import { BulkReceiptPreviewModalComponent } from '@shared/components/bulk-receipt-preview-modal/bulk-receipt-preview-modal.component';
import { FinanceStateService } from '@core/services/finance-state.service';

type ReceiptSortField =
  | 'contractNumber'
  | 'customerName'
  | 'collectionItem'
  | 'amount'
  | 'startDate'
  | 'status';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-pre-receipt-management',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    ReceiptDetailModalComponent,
    ReceiptEntryModalComponent,
    BulkReceiptPreviewModalComponent,
  ],
  templateUrl: './pre-receipt-management.component.html',
  styleUrl: './pre-receipt-management.component.css',
})
export class PreReceiptManagementComponent implements OnInit {
  private readonly state = inject(FinanceStateService);

  // ── Data ────────────────────────────────────────────────────
  receipts = computed(
    () => this._sortedReceipts() ?? this.state.waitingReceipts(),
  );
  private _sortedReceipts = signal<Receipt[] | null>(null);
  selectedReceipts = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);

  // ── Sorting ──────────────────────────────────────────────────
  sortField = signal<ReceiptSortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // ── Single-entry modal (manual / kebab) ──────────────────────
  showEntryModal = signal<boolean>(false);
  currentReceipt = signal<Receipt | null>(null);

  // ── Bulk preview modal ───────────────────────────────────────
  showBulkPreview = signal<boolean>(false);
  bulkPreviewReceipts = signal<Receipt[]>([]);

  // ── Other modals ─────────────────────────────────────────────
  showDetailModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  pendingCancelReceipt = signal<Receipt | null>(null);
  editingReceipt = signal<Receipt | null>(null);

  // ── Kebab Menu ───────────────────────────────────────────────
  showRowMenu = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  ngOnInit(): void {
    this.loadData();
  }
  loadData(): void {
    this._sortedReceipts.set(null);
  }

  // ── Sorting ──────────────────────────────────────────────────
  sortBy(field: ReceiptSortField): void {
    const curr = this.sortField();
    const dir = this.sortDirection();
    if (curr === field) {
      if (dir === null) {
        this.sortDirection.set('asc');
      } else if (dir === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortDirection.set(null);
        this.sortField.set(null);
        this.loadData();
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
    const dir = this.sortDirection();
    if (!field || !dir) return;
    const sorted = [...this.receipts()].sort((a, b) => {
      let av: any = a[field];
      let bv: any = b[field];
      if (field === 'amount') {
        av = Number(av);
        bv = Number(bv);
      } else if (field === 'startDate') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    this._sortedReceipts.set(sorted);
  }

  getSortIcon(field: ReceiptSortField): string {
    if (this.sortField() !== field) return 'pi-sort-alt';
    return this.sortDirection() === 'asc'
      ? 'pi-sort-amount-up-alt'
      : 'pi-sort-amount-down';
  }

  // ── Selection ────────────────────────────────────────────────
  toggleSelection(id: string): void {
    const s = new Set(this.selectedReceipts());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedReceipts.set(s);
    this.showBulkActions.set(s.size > 0);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const s = new Set<string>();
    if (checked) this.receipts().forEach((r) => s.add(r.id));
    this.selectedReceipts.set(s);
    this.showBulkActions.set(s.size > 0);
  }

  isSelected(id: string): boolean {
    return this.selectedReceipts().has(id);
  }
  isAllSelected(): boolean {
    return (
      this.selectedReceipts().size === this.receipts().length &&
      this.receipts().length > 0
    );
  }
  getSelectedCount(): number {
    return this.selectedReceipts().size;
  }

  // ── Kebab Menu ───────────────────────────────────────────────
  toggleRowMenu(receiptId: string, event: MouseEvent): void {
    if (this.showRowMenu() === receiptId) {
      this.closeRowMenu();
      return;
    }
    const receipt = this.receipts().find((r) => r.id === receiptId);
    if (!receipt) return;
    this.currentReceipt.set(receipt);
    this.showRowMenu.set(receiptId);
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const menuW = 224,
      menuH = 180;
    let top = rect.bottom - 20;
    let left = rect.left - menuW + 20;
    if (window.innerHeight - rect.bottom < menuH) top = rect.top - menuH - 4;
    this.menuPosition.set({ top, left });
  }

  closeRowMenu(): void {
    this.showRowMenu.set(null);
  }

  onMenuAction(receipt: Receipt, action: string): void {
    this.closeRowMenu();
    switch (action) {
      case 'ออกใบเสร็จ':
        this.onIssueReceipt(receipt);
        break;
      case 'ออกใบเสร็จ + พิมพ์':
        this.onIssueReceiptAndPrint(receipt);
        break;
      case 'ออกใบเสร็จ + ส่งอีเมล':
        this.onIssueReceiptAndEmail(receipt);
        break;
      case 'ยกเลิกรายการ':
        this.onCancel(receipt);
        break;
      case 'ลบสัญญา':
        this.onDeleteContract(receipt);
        break;
    }
  }

  // ── Actions: single ──────────────────────────────────────────
  onPreview(receipt: Receipt): void {
    this.currentReceipt.set(receipt);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      if (!this.showDetailModal()) this.currentReceipt.set(null);
    }, 300);
  }

  onEdit(receipt: Receipt): void {
    this.editingReceipt.set({ ...receipt });
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingReceipt.set(null);
  }

  onSaveEdit(): void {
    const edited = this.editingReceipt();
    if (!edited) return;
    this.state.updateWaitingReceipt(edited);
    alert('บันทึกการแก้ไขสำเร็จ');
    this.closeEditModal();
  }

  onCancel(receipt: Receipt): void {
    this.pendingCancelReceipt.set(receipt);
    this.showConfirmModal.set(true);
  }

  onConfirmCancel(): void {
    const r = this.pendingCancelReceipt();
    if (r) {
      this.state.deleteWaitingReceipt(r.id);
      alert(`ยกเลิกรายการ ${r.contractNumber} สำเร็จ`);
    }
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  onDeleteContract(receipt: Receipt): void {
    if (confirm(`ต้องการลบสัญญา ${receipt.contractNumber} หรือไม่?`)) {
      this.state.deleteWaitingReceipt(receipt.id);
      alert('ลบสัญญาสำเร็จ');
    }
  }

  // ── Issue Receipt → เปิด Entry Modal (single) ────────────────
  onIssueReceipt(receipt: Receipt): void {
    this.currentReceipt.set(receipt);
    this.showEntryModal.set(true);
  }

  onIssueReceiptAndPrint(receipt: Receipt): void {
    this.currentReceipt.set(receipt);
    this.showEntryModal.set(true);
  }

  onIssueReceiptAndEmail(receipt: Receipt): void {
    this.currentReceipt.set(receipt);
    this.showEntryModal.set(true);
  }

  closeEntryModal(): void {
    this.showEntryModal.set(false);
    this.currentReceipt.set(null);
  }

  onEntrySubmit(payload: Record<string, any>): void {
    const receipt = this.currentReceipt();
    if (receipt) {
      const issued = this.state.issueReceipt(receipt, 'invoice', payload);
      this.state.deleteWaitingReceipt(receipt.id);
      alert(
        `ออกใบเสร็จ ${issued.contractNumber} สำเร็จ\nปรากฏในประวัติใบเสร็จแล้ว`,
      );
    }
    this.closeEntryModal();
    this.loadData();
  }

  // ── Bulk Actions → เปิด Preview Modal ────────────────────────
  onBulkCreateReceipts(): void {
    const selectedIds = Array.from(this.selectedReceipts());
    const toPreview = this.state
      .waitingReceipts()
      .filter((r) => selectedIds.includes(r.id));
    if (toPreview.length === 0) return;
    this.bulkPreviewReceipts.set(toPreview);
    this.showBulkPreview.set(true);
  }

  closeBulkPreview(): void {
    this.showBulkPreview.set(false);
    this.bulkPreviewReceipts.set([]);
  }

  /** กดยืนยันใน Bulk Preview → สร้างใบเสร็จทั้งหมด */
  onBulkConfirm(): void {
    const toIssue = this.bulkPreviewReceipts();
    toIssue.forEach((r) => {
      this.state.issueReceipt(r, 'invoice', {});
      this.state.deleteWaitingReceipt(r.id);
    });
    alert(
      `ออกใบเสร็จ ${toIssue.length} รายการสำเร็จ\nปรากฏในประวัติใบเสร็จแล้ว`,
    );
    this.closeBulkPreview();
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
    this.loadData();
  }

  // ── Edit helpers ─────────────────────────────────────────────
  getEditValue(field: keyof Receipt): any {
    return this.editingReceipt()?.[field] ?? '';
  }

  setEditValue(field: keyof Receipt, value: any): void {
    this.editingReceipt.update((rec) =>
      rec ? { ...rec, [field]: value } : null,
    );
  }
}
