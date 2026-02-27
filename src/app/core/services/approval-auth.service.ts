// approval-auth.service.ts - สิทธิ์ผู้อนุมัติ (ใครเป็นผู้อนุมัติลำดับที่เท่าไหร่)
import { Injectable, signal } from '@angular/core';

export type ApproverLevel = 1 | 2 | 3;

@Injectable({
  providedIn: 'root',
})
export class ApprovalAuthService {
  /** ลำดับผู้อนุมัติของผู้ใช้ปัจจุบัน (1, 2, หรือ 3) - ตั้งจาก login/profile เมื่อมีระบบล็อกอิน */
  private currentLevel = signal<ApproverLevel>(2);

  /** ค่าที่อ่านได้ (สำหรับใช้ใน template / effect) */
  readonly currentApproverLevel = this.currentLevel.asReadonly();

  /** ตั้งลำดับผู้อนุมัติของ current user (จาก login/profile หรือใช้สำหรับทดสอบ) */
  setCurrentApproverLevel(level: ApproverLevel): void {
    this.currentLevel.set(level);
  }

  /** อ่านลำดับผู้อนุมัติของ current user */
  getCurrentApproverLevel(): ApproverLevel {
    return this.currentLevel();
  }

  /** เช็คว่าผู้ใช้ปัจจุบันมีสิทธิ์อนุมัติ/ส่งกลับ row นี้ไหม (ต้องเป็นคนที่รออยู่ที่ลำดับนี้) */
  canActOnRow(waitingForApproverLevel: 1 | 2 | 3 | undefined): boolean {
    if (waitingForApproverLevel == null) return false;
    return this.currentLevel() === waitingForApproverLevel;
  }
}
