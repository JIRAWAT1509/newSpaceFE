// approval-notification.service.ts - จำนวนเอกสารรออนุมัติ สำหรับแสดง badge ที่ไอคอน MY TASK
import { Injectable, signal } from '@angular/core';
import { ContractService } from '@core/services/contract.service';
import { ApprovalDateRangeService } from '@core/services/approval-date-range.service';
import { getMockWaitingContracts } from '@core/data/approval.mock';

@Injectable({
  providedIn: 'root',
})
export class ApprovalNotificationService {
  /** จำนวนเอกสารรออนุมัติ (หน้าอนุมัติจะอัปเดตค่านี้ หรือโหลดจาก refreshPendingCount ทุกหน้า) */
  private pendingCount = signal<number>(0);

  readonly count = this.pendingCount.asReadonly();

  constructor(
    private contractService: ContractService,
    private approvalDateRangeService: ApprovalDateRangeService
  ) {}

  setPendingCount(value: number): void {
    this.pendingCount.set(Math.max(0, value));
  }

  /**
   * โหลด/อัปเดตจำนวนรออนุมัติจากสัญญาทั้งหมด (contracts + mock) ใช้แสดง badge MY TASK ทุกหน้า
   */
  refreshPendingCount(): void {
    const contracts = this.contractService.getContracts();
    const withMock = [...contracts, ...getMockWaitingContracts()];
    const dateRange = this.approvalDateRangeService;
    let count = 0;
    for (const c of withMock) {
      const isApproved =
        c.STATUS === 'ACTIVE' ||
        c.STATUS === 'COMPLETED' ||
        c.STATUS === 'EXPIRED' ||
        c.STATUS === 'TERMINATED';
      if (isApproved) continue;
      const dateStr =
        c.CONTRACT_DATE ||
        c.ISSUE_DATE ||
        c.RECORD_DATE ||
        c.APPROVAL_DATE ||
        '';
      if (!dateRange.isDateInRange(dateStr)) continue;
      count++;
    }
    this.pendingCount.set(count);
  }
}
