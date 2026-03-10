// centralized-approval.component.ts - ข้อมูลสัญญารออนุมัติ (ทุกอย่างจบในหน้าเดียว)
import { Component, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { MultiSelect } from 'primeng/multiselect';
import { ContractService } from '@core/services/contract.service';
import { ApprovalDateRangeService } from '@core/services/approval-date-range.service';
import { ApprovalNotificationService } from '@core/services/approval-notification.service';
import { ApprovalAuthService } from '@core/services/approval-auth.service';
import { Contract } from '@core/models/contract.model';
import {
  ApprovalRow,
  ApprovalStatusTab,
  CONTRACT_TYPE_APPROVAL_LABELS,
} from '@core/models/approval.model';
import { formatDateForDisplay } from '@core/utils/date-utils';
import { getMockWaitingContracts } from '@core/data/approval.mock';
import { ApprovalDetailDrawerComponent } from './components/approval-detail-drawer/approval-detail-drawer.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-centralized-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePicker,
    DialogModule,
    MultiSelect,
    ApprovalDetailDrawerComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './centralized-approval.component.html',
  styleUrl: './centralized-approval.component.css',
})
export class CentralizedApprovalComponent implements OnInit {
  activeTab = signal<ApprovalStatusTab>('waiting');

  // ช่วงวันที่ (อยู่เฉพาะในหน้าอนุมัติ)
  dateRangeFrom: Date | null = null;
  dateRangeTo: Date | null = null;

  // Drawer: รายละเอียด + อนุมัติ/ส่งกลับ ในหน้าเดียว (ไม่เด้งไปหน้าอื่น)
  drawerOpen = signal<boolean>(false);
  selectedRow = signal<ApprovalRow | null>(null);

  // ป๊อปอัพเหตุผลส่งกลับ/ไม่อนุมัติ (Return / Reject)
  showReasonDialog = false;
  reasonDialogType: 'return' | 'reject' = 'return';
  rowForReason: ApprovalRow | null = null;
  reasonDialogText = '';
  get reasonDialogTitle(): string {
    return this.reasonDialogType === 'return' ? 'ส่งกลับสัญญา' : 'ไม่อนุมัติสัญญา';
  }

  // Filters (ไม่มีสาระ - มีแค่ สาขา, ประเภทเอกสาร, แสดงเอกสารของตนเอง)
  selectedBranch = signal<string>('');
  showMyDocumentsOnly = signal<boolean>(false);
  /** รายการประเภทเอกสารที่เลือก */
  selectedDocTypeIds = signal<string[]>([
    'quotation',
    'booking',
    'lease',
    'lease_renewal',
    'amendment',
    'discount',
    'record_renewal',
    'addendum',
  ]);
  searchKeyword = signal<string>('');

  /** ตัวเลือกประเภทเอกสาร ตรงตามต้นฉบับ (รวม บันทึกแนบท้ายต่ออายุสัญญา) */
  docTypeOptions: { id: string; label: string }[] = [
    { id: 'quotation', label: 'ใบเสนอราคา' },
    { id: 'booking', label: 'สัญญาจอง' },
    { id: 'lease', label: 'สัญญาเช่า' },
    { id: 'lease_renewal', label: 'ต่ออายุสัญญาเช่า' },
    { id: 'amendment', label: 'สัญญาเสริม' },
    { id: 'discount', label: 'สัญญาส่วนลด' },
    { id: 'record_renewal', label: 'บันทึกแนบท้ายต่ออายุสัญญา' },
    { id: 'addendum', label: 'บันทึก Addendum' },
  ];

  /** เช็คว่า CONTRACT_TYPE ตรงกับ doc type id ที่เลือกหรือไม่ (ADDENDUM ตรงกับทั้ง record_renewal และ addendum) */
  private contractTypeMatchesDocId(contractType: string, docId: string): boolean {
    const typeToIds: Record<string, string[]> = {
      QUOTATION_AGREEMENT: ['quotation'],
      DEPOSIT_AGREEMENT: ['booking'],
      LEASE_AGREEMENT: ['lease'],
      LEASE_RENEWAL: ['lease_renewal'],
      LEASE_AMENDMENT: ['amendment'],
      ADDENDUM: ['addendum', 'record_renewal'],
      OTHER: ['discount'],
    };
    const ids = typeToIds[contractType];
    return ids ? ids.includes(docId) : false;
  }

