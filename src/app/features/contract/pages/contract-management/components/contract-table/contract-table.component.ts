// contract-table.component.ts - UPDATED with shared state
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract, CONTRACT_STATUS_LABELS } from '@core/models/contract.model';
import { SearchFilter, SavedSearch, SearchFieldType, SEARCH_FIELD_CONFIG } from '@core/models/contract-search.model';
import { fromDateString } from '@core/utils/date-utils';
import { AdvanceSearchModalComponent } from '../advance-search-modal/advance-search-modal.component';

@Component({
  selector: 'app-contract-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvanceSearchModalComponent],
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

  savedSearches = signal<SavedSearch[]>([
    {
      id: 'bookmark1',
      name: 'Bookmark1',
      filters: [],
      createdAt: new Date()
    },
    {
      id: 'bookmark2',
      name: 'Bookmark2',
      filters: [],
      createdAt: new Date()
    }
  ]);

  // Selection
  selectedIds = signal<string[]>([]);

  // UI State
  showAdvanceSearchModal = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
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
      if (!filter.field || !filter.isComplete) return;

      switch (filter.field) {
        case 'CONTRACT_NUMBER':
          contracts = contracts.filter(c =>
            c.CONTRACT_NUMBER.toLowerCase().includes((filter.value as string).toLowerCase())
          );
          break;
        case 'CUSTOMER':
        case 'COMPANY_NAME':
          contracts = contracts.filter(c =>
            c.TENANT_NAME_TH.toLowerCase().includes((filter.value as string).toLowerCase()) ||
            c.TENANT_NAME_EN.toLowerCase().includes((filter.value as string).toLowerCase())
          );
          break;
        case 'CONTRACT_TYPE':
          if (Array.isArray(filter.value)) {
            contracts = contracts.filter(c => filter.value.includes(c.CONTRACT_TYPE));
          }
          break;
        case 'STATUS':
          if (Array.isArray(filter.value)) {
            contracts = contracts.filter(c => filter.value.includes(c.STATUS));
          }
          break;
        case 'BUILDING':
          if (Array.isArray(filter.value)) {
            contracts = contracts.filter(c =>
              c.BUILDING_CODE && filter.value.includes(c.BUILDING_CODE)
            );
          }
          break;
        case 'AREA_ID':
          // NEW: Filter by area ID
          contracts = contracts.filter(c =>
            c.AREA_ID.toLowerCase().includes((filter.value as string).toLowerCase())
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
    // Emit to parent for cross-tab sync
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
    this.filtersChange.emit(filters); // Emit to parent for cross-tab sync
  }

  removeFilter(id: string): void {
    const updated = this.activeFilters().filter(f => f.id !== id);
    this.activeFilters.set(updated);
    this.filtersChange.emit(updated); // Emit to parent
  }

  clearAllFilters(): void {
    this.activeFilters.set([]);
    this.simpleSearchText.set('');
    this.filtersChange.emit([]); // Emit to parent
    this.searchTextChange.emit('');
  }

  applyBookmark(bookmark: SavedSearch): void {
    this.activeFilters.set([...bookmark.filters]);
    this.filtersChange.emit([...bookmark.filters]); // Emit to parent
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

  // ==================== ACTIONS ====================

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
    alert(`${action} for ${contract.CONTRACT_NUMBER}`);
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  saveNewContract(): void {
    console.log('Saving new contract...');
    this.closeAddModal();
    alert('Contract saved! (placeholder)');
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
    return CONTRACT_STATUS_LABELS[status as keyof typeof CONTRACT_STATUS_LABELS]?.COLOR || '#9CA3AF';
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
