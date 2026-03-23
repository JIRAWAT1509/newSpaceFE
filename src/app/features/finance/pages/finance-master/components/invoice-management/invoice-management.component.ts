// invoice-management.component.ts
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice, CreditNote, Debt } from '@core/models/finance.model';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { FinanceDocumentModalComponent } from '@shared/components/finance-document-modal/finance-document-modal.component';
import { DocumentType } from '@core/models/finance-document.model';
import { InvoiceDetailModalComponent } from '@shared/components/invoice-detail-modal/invoice-detail-modal.component';
import { FinanceStateService } from '@core/services/finance-state.service';
import { SuccessToastComponent } from '@shared/components/success-toast/success-toast.component';
import {
  CreateInvoiceModalComponent,
  CreateInvoiceSubmitData,
} from '@shared/components/create-invoice-modal/create-invoice-modal.component';
import { IssueInvoiceEvent } from '@shared/components/invoice-detail-modal/invoice-detail-modal.component';

type SortField =
  | 'contractNumber'
  | 'customerName'
  | 'collectionItem'
  | 'amount'
  | 'startDate'
  | 'status';
type SortDirection = 'asc' | 'desc' | null;
type HistoryTab = 'invoice' | 'credit';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    FinanceDocumentModalComponent,
    InvoiceDetailModalComponent,
    SuccessToastComponent,
    CreateInvoiceModalComponent,
  ],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css',
})
export class InvoiceManagementComponent implements OnInit {
  private readonly state = inject(FinanceStateService);
pendingDetailAction = signal<'issue' | 'issue_print' | 'issue_email' | 'view'>('view');
  // ── View States ──
  showHistory = signal<boolean>(false);
  activeHistoryTab = signal<HistoryTab>('invoice');
  selectedInvoices = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);

  invoices = computed(() => this._sortedReady() ?? this.state.readyInvoices());
  issuedInvoices = computed(
    () => this._sortedIssued() ?? this.state.issuedInvoices(),
  );
  issuedCreditNotes = computed(
    () => this._sortedCredits() ?? this.state.creditNotes(),
  );

  private _sortedReady = signal<Invoice[] | null>(null);
  private _sortedIssued = signal<Invoice[] | null>(null);
  private _sortedCredits = signal<CreditNote[] | null>(null);

  // ── Search ──
  searchQuery = signal<string>('');

  // ── Sorting ──
  sortField = signal<SortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  // ── Toast ──
  showToast = signal<boolean>(false);
  toastTitle = signal<string>('สำเร็จ');
  toastMessage = signal<string>('');

  // ── Modals ──
  showCreateDrawer = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  pendingCancelInvoice = signal<Invoice | null>(null);

  showDocumentModal = signal<boolean>(false);
  selectedDocumentType = signal<DocumentType | null>(null);

  // แยก signal สำหรับแต่ละ modal — ไม่ปะปนกัน
  currentDebtForDocument = signal<Debt | null>(null); // → finance-document-modal
  currentInvoiceForDetail = signal<Invoice | null>(null); // → invoice-detail-modal
  currentInvoice = signal<Invoice | null>(null); // → row menu / edit

  showDetailModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  editingInvoice = signal<Invoice | CreditNote | null>(null);

  // ── Row / Header menus ──
  showRowMenu = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  showHeaderMenu = signal<boolean>(false);

  // ══════════════════════════════════════════════
  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this._sortedReady.set(null);
    this._sortedIssued.set(null);
    this._sortedCredits.set(null);
  }

  // ===================== TOAST =====================
  showSuccessToast(title: string, message: string): void {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.showToast.set(false);
    setTimeout(() => this.showToast.set(true), 10);
  }

  onToastClosed(): void {
    this.showToast.set(false);
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
    } else if (this.activeHistoryTab() === 'invoice') {
      data = this.issuedInvoices();
    } else {
      data = this.issuedCreditNotes().map((cn) => ({
        id: cn.id,
        contractNumber: cn.cnNumber,
        customerName: cn.customerName,
        collectionItem: `อ้างอิง: ${cn.refInvoiceNumber}`,
        amount: cn.amount,
        startDate: cn.date,
        status: cn.status,
        originalData: cn,
      }));
    }

    const query = this.searchQuery().toLowerCase();
    if (!query) return data;
    return data.filter(
      (item) =>
        (item.contractNumber || '').toLowerCase().includes(query) ||
        (item.customerName || '').toLowerCase().includes(query) ||
        (item.collectionItem || '').toLowerCase().includes(query),
    );
  }

  // ===================== SORTING =====================
  sortBy(field: SortField): void {
    if (this.sortField() === field) {
      const dir = this.sortDirection();
      if (dir === null) {
        this.sortDirection.set('asc');
      } else if (dir === 'asc') {
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
    if (!field || !direction) {
      this._sortedReady.set(null);
      this._sortedIssued.set(null);
      this._sortedCredits.set(null);
      return;
    }

    const sortData = <T extends Invoice | CreditNote>(data: T[]): T[] =>
      [...data].sort((a, b) => {
        let aVal: any, bVal: any;
        if ('cnNumber' in a) {
          const aCN = a as CreditNote,
            bCN = b as CreditNote;
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
          aVal = aVal.toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        return aVal < bVal
          ? direction === 'asc'
            ? -1
            : 1
          : aVal > bVal
            ? direction === 'asc'
              ? 1
              : -1
            : 0;
      });

    this._sortedReady.set(sortData([...this.state.readyInvoices()]));
    this._sortedIssued.set(sortData([...this.state.issuedInvoices()]));
    this._sortedCredits.set(sortData([...this.state.creditNotes()]));
  }

  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return 'pi-sort-alt';
    return this.sortDirection() === 'asc'
      ? 'pi-sort-amount-up-alt'
      : 'pi-sort-amount-down';
  }

  // ===================== SELECTION =====================
  toggleSelection(invoiceId: string): void {
    const selected = new Set(this.selectedInvoices());
    selected.has(invoiceId)
      ? selected.delete(invoiceId)
      : selected.add(invoiceId);
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

  isSelected(id: string): boolean {
    return this.selectedInvoices().has(id);
  }
  isAllSelected(): boolean {
    const current = this.getCurrentViewInvoices();
    return (
      this.selectedInvoices().size === current.length && current.length > 0
    );
  }
  getSelectedCount(): number {
    return this.selectedInvoices().size;
  }

  // ===================== ROW KEBAB MENU =====================
  toggleRowMenu(invoiceId: string, event: MouseEvent): void {
    if (this.showRowMenu() === invoiceId) {
      this.closeRowMenu();
      return;
    }

    const invoice = this.getCurrentViewInvoices().find(
      (inv) => inv.id === invoiceId,
    );
    if (!invoice) return;

    // currentInvoice ใช้สำหรับ row menu / edit เท่านั้น
    this.currentInvoice.set(invoice);
    this.showRowMenu.set(invoiceId);

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const menuWidth = 224,
      menuHeight = 240;
    let top = rect.bottom - 18;
    let left = rect.right - menuWidth + 20;
    if (window.innerHeight - rect.bottom < menuHeight)
      top = rect.top - menuHeight - 4;
    this.menuPosition.set({ top, left });
  }

  closeRowMenu(): void {
    this.showRowMenu.set(null);
  }

  onMenuAction(invoice: Invoice, action: string): void {
  this.closeRowMenu();
  switch (action) {
    case 'ออกใบแจ้งหนี้':
      this.openDetailWithAction(invoice, 'issue');
      break;
    case 'ออกใบแจ้งหนี้ + พิมพ์เอกสาร':
      this.openDetailWithAction(invoice, 'issue_print');
      break;
    case 'ออกใบแจ้งหนี้ + ส่งอีเมล':
      this.openDetailWithAction(invoice, 'issue_email');
      break;
    case 'ยกเลิกใบแจ้งหนี้':
      this.openDocumentModal(invoice, 'cancel_invoice');
      break;
    case 'ลบสัญญา':
      this.deleteContract(invoice);
      break;
    case 'ออกใบลดหนี้':
      this.issueCreditNote(invoice);
      break;
    case 'ออกใบเสร็จใบลดหนี้':
      this.issueReceiptCredit(invoice);
      break;
    case 'พิมพ์เอกสาร (PDF)':
    case 'ส่งทางอีเมล':
      this.showSuccessToast('ดำเนินการ', `กำลังดำเนินการ: ${action}`);
      break;
  }
}

private openDetailWithAction(
  invoice: Invoice,
  action: 'issue' | 'issue_print' | 'issue_email' | 'view',
): void {
  this.showDocumentModal.set(false);
  this.currentDebtForDocument.set(null);
  this.pendingDetailAction.set(action);
  this.currentInvoiceForDetail.set(invoice);
  this.showDetailModal.set(true);
}

  // ===================== HEADER KEBAB MENU =====================
  toggleHeaderMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showHeaderMenu.update((v) => !v);
  }
  closeHeaderMenu(): void {
    this.showHeaderMenu.set(false);
  }
  onHeaderMenuAction(action: string): void {
    this.closeHeaderMenu();
    this.showSuccessToast('ดำเนินการ', `เลือก: ${action}`);
  }

  // ===================== OPEN DOCUMENT MODAL (ปิด detail ก่อนเปิด) =====================
  private openDocumentModal(
    invoice: Invoice,
    documentType: DocumentType,
  ): void {
    // ปิด detail modal ก่อนเสมอ — ไม่ให้ซ้อนกัน
    this.showDetailModal.set(false);
    this.currentInvoiceForDetail.set(null);

    this.currentDebtForDocument.set(this.convertInvoiceToDebt(invoice));
    this.selectedDocumentType.set(documentType);
    this.showDocumentModal.set(true);
  }

  // ===================== ISSUE INVOICE =====================
  issueInvoiceForSingle(invoice: Invoice, print = false, email = false): void {
  const action = email ? 'issue_email' : print ? 'issue_print' : 'issue';
  (window as any).__pendingInvoiceActions = { print, email, originalInvoice: invoice };
  this.openDetailWithAction(invoice, action as any);
}

  issueCreditNote(invoice: Invoice): void {
    (window as any).__pendingInvoiceActions = { originalInvoice: invoice };
    this.openDocumentModal(invoice, 'credit_note');
  }

  issueReceiptCredit(invoice: Invoice | any): void {
    const sourceInvoice = invoice?.originalData
      ? invoice.originalData
      : invoice;
    (window as any).__pendingInvoiceActions = {
      originalInvoice: sourceInvoice,
    };
    this.openDocumentModal(sourceInvoice, 'receipt_credit');
  }

  onDocumentSubmit(formData: any): void {
    const actions = (window as any).__pendingInvoiceActions || {};
    const invoice: Invoice = actions.originalInvoice;
    if (!invoice) {
      this.closeDocumentModal();
      return;
    }

    switch (formData.documentType as DocumentType) {
      case 'invoice': {
        this.state.issueInvoice(invoice.id);
        let msg = 'ออกใบแจ้งหนี้สำเร็จ';
        if (actions.print) msg += ' · กำลังพิมพ์เอกสาร';
        if (actions.email) msg += ' · กำลังส่งอีเมล';
        this.showSuccessToast('ออกใบแจ้งหนี้สำเร็จ', msg);
        break;
      }
      case 'credit_note': {
        const reason =
          formData.cnReasonDescription || formData.reason || 'ออกใบลดหนี้';
        const cn = this.state.issueCreditNote(
          invoice,
          formData.amount || invoice.amount,
          reason,
          formData,
        );
        this.showSuccessToast(
          'ออกใบลดหนี้สำเร็จ',
          `${cn.cnNumber} · ยอดหนี้ถูกปรับลด ฿${cn.amount.toLocaleString()}`,
        );
        this.showHistory.set(true);
        this.activeHistoryTab.set('credit');
        break;
      }
      case 'receipt_credit': {
        const cn: any = (invoice as any).originalData
          ? (invoice as any).originalData
          : invoice;
        if (!cn) {
          this.showSuccessToast('ไม่สำเร็จ', 'ไม่พบใบลดหนี้สำหรับออกใบเสร็จ');
          break;
        }
        this.state.issueReceipt(cn, 'credit_note', formData);
        this.showSuccessToast(
          'ออกใบเสร็จใบลดหนี้สำเร็จ',
          `ออกใบเสร็จใบลดหนี้สำหรับ ${cn.cnNumber || cn.contractNumber}`,
        );
        this.showHistory.set(true);
        this.activeHistoryTab.set('credit');
        break;
      }
      case 'cancel_invoice': {
        this.state.issueCancelInvoice(invoice);
        this.showSuccessToast(
          'ยกเลิกใบแจ้งหนี้สำเร็จ',
          `ใบแจ้งหนี้ ${invoice.contractNumber} ถูกยกเลิกแล้ว`,
        );
        this.showHistory.set(true);
        this.activeHistoryTab.set('invoice');
        break;
      }
    }
    delete (window as any).__pendingInvoiceActions;
    this.closeDocumentModal();
  }

  closeDocumentModal(): void {
    this.showDocumentModal.set(false);
    this.selectedDocumentType.set(null);
    this.currentDebtForDocument.set(null);
  }

  // ===================== CREATE MANUAL INVOICE =====================
  openCreateDrawer(): void {
    this.showCreateDrawer.set(true);
  }

  closeCreateDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  onCreateInvoiceFromModal(data: CreateInvoiceSubmitData): void {
    const newInvoice: Invoice = {
      id: `manual-${Date.now()}`,
      contractNumber: `${data.invoicePrefix}-${data.invoiceNumber}`,
      customerName: data.customerName,
      collectionItem: data.collectionItem || 'N/A',
      amount: data.amount,
      startDate: data.invoiceDate,
      status: 'ready',
    };
    this.state.addReadyInvoice(newInvoice);
    this.state.issueInvoice(newInvoice.id);
    this.showSuccessToast(
      'สร้างใบแจ้งหนี้สำเร็จ',
      `${newInvoice.contractNumber} · ${newInvoice.customerName}`,
    );
    this.closeCreateDrawer();
  }

  // ===================== ROW ACTIONS =====================
  onPreview(invoice: Invoice): void {
  this.openDetailWithAction(invoice, 'view');
}

  closeDetailModal(): void {
  this.showDetailModal.set(false);
  setTimeout(() => {
    if (!this.showDetailModal()) {
      this.currentInvoiceForDetail.set(null);
      this.pendingDetailAction.set('view');
    }
  }, 300);
}

  onIssueInvoiceFromDetail(event: IssueInvoiceEvent): void {
  const invoice = event.invoice;
  this.state.issueInvoice(invoice.id);
  let msg = 'ออกใบแจ้งหนี้สำเร็จ';
  if (event.print) msg += ' · กำลังพิมพ์เอกสาร';
  if (event.email) msg += ' · กำลังส่งอีเมล';
  this.showSuccessToast('ออกใบแจ้งหนี้สำเร็จ', msg);
  delete (window as any).__pendingInvoiceActions;
}

  onInvoiceUpdated(updated: any): void {
    this.state.updateInvoice(updated as Invoice);
    this.showSuccessToast('บันทึกสำเร็จ', 'แก้ไขใบแจ้งหนี้สำเร็จ');
    // อัปเดต signal ให้ detail modal แสดงข้อมูลใหม่
    this.currentInvoiceForDetail.set(updated);
  }

  onEdit(invoice: Invoice): void {
    this.editingInvoice.set(
      'originalData' in invoice && (invoice as any).originalData
        ? { ...((invoice as any).originalData as CreditNote) }
        : { ...invoice },
    );
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingInvoice.set(null);
  }

  onSaveEdit(): void {
    const edited = this.editingInvoice();
    if (!edited) return;
    if (!('cnNumber' in edited)) this.state.updateInvoice(edited as Invoice);
    this.showSuccessToast('บันทึกสำเร็จ', 'บันทึกการแก้ไขสำเร็จ');
    this.closeEditModal();
  }

  getEditContractNumber(): string {
    const e = this.editingInvoice();
    if (!e) return '';
    return 'cnNumber' in e ? e.cnNumber : e.contractNumber;
  }
  getEditCustomerName(): string {
    return this.editingInvoice()?.customerName || '';
  }
  getEditCollectionItem(): string {
    const e = this.editingInvoice();
    if (!e) return '';
    return 'refInvoiceNumber' in e
      ? `อ้างอิง: ${e.refInvoiceNumber}`
      : e.collectionItem;
  }
  getEditAmount(): number {
    return this.editingInvoice()?.amount || 0;
  }
  getEditStartDate(): string {
    const e = this.editingInvoice();
    if (!e) return '';
    return 'date' in e ? e.date : e.startDate;
  }

  setEditContractNumber(v: string): void {
    this.editingInvoice.update((e) =>
      !e
        ? null
        : 'cnNumber' in e
          ? { ...e, cnNumber: v }
          : { ...e, contractNumber: v },
    );
  }
  setEditCustomerName(v: string): void {
    this.editingInvoice.update((e) => (e ? { ...e, customerName: v } : null));
  }
  setEditCollectionItem(v: string): void {
    this.editingInvoice.update((e) =>
      !e
        ? null
        : 'refInvoiceNumber' in e
          ? { ...e, refInvoiceNumber: v.replace('อ้างอิง: ', '') }
          : { ...e, collectionItem: v },
    );
  }
  setEditAmount(v: number): void {
    this.editingInvoice.update((e) => (e ? { ...e, amount: v } : null));
  }
  setEditStartDate(v: string): void {
    this.editingInvoice.update((e) =>
      !e ? null : 'date' in e ? { ...e, date: v } : { ...e, startDate: v },
    );
  }

  onCancel(invoice: Invoice): void {
    this.pendingCancelInvoice.set(invoice);
    this.showConfirmModal.set(true);
  }

  onConfirmCancel(): void {
    const invoice = this.pendingCancelInvoice();
    if (invoice) {
      this.state.issueCancelInvoice(invoice);
      this.showSuccessToast(
        'ยกเลิกสำเร็จ',
        `ใบแจ้งหนี้ ${invoice.contractNumber} ถูกยกเลิกแล้ว`,
      );
      this.showHistory.set(true);
      this.activeHistoryTab.set('invoice');
    }
    this.showConfirmModal.set(false);
    this.pendingCancelInvoice.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelInvoice.set(null);
  }

  deleteContract(invoice: Invoice): void {
    this.state.deleteInvoice(invoice.id);
    this.showSuccessToast('ลบสำเร็จ', `ลบสัญญา ${invoice.contractNumber} แล้ว`);
  }

  // ===================== BULK ACTIONS =====================
  onBulkIssueInvoice(): void {
    const ids = Array.from(this.selectedInvoices());
    ids.forEach((id) => this.state.issueInvoice(id));
    this.showSuccessToast(
      'ออกใบแจ้งหนี้สำเร็จ',
      `ออกใบแจ้งหนี้ ${ids.length} รายการสำเร็จ`,
    );
    this.selectedInvoices.set(new Set());
    this.showBulkActions.set(false);
  }

  onBulkEmail(): void {
    this.showSuccessToast(
      'ส่งอีเมล',
      `กำลังส่งอีเมล ${this.getSelectedCount()} รายการ`,
    );
  }
  onBulkPrint(): void {
    this.showSuccessToast(
      'พิมพ์เอกสาร',
      `กำลังพิมพ์เอกสาร ${this.getSelectedCount()} รายการ`,
    );
  }

  // ===================== HELPERS =====================
  convertInvoiceToDebt(invoice: Invoice): Debt {
    const statusMap: Record<Invoice['status'], Debt['status']> = {
      ready: 'new',
      open: 'warning',
      cancel: 'warning',
    };

    return {
      id: invoice.id,
      description: invoice.collectionItem,
      customerName: invoice.customerName,
      contractFile: invoice.contractNumber + '.pdf',
      amount: invoice.amount,
      dueDate: invoice.startDate,
      overdueDays: 0,
      status: statusMap[invoice.status],
      branchId: invoice.branchId,
    };
  }

  onPrint(invoice: Invoice): void {
    this.showSuccessToast(
      'พิมพ์เอกสาร',
      `กำลังพิมพ์เอกสาร ${invoice.contractNumber}`,
    );
  }
  onEmail(invoice: Invoice): void {
    this.showSuccessToast(
      'ส่งอีเมล',
      `กำลังส่งอีเมล ${invoice.contractNumber}`,
    );
  }
}
