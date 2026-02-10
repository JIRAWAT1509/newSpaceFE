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

  // ✅ เพิ่ม signals สำหรับ menu positioning
  currentReceipt = signal<Receipt | null>(null);
  menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

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
      const menuHeight = 300; // ประมาณ

      // ตรวจสอบว่ามีพื้นที่ทางขวาหรือไม่
      const spaceOnRight = window.innerWidth - rect.right;
      const spaceOnLeft = rect.left;

      // ตรวจสอบว่ามีพื้นที่ด้านล่างหรือไม่
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom -20;
      let left = rect.left - menuWidth + 20;

      // ถ้าพื้นที่ล่างไม่พอ ให้แสดงด้านบน
      if (spaceBelow < menuHeight) {
        top = rect.top - menuHeight - 4;
      }

      this.menuPosition.set({ top, left });
    }
  }
}

  isRowMenuOpen(receiptId: string): boolean {
    return this.showRowMenu() === receiptId;
  }

  // ✅ แก้ไข closeRowMenu
  closeRowMenu(): void {
    this.showRowMenu.set(null);
    this.currentReceipt.set(null);
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