  branches = signal<{ id: string; name: string }[]>([
    { id: '', name: '-- ทุกสาขา --' },
    { id: 'ST03', name: 'อาคารชินวัตร ทาวเวอร์ 3' },
    { id: 'WBP1', name: 'Warehouse Bangphee 1' },
    { id: 'WBP2', name: 'Warehouse Bangphee 2' },
    { id: 'BRANCH-BKK-01', name: 'สาขากรุงเทพ 01' },
  ]);

  private allContracts = signal<Contract[]>([]);
  private approvalRows = signal<ApprovalRow[]>([]);

  /** สัญญาที่ผู้ใช้กดอนุมัติแล้วใน session นี้ (จะย้ายไปแท็บ Approved) */
  private approvedContractIds = signal<Set<string>>(new Set());
  /** สัญญาที่ผู้ใช้กดส่งกลับ/ไม่อนุมัติแล้ว (จะหายจากรายการรอ) */
  private rejectedContractIds = signal<Set<string>>(new Set());

  /** แถวหลังรวมกับสถานะที่ผู้ใช้กดอนุมัติ/ส่งกลับแล้ว */
  private effectiveApprovalRows = computed<ApprovalRow[]>(() => {
    const rows = this.approvalRows();
    const approved = this.approvedContractIds();
    const rejected = this.rejectedContractIds();
    return rows.map((r) => {
      const id = r.contract.CONTRACT_ID;
      if (approved.has(id)) return { ...r, approvalStatus: 'approved' as const };
      if (rejected.has(id)) return { ...r, approvalStatus: 'rejected' as const };
      return r;
    });
  });

  filteredRows = computed<ApprovalRow[]>(() => {
    const tab = this.activeTab();
    let rows = this.effectiveApprovalRows().filter(
      (r) => r.approvalStatus === tab && r.approvalStatus !== 'rejected'
    );

    // Filter by date range (from header)
    rows = rows.filter((r) =>
      this.approvalDateRangeService.isDateInRange(
        r.contract.CONTRACT_DATE ||
          r.contract.ISSUE_DATE ||
          r.contract.RECORD_DATE ||
          r.contract.APPROVAL_DATE
      )
    );

    const branch = this.selectedBranch();
    if (branch) {
      rows = rows.filter((r) => r.contract.BRANCH_CODE === branch);
    }

    if (this.showMyDocumentsOnly()) {
      const currentUser = 'admin@space.com';
      rows = rows.filter(
        (r) =>
          (r.contract as any).CREATE_BY === currentUser ||
          r.contract.CONTRACT_CREATOR === 'SPACE'
      );
    }

    const selectedTypes = this.selectedDocTypeIds();
    if (selectedTypes.length > 0) {
      rows = rows.filter((r) =>
        selectedTypes.some((id) =>
          this.contractTypeMatchesDocId(r.contract.CONTRACT_TYPE, id)
        )
      );
    }

    const kw = this.searchKeyword().trim().toLowerCase();
    if (kw) {
      rows = rows.filter(
        (r) =>
          r.contract.CONTRACT_NUMBER?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_TH?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_EN?.toLowerCase().includes(kw) ||
          r.contract.BUSINESS_NAME?.toLowerCase().includes(kw) ||
          r.contract.CUSTOMER_ID?.toLowerCase().includes(kw)
      );
    }

    return rows;
  });

