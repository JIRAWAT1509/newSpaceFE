// approval.model.ts - View model for Centralized approval page
import { Contract } from './contract.model';

/** สถานะแถว: waiting = รออนุมัติ, approved = อนุมัติแล้ว, rejected = ส่งกลับ/ไม่อนุมัติ (ไม่แสดงในแท็บ) */
export type ApprovalStatusTab = 'waiting' | 'approved' | 'rejected';

export interface ApprovalRow {
  contract: Contract;
  /** ผู้อนุมัติลำดับที่ 1 - name (date) */
  approver1Display: string;
  /** ผู้อนุมัติลำดับที่ 2 */
  approver2Display: string;
  /** ผู้อนุมัติลำดับที่ 3 */
  approver3Display: string;
  /** สถานะสำหรับแท็บ: waiting = รออนุมัติ, approved = อนุมัติแล้ว */
  approvalStatus: ApprovalStatusTab;
  /** สัญญารออยู่ที่ผู้อนุมัติลำดับที่เท่าไหร่ (1, 2, 3) - ใช้เช็คสิทธิ์ว่าคนปัจจุบันกดอนุมัติได้ไหม */
  waitingForApproverLevel?: 1 | 2 | 3;
}

export const CONTRACT_TYPE_APPROVAL_LABELS: Record<string, string> = {
  'LEASE_AGREEMENT': 'สัญญาเช่า',
  'LEASE_RENEWAL': 'ต่ออายุสัญญาเช่า',
  'LEASE_AMENDMENT': 'สัญญาเสริม',
  'DEPOSIT_AGREEMENT': 'สัญญาจอง',
  'QUOTATION_AGREEMENT': 'ใบเสนอราคา',
  'ADDENDUM': 'บันทึก Addendum',
  'OTHER': 'อื่นๆ',
};
