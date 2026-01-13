// invoice-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '@core/models/finance.model';
import { MOCK_INVOICES } from '@core/data/finance.mock';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css'
})
export class InvoiceManagementComponent implements OnInit {
  invoices = signal<Invoice[]>([]);
  selectedInvoices = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);
  showActionDropdown = signal<boolean>(false);
  showCreateDrawer = signal<boolean>(false);

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
    alert(`Mock: ออกใบแจ้งหนี้ ${count} รายการ\nตัวเลือก: ${option}`);
    this.showActionDropdown.set(false);
  }

  openCreateDrawer(): void {
    this.showCreateDrawer.set(true);
  }

  closeCreateDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  onCreateInvoice(): void {
    alert('Mock: สร้างใบแจ้งหนี้สำเร็จ');
    this.closeCreateDrawer();
  }

  // Row Actions
  onPreview(invoice: Invoice): void {
    console.log('Preview:', invoice);
    alert(`Mock: Preview ${invoice.contractNumber}`);
  }

  onEdit(invoice: Invoice): void {
    console.log('Edit:', invoice);
    alert(`Mock: Edit ${invoice.contractNumber}`);
  }

  onCancel(invoice: Invoice): void {
    console.log('Cancel:', invoice);
    if (confirm(`ยกเลิกใบแจ้งหนี้ ${invoice.contractNumber}?`)) {
      alert('Mock: ยกเลิกสำเร็จ');
    }
  }
}
