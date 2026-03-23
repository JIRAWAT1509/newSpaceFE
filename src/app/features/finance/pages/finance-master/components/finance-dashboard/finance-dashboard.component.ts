// finance-dashboard.component.ts
import { FinanceDocumentModalComponent } from '@shared/components/finance-document-modal/finance-document-modal.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { DocumentType } from '@core/models/finance-document.model';
import { DebtDetailModalComponent } from '@shared/components/debt-detail-modal/debt-detail-modal.component';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStats, Debt, DEBT_STATUS_CONFIG } from '@core/models/finance.model';
import { MOCK_FINANCE_STATS, MOCK_DEBTS, ISSUED_DOCUMENTS } from '@core/data/finance.mock';

interface StatCard {
  label: string;
  color: string;
  icon: string;
  bgGradient?: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  tone?: 'primary' | 'warning' | 'info' | 'success';
}

type SortField = 'description' | 'customerName' | 'contractFile' | 'amount' | 'dueDate' | 'overdueDays' | 'status';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FinanceDocumentModalComponent,
    ConfirmationModalComponent,
    DebtDetailModalComponent,
  ],
  templateUrl: './finance-dashboard.component.html',
  styleUrl: './finance-dashboard.component.css',
})
export class FinanceDashboardComponent implements OnInit {
  stats = signal<FinanceStats>(MOCK_FINANCE_STATS);
  debts = signal<Debt[]>([]);
  statCards = signal<StatCard[]>([]);
  showDocumentModal = signal<boolean>(false);
  showDetailModal = signal<boolean>(false);
  selectedDocumentType = signal<DocumentType | null>(null);

  showConfirmationModal = signal<boolean>(false);
  confirmationTitle = signal<string>('');
  confirmationMessage = signal<string>('');
  pendingAction = signal<{ debt: Debt; documentType: DocumentType } | null>(null);

  sortField = signal<SortField | null>(null);
  sortDirection = signal<SortDirection>(null);

  showDebtMenu = signal<string | null>(null);
  currentDebt = signal<Debt | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  ngOnInit(): void {
    this.loadStats();
    this.loadDebts();
  }

  loadStats(): void {
    const statsData = this.stats();
    const cards: StatCard[] = [
      { label: 'จำนวนรายการทั้งหมด', value: statsData.totalItems, color: '#667eea', icon: 'pi-list', tone: 'primary', change: 2.1, changeLabel: 'vs last month' },
      { label: 'ออกใบแจ้งหนี้แล้ว', value: statsData.invoicesIssued, color: '#43e97b', icon: 'pi-check-circle', tone: 'success', change: 5.3, changeLabel: 'vs last month' },
      { label: 'ออกใบกำกับภาษีแล้ว', value: statsData.taxInvoicesIssued, color: '#4facfe', icon: 'pi-file-check', tone: 'info', change: -1.2, changeLabel: 'vs last month' },
      { label: 'รายการหนี้คงค้างทั้งหมด', value: statsData.totalOutstanding, color: '#fa709a', icon: 'pi-exclamation-triangle', tone: 'warning', change: 0.8, changeLabel: 'vs last month' },
    ];
    this.statCards.set(cards);
  }

  loadDebts(): void {
    const sorted = [...MOCK_DEBTS].sort((a, b) => b.overdueDays - a.overdueDays);
    this.debts.set(sorted);
  }

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
        this.loadDebts();
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

