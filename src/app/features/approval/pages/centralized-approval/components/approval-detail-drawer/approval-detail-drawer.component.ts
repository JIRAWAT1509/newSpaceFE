// approval-detail-drawer.component.ts - ดูรายละเอียด + อนุมัติ/ส่งกลับ ในหน้าเดียว
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalRow } from '@core/models/approval.model';
import { Contract } from '@core/models/contract.model';
import { CONTRACT_TYPE_APPROVAL_LABELS } from '@core/models/approval.model';
import { formatDateForDisplay } from '@core/utils/date-utils';
import { ApprovalAuthService } from '@core/services/approval-auth.service';

@Component({
  selector: 'app-approval-detail-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approval-detail-drawer.component.html',
  styleUrl: './approval-detail-drawer.component.css',
})
export class ApprovalDetailDrawerComponent {
  @Input() row: ApprovalRow | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<ApprovalRow>();
  @Output() reject = new EventEmitter<{ row: ApprovalRow; reason: string }>();

  rejectReason = '';

  constructor(public approvalAuth: ApprovalAuthService) {}

  get contract(): Contract | null {
    return this.row?.contract ?? null;
  }

  /** true ถ้าผู้ใช้เป็นผู้อนุมัติและสัญญาอยู่สถานะรอ จึงกดอนุมัติ/ส่งกลับได้ (ทุกฉบับที่เปิดดู) */
  get canAct(): boolean {
    return !!this.row && this.row.approvalStatus === 'waiting';
  }

  getContractTypeLabel(type: string): string {
    return CONTRACT_TYPE_APPROVAL_LABELS[type] || type;
  }

  formatDate(value: unknown): string {
    return formatDateForDisplay(value, 'th-TH');
  }

  getDurationDisplay(c: Contract): string {
    const y = c.DURATION_YEARS ?? 0;
    const m = c.DURATION_MONTHS ?? 0;
    if (y === 0 && m === 0) return '—';
    if (y >= 1) {
      if (m === 0) return `${y} ปี`;
      if (m === 6) return `${y}.5 ปี`;
      return `${y} ปี ${m} เดือน`;
    }
    return `${m} เดือน`;
  }

  getCreatorDisplay(c: Contract): string {
    return c.CONTRACT_CREATOR || (c as any).CREATE_BY || '-';
  }

  onClose(): void {
    this.rejectReason = '';
    this.close.emit();
  }

  onApprove(): void {
    if (this.row) this.approve.emit(this.row);
  }

  onReject(): void {
    if (this.row && this.rejectReason.trim()) {
      this.reject.emit({ row: this.row, reason: this.rejectReason.trim() });
      this.rejectReason = '';
      this.onClose();
    }
  }

  onBackdropClick(): void {
    this.onClose();
  }
}
