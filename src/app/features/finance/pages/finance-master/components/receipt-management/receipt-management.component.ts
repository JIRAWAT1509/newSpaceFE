// src/app/features/finance/components/receipt-management/receipt-management.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt, CreditNote } from '@core/models/finance.model';
import { MOCK_RECEIPTS, MOCK_RECEIPT_CREDIT_NOTES } from '@core/data/finance.mock';
import { ReceiptDetailModalComponent } from '@shared/components/receipt-detail-modal/receipt-detail-modal.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

type ReceiptSortField = 'contractNumber' | 'customerName' | 'collectionItem' | 'amount' | 'startDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;
type HistoryTab = 'receipt' | 'credit';

@Component({
  selector: 'app-receipt-management',
  standalone: true,
  imports: [
    CommonModule,
    ReceiptDetailModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './receipt-management.component.html',
  styleUrl: './receipt-management.component.css'
})
export class ReceiptManagementComponent implements OnInit {
  // Tab State
  activeHistoryTab = signal<HistoryTab>('receipt');

  // Data
  issuedReceipts = signal<Receipt[]>([]);
  issuedCreditNotes = signal<CreditNote[]>([]);
  selectedReceipts = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);

  // Sorting
  sortField = signal<ReceiptSortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // Modals
  showDetailModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  currentReceipt = signal<any>(null);
  editingReceipt = signal<Receipt | CreditNote | null>(null);
  pendingCancelReceipt = signal<Receipt | null>(null);

  // Kebab Menu
  showRowMenu = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  // Search
  searchQuery = signal<string>('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.issuedReceipts.set(MOCK_RECEIPTS);
    this.issuedCreditNotes.set(MOCK_RECEIPT_CREDIT_NOTES);
  }

  // ===================== TAB MANAGEMENT =====================
  setHistoryTab(tab: HistoryTab): void {
    this.activeHistoryTab.set(tab);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
  }

  getCurrentViewReceipts(): any[] {
    let data: any[];

    if (this.activeHistoryTab() === 'receipt') {
      data = this.issuedReceipts();
    } else {
      // Map Credit Note to match table properties
      data = this.issuedCreditNotes().map(cn => ({
        id: cn.id,
        contractNumber: cn.cnNumber,
        customerName: cn.customerName,
        collectionItem: `อ้างอิง: ${cn.refInvoiceNumber}`,
        amount: cn.amount,
        startDate: cn.date,
        status: cn.status,
        originalData: cn
      }));
    }

    const query = this.searchQuery().toLowerCase();
    if (!query) return data;

    return data.filter(item =>
      (item.contractNumber || '').toLowerCase().includes(query) ||
      (item.customerName || '').toLowerCase().includes(query) ||
      (item.collectionItem || '').toLowerCase().includes(query)
    );
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

    const sortData = <T extends Receipt | CreditNote>(data: T[]): T[] => {
      return [...data].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if ('cnNumber' in a) {
          const aCN = a as CreditNote;
          const bCN = b as CreditNote;

          switch (field) {
            case 'contractNumber':
              aVal = aCN.cnNumber;
              bVal = bCN.cnNumber;
              break;
            case 'collectionItem':
              aVal = aCN.refInvoiceNumber;
              bVal = bCN.refInvoiceNumber;
              break;
            case 'startDate':
              aVal = new Date(aCN.date).getTime();
              bVal = new Date(bCN.date).getTime();
              break;
            case 'amount':
              aVal = Number(aCN.amount);
              bVal = Number(bCN.amount);
              break;
            case 'customerName':
              aVal = aCN.customerName;
              bVal = bCN.customerName;
              break;
            case 'status':
              aVal = aCN.status;
              bVal = bCN.status;
              break;
            default:
              aVal = '';
              bVal = '';
          }
        } else {
          aVal = (a as any)[field];
          bVal = (b as any)[field];
        }

        if (field === 'amount') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else if (field === 'startDate' && typeof aVal === 'string') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === 'string') {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    };

    if (this.activeHistoryTab() === 'receipt') {
      this.issuedReceipts.set(sortData(this.issuedReceipts()));
    } else {
      this.issuedCreditNotes.set(sortData(this.issuedCreditNotes()));
    }
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
      this.getCurrentViewReceipts().forEach(rec => selected.add(rec.id));
    }
    this.selectedReceipts.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  isSelected(receiptId: string): boolean {
    return this.selectedReceipts().has(receiptId);
  }

  isAllSelected(): boolean {
    const current = this.getCurrentViewReceipts();
    return this.selectedReceipts().size === current.length && current.length > 0;
  }

  getSelectedCount(): number {
    return this.selectedReceipts().size;
  }

  // ===================== KEBAB MENU =====================
  toggleRowMenu(receiptId: string, event: MouseEvent): void {
    if (this.showRowMenu() === receiptId) {
      this.closeRowMenu();
    } else {
      const receipt = this.getCurrentViewReceipts().find(r => r.id === receiptId);
      if (receipt) {
        this.currentReceipt.set(receipt);
        this.showRowMenu.set(receiptId);

        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        const menuWidth = 224;
        const menuHeight = 200;

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
      case 'Preview ใบเสร็จ':
        this.onPreview(receipt);
        break;
      case 'ยกเลิกใบเสร็จ':
        this.onCancelReceipt(receipt);
        break;
      case 'ออกใบลดหนี้ใบเสร็จ':
        alert('Mock: ออกใบลดหนี้ใบเสร็จ');
        break;
      case 'พิมพ์เอกสาร (PDF)':
        alert(`Mock: พิมพ์เอกสาร ${receipt.contractNumber}`);
        break;
      case 'ส่งทางอีเมล':
        alert(`Mock: ส่งอีเมล ${receipt.contractNumber}`);
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

  onPrint(receipt: Receipt): void {
    alert(`Mock: พิมพ์เอกสาร ${receipt.contractNumber}`);
  }

  onEmail(receipt: Receipt): void {
    alert(`Mock: ส่งอีเมล ${receipt.contractNumber}`);
  }

  onCancelReceipt(receipt: Receipt): void {
    this.pendingCancelReceipt.set(receipt);
    this.showConfirmModal.set(true);
  }

  onConfirmCancel(): void {
    const receipt = this.pendingCancelReceipt();
    if (receipt) {
      const canceledReceipt = { ...receipt, status: 'cancel' as const };

      if (this.activeHistoryTab() === 'receipt') {
        this.issuedReceipts.update(recs =>
          recs.map(rec => rec.id === receipt.id ? canceledReceipt : rec)
        );
      }
      alert(`ยกเลิกใบเสร็จ ${receipt.contractNumber} สำเร็จ`);
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
    const count = this.getSelectedCount();
    alert(`Mock: ส่งอีเมล ${count} รายการ`);
  }

  onBulkPrint(): void {
    const count = this.getSelectedCount();
    alert(`Mock: พิมพ์เอกสาร ${count} รายการ`);
  }
}
