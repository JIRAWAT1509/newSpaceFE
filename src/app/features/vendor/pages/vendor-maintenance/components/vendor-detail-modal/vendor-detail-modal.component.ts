// vendor-detail-modal.component.ts
import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VendorContract,
  PMTask,
  TYPE_COLORS,
  TYPE_BG,
  getDaysUntil,
  computeStatus
} from '../../../../../../core/models/vendor-contract.model';

type TabId = 'overview' | 'vendor' | 'financial' | 'pm' | 'history';

@Component({
  selector: 'app-vendor-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-detail-modal.component.html',
  styleUrl: './vendor-detail-modal.component.css'
})
export class VendorDetailModalComponent {
  contract = input.required<VendorContract>();
  pmTasks = input.required<PMTask[]>();

  close = output<void>();
  edit = output<string>();

  activeTab = signal<TabId>('overview');

  tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'financial', label: 'Financial' },
    { id: 'pm', label: 'PM Schedule' },
    { id: 'history', label: 'History' }
  ];

  linkedPMTasks = computed(() => {
    return this.pmTasks().filter(t => t.linked === this.contract().id);
  });

  getTypeBadgeStyle(): { [key: string]: string } {
    const type = this.contract().type;
    return {
      'background-color': TYPE_BG[type] || '#f1f5f9',
      'color': TYPE_COLORS[type] || '#64748b'
    };
  }

  getStatusClass(): string {
    const s = computeStatus(this.contract());
    switch (s) {
      case 'Active': return 'status-active';
      case 'Expiring': return 'status-expiring';
      case 'Expired': return 'status-expired';
      case 'Draft': return 'status-draft';
      default: return '';
    }
  }

  getStatusLabel(): string {
    return computeStatus(this.contract());
  }

  getDaysUntilEnd(): number {
    return getDaysUntil(this.contract().end);
  }

  formatCurrency(value: number): string {
    return '฿' + value.toLocaleString();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getVendorInitial(): string {
    return this.contract().vendor.charAt(0).toUpperCase();
  }

  getPMStatusClass(status: string): string {
    switch (status) {
      case 'Overdue': return 'pm-overdue';
      case 'Due Soon': return 'pm-due-soon';
      case 'Scheduled': return 'pm-scheduled';
      case 'Completed': return 'pm-completed';
      default: return '';
    }
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.edit.emit(this.contract().id);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
