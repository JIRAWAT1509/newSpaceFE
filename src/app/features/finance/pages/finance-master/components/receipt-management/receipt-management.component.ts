// receipt-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Receipt } from '@core/models/finance.model';
import { MOCK_RECEIPTS } from '@core/data/finance.mock';

@Component({
  selector: 'app-receipt-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-management.component.html',
  styleUrl: './receipt-management.component.css'
})
export class ReceiptManagementComponent implements OnInit {
  activeSubTab = signal<string>('issue');
  receipts = signal<Receipt[]>([]);
  selectedReceipts = signal<Set<string>>(new Set());
  showBulkActions = signal<boolean>(false);
  showRowMenu = signal<string | null>(null);

  subTabs = [
    { id: 'issue', label: 'การออกใบแจ้งหนี้' },
    { id: 'receipt', label: 'การออกใบเสร็จหรือ เอกสารอื่นๆ' }
  ];

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.receipts.set(MOCK_RECEIPTS);
  }

  // Sub-tab Management
  setActiveSubTab(tabId: string): void {
    this.activeSubTab.set(tabId);
  }

  isActiveSubTab(tabId: string): boolean {
    return this.activeSubTab() === tabId;
  }

  // Selection Management
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

  // Row Menu
  toggleRowMenu(receiptId: string): void {
    if (this.showRowMenu() === receiptId) {
      this.showRowMenu.set(null);
    } else {
      this.showRowMenu.set(receiptId);
    }
  }

  isRowMenuOpen(receiptId: string): boolean {
    return this.showRowMenu() === receiptId;
  }

  closeRowMenu(): void {
    this.showRowMenu.set(null);
  }

  // Row Actions
  onPrint(receipt: Receipt): void {
    console.log('Print:', receipt);
    alert(`Mock: พิมพ์เอกสาร ${receipt.contractNumber}`);
  }

  onEmail(receipt: Receipt): void {
    console.log('Email:', receipt);
    alert(`Mock: ส่งอีเมล ${receipt.contractNumber}`);
  }

  onMenuAction(receipt: Receipt, action: string): void {
    console.log(`Action ${action}:`, receipt);
    alert(`Mock: ${action} - ${receipt.contractNumber}`);
    this.closeRowMenu();
  }

  // Bulk Actions
  onBulkEmail(): void {
    const count = this.getSelectedCount();
    alert(`Mock: ส่งอีเมล ${count} รายการ`);
  }

  onBulkPrint(): void {
    const count = this.getSelectedCount();
    alert(`Mock: พิมพ์เอกสาร ${count} รายการ`);
  }

  onBulkAction(): void {
    const count = this.getSelectedCount();
    alert(`Mock: ดำเนินการ ${count} รายการ`);
  }
}
