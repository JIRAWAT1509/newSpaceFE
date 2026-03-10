// vendor-table.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VendorContract,
  ContractStatus,
  TYPE_COLORS,
  TYPE_BG,
  getDaysUntil,
  computeStatus
} from '../../../../../../core/models/vendor-contract.model';

@Component({
  selector: 'app-vendor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-table.component.html',
  styleUrl: './vendor-table.component.css'
})
export class VendorTableComponent {
  contracts = input.required<VendorContract[]>();
  showAllColumns = input<boolean>(false);

  viewContract = output<string>();
  editContract = output<string>();
  deleteContract = output<string>();

  getTypeBadgeStyle(type: string): { [key: string]: string } {
    return {
      'background-color': TYPE_BG[type] || '#f1f5f9',
      'color': TYPE_COLORS[type] || '#64748b'
    };
  }

  getStatusClass(contract: VendorContract): string {
    const s = computeStatus(contract);
    switch (s) {
      case 'Active': return 'status-active';
      case 'Expiring': return 'status-expiring';
      case 'Expired': return 'status-expired';
      case 'Draft': return 'status-draft';
      default: return '';
    }
  }

  getStatusLabel(contract: VendorContract): string {
    return computeStatus(contract);
  }

  getDaysUntilEnd(contract: VendorContract): number {
    return getDaysUntil(contract.end);
  }

  getProgressPercent(contract: VendorContract): number {
    const start = new Date(contract.start).getTime();
    const end = new Date(contract.end).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getProgressClass(contract: VendorContract): string {
    const days = getDaysUntil(contract.end);
    if (days < 0) return 'progress-expired';
    if (days <= 30) return 'progress-critical';
    if (days <= 90) return 'progress-warning';
    return 'progress-ok';
  }

  formatValue(value: number): string {
    if (value >= 1000000) {
      return '฿' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '฿' + (value / 1000).toFixed(0) + 'K';
    }
    return '฿' + value.toLocaleString();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onView(id: string): void {
    this.viewContract.emit(id);
  }

  onEdit(id: string): void {
    this.editContract.emit(id);
  }

  onDelete(id: string): void {
    this.deleteContract.emit(id);
  }
}
