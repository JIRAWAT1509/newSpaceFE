// invoice-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice, CreditNote } from '@core/models/finance.model';
import { MOCK_INVOICES, MOCK_CREDIT_NOTES } from '@core/data/finance.mock';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';
import { FinanceDocumentModalComponent } from '@shared/components/finance-document-modal/finance-document-modal.component';
import { DocumentType } from '@core/models/finance-document.model';
import { InvoiceDetailModalComponent } from '@shared/components/invoice-detail-modal/invoice-detail-modal.component';

type SortField = 'contractNumber' | 'customerName' | 'collectionItem' | 'amount' | 'startDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;
type HistoryTab = 'invoice' | 'credit';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    WarningModalComponent,
    FinanceDocumentModalComponent,
    InvoiceDetailModalComponent,
  ],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css',
})
export class InvoiceManagementComponent implements OnInit {
  // View States
  showHistory = signal<boolean>(false);
  activeHistoryTab = signal<HistoryTab>('invoice');
  invoices = signal<Invoice[]>([]);
  issuedInvoices = signal<Invoice[]>([]);
  issuedCreditNotes = signal<CreditNote[]>([]);
  selectedInvoices = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);

  // Search
  searchQuery = signal<string>('');

  // Sorting
  sortField = signal<SortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // Modals & Drawers
  showCreateDrawer = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  pendingCancelInvoice = signal<Invoice | null>(null);
  showMessageModal = signal<boolean>(false);
  messageTitle = signal<string>('');
  messageText = signal<string>('');

  // Document Modal
  showDocumentModal = signal<boolean>(false);
  selectedDocumentType = signal<DocumentType | null>(null);
  currentInvoice = signal<any>(null);

  // Detail Modal
  showDetailModal = signal<boolean>(false);

  // Edit Modal
  showEditModal = signal<boolean>(false);
  editingInvoice = signal<Invoice | CreditNote | null>(null);

  // Row Kebab Menu
  showRowMenu = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  // Header Kebab Menu
  showHeaderMenu = signal<boolean>(false);

  // New Invoice Data
  newInvoiceData = signal<Partial<Invoice>>({
    contractNumber: '',
    customerName: '',
    collectionItem: '',
    amount: 0,
    startDate: '',
    status: 'ready',
  });

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoices.set(MOCK_INVOICES.filter((inv) => inv.status === 'ready'));
    this.issuedInvoices.set(MOCK_INVOICES.filter((inv) => inv.status === 'open'));
    this.issuedCreditNotes.set(MOCK_CREDIT_NOTES);
  }

  // ===================== VIEW TOGGLE =====================
  toggleHistoryView(): void {
    this.showHistory.update((v) => !v);
    this.selectedInvoices.set(new Set());
    this.showBulkActions.set(false);
    this.searchQuery.set('');
  }

  setHistoryTab(tab: HistoryTab): void {
    this.activeHistoryTab.set(tab);
    this.selectedInvoices.set(new Set());
    this.showBulkActions.set(false);
  }

  getCurrentViewInvoices(): any[] {
    let data: any[];

    if (!this.showHistory()) {
      data = this.invoices();
    } else {
      if (this.activeHistoryTab() === 'invoice') {
        data = this.issuedInvoices();
      } else {
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
  sortBy(field: SortField): void {
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
        this.loadInvoices();
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

    const sortData = <T extends Invoice | CreditNote>(data: T[]): T[] => {
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

    if (!this.showHistory()) {
      this.invoices.set(sortData(this.invoices()));
    } else {
      if (this.activeHistoryTab() === 'invoice') {
        this.issuedInvoices.set(sortData(this.issuedInvoices()));
      } else {
        this.issuedCreditNotes.set(sortData(this.issuedCreditNotes()));
      }
    }
  }

  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return 'pi-sort-alt';
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down';
  }

  // ===================== SELECTION =====================
  toggleSelection(invoiceId: string): void {
    const selected = new Set(this.selectedInvoices());
    if (selected.has(invoiceId)) {
      selected.delete(invoiceId);
    } else {
      selected.add(invoiceId);
    }
    this.selectedInvoices.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const selected = new Set<string>();
    if (checkbox.checked) {
      this.getCurrentViewInvoices().forEach((inv) => selected.add(inv.id));
    }
    this.selectedInvoices.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  isSelected(invoiceId: string): boolean {
    return this.selectedInvoices().has(invoiceId);
  }

  isAllSelected(): boolean {
    const current = this.getCurrentViewInvoices();
    return this.selectedInvoices().size === current.length && current.length > 0;
  }

  getSelectedCount(): number {
    return this.selectedInvoices().size;
  }

  // ===================== ROW KEBAB MENU =====================
  toggleRowMenu(invoiceId: string, event: MouseEvent): void {
    if (this.showRowMenu() === invoiceId) {
      this.closeRowMenu();
    } else {
      const invoice = this.getCurrentViewInvoices().find((inv) => inv.id === invoiceId);
      if (invoice) {
        this.currentInvoice.set(invoice);
        this.showRowMenu.set(invoiceId);

        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        const menuWidth = 224;
        const menuHeight = 240;

        let top = rect.bottom - 18;
        let left = rect.right - menuWidth + 20;

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

  onMenuAction(invoice: Invoice, action: string): void {
    console.log(`Action ${action}:`, invoice);
    this.closeRowMenu();

    switch (action) {
      case 'ออกใบแจ้งหนี้':
        this.issueInvoiceForSingle(invoice);
        break;
      case 'ออกใบแจ้งหนี้ + พิมพ์เอกสาร':
        this.issueInvoiceForSingle(invoice, true);
        break;
      case 'ออกใบแจ้งหนี้ + ส่งอีเมล':
        this.issueInvoiceForSingle(invoice, false, true);
        break;
      case 'ยกเลิกใบแจ้งหนี้':
        this.onCancel(invoice);
        break;
      case 'ลบสัญญา':
        this.deleteContract(invoice);
        break;
      case 'ออกใบลดหนี้':
        this.issueCreditNote(invoice);
        break;
      case 'พิมพ์เอกสาร (PDF)':
      case 'ส่งทางอีเมล':
        this.showMessage('ดำเนินการ', `กำลังดำเนินการ: ${action}`);
        break;
    }
  }

  // ===================== HEADER KEBAB MENU =====================
  toggleHeaderMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showHeaderMenu.update(v => !v);
  }

  closeHeaderMenu(): void {
    this.showHeaderMenu.set(false);
  }

  onHeaderMenuAction(action: string): void {
    this.closeHeaderMenu();
    this.showMessage('ดำเนินการ', `เลือก: ${action}`);
  }

  // ===================== ISSUE INVOICE =====================
  issueInvoiceForSingle(invoice: Invoice, print = false, email = false): void {
    this.currentInvoice.set(this.convertInvoiceToDebt(invoice));
    this.selectedDocumentType.set('invoice');
    this.showDocumentModal.set(true);
    (window as any).__pendingInvoiceActions = { print, email, originalInvoice: invoice };
  }

  issueCreditNote(invoice: Invoice): void {
    this.currentInvoice.set(this.convertInvoiceToDebt(invoice));
    this.selectedDocumentType.set('credit_note');
    this.showDocumentModal.set(true);
    (window as any).__pendingInvoiceActions = { originalInvoice: invoice };
  }

  onDocumentSubmit(formData: any): void {
    console.log('Document submitted:', formData);
    const actions = (window as any).__pendingInvoiceActions || {};
    const invoice = actions.originalInvoice;

    if (invoice) {
      if (formData.documentType === 'invoice') {
        const updatedInvoice = { ...invoice, status: 'open' as const };
        this.invoices.update((invs) => invs.filter((inv) => inv.id !== invoice.id));
        this.issuedInvoices.update((invs) => [...invs, updatedInvoice]);

        let message = 'ออกใบแจ้งหนี้สำเร็จ';
        if (actions.print) message += ' และกำลังพิมพ์เอกสาร';
        if (actions.email) message += ' และกำลังส่งอีเมล';
        this.showMessage('สำเร็จ', message);
      } else if (formData.documentType === 'credit_note') {
        const creditNote: CreditNote = {
          id: `CN-${Date.now()}`,
          cnNumber: `CN-2025-${String(this.issuedCreditNotes().length + 1).padStart(3, '0')}`,
          refInvoiceNumber: invoice.contractNumber,
          customerName: invoice.customerName,
          amount: Math.abs(formData.amount || invoice.amount),
          date: new Date().toISOString().split('T')[0],
          reason: formData.reason || 'ออกใบลดหนี้',
          status: 'open'
        };
        this.issuedCreditNotes.update((notes) => [...notes, creditNote]);
        this.showMessage('สำเร็จ', 'ออกใบลดหนี้สำเร็จ');
      }

      delete (window as any).__pendingInvoiceActions;
    }

    this.closeDocumentModal();
  }

  closeDocumentModal(): void {
    this.showDocumentModal.set(false);
    this.selectedDocumentType.set(null);
    this.currentInvoice.set(null);
  }

  // ===================== CREATE MANUAL INVOICE =====================
  openCreateDrawer(): void {
    this.newInvoiceData.set({
      contractNumber: '',
      customerName: '',
      collectionItem: '',
      amount: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ready',
    });

    const mockInvoice: Invoice = {
      id: `temp-${Date.now()}`,
      contractNumber: '',
      customerName: '',
      collectionItem: '',
      amount: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ready',
    };

    this.currentInvoice.set(this.convertInvoiceToDebt(mockInvoice));
    this.selectedDocumentType.set('invoice');
    this.showDocumentModal.set(true);
    (window as any).__pendingInvoiceActions = { isNewInvoice: true };
  }

  closeCreateDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  onCreateInvoice(): void {
    const data = this.newInvoiceData();
    const newInvoice: Invoice = {
      id: `manual-${Date.now()}`,
      contractNumber: data.contractNumber || 'N/A',
      customerName: data.customerName || 'N/A',
      collectionItem: data.collectionItem || 'N/A',
      amount: data.amount || 0,
      startDate: data.startDate || '',
      status: 'open',
    };

    this.issuedInvoices.update((invs) => [...invs, newInvoice]);
    this.showMessage('สำเร็จ', 'สร้างใบแจ้งหนี้สำเร็จ');
    this.closeCreateDrawer();
  }

  updateNewInvoiceField(field: string, value: any): void {
    this.newInvoiceData.update((data) => ({ ...data, [field]: value }));
  }

  // ===================== ROW ACTIONS =====================
  onPreview(invoice: Invoice): void {
    this.currentInvoice.set(invoice);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      if (!this.showDetailModal()) {
        this.currentInvoice.set(null);
      }
    }, 300);
  }

  onIssueInvoiceFromDetail(invoice: any): void {
    const originalInvoice = this.invoices().find(inv => inv.id === invoice.id);
    if (originalInvoice) {
      this.issueInvoiceForSingle(originalInvoice);
    }
  }

  onEdit(invoice: Invoice): void {
    if ('originalData' in invoice && invoice.originalData) {
      this.editingInvoice.set({ ...(invoice.originalData as CreditNote) });
    } else {
      this.editingInvoice.set({ ...invoice });
    }
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingInvoice.set(null);
  }

  onSaveEdit(): void {
    const edited = this.editingInvoice();
    if (!edited) return;

    if (!this.showHistory()) {
      this.invoices.update((invs) => invs.map((inv) => (inv.id === edited.id ? edited as Invoice : inv)));
    } else if (this.activeHistoryTab() === 'invoice') {
      this.issuedInvoices.update((invs) => invs.map((inv) => (inv.id === edited.id ? edited as Invoice : inv)));
    } else {
      if ('cnNumber' in edited) {
        this.issuedCreditNotes.update((notes) =>
          notes.map((note) => (note.id === edited.id ? edited as CreditNote : note))
        );
      }
    }
    this.showMessage('สำเร็จ', 'บันทึกการแก้ไขสำเร็จ');
    this.closeEditModal();
  }

  updateEditField(field: string, value: any): void {
    this.editingInvoice.update((inv) => {
      if (!inv) return null;
      let finalValue = value;
      if (field === 'amount') {
        finalValue = parseFloat(value) || 0;
      }
      return { ...inv, [field]: finalValue };
    });
  }

  getEditContractNumber(): string {
    const editing = this.editingInvoice();
    if (!editing) return '';
    if ('cnNumber' in editing) {
      return editing.cnNumber;
    }
    return editing.contractNumber;
  }

  getEditCustomerName(): string {
    const editing = this.editingInvoice();
    return editing?.customerName || '';
  }

  getEditCollectionItem(): string {
    const editing = this.editingInvoice();
    if (!editing) return '';
    if ('refInvoiceNumber' in editing) {
      return `อ้างอิง: ${editing.refInvoiceNumber}`;
    }
    return editing.collectionItem;
  }

  getEditAmount(): number {
    const editing = this.editingInvoice();
    return editing?.amount || 0;
  }

  getEditStartDate(): string {
    const editing = this.editingInvoice();
    if (!editing) return '';
    if ('date' in editing) {
      return editing.date;
    }
    return editing.startDate;
  }

  setEditContractNumber(value: string): void {
    this.editingInvoice.update((inv) => {
      if (!inv) return null;
      if ('cnNumber' in inv) {
        return { ...inv, cnNumber: value };
      }
      return { ...inv, contractNumber: value };
    });
  }

  setEditCustomerName(value: string): void {
    this.editingInvoice.update((inv) => {
      if (!inv) return null;
      return { ...inv, customerName: value };
    });
  }

  setEditCollectionItem(value: string): void {
    this.editingInvoice.update((inv) => {
      if (!inv) return null;
      if ('refInvoiceNumber' in inv) {
        return { ...inv, refInvoiceNumber: value.replace('อ้างอิง: ', '') };
      }
      return { ...inv, collectionItem: value };
    });
  }

  setEditAmount(value: number): void {
    this.editingInvoice.update((inv) => {
      if (!inv) return null;
      return { ...inv, amount: value };
    });
  }

  setEditStartDate(value: string): void {
    this.editingInvoice.update((inv) => {
      if (!inv) return null;
      if ('date' in inv) {
        return { ...inv, date: value };
      }
      return { ...inv, startDate: value };
    });
  }

  onCancel(invoice: Invoice): void {
    this.pendingCancelInvoice.set(invoice);
    this.showConfirmModal.set(true);
  }

  onConfirmCancel(): void {
    const invoice = this.pendingCancelInvoice();
    if (invoice) {
      const canceledInvoice = { ...invoice, status: 'cancel' as const };

      if (!this.showHistory()) {
        this.invoices.update((invs) => invs.filter(inv => inv.id !== invoice.id));
        this.issuedInvoices.update((invs) => [...invs, canceledInvoice]);
      } else if (this.activeHistoryTab() === 'invoice') {
        this.issuedInvoices.update((invs) =>
          invs.map((inv) => (inv.id === invoice.id ? canceledInvoice : inv))
        );
      }
      this.showMessage('ยกเลิกสำเร็จ', `ใบแจ้งหนี้ ${invoice.contractNumber} ถูกยกเลิกแล้ว`);
    }
    this.showConfirmModal.set(false);
    this.pendingCancelInvoice.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelInvoice.set(null);
  }

  deleteContract(invoice: Invoice): void {
    if (!this.showHistory()) {
      this.invoices.update((invs) => invs.filter((inv) => inv.id !== invoice.id));
    } else if (this.activeHistoryTab() === 'invoice') {
      this.issuedInvoices.update((invs) => invs.filter((inv) => inv.id !== invoice.id));
    }
    this.showMessage('ลบสำเร็จ', `ลบสัญญา ${invoice.contractNumber} แล้ว`);
  }

  // ===================== BULK ACTIONS =====================
  onBulkIssueInvoice(): void {
    const count = this.getSelectedCount();
    const selectedIds = Array.from(this.selectedInvoices());
    const selectedInvs = this.invoices().filter((inv) => selectedIds.includes(inv.id));
    const movedInvs = selectedInvs.map((inv) => ({ ...inv, status: 'open' as const }));

    this.invoices.update((invs) => invs.filter((inv) => !selectedIds.includes(inv.id)));
    this.issuedInvoices.update((invs) => [...invs, ...movedInvs]);

    this.showMessage('ออกใบแจ้งหนี้สำเร็จ', `ออกใบแจ้งหนี้ ${count} รายการสำเร็จ`);
    this.selectedInvoices.set(new Set());
    this.showBulkActions.set(false);
  }

  onBulkEmail(): void {
    const count = this.getSelectedCount();
    this.showMessage('ส่งอีเมล', `กำลังส่งอีเมล ${count} รายการ`);
  }

  onBulkPrint(): void {
    const count = this.getSelectedCount();
    this.showMessage('พิมพ์เอกสาร', `กำลังพิมพ์เอกสาร ${count} รายการ`);
  }

  // ===================== HELPERS =====================
  convertInvoiceToDebt(invoice: Invoice): any {
    return {
      id: invoice.id,
      description: invoice.collectionItem,
      customerName: invoice.customerName,
      contractFile: invoice.contractNumber + '.pdf',
      amount: invoice.amount,
      dueDate: invoice.startDate,
      overdueDays: 0,
      status: invoice.status,
    };
  }

  showMessage(title: string, message: string): void {
    this.messageTitle.set(title);
    this.messageText.set(message);
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
  }

  onPrint(invoice: Invoice): void {
    this.showMessage('พิมพ์เอกสาร', `กำลังพิมพ์เอกสาร ${invoice.contractNumber}`);
  }

  onEmail(invoice: Invoice): void {
    this.showMessage('ส่งอีเมล', `กำลังส่งอีเมล ${invoice.contractNumber}`);
  }
}
