// receipt-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt, Invoice, CreditNote } from '@core/models/finance.model';
import { MOCK_RECEIPTS, MOCK_RECEIPTS_WAITING, MOCK_RECEIPT_CREDIT_NOTES } from '@core/data/finance.mock';
import { FinanceDocumentModalComponent } from '@shared/components/finance-document-modal/finance-document-modal.component';
import { DocumentType } from '@core/models/finance-document.model';
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
    FinanceDocumentModalComponent,
    ReceiptDetailModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './receipt-management.component.html',
  styleUrl: './receipt-management.component.css'
})
export class ReceiptManagementComponent implements OnInit {
  // View States
  showHistory = signal<boolean>(false);
  activeHistoryTab = signal<HistoryTab>('receipt');

  // Data
  receipts = signal<Receipt[]>([]); // Invoices waiting to become receipts
  issuedReceipts = signal<Receipt[]>([]); // Actual receipts
  issuedCreditNotes = signal<CreditNote[]>([]); // Credit notes for receipts
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

  // Edit Modal
  showEditModal = signal<boolean>(false);
  editingReceipt = signal<Receipt | CreditNote | null>(null);

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

    // Credit notes for receipts
    this.issuedCreditNotes.set(MOCK_RECEIPT_CREDIT_NOTES);
  }

  // ===================== VIEW TOGGLE =====================
  toggleHistoryView(): void {
    this.showHistory.update(v => !v);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
    this.searchQuery.set('');
  }

  setHistoryTab(tab: HistoryTab): void {
    this.activeHistoryTab.set(tab);
    this.selectedReceipts.set(new Set());
    this.showBulkActions.set(false);
  }

  getCurrentViewReceipts(): any[] {
    let data: any[];

    if (!this.showHistory()) {
      data = this.receipts();
    } else {
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

        // Map CreditNote properties to match sorting fields
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
    // Check if this is actually a mapped credit note (has originalData)
    if ('originalData' in receipt && receipt.originalData) {
      this.editingReceipt.set({ ...(receipt.originalData as CreditNote) });
    } else {
      this.editingReceipt.set({ ...receipt });
    }
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingReceipt.set(null);
  }

  onSaveEdit(): void {
    const edited = this.editingReceipt();
    if (!edited) return;

    if (!this.showHistory()) {
      // Editing waiting receipts
      this.receipts.update((recs) => recs.map((rec) => (rec.id === edited.id ? edited as Receipt : rec)));
    } else if (this.activeHistoryTab() === 'receipt') {
      // Editing issued receipts
      this.issuedReceipts.update((recs) => recs.map((rec) => (rec.id === edited.id ? edited as Receipt : rec)));
    } else {
      // Editing credit notes - type guard to check if it's a CreditNote
      if ('cnNumber' in edited) {
        this.issuedCreditNotes.update((notes) =>
          notes.map((note) => (note.id === edited.id ? edited as CreditNote : note))
        );
      }
    }
    alert('บันทึกการแก้ไขสำเร็จ');
    this.closeEditModal();
  }

  updateEditField(field: string, value: any): void {
    this.editingReceipt.update((rec) => {
      if (!rec) return null;
      let finalValue = value;
      if (field === 'amount') {
        finalValue = parseFloat(value) || 0;
      }
      return { ...rec, [field]: finalValue };
    });
  }

  // ✅ FIX #5: Helper methods for edit modal
  getEditContractNumber(): string {
    const editing = this.editingReceipt();
    if (!editing) return '';
    if ('cnNumber' in editing) {
      return editing.cnNumber;
    }
    return editing.contractNumber;
  }

  getEditCustomerName(): string {
    const editing = this.editingReceipt();
    return editing?.customerName || '';
  }

  getEditCollectionItem(): string {
    const editing = this.editingReceipt();
    if (!editing) return '';
    if ('refInvoiceNumber' in editing) {
      return `อ้างอิง: ${editing.refInvoiceNumber}`;
    }
    return editing.collectionItem;
  }

  getEditAmount(): number {
    const editing = this.editingReceipt();
    return editing?.amount || 0;
  }

  getEditStartDate(): string {
    const editing = this.editingReceipt();
    if (!editing) return '';
    if ('date' in editing) {
      return editing.date;
    }
    return editing.startDate;
  }

  setEditContractNumber(value: string): void {
    this.editingReceipt.update((rec) => {
      if (!rec) return null;
      if ('cnNumber' in rec) {
        return { ...rec, cnNumber: value };
      }
      return { ...rec, contractNumber: value };
    });
  }

  setEditCustomerName(value: string): void {
    this.editingReceipt.update((rec) => {
      if (!rec) return null;
      return { ...rec, customerName: value };
    });
  }

  setEditCollectionItem(value: string): void {
    this.editingReceipt.update((rec) => {
      if (!rec) return null;
      if ('refInvoiceNumber' in rec) {
        return { ...rec, refInvoiceNumber: value.replace('อ้างอิง: ', '') };
      }
      return { ...rec, collectionItem: value };
    });
  }

  setEditAmount(value: number): void {
    this.editingReceipt.update((rec) => {
      if (!rec) return null;
      return { ...rec, amount: value };
    });
  }

  setEditStartDate(value: string): void {
    this.editingReceipt.update((rec) => {
      if (!rec) return null;
      if ('date' in rec) {
        return { ...rec, date: value };
      }
      return { ...rec, startDate: value };
    });
  }

  // ✅ FIX #2: Make cancel button work and move to history
  onCancel(receipt: Receipt): void {
    this.pendingCancelReceipt.set(receipt);
    this.showConfirmModal.set(true);
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

  // ✅ FIX #5: When canceling receipt, move to history
  onConfirmCancel(): void {
    const receipt = this.pendingCancelReceipt();
    if (receipt) {
      const canceledReceipt = { ...receipt, status: 'cancel' as const };

      if (!this.showHistory()) {
        // Remove from waiting list and add to issued receipts
        this.receipts.update((recs) => recs.filter(rec => rec.id !== receipt.id));
        this.issuedReceipts.update((recs) => [...recs, canceledReceipt]);
      } else if (this.activeHistoryTab() === 'receipt') {
        // Update in issued receipts
        this.issuedReceipts.update((recs) =>
          recs.map((rec) => (rec.id === receipt.id ? canceledReceipt : rec))
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

  issueReceiptCreditNote(receipt: Receipt): void {
    this.currentReceipt.set(this.convertReceiptToDebt(receipt));
    this.selectedDocumentType.set('receipt_credit');
    this.showDocumentModal.set(true);
    // Store original receipt for later use
    (window as any).__pendingReceiptData = { originalReceipt: receipt };
  }

  // ✅ FIX #4: Use ออกใบเสร็จ modal and move to history
  onDocumentSubmit(formData: any): void {
    console.log('Document submitted:', formData);
    const pendingData = (window as any).__pendingReceiptData || {};
    const receipt = pendingData.originalReceipt || this.getCurrentViewReceipts().find(r => r.id === this.currentReceipt()?.id);

    if (receipt && formData.documentType === 'receipt') {
      // Move from waiting list to issued receipts
      const issuedReceipt = { ...receipt, status: 'open' as const };
      this.receipts.update(recs => recs.filter(r => r.id !== receipt.id));
      this.issuedReceipts.update(recs => [...recs, issuedReceipt]);
      alert('ออกใบเสร็จสำเร็จ');
    } else if (receipt && formData.documentType === 'receipt_credit') {
      // Add to credit notes
      const creditNote: CreditNote = {
        id: `RCN-${Date.now()}`,
        cnNumber: `RCN-2025-${String(this.issuedCreditNotes().length + 1).padStart(3, '0')}`,
        refInvoiceNumber: receipt.contractNumber,
        customerName: receipt.customerName,
        amount: Math.abs(formData.amount || receipt.amount),
        date: new Date().toISOString().split('T')[0],
        reason: formData.reason || 'ออกใบลดหนี้',
        status: 'open'
      };
      this.issuedCreditNotes.update(notes => [...notes, creditNote]);
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
    const issuedRecs = selectedRecs.map(rec => ({ ...rec, status: 'open' as const }));
    this.receipts.update(recs => recs.filter(rec => !selectedIds.includes(rec.id)));
    this.issuedReceipts.update(recs => [...recs, ...issuedRecs]);

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
