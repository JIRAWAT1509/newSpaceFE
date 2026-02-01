// contract-table.component.ts - WITH EDIT MODE INTEGRATED
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract, CONTRACT_STATUS_LABELS } from '@core/models/contract.model';
import { SearchFilter, SavedSearch, SearchFieldType, SEARCH_FIELD_CONFIG } from '@core/models/contract-search.model';
import { fromDateString } from '@core/utils/date-utils';
import { AdvanceSearchModalComponent } from '../advance-search-modal/advance-search-modal.component';
import { AddContractModalComponent } from '../add-contract-modal/add-contract-modal.component';

@Component({
  selector: 'app-contract-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvanceSearchModalComponent, AddContractModalComponent],
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
  showBulkActions = false;
  activeRowMenu = signal<string | null>(null);

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
    this.showBulkActions = false;
    alert(`Bulk ${action} for ${this.selectedIds().length} items`);
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
      case 'copy-booking':
        alert(`คัดลอกสัญญาเช่าไปเป็นสัญญาจอง: ${contract.CONTRACT_NUMBER}`);
        break;
      case 'copy-quotation':
        alert(`คัดลอกสัญญาเช่าไปเป็นใบเสนอราคา: ${contract.CONTRACT_NUMBER}`);
        break;
      case 'addendum':
        alert(`ยกเลิกสัญญา + addendum: ${contract.CONTRACT_NUMBER}`);
        break;
      default:
        alert(`${action} for ${contract.CONTRACT_NUMBER}`);
    }
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

    if (mode === 'edit') {
      console.log('Updating contract:', formData.contractId, formData);
      alert(`สัญญาถูกแก้ไขเรียบร้อยแล้ว!\nเลขที่สัญญา: ${formData.contractId}`);
    } else {
      console.log('Creating new contract:', formData);
      alert(`สัญญาใหม่ถูกบันทึกแล้ว!`);
    }

    this.closeAddModal();

    // TODO: Call API to save/update contract
    // if (mode === 'edit') {
    //   this.contractService.updateContract(formData).subscribe(...)
    // } else {
    //   this.contractService.createContract(formData).subscribe(...)
    // }
  }

  // ==================== HELPERS ====================

  formatDate(dateString: string): string {
    try {
      const date = fromDateString(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  getStatusColor(status: string): string {
    return (
      CONTRACT_STATUS_LABELS[status as keyof typeof CONTRACT_STATUS_LABELS]?.COLOR ||
      'rgb(var(--muted))'
    );
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