    const sorted = [...this.debts()].sort((a, b) => {
      let aVal: any = a[field];
      let bVal: any = b[field];

      if (field === 'amount' || field === 'overdueDays') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (field === 'dueDate') {
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

    this.debts.set(sorted);
  }

  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return 'pi-sort-alt';
    return this.sortDirection() === 'asc' ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down';
  }

  toggleDebtMenu(debtId: string, event: MouseEvent): void {
    if (this.showDebtMenu() === debtId) {
      this.closeDebtMenu();
      return;
    }

    const debt = this.debts().find((d) => d.id === debtId);
    if (!debt) return;

    this.currentDebt.set(debt);
    this.showDebtMenu.set(debtId);

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const menuWidth = 224;
    const menuHeight = 200;

    let top = rect.bottom - 18;
    let left = rect.right - menuWidth + 20;

    if (window.innerHeight - rect.bottom < menuHeight) {
      top = rect.top - menuHeight - 4;
    }

    this.menuPosition.set({ top, left });
  }

  closeDebtMenu(): void {
    this.showDebtMenu.set(null);
  }

  checkDocumentRequirement(debt: Debt, documentType: DocumentType): boolean {
    const issued = ISSUED_DOCUMENTS[debt.id];
    if (!issued) return true;

    switch (documentType) {
      case 'receipt_credit': return issued.hasCreditNote;
      case 'receipt_invoice': return issued.hasInvoice;
      case 'receipt_cancel': return issued.hasCancelInvoice || false;
      default: return true;
    }
  }

  onDebtMenuAction(debt: Debt, action: string): void {
    let documentType: DocumentType | null = null;

    switch (action) {
      case 'ออกใบลดหนี้':       documentType = 'credit_note';    break;
      case 'ออกใบเสร็จใบลดหนี้': documentType = 'receipt_credit'; break;
      case 'ออกใบเสร็จใบยกเลิก': documentType = 'receipt_cancel'; break;
      case 'ออกใบยกเลิก':       documentType = 'cancel_invoice'; break;
      case 'ออกใบเสร็จ':        documentType = 'receipt_invoice'; break;
    }

    this.closeDebtMenu();

    if (!documentType) return;

    if (!this.checkDocumentRequirement(debt, documentType)) {
      const docName = this.getRequiredDocumentName(documentType);
      this.confirmationTitle.set(`ยังไม่เคยออก${docName}`);
      this.confirmationMessage.set(`คุณยังไม่เคยออก${docName}สำหรับรายการนี้\nต้องการออก${docName}ก่อนหรือไม่?`);
      this.pendingAction.set({ debt, documentType });
      this.showConfirmationModal.set(true);
    } else {
      this.openDocumentModal(debt, documentType);
    }
  }

  getRequiredDocumentName(documentType: DocumentType): string {
    switch (documentType) {
      case 'receipt_credit':  return 'ใบลดหนี้';
      case 'receipt_invoice': return 'ใบแจ้งหนี้';
      case 'receipt_cancel':  return 'ใบยกเลิก';
      default:                return 'เอกสาร';
    }
  }

  openDocumentModal(debt: Debt, documentType: DocumentType): void {
    this.currentDebt.set(debt);
    this.selectedDocumentType.set(documentType);
    this.showDocumentModal.set(true);
  }

  onConfirmationConfirm(): void {
    const pending = this.pendingAction();
    if (pending) {
      let requiredType: DocumentType;
      switch (pending.documentType) {
        case 'receipt_credit':  requiredType = 'credit_note';    break;
        case 'receipt_invoice': requiredType = 'invoice';        break;
        case 'receipt_cancel':  requiredType = 'cancel_invoice'; break;
        default:                requiredType = 'invoice';
      }
      this.openDocumentModal(pending.debt, requiredType);
    }
    this.showConfirmationModal.set(false);
    this.pendingAction.set(null);
  }

  onConfirmationCancel(): void {
    this.showConfirmationModal.set(false);
    this.pendingAction.set(null);
    this.currentDebt.set(null);
  }

  onDocumentSubmit(formData: any): void {
    const debt = this.currentDebt();
    if (debt && ISSUED_DOCUMENTS[debt.id]) {
      if (formData.documentType === 'credit_note')     ISSUED_DOCUMENTS[debt.id].hasCreditNote    = true;
      if (formData.documentType === 'invoice')         ISSUED_DOCUMENTS[debt.id].hasInvoice       = true;
      if (formData.documentType === 'cancel_invoice')  ISSUED_DOCUMENTS[debt.id].hasCancelInvoice = true;
    }
    alert(`สำเร็จ: ${formData.documentType}`);
    this.closeDocumentModal();
  }

  closeDocumentModal(): void {
    this.showDocumentModal.set(false);
    this.selectedDocumentType.set(null);
    this.currentDebt.set(null);
  }

  getStatusConfig(status: string) {
    return DEBT_STATUS_CONFIG[status as keyof typeof DEBT_STATUS_CONFIG];
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  onViewContract(debt: Debt): void {
    alert(`Mock: View ${debt.contractFile}`);
  }

  onSendReminder(debt: Debt): void {
    alert(`Mock: Send reminder to ${debt.customerName}`);
  }

  onViewDetails(debt: Debt): void {
    this.currentDebt.set(debt);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      if (!this.showDetailModal()) this.currentDebt.set(null);
    }, 300);
  }

  isPositiveChange(change: number): boolean {
    return change > 0;
  }

  getChangeIcon(change: number): string {
    if (change > 0) return 'pi-arrow-up';
    if (change < 0) return 'pi-arrow-down';
    return 'pi-minus';
  }
}
