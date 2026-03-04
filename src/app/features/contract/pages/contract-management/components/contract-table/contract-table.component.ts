// contract-table.component.ts - WITH EDIT MODE & DRAFT SUPPORT
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract, CONTRACT_STATUS_LABELS } from '@core/models/contract.model';
import { SearchFilter, SavedSearch, SearchFieldType, SEARCH_FIELD_CONFIG } from '@core/models/contract-search.model';
import type { CancelType } from '@core/services/contract.service';
import { formatDateForDisplay } from '@core/utils/date-utils';
import { AdvanceSearchModalComponent } from '../advance-search-modal/advance-search-modal.component';
import { AddContractModalComponent } from '../add-contract-modal/add-contract-modal.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';
import { BulkActionModalComponent, BulkActionType, BulkActionResult } from '../bulk-action-modal/bulk-action-modal.component';
import { DraftContractService, DraftContract } from '@core/services/draft-contract.service';
import { ConfirmationModalComponent, ConfirmationType } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { CustomerQuotationData } from '@core/services/customer-quotation.service';


@Component({
  selector: 'app-contract-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvanceSearchModalComponent, AddContractModalComponent, WarningModalComponent, BulkActionModalComponent, ConfirmationModalComponent],
  templateUrl: './contract-table.component.html',
  styleUrl: './contract-table.component.css'
})
export class ContractTableComponent {
  // Inputs
  contractType = input.required<'quotation' | 'booking' | 'lease'>();
  data = input.required<Contract[]>();

  // Shared state from parent (synchronized across tabs)
  sharedSearchText = input<string>('');
  sharedFilters = input<SearchFilter[]>([]);

  // Customer quotation inputs
  customerDataForQuotation = input<CustomerQuotationData | null>(null);
  shouldAutoOpenModal = input<boolean>(false);

  // Outputs to sync state back to parent
  searchTextChange = output<string>();
  filtersChange = output<SearchFilter[]>();
  contractSaved = output<any>();
  contractCopied = output<Contract>();
  contractCancelRequest = output<{ contract: Contract; cancelType: CancelType }>();
  quotationModalOpened = output<void>();

  // Local search (syncs with shared)
  simpleSearchText = signal<string>('');
  activeFilters = signal<SearchFilter[]>([]);

  savedSearches = signal<SavedSearch[]>([]);
  private readonly bookmarkKey = 'contract_advance_search_bookmarks';

  // Selection
  selectedIds = signal<string[]>([]);

  // UI State - UPDATED FOR EDIT MODE & DRAFTS
  showAdvanceSearchModal = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedContract = signal<Contract | null>(null);
  selectedDraft = signal<DraftContract | null>(null);
  preFillData = signal<any>(null);
  showBulkActions = signal<boolean>(false);
  activeRowMenu = signal<string | null>(null);
  showDraftsPanel = signal<boolean>(true); // Show/hide drafts panel

  // In-app message modal (replaces browser alert)
  showMessageModal = signal<boolean>(false);
  messageModalTitle = signal<string>('');
  messageModalMessage = signal<string>('');
  private messageModalOnClose?: () => void;

  // Confirmation modal (replaces browser confirm)
  showConfirmModal = signal<boolean>(false);
  confirmModalType = signal<ConfirmationType>('warning');
  confirmModalTitle = signal<string>('');
  confirmModalMessage = signal<string>('');
  confirmModalConfirmText = signal<string>('ยืนยัน');
  confirmModalCancelText = signal<string>('ยกเลิก');
  confirmModalIcon = signal<string>('pi-check');
  private confirmModalOnConfirm?: () => void;

  // Bulk action modal
  showBulkActionModal = signal<boolean>(false);
  currentBulkAction = signal<BulkActionType>('terminate');
  selectedContractsForBulk = signal<Contract[]>([]);