  /** จำนวนเอกสารรออนุมัติ (ใช้แสดง badge ที่ไอคอน MY TASK ใน header) */
  waitingCountForBadge = computed(() => {
    let rows = this.effectiveApprovalRows().filter((r) => r.approvalStatus === 'waiting');
    rows = rows.filter((r) =>
      this.approvalDateRangeService.isDateInRange(
        r.contract.CONTRACT_DATE ||
          r.contract.ISSUE_DATE ||
          r.contract.RECORD_DATE ||
          r.contract.APPROVAL_DATE
      )
    );
    const branch = this.selectedBranch();
    if (branch) rows = rows.filter((r) => r.contract.BRANCH_CODE === branch);
    if (this.showMyDocumentsOnly()) {
      const currentUser = 'admin@space.com';
      rows = rows.filter(
        (r) =>
          (r.contract as any).CREATE_BY === currentUser ||
          r.contract.CONTRACT_CREATOR === 'SPACE'
      );
    }
    const selectedTypes = this.selectedDocTypeIds();
    if (selectedTypes.length > 0) {
      rows = rows.filter((r) =>
        selectedTypes.some((id) =>
          this.contractTypeMatchesDocId(r.contract.CONTRACT_TYPE, id)
        )
      );
    }
    const kw = this.searchKeyword().trim().toLowerCase();
    if (kw) {
      rows = rows.filter(
        (r) =>
          r.contract.CONTRACT_NUMBER?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_TH?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_EN?.toLowerCase().includes(kw) ||
          r.contract.BUSINESS_NAME?.toLowerCase().includes(kw) ||
          r.contract.CUSTOMER_ID?.toLowerCase().includes(kw)
      );
    }
    return rows.length;
  });

  constructor(
    private contractService: ContractService,
    private approvalDateRangeService: ApprovalDateRangeService,
    private approvalNotificationService: ApprovalNotificationService,
    public approvalAuth: ApprovalAuthService
  ) {
    // อัปเดตจำนวนรออนุมัติให้ header แสดง badge
    effect(() => {
      this.approvalNotificationService.setPendingCount(this.waitingCountForBadge());
    });
  }

  ngOnInit(): void {
    const contracts = this.contractService.getContracts();
    const withMockWaiting = [...contracts, ...getMockWaitingContracts()];
    this.allContracts.set(withMockWaiting);
    this.approvalRows.set(this.buildApprovalRows(withMockWaiting));
    this.dateRangeFrom = this.approvalDateRangeService.getFrom();
    this.dateRangeTo = this.approvalDateRangeService.getTo();
  }

  onDateRangeFromChange(value: Date | null): void {
    this.dateRangeFrom = value;
    this.approvalDateRangeService.setFrom(value);
  }

  onDateRangeToChange(value: Date | null): void {
    this.dateRangeTo = value;
    this.approvalDateRangeService.setTo(value);
  }

  private buildApprovalRows(contracts: Contract[]): ApprovalRow[] {
    const names = ['WANTANAD', 'PORNSARUNS', 'SPACE, Dlam', 'Oranee Thananut', 'สมชาย ใจดี', 'น.ส. สมหญิง'];
    return contracts.map((c) => {
      const isApproved =
        c.STATUS === 'ACTIVE' || c.STATUS === 'COMPLETED' || c.STATUS === 'EXPIRED' || c.STATUS === 'TERMINATED';
      const status: ApprovalStatusTab = isApproved ? 'approved' : 'waiting';
      const d = c.APPROVAL_DATE
        ? formatDateForDisplay(c.APPROVAL_DATE, 'th-TH').replace(/\s/g, '')
        : '';
      const d2 = c.RECORD_DATE
        ? formatDateForDisplay(c.RECORD_DATE, 'th-TH').replace(/\s/g, '')
        : '';
      const n1 = names[Math.abs(this.hash(c.CONTRACT_ID)) % names.length];
      const n2 = names[(Math.abs(this.hash(c.CONTRACT_ID)) + 1) % names.length];
      const n3 = names[(Math.abs(this.hash(c.CONTRACT_ID)) + 2) % names.length];
      let waitingForApproverLevel: 1 | 2 | 3 | undefined;
      if (status === 'waiting') {
        const cAny = c as any;
        if (cAny.APPROVER_1_AT != null && cAny.APPROVER_1_AT !== '') {
          if (cAny.APPROVER_2_AT == null || cAny.APPROVER_2_AT === '') waitingForApproverLevel = 2;
          else if (cAny.APPROVER_3_AT == null || cAny.APPROVER_3_AT === '') waitingForApproverLevel = 3;
          else waitingForApproverLevel = 3;
        } else {
          waitingForApproverLevel = 1;
        }
        // Mock: ถ้า contract ไม่มีฟิลด์ผู้อนุมัติ แจก 1,2,3 ตาม CONTRACT_ID
        if (!('APPROVER_1_AT' in c) && !('APPROVER_2_AT' in c)) {
          waitingForApproverLevel = (1 + (Math.abs(this.hash(c.CONTRACT_ID)) % 3)) as 1 | 2 | 3;
        }
      }
      return {
        contract: c,
        approver1Display: status === 'approved' ? `${n1} (${d || d2})` : n1,
        approver2Display: status === 'approved' ? `${n2} (${d2 || d})` : n2,
        approver3Display: n3,
        approvalStatus: status,
        waitingForApproverLevel,
      };
    });
  }

