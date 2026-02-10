// invoice-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '@core/models/finance.model';
import { MOCK_INVOICES } from '@core/data/finance.mock';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent, WarningModalComponent],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css'
})
export class InvoiceManagementComponent implements OnInit {
  invoices = signal<Invoice[]>([]);
  selectedInvoices = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);
  showActionDropdown = signal<boolean>(false);
  showCreateDrawer = signal<boolean>(false);

  // Modal state
  showConfirmModal = signal<boolean>(false);
  pendingCancelInvoice = signal<Invoice | null>(null);
  showMessageModal = signal<boolean>(false);
  messageTitle = signal<string>('');
  messageText = signal<string>('');

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoices.set(MOCK_INVOICES);
  }

  // Selection Management
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
      this.invoices().forEach(inv => selected.add(inv.id));
    }

    this.selectedInvoices.set(selected);
    this.showBulkActions.set(selected.size > 0);
  }

  isSelected(invoiceId: string): boolean {
    return this.selectedInvoices().has(invoiceId);
  }

  isAllSelected(): boolean {
    return this.selectedInvoices().size === this.invoices().length && this.invoices().length > 0;
  }

  getSelectedCount(): number {
    return this.selectedInvoices().size;
  }

  // Actions
  toggleActionDropdown(): void {
    this.showActionDropdown.update(v => !v);
  }

  onIssueInvoice(option: string): void {
    const count = this.getSelectedCount();
    console.log(`Issue invoice (${option}):`, Array.from(this.selectedInvoices()));
    this.showMessage('ออกใบแจ้งหนี้สำเร็จ', `ออกใบแจ้งหนี้ ${count} รายการ\nตัวเลือก: ${option}`);
    this.showActionDropdown.set(false);
  }

  openCreateDrawer(): void {
    this.showCreateDrawer.set(true);
  }

  closeCreateDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  onCreateInvoice(): void {
    this.showMessage('สำเร็จ', 'สร้างใบแจ้งหนี้สำเร็จ');
    this.closeCreateDrawer();
  }

  // Row Actions
  onPreview(invoice: Invoice): void {
    console.log('Preview:', invoice);
    this.showMessage('ดูตัวอย่าง', `กำลังแสดงตัวอย่างใบแจ้งหนี้ ${invoice.contractNumber}`);
  }

  onEdit(invoice: Invoice): void {
    console.log('Edit:', invoice);
    this.showMessage('แก้ไข', `กำลังเปิดแบบฟอร์มแก้ไขใบแจ้งหนี้ ${invoice.contractNumber}`);
  }

  onCancel(invoice: Invoice): void {
    console.log('Cancel:', invoice);
    this.pendingCancelInvoice.set(invoice);
    this.showConfirmModal.set(true);
  }

  onConfirmCancel(): void {
    const invoice = this.pendingCancelInvoice();
    if (invoice) {
      this.showMessage('ยกเลิกสำเร็จ', `ใบแจ้งหนี้ ${invoice.contractNumber} ถูกยกเลิกแล้ว`);
    }
    this.showConfirmModal.set(false);
    this.pendingCancelInvoice.set(null);
  }

  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.pendingCancelInvoice.set(null);
  }

  showMessage(title: string, message: string): void {
    this.messageTitle.set(title);
    this.messageText.set(message);
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
  }
}