  // Filtered data
  filteredData = computed<Contract[]>(() => {
    let contracts = [...this.data()];

    // Apply simple search
    const searchText = this.simpleSearchText().toLowerCase();
    if (searchText) {
      contracts = contracts.filter(c =>
        c.CONTRACT_NUMBER.toLowerCase().includes(searchText) ||
        c.TENANT_NAME_TH.toLowerCase().includes(searchText) ||
        c.TENANT_NAME_EN.toLowerCase().includes(searchText) ||
        c.CUSTOMER_ID?.toLowerCase().includes(searchText) ||
        c.AREA_ID?.toLowerCase().includes(searchText)
      );
    }

    // Apply advanced filters
    const filters = this.activeFilters();
    filters.forEach(filter => {
      // Check if filter is valid (has field and value)
      if (!filter.field) return;

      // Check if value exists and is not empty
      const hasValue = Array.isArray(filter.value)
        ? filter.value.length > 0
        : typeof filter.value === 'string'
          ? filter.value.trim().length > 0
          : filter.value !== null && filter.value !== undefined;

      if (!hasValue) return;

      switch (filter.field) {
        case 'CONTRACT_NUMBER':
          contracts = contracts.filter(c =>
            c.CONTRACT_NUMBER && c.CONTRACT_NUMBER.toLowerCase().includes((filter.value as string).toLowerCase())
          );
          break;
        case 'CUSTOMER':
          contracts = contracts.filter(c =>
            (c.TENANT_NAME_TH && c.TENANT_NAME_TH.toLowerCase().includes((filter.value as string).toLowerCase())) ||
            (c.TENANT_NAME_EN && c.TENANT_NAME_EN.toLowerCase().includes((filter.value as string).toLowerCase())) ||
            (c.CUSTOMER_ID && c.CUSTOMER_ID.toLowerCase().includes((filter.value as string).toLowerCase()))
          );
          break;
        case 'COMPANY_NAME':
          contracts = contracts.filter(c =>
            (c.TENANT_NAME_TH && c.TENANT_NAME_TH.toLowerCase().includes((filter.value as string).toLowerCase())) ||
            (c.TENANT_NAME_EN && c.TENANT_NAME_EN.toLowerCase().includes((filter.value as string).toLowerCase()))
          );
          break;
        case 'CONTRACT_TYPE':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            contracts = contracts.filter(c => filter.value.includes(c.CONTRACT_TYPE));
          }
          break;
        case 'STATUS':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            contracts = contracts.filter(c => filter.value.includes(c.STATUS));
          }
          break;
        case 'BUILDING':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            contracts = contracts.filter(c =>
              c.BUILDING_CODE && filter.value.includes(c.BUILDING_CODE)
            );
          }
          break;
        case 'BRANCH':
          if (typeof filter.value === 'string') {
            contracts = contracts.filter(c =>
              c.BRANCH_CODE && c.BRANCH_CODE.toLowerCase().includes((filter.value as string).toLowerCase())
            );
          }
          break;
        case 'CATEGORY':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            contracts = contracts.filter(c =>
              c.CATEGORY && filter.value.includes(c.CATEGORY)
            );
          }
          break;
        case 'AREA_ID':
          contracts = contracts.filter(c =>
            c.AREA_ID && c.AREA_ID.toLowerCase().includes((filter.value as string).toLowerCase())
          );
          break;
      }
    });

    return contracts;
  });

  // Selection helpers
  isAllSelected = computed<boolean>(() => {
    const data = this.filteredData();
    return data.length > 0 && this.selectedIds().length === data.length;
  });

  isSomeSelected = computed<boolean>(() => {
    const selectedCount = this.selectedIds().length;
    return selectedCount > 0 && selectedCount < this.filteredData().length;
  });

  constructor(public draftService: DraftContractService) {
    // Load saved searches from localStorage
    this.loadSavedSearches();

    // Sync incoming shared state to local state
    effect(() => {
      this.simpleSearchText.set(this.sharedSearchText());
    });

    effect(() => {
      this.activeFilters.set(this.sharedFilters());
    });

    // Close row menu when clicking outside
    effect(() => {
      if (this.activeRowMenu()) {
        const handler = () => this.activeRowMenu.set(null);
        setTimeout(() => document.addEventListener('click', handler, { once: true }), 0);
      }
    });

    // Close bulk actions menu when clicking outside
    effect(() => {
      if (this.showBulkActions()) {
        const handler = () => this.showBulkActions.set(false);
        setTimeout(() => document.addEventListener('click', handler, { once: true }), 0);
      }
    });

    // Auto-open modal when customer data is provided
    effect(() => {
      const shouldOpen = this.shouldAutoOpenModal();
      const customerData = this.customerDataForQuotation();

      if (shouldOpen && customerData && this.contractType() === 'quotation') {
        console.log('🎯 Auto-opening quotation modal with customer data');
        setTimeout(() => {
          this.openModalWithCustomerData(customerData);
        }, 300);
      }
    });
  }


  // ==================== SEARCH ====================

  onSimpleSearch(): void {
    this.searchTextChange.emit(this.simpleSearchText());
  }

  clearSimpleSearch(): void {
    this.simpleSearchText.set('');
    this.searchTextChange.emit('');
  }

  openAdvanceSearch(): void {
    this.showAdvanceSearchModal.set(true);
  }

  closeAdvanceSearch(): void {
    this.showAdvanceSearchModal.set(false);
  }

  onFiltersChange(filters: SearchFilter[]): void {
    this.activeFilters.set(filters);
    this.filtersChange.emit(filters);
  }

  removeFilter(id: string): void {
    const updated = this.activeFilters().filter(f => f.id !== id);
    this.activeFilters.set(updated);
    this.filtersChange.emit(updated);
  }

  clearAllFilters(): void {
    this.activeFilters.set([]);
    this.simpleSearchText.set('');
    this.filtersChange.emit([]);
    this.searchTextChange.emit('');
  }

  applyBookmark(bookmark: SavedSearch): void {
    // Deep copy filters to avoid reference issues
    const filters = JSON.parse(JSON.stringify(bookmark.filters));

    // Ensure all filters have isComplete flag set correctly
    const restoredFilters = filters.map((filter: SearchFilter) => ({
      ...filter,
      // Ensure isComplete is true if field and value exist
      isComplete: filter.field !== null &&
                   filter.field !== undefined &&
                   (Array.isArray(filter.value) ? filter.value.length > 0 :
                    typeof filter.value === 'string' ? filter.value.trim().length > 0 :
                    filter.value !== null && filter.value !== undefined)
    }));

    // Set active filters and trigger search
    this.activeFilters.set(restoredFilters);
    this.filtersChange.emit(restoredFilters);

    // Clear simple search when applying bookmark
    this.simpleSearchText.set('');
    this.searchTextChange.emit('');
  }

  onSavedSearchChange(bookmark: SavedSearch): void {
    // Reload saved searches to include the new one
    this.loadSavedSearches();
  }

  deleteBookmark(bookmarkId: string, event: MouseEvent): void {
    event.stopPropagation();
    const updated = this.savedSearches().filter(b => b.id !== bookmarkId);
    this.savedSearches.set(updated);
    localStorage.setItem(this.bookmarkKey, JSON.stringify(updated));
  }

  private loadSavedSearches(): void {
    const raw = localStorage.getItem(this.bookmarkKey);
    if (!raw) {
      this.savedSearches.set([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SavedSearch[];
      // Convert date strings back to Date objects
      const searches = parsed.map(b => ({
        ...b,
        createdAt: new Date(b.createdAt)
      }));
      this.savedSearches.set(searches);
    } catch {
      this.savedSearches.set([]);
    }
  }

  getFieldLabel(field: SearchFieldType): string {
    return SEARCH_FIELD_CONFIG[field].TH;
  }

  formatFilterValue(filter: SearchFilter): string {
    if (Array.isArray(filter.value)) {
      return filter.value.join(', ');
    }
    return filter.value;
  }

  // ==================== SELECTION ====================

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.set([]);
    } else {
      this.selectedIds.set(this.filteredData().map(c => c.CONTRACT_ID));
    }
  }

  toggleSelect(id: string): void {
    this.selectedIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(i => i !== id);
      } else {
        return [...ids, id];
      }
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  // ==================== ACTIONS - UPDATED WITH EDIT MODE ====================

  onBulkAction(action: string): void {
    console.log('Bulk action:', action, 'on', this.selectedIds());
    this.showBulkActions.set(false);

    // Get selected contracts
    const selectedContracts = this.filteredData().filter(c =>
      this.selectedIds().includes(c.CONTRACT_ID)
    );

    if (selectedContracts.length === 0) {
      this.openMessageModal('ไม่มีรายการที่เลือก', 'กรุณาเลือกสัญญาอย่างน้อย 1 รายการ');
      return;
    }

    // Map action string to BulkActionType
    const actionMap: Record<string, BulkActionType> = {
      'terminate': 'terminate',
      'discount': 'discount',
      'renew': 'renew',
      'extend': 'extend',
      'edit': 'edit'
    };

    const bulkAction = actionMap[action];
    if (!bulkAction) {
      this.openMessageModal('ไม่รองรับ', `ไม่รองรับการดำเนินการ: ${action}`);
      return;
    }

    // Open bulk action modal
    this.selectedContractsForBulk.set(selectedContracts);
    this.currentBulkAction.set(bulkAction);
    this.showBulkActionModal.set(true);
    this.showBulkActions.set(false);
  }

  closeBulkActionModal(): void {
    this.showBulkActionModal.set(false);
  }

  onBulkActionConfirm(result: BulkActionResult): void {
    console.log('Bulk action confirmed:', result);
    this.showBulkActionModal.set(false);

    // Handle different actions
    switch (result.action) {
      case 'terminate':
        this.handleBulkTerminate(result);
        break;
      case 'discount':
        this.handleBulkDiscount(result);
        break;
      case 'renew':
        this.handleBulkRenew(result);
        break;
      case 'extend':
        this.handleBulkExtend(result);
        break;
      case 'edit':
        this.handleBulkEdit(result);
        break;
    }

    // Clear selection after action
    this.selectedIds.set([]);
  }

  private handleBulkTerminate(result: BulkActionResult): void {
    const data = result.data;
    const dateStr = data.terminationDate ? new Date(data.terminationDate).toLocaleDateString('th-TH') : '-';
    const reasonLabels: Record<string, string> = {
      'tenant_request': 'ผู้เช่าขอยกเลิก',
      'breach': 'ผิดสัญญา',
      'expiry': 'ครบกำหนดสัญญา',
      'renovation': 'ปรับปรุงพื้นที่',
      'other': 'อื่นๆ'
    };

    this.openMessageModal(
      'ยกเลิกสัญญาสำเร็จ',
      `ยกเลิกสัญญา ${result.contractIds.length} รายการแล้ว\n` +
      `วันที่มีผล: ${dateStr}\n` +
      `เหตุผล: ${reasonLabels[data.reason] || data.reason}\n` +
      `${data.refundDeposit ? 'คืนเงินมัดจำ' : 'ไม่คืนเงินมัดจำ'}`
    );

    // TODO: Call API to terminate contracts
    // this.contractService.bulkTerminate(result).subscribe(...)
  }

  private handleBulkDiscount(result: BulkActionResult): void {
    const data = result.data;
    const applyToLabels: Record<string, string> = {
      'both': 'ค่าเช่าและค่าบริการ',
      'rent': 'ค่าเช่า',
      'service': 'ค่าบริการ'
    };

    const discountText = data.discountType === 'percentage'
      ? `${data.discountValue}%`
      : `${data.discountValue.toLocaleString()} บาท`;

    this.openMessageModal(
      'ให้ส่วนลดสำเร็จ',
      `ให้ส่วนลด ${result.contractIds.length} สัญญาแล้ว\n` +
      `ส่วนลด: ${discountText}\n` +
      `ใช้กับ: ${applyToLabels[data.applyTo]}`
    );

    // TODO: Call API
  }

  private handleBulkRenew(result: BulkActionResult): void {
    const data = result.data;
    const duration = [];
    if (data.durationYears > 0) duration.push(`${data.durationYears} ปี`);
    if (data.durationMonths > 0) duration.push(`${data.durationMonths} เดือน`);

    this.openMessageModal(
      'ต่อสัญญาสำเร็จ',
      `ต่อสัญญา ${result.contractIds.length} รายการแล้ว\n` +
      `ระยะเวลา: ${duration.join(' ')}`
    );

    // TODO: Call API
  }

  private handleBulkExtend(result: BulkActionResult): void {
    const data = result.data;
    const extension = [];
    if (data.extensionMonths > 0) extension.push(`${data.extensionMonths} เดือน`);
    if (data.extensionDays > 0) extension.push(`${data.extensionDays} วัน`);

    this.openMessageModal(
      'ขยายระยะเวลาสำเร็จ',
      `ขยายระยะเวลา ${result.contractIds.length} สัญญาแล้ว\n` +
      `ขยาย: ${extension.join(' ')}`
    );

    // TODO: Call API
  }

  private handleBulkEdit(result: BulkActionResult): void {
    // For edit, we open the edit modal for the single selected contract
    const contractId = result.contractIds[0];
    const contract = this.filteredData().find(c => c.CONTRACT_ID === contractId);

    if (contract) {
      this.openEditModal(contract);
    }
  }

  showRowActions(id: string): void {
    this.activeRowMenu.set(this.activeRowMenu() === id ? null : id);
  }

  onRowAction(action: string, contract: Contract): void {
    console.log('Row action:', action, 'on', contract.CONTRACT_ID);
    this.activeRowMenu.set(null);

    switch (action) {
      case 'edit':
        this.openEditModal(contract);
        break;
      case 'copy-contract':
        this.copyContractImmediately(contract);
        break;
      case 'transfer-to-booking':
        this.transferToBooking(contract);
        break;
      case 'transfer-to-lease':
        this.transferToLease(contract);
        break;
      case 'copy-to-booking':
        this.copyLeaseToBooking(contract);
        break;
      case 'copy-to-quotation':
        this.copyLeaseToQuotation(contract);
        break;
      case 'copy-booking-to-quotation':
        this.copyBookingToQuotation(contract);
        break;
      case 'cancel-quotation':
        this.cancelQuotation(contract);
        break;
      case 'cancel-booking':
        this.cancelBooking(contract);
        break;
      case 'cancel-lease':
        this.cancelLease(contract);
        break;
      case 'addendum':
        this.openAddendum(contract);
        break;
      default:
        this.openMessageModal('ดำเนินการ', `${action}: ${contract.CONTRACT_NUMBER}`);
    }
  }

  /** ป้ายชื่อปุ่มคัดลอกตามประเภท */
  getCopyContractLabel(): string {
    switch (this.contractType()) {
      case 'quotation': return 'คัดลอกใบเสนอราคา';
      case 'booking': return 'คัดลอกสัญญาจอง';
      case 'lease': return 'คัดลอกสัญญาเช่า';
      default: return 'คัดลอกสัญญา';
    }
  }

  private newContractNumber(): string {
    return `AUTO-${Date.now()}`;
  }

  /** คัดลอกสัญญาทันที: สร้างสัญญาใหม่เหมือนเดิม แต่เลขที่ไม่ซ้ำ (ไม่เปิดโมดอล) */
  copyContractImmediately(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_NUMBER_MAIN: contract.CONTRACT_NUMBER_MAIN ? newNumber : undefined,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB ? `${newNumber}-SUB` : undefined
    };
    this.contractCopied.emit(copy);
    this.openMessageModal('คัดลอกสัญญาเรียบร้อย', `สร้างสัญญาใหม่เลขที่: ${newNumber}`);
  }

  /** ใบเสนอราคา → โอนเป็นสัญญาจอง (ขอยืนยันก่อน) */
  transferToBooking(contract: Contract): void {
    this.openConfirmModal({
      type: 'warning',
      title: 'ยืนยันโอนเป็นสัญญาจอง',
      message: `คุณต้องการโอนใบเสนอราคา ${contract.CONTRACT_NUMBER} เป็นสัญญาจองใช่หรือไม่?\n\nใบเสนอราคาต้นทางจะถูกเปลี่ยนสถานะเป็น "โอนแล้ว" และไม่สามารถแก้ไขได้อีก`,
      confirmText: 'ยืนยันโอน',
      confirmIcon: 'pi-arrow-right-arrow-left',
      onConfirm: () => {
        this.executeTransferToBooking(contract);
      }
    });
  }

  /** ดำเนินการโอนใบเสนอราคา → สัญญาจองจริง */
  private executeTransferToBooking(contract: Contract): void {
    const sameNumber = contract.CONTRACT_NUMBER;
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: sameNumber,
      CONTRACT_TYPE: 'DEPOSIT_AGREEMENT',
      STATUS: 'ACTIVE',
      CONTRACT_NUMBER_MAIN: contract.CONTRACT_NUMBER_MAIN || sameNumber,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB || '',
      BOOKING_NUMBER: sameNumber,
      QUOTATION_NUMBER: sameNumber
    } as Contract;
    this.contractCopied.emit(copy);

    // อัปเดตสถานะใบเสนอราคาต้นทาง → COMPLETED (โอนแล้ว)
    contract.STATUS = 'COMPLETED';
    contract.TRANSFER_TO_BOOKING = sameNumber;

    this.openMessageModal('โอนเป็นสัญญาจองเรียบร้อย', `เลขที่สัญญาจอง: ${sameNumber}\nอ้างอิงใบเสนอราคา: ${sameNumber}`);
  }

  /** สัญญาจอง → โอนเป็นสัญญาเช่า (ขอยืนยันก่อน) */
  transferToLease(contract: Contract): void {
    this.openConfirmModal({
      type: 'warning',
      title: 'ยืนยันโอนเป็นสัญญาเช่า',
      message: `คุณต้องการโอนสัญญาจอง ${contract.CONTRACT_NUMBER} เป็นสัญญาเช่าใช่หรือไม่?\n\nสัญญาจองต้นทางจะถูกเปลี่ยนสถานะเป็น "โอนแล้ว" และไม่สามารถแก้ไขได้อีก`,
      confirmText: 'ยืนยันโอน',
      confirmIcon: 'pi-arrow-right-arrow-left',
      onConfirm: () => {
        this.executeTransferToLease(contract);
      }
    });
  }

  /** ดำเนินการโอนสัญญาจอง → สัญญาเช่าจริง */
  private executeTransferToLease(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_TYPE: 'LEASE_AGREEMENT',
      STATUS: 'ACTIVE',
      BOOKING_NUMBER: contract.CONTRACT_NUMBER ?? contract.BOOKING_NUMBER,
      CONTRACT_NUMBER_MAIN: contract.CONTRACT_NUMBER_MAIN,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB
    } as Contract;
    this.contractCopied.emit(copy);

    // อัปเดตสถานะสัญญาจองต้นทาง → COMPLETED (โอนแล้ว)
    contract.STATUS = 'COMPLETED';
    (contract as any).TRANSFER_TO_LEASE = newNumber;

    this.openMessageModal('โอนเป็นสัญญาเช่าเรียบร้อย', `เลขที่สัญญาเช่า: ${newNumber}\nอ้างอิงสัญญาจอง: ${contract.CONTRACT_NUMBER}`);
  }

  /** สัญญาเช่า → คัดลอกไปเป็นสัญญาจอง */
  copyLeaseToBooking(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_TYPE: 'DEPOSIT_AGREEMENT',
      CONTRACT_NUMBER_MAIN: contract.CONTRACT_NUMBER_MAIN,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB ? `${newNumber}-SUB` : undefined,
      BOOKING_NUMBER: newNumber
    } as Contract;
    this.contractCopied.emit(copy);
    this.openMessageModal('คัดลอกเป็นสัญญาจองเรียบร้อย', `เลขที่สัญญาจอง: ${newNumber}`);
  }

  /** สัญญาเช่า → คัดลอกไปเป็นใบเสนอราคา */
  copyLeaseToQuotation(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_TYPE: 'QUOTATION_AGREEMENT',
      CONTRACT_NUMBER_MAIN: newNumber,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB ? `${newNumber}-SUB` : undefined,
      BOOKING_NUMBER: undefined
    } as Contract;
    this.contractCopied.emit(copy);
    this.openMessageModal('คัดลอกเป็นใบเสนอราคาเรียบร้อย', `เลขที่ใบเสนอราคา: ${newNumber}`);
  }

  /** สัญญาจอง → คัดลอกไปเป็นใบเสนอราคา */
  copyBookingToQuotation(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_TYPE: 'QUOTATION_AGREEMENT',
      CONTRACT_NUMBER_MAIN: newNumber,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB ? `${newNumber}-SUB` : undefined,
      BOOKING_NUMBER: undefined
    } as Contract;
    this.contractCopied.emit(copy);
    this.openMessageModal('คัดลอกสัญญาจองไปเป็นใบเสนอราคาเรียบร้อย', `เลขที่ใบเสนอราคา: ${newNumber}`);
  }

  /** ยกเลิกใบเสนอราคา: ยกเลิกทันที */
  cancelQuotation(contract: Contract): void {
    this.cancelContractDirectly(contract, 'quotation');
  }

  /** ยกเลิกสัญญาจอง: ยกเลิกทันที */
  cancelBooking(contract: Contract): void {
    this.cancelContractDirectly(contract, 'booking');
  }

  /** ยกเลิกสัญญาเช่า */
  cancelLease(contract: Contract): void {
    this.cancelContractDirectly(contract, 'lease');
  }

  /** ภาคผนวก (Addendum) - สำหรับใช้งานในอนาคต */
  openAddendum(contract: Contract): void {
    this.openMessageModal('ภาคผนวก', `ฟีเจอร์ภาคผนวกสำหรับสัญญา ${contract.CONTRACT_NUMBER} อยู่ระหว่างพัฒนา`);
  }

  // ==================== CANCEL CONFIRMATION MODAL ====================
  showCancelConfirm = signal<boolean>(false);
  cancelConfirmTitle = signal<string>('');
  cancelConfirmMessage = signal<string>('');
  private pendingCancelContract = signal<Contract | null>(null);
  private pendingCancelType = signal<CancelType | null>(null);

  private readonly cancelLabelMap: Record<string, string> = {
    quotation: 'ใบเสนอราคา',
    booking: 'สัญญาจอง',
    lease: 'สัญญาเช่า',
  };

  /** แสดง confirmation modal ก่อนยกเลิก */
  private cancelContractDirectly(contract: Contract, cancelType: CancelType): void {
    const label = this.cancelLabelMap[cancelType] || cancelType;
    this.pendingCancelContract.set(contract);
    this.pendingCancelType.set(cancelType);
    this.cancelConfirmTitle.set(`ยืนยันการยกเลิก${label}`);
    this.cancelConfirmMessage.set(`คุณต้องการยกเลิก${label} ${contract.CONTRACT_NUMBER} ใช่หรือไม่?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`);
    this.showCancelConfirm.set(true);
  }

  /** เมื่อกดยืนยันใน confirmation modal */
  onCancelConfirm(): void {
    const contract = this.pendingCancelContract();
    const cancelType = this.pendingCancelType();
    this.showCancelConfirm.set(false);

    if (contract && cancelType) {
      const label = this.cancelLabelMap[cancelType] || cancelType;
      this.contractCancelRequest.emit({ contract, cancelType });
      this.openMessageModal(
        'ยกเลิกสำเร็จ',
        `${label} ${contract.CONTRACT_NUMBER} ถูกยกเลิกแล้ว`
      );
    }

    this.pendingCancelContract.set(null);
    this.pendingCancelType.set(null);
  }

  /** เมื่อกดยกเลิกใน confirmation modal */
  onCancelDismiss(): void {
    this.showCancelConfirm.set(false);
    this.pendingCancelContract.set(null);
    this.pendingCancelType.set(null);
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.selectedContract.set(null);
    this.showAddModal.set(true);
  }

  openEditModal(contract: Contract): void {
    this.modalMode.set('edit');
    this.selectedContract.set(contract);
    this.showAddModal.set(true);
  }

  /**
   * Open add modal with pre-filled customer data
   */
  openModalWithCustomerData(customerData: CustomerQuotationData): void {
    console.log('📝 Opening quotation modal with customer data:', customerData);

    // Create pre-fill data object
    const preFillData = {
      generalDetails: {
        contactName: customerData.customerName,
        businessName: customerData.companyName || customerData.customerName,
        customerId: customerData.customerId,
      }
    };

    // Set mode and pre-fill data
    this.modalMode.set('add');
    this.selectedContract.set(null);
    this.selectedDraft.set(null);
    this.preFillData.set(preFillData);
    this.showAddModal.set(true);

    // Emit event to parent
    this.quotationModalOpened.emit();

    console.log('✅ Modal opened with pre-fill data:', preFillData);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.modalMode.set('add');
    this.selectedContract.set(null);
    this.selectedDraft.set(null);
    this.preFillData.set(null);
  }

  // ==================== DRAFT MANAGEMENT ====================

  /** เปิด/ปิด panel แบบร่าง */
  toggleDraftsPanel(): void {
    this.showDraftsPanel.update(v => !v);
  }

  /** เปิด modal เพื่อกรอกต่อจาก draft */
  continueDraft(draft: DraftContract): void {
    this.modalMode.set('add');
    this.selectedContract.set(null);
    this.selectedDraft.set(draft);
    this.showAddModal.set(true);
  }

  /** ลบ draft */
  deleteDraft(draft: DraftContract): void {
    this.openConfirmModal({
      type: 'danger',
      title: 'ลบแบบร่าง',
      message: `คุณต้องการลบแบบร่าง "${draft.name}" หรือไม่?\n\nข้อมูลที่กรอกไว้จะถูกลบทั้งหมดและไม่สามารถกู้คืนได้`,
      confirmText: 'ลบ',
      confirmIcon: 'pi-trash',
      onConfirm: () => {
        this.draftService.deleteDraft(draft.id);
        this.openMessageModal('ลบสำเร็จ', `แบบร่าง "${draft.name}" ถูกลบแล้ว`);
      }
    });
  }

  /** เมื่อ draft ถูกบันทึกจาก modal */
  onDraftSaved(draft: DraftContract): void {
    // Draft is saved, we can close modal or keep it open
    console.log('Draft saved:', draft);
  }

  saveNewContract(formData: any): void {
    const mode = formData.mode || 'add';

    // ลบแบบร่างที่เกี่ยวข้อง ถ้ามี draftId
    if (formData.draftId) {
      this.draftService.deleteDraft(formData.draftId);
      console.log('Draft deleted after final save:', formData.draftId);
    }

    this.closeAddModal();
    this.contractSaved.emit(formData);

    if (mode === 'edit') {
      console.log('Updating contract:', formData.contractId, formData);
      this.openMessageModal('บันทึกสำเร็จ', `สัญญาถูกแก้ไขเรียบร้อยแล้ว\nเลขที่สัญญา: ${formData.contractId}`);
    } else {
      const draftRemoved = formData.draftId ? '\n(แบบร่างถูกลบแล้ว)' : '';
      const msg = formData.saveAsQuotationOnly
        ? `บันทึกใบเสนอราคาแล้ว แสดงในแท็บใบเสนอราคา${draftRemoved}`
        : formData.saveAsBooking
          ? `บันทึกสัญญาจองแล้ว แสดงในแท็บสัญญาจอง${draftRemoved}`
          : `สัญญาใหม่ถูกบันทึกแล้ว${draftRemoved}`;
      console.log('Creating new contract:', formData);
      this.openMessageModal('บันทึกสำเร็จ', msg);
    }
  }

  openMessageModal(title: string, message: string, onClose?: () => void): void {
    this.messageModalTitle.set(title);
    this.messageModalMessage.set(message);
    this.messageModalOnClose = onClose;
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
    if (this.messageModalOnClose) {
      this.messageModalOnClose();
      this.messageModalOnClose = undefined;
    }
  }

  // ==================== CONFIRMATION MODAL ====================

  openConfirmModal(options: {
    type?: ConfirmationType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmIcon?: string;
    onConfirm: () => void;
  }): void {
    this.confirmModalType.set(options.type || 'warning');
    this.confirmModalTitle.set(options.title);
    this.confirmModalMessage.set(options.message);
    this.confirmModalConfirmText.set(options.confirmText || 'ยืนยัน');
    this.confirmModalCancelText.set(options.cancelText || 'ยกเลิก');
    this.confirmModalIcon.set(options.confirmIcon || 'pi-check');
    this.confirmModalOnConfirm = options.onConfirm;
    this.showConfirmModal.set(true);
  }

  onConfirmModalConfirm(): void {
    this.showConfirmModal.set(false);
    if (this.confirmModalOnConfirm) {
      this.confirmModalOnConfirm();
      this.confirmModalOnConfirm = undefined;
    }
  }

  onConfirmModalCancel(): void {
    this.showConfirmModal.set(false);
    this.confirmModalOnConfirm = undefined;
  }

  // ==================== HELPERS ====================

  formatDate(dateValue: unknown): string {
    return formatDateForDisplay(dateValue, 'th-TH');
  }

  getStatusColor(status: string): string {
    return (
      CONTRACT_STATUS_LABELS[status as keyof typeof CONTRACT_STATUS_LABELS]?.COLOR ||
      'rgb(var(--muted))'
    );
  }

  /**
   * สีจุดสถานะ — UX logic:
   * - ใบเสนอราคาที่โอนเป็นสัญญาจองแล้ว (COMPLETED + มี TRANSFER_TO_BOOKING) → น้ำเงิน
   * - สัญญาจอง (DEPOSIT_AGREEMENT) → น้ำเงิน
   * - ACTIVE → เขียว (ใช้งานอยู่)
   * - PENDING → เหลือง (รอดำเนินการ)
   * - TERMINATED → แดง (ยกเลิก)
   * - EXPIRED → แดง (หมดอายุ)
   * - DRAFT → เทา (ร่าง)
   * - COMPLETED → เทา (เสร็จสิ้น)
   */
  getStatusDotColor(item: Contract): string {
    // สัญญาที่โอนแล้ว → สีน้ำเงิน
    if (item.TRANSFER_TO_BOOKING || item.TRANSFER_TO_LEASE) {
      return '#3B82F6'; // blue — transferred
    }
    // สัญญาจอง → สีน้ำเงิน
    if (item.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT') {
      return '#3B82F6'; // blue for booking
    }
    return this.getStatusColor(item.STATUS);
  }

  /** สถานะแสดงผลเป็นภาษาไทย (ใช้ในตาราง) */
  getStatusDisplayLabel(item: Contract): string {
    if (item.TRANSFER_TO_BOOKING) {
      return 'โอนเป็นสัญญาจองแล้ว';
    }
    if (item.TRANSFER_TO_LEASE) {
      return 'โอนเป็นสัญญาเช่าแล้ว';
    }
    return CONTRACT_STATUS_LABELS[item.STATUS as keyof typeof CONTRACT_STATUS_LABELS]?.TH || item.STATUS;
  }

  /** ตรวจว่าสัญญาถูกล็อกแล้วหรือไม่ (โอนแล้ว / ยกเลิกแล้ว) */
  isContractLocked(item: Contract): boolean {
    return !!item.TRANSFER_TO_BOOKING ||
           !!item.TRANSFER_TO_LEASE ||
           item.STATUS === 'TERMINATED' ||
           item.STATUS === 'EXPIRED';
  }

  getContractNumberColumnLabel(): string {
    switch (this.contractType()) {
      case 'quotation': return 'เลขที่ใบเสนอราคา';
      case 'booking': return 'เลขที่สัญญาจอง';
      case 'lease': return 'เลขที่สัญญาเช่า';
      default: return 'เลขที่สัญญา';
    }
  }

  /** ป้ายคอลัมน์เลขที่อ้างอิง ตามประเภทแท็บ */
  getReferenceNumberColumnLabel(): string {
    switch (this.contractType()) {
      case 'quotation': return 'เลขที่อ้างอิง';
      case 'booking': return 'เลขที่ใบเสนอราคา';
      case 'lease': return 'เลขที่สัญญาจอง';
      default: return 'เลขที่อ้างอิง';
    }
  }

  /** ป้ายปุ่ม "สร้าง..." ตามประเภทแท็บ */
  getAddButtonLabel(): string {
    switch (this.contractType()) {
      case 'quotation': return 'สร้างใบเสนอราคา';
      case 'booking': return 'สร้างสัญญาจอง';
      case 'lease': return 'สร้างสัญญาเช่า';
      default: return 'สร้างสัญญา';
    }
  }

  getEditBulkActionLabel(): string {
    switch (this.contractType()) {
      case 'quotation': return 'แก้ไขใบเสนอราคา เดี่ยว';
      case 'booking': return 'แก้ไขสัญญาจอง เดี่ยว';
      case 'lease': return 'แก้ไขสัญญาเช่า เดี่ยว';
      default: return 'แก้ไขสัญญา เดี่ยว';
    }
  }

  getContractTypeLabel(type: string): string {
    const CONTRACT_TYPE_LABELS = {
      'LEASE_AGREEMENT': 'สัญญาเช่า',
      'LEASE_RENEWAL': 'ต่อสัญญาเช่า',
      'LEASE_AMENDMENT': 'แก้ไขสัญญา',
      'LEASE_TERMINATION': 'เลิกสัญญา',
      'DEPOSIT_AGREEMENT': 'สัญญาจอง',
      'QUOTATION_AGREEMENT': 'ใบเสนอราคา',
      'MAINTENANCE_AGREEMENT': 'สัญญาบำรุงรักษา',
      'ADDENDUM': 'ภาคผนวก',
      'OTHER': 'อื่นๆ'
    };
    return CONTRACT_TYPE_LABELS[type as keyof typeof CONTRACT_TYPE_LABELS] || type;
  }
}
