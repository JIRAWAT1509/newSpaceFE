// contract-table.component.ts - WITH EDIT MODE INTEGRATED
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

@Component({
  selector: 'app-contract-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvanceSearchModalComponent, AddContractModalComponent, WarningModalComponent, BulkActionModalComponent],
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

  // Outputs to sync state back to parent
  searchTextChange = output<string>();
  filtersChange = output<SearchFilter[]>();
  contractSaved = output<any>();
  contractCopied = output<Contract>();
  contractCancelRequest = output<{ contract: Contract; cancelType: CancelType }>();

  // Local search (syncs with shared)
  simpleSearchText = signal<string>('');
  activeFilters = signal<SearchFilter[]>([]);

  savedSearches = signal<SavedSearch[]>([]);
  private readonly bookmarkKey = 'contract_advance_search_bookmarks';

  // Selection
  selectedIds = signal<string[]>([]);

  // UI State - UPDATED FOR EDIT MODE
  showAdvanceSearchModal = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedContract = signal<Contract | null>(null);
  showBulkActions = signal<boolean>(false);
  activeRowMenu = signal<string | null>(null);

  // In-app message modal (replaces browser alert)
  showMessageModal = signal<boolean>(false);
  messageModalTitle = signal<string>('');
  messageModalMessage = signal<string>('');
  private messageModalOnClose?: () => void;

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

  constructor() {
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
      case 'cancel-quotation':
        this.cancelQuotation(contract);
        break;
      case 'cancel-booking':
        this.cancelBooking(contract);
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

  /** ใบเสนอราคา → โอนเป็นสัญญาจอง (สร้างสัญญาจองจากใบเสนอราคา) */
  transferToBooking(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_TYPE: 'DEPOSIT_AGREEMENT',
      CONTRACT_NUMBER_MAIN: contract.CONTRACT_NUMBER_MAIN ?? newNumber,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB ? `${newNumber}-SUB` : undefined,
      BOOKING_NUMBER: newNumber
    } as Contract;
    this.contractCopied.emit(copy);
    this.openMessageModal('โอนเป็นสัญญาจองเรียบร้อย', `เลขที่สัญญาจอง: ${newNumber}`);
  }

  /** สัญญาจอง → โอนเป็นสัญญาเช่า (สร้างสัญญาเช่าจากสัญญาจอง) */
  transferToLease(contract: Contract): void {
    const newNumber = this.newContractNumber();
    const copy: Contract = {
      ...contract,
      CONTRACT_ID: `CNT-${Date.now()}`,
      CONTRACT_NUMBER: newNumber,
      CONTRACT_TYPE: 'LEASE_AGREEMENT',
      BOOKING_NUMBER: contract.CONTRACT_NUMBER ?? contract.BOOKING_NUMBER,
      CONTRACT_NUMBER_MAIN: contract.CONTRACT_NUMBER_MAIN,
      CONTRACT_NUMBER_SUB: contract.CONTRACT_NUMBER_SUB
    } as Contract;
    this.contractCopied.emit(copy);
    this.openMessageModal('โอนเป็นสัญญาเช่าเรียบร้อย', `เลขที่สัญญาเช่า: ${newNumber}`);
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

  /** ยกเลิกใบเสนอราคา: ส่งไป parent เพื่อเรียก API แล้วอัปเดตสถานะ */
  cancelQuotation(contract: Contract): void {
    this.contractCancelRequest.emit({ contract, cancelType: 'quotation' });
  }

  /** ยกเลิกสัญญาจอง: ส่งไป parent เพื่อเรียก API แล้วอัปเดตสถานะ */
  cancelBooking(contract: Contract): void {
    this.contractCancelRequest.emit({ contract, cancelType: 'booking' });
  }

  /** ยกเลิกสัญญาและภาคผนวก (สัญญาเช่า): ส่งไป parent เพื่อเรียก API แล้วอัปเดตสถานะ */
  openAddendum(contract: Contract): void {
    this.contractCancelRequest.emit({ contract, cancelType: 'lease' });
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

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.modalMode.set('add');
    this.selectedContract.set(null);
  }

  saveNewContract(formData: any): void {
    const mode = formData.mode || 'add';

    this.closeAddModal();
    this.contractSaved.emit(formData);

    if (mode === 'edit') {
      console.log('Updating contract:', formData.contractId, formData);
      this.openMessageModal('บันทึกสำเร็จ', `สัญญาถูกแก้ไขเรียบร้อยแล้ว\nเลขที่สัญญา: ${formData.contractId}`);
    } else {
      const msg = formData.saveAsQuotationOnly
        ? 'บันทึกใบเสนอราคาแล้ว แสดงในแท็บใบเสนอราคา'
        : formData.saveAsBooking
          ? 'บันทึกสัญญาจองแล้ว แสดงในแท็บสัญญาจอง'
          : 'สัญญาใหม่ถูกบันทึกแล้ว';
      console.log('Creating new contract:', formData);
      this.openMessageModal('บันทึกสำเร็จ', msg);
    }

    // TODO: Call API to save/update contract
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

  getContractNumberColumnLabel(): string {
    switch (this.contractType()) {
      case 'quotation': return 'เลขที่ใบเสนอราคา';
      case 'booking': return 'เลขที่สัญญาจอง';
      case 'lease': return 'เลขที่สัญญาเช่า';
      default: return 'เลขที่สัญญา';
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
      'DEPOSIT_AGREEMENT': 'สัญญามัดจำ',
      'QUOTATION_AGREEMENT': 'ใบเสนอราคา',
      'MAINTENANCE_AGREEMENT': 'สัญญาบำรุงรักษา',
      'ADDENDUM': 'ภาคผนวก',
      'OTHER': 'อื่นๆ'
    };
    return CONTRACT_TYPE_LABELS[type as keyof typeof CONTRACT_TYPE_LABELS] || type;
  }
}
