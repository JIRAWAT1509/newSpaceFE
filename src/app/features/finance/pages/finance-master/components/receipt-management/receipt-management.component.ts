// receipt-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt, Invoice } from '@core/models/finance.model';
import { MOCK_RECEIPTS, MOCK_RECEIPTS_WAITING } from '@core/data/finance.mock';
import { FinanceDocumentModalComponent } from '@shared/components/finance-document-modal/finance-document-modal.component';
import { DocumentType } from '@core/models/finance-document.model';
import { DebtDetailModalComponent } from '@shared/components/debt-detail-modal/debt-detail-modal.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

type ReceiptSortField = 'contractNumber' | 'customerName' | 'collectionItem' | 'amount' | 'startDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-receipt-management',
  standalone: true,
  imports: [
    CommonModule,
    FinanceDocumentModalComponent,
    DebtDetailModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './receipt-management.component.html',
  styleUrl: './receipt-management.component.css'
})
export class ReceiptManagementComponent implements OnInit {
  // View States
  showHistory = signal<boolean>(false);
  activeHistoryTab = signal<'receipt' | 'credit'>('receipt'); // receipt history or credit note history

  // Data
  receipts = signal<Receipt[]>([]); // Invoices waiting to become receipts
  issuedReceipts = signal<Receipt[]>([]); // Actual receipts
  issuedCreditNotes = signal<Receipt[]>([]); // Credit notes for receipts
  selectedReceipts = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);

  // Sorting
  sortField = signal<ReceiptSortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // Modals
  showDocumentModal = signal<boolean>(false);
  selectedDocumentType = signal<DocumentType | null>(null);
  currentReceipt = signal<any>(null); // Can be Receipt or converted to Debt format
  showDetailModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
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
    // Receipts waiting to be issued from MOCK_RECEIPTS_WAITING
    this.receipts.set(MOCK_RECEIPTS_WAITING);

    // Issued receipts
    this.issuedReceipts.set(MOCK_RECEIPTS.filter(rec => rec.status === 'open'));

    // Credit notes (mock data)
    this.issuedCreditNotes.set([]);
  }

  // ===================== VIEW TOGGLE =====================
  toggleHistoryView(): void {
    this.showHistory.update(v => !v);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
    this.searchQuery.set('');
  }

  setHistoryTab(tab: 'receipt' | 'credit'): void {
    this.activeHistoryTab.set(tab);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
  }

  getCurrentViewReceipts(): Receipt[] {
    if (!this.showHistory()) {
      return this.getFilteredReceipts(this.receipts());
    } else {
      if (this.activeHistoryTab() === 'receipt') {
        return this.getFilteredReceipts(this.issuedReceipts());
      } else {
        return this.getFilteredReceipts(this.issuedCreditNotes());
      }
    }
  }

  getFilteredReceipts(receipts: Receipt[]): Receipt[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return receipts;

    return receipts.filter(rec =>
      rec.contractNumber.toLowerCase().includes(query) ||
      rec.customerName.toLowerCase().includes(query) ||
      rec.collectionItem.toLowerCase().includes(query)
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

    const sortData = (data: Receipt[]) => {
      return [...data].sort((a, b) => {
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
    };

    if (!this.showHistory()) {
      this.receipts.set(sortData(this.receipts()));
    } else {
      if (this.activeHistoryTab() === 'receipt') {
        this.issuedReceipts.set(sortData(this.issuedReceipts()));
      } else {
        this.issuedCreditNotes.set(sortData(this.issuedCreditNotes()));
      }
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
    console.log(`Action ${action}:`, receipt);
    this.closeRowMenu();

    switch (action) {
      case 'Preview ใบเสร็จ':
        this.onPreview(receipt);
        break;
      case 'ยกเลิกใบเสร็จ':
        this.onCancelReceipt(receipt);
        break;
      case 'ออกใบลดหนี้ใบเสร็จ':
        this.issueReceiptCreditNote(receipt);
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
    this.currentReceipt.set(this.convertReceiptToDebt(receipt));
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
      this.issuedReceipts.update(recs =>
        recs.map(r => r.id === receipt.id ? { ...r, status: 'cancel' as const } : r)
      );
      alert(`ยกเลิกใบเสร็จ ${receipt.contractNumber} สำเร็จ`);
    }
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelReceipt.set(null);
  }

  issueReceiptCreditNote(receipt: Receipt): void {
    this.currentReceipt.set(this.convertReceiptToDebt(receipt));
    this.selectedDocumentType.set('receipt_credit');
    this.showDocumentModal.set(true);
    // Store original receipt for later use
    (window as any).__pendingReceiptData = { originalReceipt: receipt };
  }

  onDocumentSubmit(formData: any): void {
    console.log('Document submitted:', formData);
    const pendingData = (window as any).__pendingReceiptData || {};
    const receipt = pendingData.originalReceipt || this.getCurrentViewReceipts().find(r => r.id === this.currentReceipt()?.id);

    if (receipt && formData.documentType === 'receipt') {
      // Move from waiting list to issued receipts
      this.receipts.update(recs => recs.filter(r => r.id !== receipt.id));
      this.issuedReceipts.update(recs => [...recs, receipt]);
      alert('ออกใบเสร็จสำเร็จ');
    } else if (receipt && formData.documentType === 'receipt_credit') {
      // Add to credit notes
      this.issuedCreditNotes.update(notes => [...notes, {
        ...receipt,
        id: `credit-${Date.now()}`,
        amount: -receipt.amount
      }]);
      alert('ออกใบลดหนี้ใบเสร็จสำเร็จ');
    }

    delete (window as any).__pendingReceiptData;
    this.closeDocumentModal();
  }

  closeDocumentModal(): void {
    this.showDocumentModal.set(false);
    this.selectedDocumentType.set(null);
    this.currentReceipt.set(null);
  }

  // ===================== HELPERS =====================
  convertReceiptToDebt(receipt: Receipt): any {
    // Convert Receipt to Debt-like object for modal compatibility
    return {
      id: receipt.id,
      description: receipt.collectionItem,
      customerName: receipt.customerName,
      contractFile: receipt.contractNumber + '.pdf',
      amount: receipt.amount,
      dueDate: receipt.startDate,
      overdueDays: 0,
      status: receipt.status
    };
  }

  // ===================== BULK ACTIONS =====================
  onBulkCreateReceipts(): void {
    const count = this.getSelectedCount();
    const selectedIds = Array.from(this.selectedReceipts());
    const selectedRecs = this.receipts().filter(rec => selectedIds.includes(rec.id));

    // Move to issued receipts
    this.receipts.update(recs => recs.filter(rec => !selectedIds.includes(rec.id)));
    this.issuedReceipts.update(recs => [...recs, ...selectedRecs]);

    alert(`ออกใบเสร็จ ${count} รายการสำเร็จ`);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
  }

  onBulkEmail(): void {
    const count = this.getSelectedCount();
    alert(`Mock: ส่งอีเมล ${count} รายการ`);
  }

  onBulkPrint(): void {
    const count = this.getSelectedCount();
    alert(`Mock: พิมพ์เอกสาร ${count} รายการ`);
  }
}
