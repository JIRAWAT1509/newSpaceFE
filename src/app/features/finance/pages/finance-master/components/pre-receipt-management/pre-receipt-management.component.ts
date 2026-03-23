// src/app/features/finance/components/pre-receipt-management/pre-receipt-management.component.ts

import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt } from '@core/models/finance.model';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { ReceiptDetailModalComponent } from '@shared/components/receipt-detail-modal/receipt-detail-modal.component';
import { FinanceStateService } from '@core/services/finance-state.service';

type ReceiptSortField = 'contractNumber' | 'customerName' | 'collectionItem' | 'amount' | 'startDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-pre-receipt-management',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent, ReceiptDetailModalComponent],
  templateUrl: './pre-receipt-management.component.html',
  styleUrl: './pre-receipt-management.component.css'
})
export class PreReceiptManagementComponent implements OnInit {
  private readonly state = inject(FinanceStateService);

  // Data
  receipts = computed(() => this._sortedReceipts() ?? this.state.waitingReceipts());
  private _sortedReceipts = signal<Receipt[] | null>(null);
  selectedReceipts = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);

  // Sorting
  sortField = signal<ReceiptSortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // Modals
  showDetailModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  currentReceipt = signal<Receipt | null>(null);
  pendingCancelReceipt = signal<Receipt | null>(null);
  editingReceipt = signal<Receipt | null>(null);

  // Kebab Menu
  showRowMenu = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this._sortedReceipts.set(null);
  }

  // ===================== SORTING =====================
  sortBy(field: ReceiptSortField): void {
    const currentField = this.sortField();
    const currentDirection = this.sortDirection();

    if (currentField === field) {
      if (currentDirection === null) {
        this.sortDirection.set('asc');
      } else if (currentDirection === 'asc') {
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
    const direction = this.sortDirection();
    if (!field || !direction) return;

    const sorted = [...this.receipts()].sort((a, b) => {
      let aVal: any = a[field];
      let bVal: any = b[field];

      if (field === 'amount') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (field === 'startDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this._sortedReceipts.set(sorted);
  }

  getSortIcon(field: ReceiptSortField): string {
    if (this.sortField() !== field) return 'pi-sort-alt';
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down';
  }

  // ===================== SELECTION =====================
  toggleSelection(receiptId: string): void {
    const selected = new Set(this.selectedReceipts());
    if (selected.has(receiptId)) {
      selected.delete(receiptId);
    } else {
      selected.add(receiptId);
    }
    this.selectedReceipts.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const selected = new Set<string>();
    if (checkbox.checked) {
      this.receipts().forEach(rec => selected.add(rec.id));
    }
    this.selectedReceipts.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  isSelected(receiptId: string): boolean {
    return this.selectedReceipts().has(receiptId);
  }

  isAllSelected(): boolean {
    return this.selectedReceipts().size === this.receipts().length && this.receipts().length > 0;
  }

  getSelectedCount(): number {
    return this.selectedReceipts().size;
  }

  // ===================== KEBAB MENU =====================
  toggleRowMenu(receiptId: string, event: MouseEvent): void {
    if (this.showRowMenu() === receiptId) {
      this.closeRowMenu();
    } else {
      const receipt = this.receipts().find(r => r.id === receiptId);
      if (receipt) {
        this.currentReceipt.set(receipt);
        this.showRowMenu.set(receiptId);

        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        const menuWidth = 224;
        const menuHeight = 180;

        let top = rect.bottom - 20;
        let left = rect.left - menuWidth + 20;

        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < menuHeight) {
          top = rect.top - menuHeight - 4;
        }

        this.menuPosition.set({ top, left });
      }
    }
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

  // ===================== ACTIONS =====================
  onPreview(receipt: Receipt): void {
    this.currentReceipt.set(receipt);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      if (!this.showDetailModal()) {
        this.currentReceipt.set(null);
      }
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
    const receipt = this.pendingCancelReceipt();
    if (receipt) {
      this.state.deleteWaitingReceipt(receipt.id);
      alert(`ยกเลิกรายการ ${receipt.contractNumber} สำเร็จ`);
    }
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  onIssueReceipt(receipt: Receipt): void {
    const issued = this.state.issueReceipt(receipt, 'invoice', {});
    this.state.deleteWaitingReceipt(receipt.id);
    alert(`ออกใบเสร็จ ${issued.contractNumber} สำเร็จ\nปรากฏในประวัติใบเสร็จแล้ว`);
  }

  onIssueReceiptAndPrint(receipt: Receipt): void {
    const issued = this.state.issueReceipt(receipt, 'invoice', {});
    this.state.deleteWaitingReceipt(receipt.id);
    alert(`ออกใบเสร็จ + พิมพ์เอกสาร ${issued.contractNumber} สำเร็จ`);
  }

  onIssueReceiptAndEmail(receipt: Receipt): void {
    const issued = this.state.issueReceipt(receipt, 'invoice', {});
    this.state.deleteWaitingReceipt(receipt.id);
    alert(`ออกใบเสร็จ + ส่งอีเมล ${issued.contractNumber} สำเร็จ`);
  }

  onDeleteContract(receipt: Receipt): void {
    if (confirm(`ต้องการลบสัญญา ${receipt.contractNumber} หรือไม่?`)) {
      this.state.deleteWaitingReceipt(receipt.id);
      alert('ลบสัญญาสำเร็จ');
    }
  }

  // ===================== BULK ACTIONS =====================
  onBulkCreateReceipts(): void {
    const count = this.getSelectedCount();
    const selectedIds = Array.from(this.selectedReceipts());
    const toIssue = this.state.waitingReceipts().filter(r => selectedIds.includes(r.id));
    toIssue.forEach(r => {
      this.state.issueReceipt(r, 'invoice', {});
      this.state.deleteWaitingReceipt(r.id);
    });
    alert(`ออกใบเสร็จ ${count} รายการสำเร็จ\nปรากฏในประวัติใบเสร็จแล้ว`);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
  }

  // Edit modal helpers
  getEditValue(field: keyof Receipt): any {
    return this.editingReceipt()?.[field] ?? '';
  }

  setEditValue(field: keyof Receipt, value: any): void {
    this.editingReceipt.update(rec => {
      if (!rec) return null;
      return { ...rec, [field]: value };
    });
  }
}