  setTab(tab: ApprovalStatusTab): void {
    this.activeTab.set(tab);
  }

  onSearch(): void {
    // Filtering is reactive via computed
  }

  getContractTypeLabel(type: string): string {
    return CONTRACT_TYPE_APPROVAL_LABELS[type] || type;
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

  viewDetail(row: ApprovalRow): void {
    this.selectedRow.set(row);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedRow.set(null);
  }

  onApprove(row: ApprovalRow): void {
    const id = row.contract.CONTRACT_ID;
    this.approvedContractIds.update((set) => new Set([...set, id]));
    this.closeDrawer();
  }

  /** อนุมัติจากปุ่มในตาราง (ไม่เปิด drawer) */
  onApproveFromTable(row: ApprovalRow): void {
    this.onApprove(row);
  }

  /** เปิดป๊อปอัพกรอกเหตุผล (Return หรือ Reject) */
  openReasonDialog(row: ApprovalRow, type: 'return' | 'reject'): void {
    this.rowForReason = row;
    this.reasonDialogType = type;
    this.reasonDialogText = '';
    this.showReasonDialog = true;
  }

  /** ยืนยันส่งกลับ/ไม่อนุมัติ หลังกรอกเหตุผล */
  confirmReasonDialog(): void {
    if (!this.reasonDialogText.trim() || !this.rowForReason) return;
    const id = this.rowForReason.contract.CONTRACT_ID;
    this.rejectedContractIds.update((set) => new Set([...set, id]));
    this.onReject({ row: this.rowForReason, reason: this.reasonDialogText.trim() });
    this.closeReasonDialog();
  }

  closeReasonDialog(): void {
    this.showReasonDialog = false;
    this.rowForReason = null;
    this.reasonDialogText = '';
  }

  onReject(payload: { row: ApprovalRow; reason: string }): void {
    // TODO: call API with payload.reason เมื่อต่อ backend
    const id = payload.row.contract.CONTRACT_ID;
    this.rejectedContractIds.update((set) => new Set([...set, id]));
    this.closeDrawer();
  }

  getRowStatusClass(row: ApprovalRow): string {
    return row.approvalStatus === 'approved' ? 'cell-approved' : 'cell-waiting';
  }

  /** คืน class พื้นหลังแต่ละเซลล์ผู้อนุมัติ: อนุมัติแล้ว = เขียว, รออนุมัติ = เหลือง */
  getApproverCellClass(row: ApprovalRow, level: 1 | 2 | 3): string {
    const s = this.getApproverColumnStatus(row, level);
    if (s === 'done') return 'cell-approver-done';
    return 'cell-approver-pending';
  }

  /** true ถ้าผู้ใช้ปัจจุบันเป็นผู้อนุมัติลำดับที่รออยู่ สามารถกด Approve/Reject/Return ได้ */
  canActOnRow(row: ApprovalRow): boolean {
    return this.approvalAuth.canActOnRow(row.waitingForApproverLevel);
  }

  /** true ถ้าผู้ใช้ปัจจุบันเป็นผู้อนุมัติระดับ level จึงกดแอคชันในคอลัมน์นี้ได้ (ทุกฉบับในคอลัมน์ของตัวเอง) */
  canActOnColumn(_row: ApprovalRow, level: 1 | 2 | 3): boolean {
    return this.approvalAuth.getCurrentApproverLevel() === level;
  }

  /** แถวใน Waiting ที่ผู้ใช้มีสิทธิ์อนุมัติได้ (ทุกฉบับในคอลัมน์ของตัวเอง = ทุกรายการ) */
  approvableRowsCount = computed(() => {
    if (this.activeTab() !== 'waiting') return 0;
    return this.filteredRows().length;
  });

  /** จำนวนสำหรับแสดงบนแท็บ (ใช้ filter เดียวกับ filteredRows แต่แยกตาม tab) */
  /** จำนวนรายการรออนุมัติ (หลัง filter) สำหรับแสดงบนแท็บ Waiting */
  filteredWaitingCount = computed(() => {
    const tab = this.activeTab();
    let rows = this.effectiveApprovalRows().filter((r) => r.approvalStatus === 'waiting');
    rows = rows.filter((r) =>
      this.approvalDateRangeService.isDateInRange(
        r.contract.CONTRACT_DATE ||
          r.contract.ISSUE_DATE ||
          r.contract.RECORD_DATE ||
          r.contract.APPROVAL_DATE
      )
    );
    const branch = this.selectedBranch();
    if (branch) rows = rows.filter((r) => r.contract.BRANCH_CODE === branch);
    if (this.showMyDocumentsOnly()) {
      const currentUser = 'admin@space.com';
      rows = rows.filter(
        (r) =>
          (r.contract as any).CREATE_BY === currentUser || r.contract.CONTRACT_CREATOR === 'SPACE'
      );
    }
    const selectedTypes = this.selectedDocTypeIds();
    if (selectedTypes.length > 0) {
      rows = rows.filter((r) =>
        selectedTypes.some((id) => this.contractTypeMatchesDocId(r.contract.CONTRACT_TYPE, id))
      );
    }
    const kw = this.searchKeyword().trim().toLowerCase();
    if (kw) {
      rows = rows.filter(
        (r) =>
          r.contract.CONTRACT_NUMBER?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_TH?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_EN?.toLowerCase().includes(kw) ||
          r.contract.BUSINESS_NAME?.toLowerCase().includes(kw) ||
          r.contract.CUSTOMER_ID?.toLowerCase().includes(kw)
      );
    }
    return rows.length;
  });

  /** จำนวนรายการอนุมัติแล้ว (หลัง filter) สำหรับแสดงบนแท็บ Approved */
  filteredApprovedCount = computed(() => {
    let rows = this.effectiveApprovalRows().filter((r) => r.approvalStatus === 'approved');
    rows = rows.filter((r) =>
      this.approvalDateRangeService.isDateInRange(
        r.contract.CONTRACT_DATE ||
          r.contract.ISSUE_DATE ||
          r.contract.RECORD_DATE ||
          r.contract.APPROVAL_DATE
      )
    );
    const branch = this.selectedBranch();
    if (branch) rows = rows.filter((r) => r.contract.BRANCH_CODE === branch);
    if (this.showMyDocumentsOnly()) {
      const currentUser = 'admin@space.com';
      rows = rows.filter(
        (r) =>
          (r.contract as any).CREATE_BY === currentUser || r.contract.CONTRACT_CREATOR === 'SPACE'
      );
    }
    const selectedTypes = this.selectedDocTypeIds();
    if (selectedTypes.length > 0) {
      rows = rows.filter((r) =>
        selectedTypes.some((id) => this.contractTypeMatchesDocId(r.contract.CONTRACT_TYPE, id))
      );
    }
    const kw = this.searchKeyword().trim().toLowerCase();
    if (kw) {
      rows = rows.filter(
        (r) =>
          r.contract.CONTRACT_NUMBER?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_TH?.toLowerCase().includes(kw) ||
          r.contract.TENANT_NAME_EN?.toLowerCase().includes(kw) ||
          r.contract.BUSINESS_NAME?.toLowerCase().includes(kw) ||
          r.contract.CUSTOMER_ID?.toLowerCase().includes(kw)
      );
    }
    return rows.length;
  });

  /** สถานะข้อความสำหรับคอลัมน์ผู้อนุมัติ: done | your_turn | pending */
  getApproverColumnStatus(row: ApprovalRow, level: 1 | 2 | 3): 'done' | 'your_turn' | 'pending' {
    if (row.approvalStatus === 'approved') return 'done';
    const w = row.waitingForApproverLevel;
    if (w == null) return 'pending';
    if (level < w) return 'done';
    if (level === w && this.canActOnColumn(row, level)) return 'your_turn';
    return 'pending';
  }

  /** ข้อความแสดงในเซลล์ผู้อนุมัติ (ป้ายสถานะ) - ไม่บังคับลำดับ: แค่ อนุมัติแล้ว / รอคุณอนุมัติ / รออนุมัติ */
  getApproverStatusLabel(row: ApprovalRow, level: 1 | 2 | 3): string {
    const s = this.getApproverColumnStatus(row, level);
    if (s === 'done') return 'อนุมัติแล้ว';
    if (s === 'your_turn') return 'รอคุณอนุมัติ';
    return 'รออนุมัติ';
  }

  /** อนุมัติทุกรายการที่ผู้ใช้มีสิทธิ์ (ในหน้าปัจจุบัน = ทุกรายการในตาราง) */
  showApproveAllConfirm = signal(false);
  approveAllPendingCount = signal(0);

  onApproveAll(): void {
    const rows = this.filteredRows();
    if (rows.length === 0) return;
    this.approveAllPendingCount.set(rows.length);
    this.showApproveAllConfirm.set(true);
  }

  confirmApproveAll(): void {
    const rows = this.filteredRows();
    const ids = rows.map((r) => r.contract.CONTRACT_ID);
    this.approvedContractIds.update((set) => new Set([...set, ...ids]));
    this.showApproveAllConfirm.set(false);
  }

  closeApproveAllConfirm(): void {
    this.showApproveAllConfirm.set(false);
  }

  allTotalCount = computed(() => this.effectiveApprovalRows().length);

  resetFilters(): void {
    this.selectedBranch.set('');
    this.showMyDocumentsOnly.set(false);
    this.selectedDocTypeIds.set([
      'quotation', 'booking', 'lease', 'lease_renewal',
      'amendment', 'discount', 'record_renewal', 'addendum',
    ]);
    this.searchKeyword.set('');
  }

  getApproverSteps(row: ApprovalRow): { name: string; shortName: string; status: 'done' | 'waiting' | 'pending' | 'rejected' }[] {
    const names = [row.approver1Display, row.approver2Display, row.approver3Display];
    if (row.approvalStatus === 'approved') {
      return names.map((n) => ({ name: n, shortName: n.split(' ')[0], status: 'done' as const }));
    }
    const wl = row.waitingForApproverLevel;
    return names.map((n, i) => {
      const level = (i + 1) as 1 | 2 | 3;
      let status: 'done' | 'waiting' | 'pending' | 'rejected' = 'pending';
      if (wl != null) {
        if (level < wl) status = 'done';
        else if (level === wl) status = 'waiting';
      }
      return { name: n, shortName: n.split(' ')[0], status };
    });
  }

  getStepDotColor(status: string): string {
    const colors: Record<string, string> = {
      done: '#16a34a', waiting: '#d97706', rejected: '#dc2626', pending: '#cbd5e1',
    };
    return colors[status] ?? '#cbd5e1';
  }

  getStepStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      done: 'อนุมัติแล้ว', waiting: 'รออนุมัติ', rejected: 'ปฏิเสธ', pending: 'รอดำเนินการ',
    };
    return labels[status] ?? 'รอดำเนินการ';
  }

  getTypeBadgeClass(contractType: string): string {
    const map: Record<string, string> = {
      QUOTATION_AGREEMENT: 'type-quotation',
      DEPOSIT_AGREEMENT: 'type-booking',
      LEASE_AGREEMENT: 'type-lease',
      LEASE_RENEWAL: 'type-renewal',
      LEASE_AMENDMENT: 'type-amendment',
      ADDENDUM: 'type-addendum',
      OTHER: 'type-other',
    };
    return map[contractType] ?? 'type-other';
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return h;
  }
}
