// advance-search-modal.component.ts
import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import {
  SearchFilter,
  SearchFieldType,
  SEARCH_FIELD_CONFIG,
  BUILDING_OPTIONS,
  CATEGORY_OPTIONS,
  SavedSearch
} from '@core/models/contract-search.model';
import { CONTRACT_TYPE_LABELS, CONTRACT_STATUS_LABELS } from '@core/models/contract.model';

@Component({
  selector: 'app-advance-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelect],
  templateUrl: './advance-search-modal.component.html',
  styleUrl: './advance-search-modal.component.css'
})
export class AdvanceSearchModalComponent implements OnInit {
  filters = input<SearchFilter[]>([]);
  filtersChange = output<SearchFilter[]>();
  savedSearchChange = output<SavedSearch>();
  close = output<void>();

  localFilters = signal<SearchFilter[]>([]);
  showSaveDialog = signal<boolean>(false);
  bookmarkName = signal<string>('');
  private readonly bookmarkKey = 'contract_advance_search_bookmarks';

  ngOnInit(): void {
    // Initialize with existing filters or one empty filter
    const existingFilters = this.filters();
    if (existingFilters.length > 0) {
      this.localFilters.set([...existingFilters]);
    } else {
      this.addFilter();
    }
  }

  // ==================== FILTER MANAGEMENT ====================

  addFilter(): void {
    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}`,
      field: null,
      value: '',
      isComplete: false
    };
    this.localFilters.update(filters => [...filters, newFilter]);
  }

  removeFilter(index: number): void {
    if (this.localFilters().length === 1) return; // Keep at least one
    this.localFilters.update(filters => filters.filter((_, i) => i !== index));
  }

  onFieldChange(index: number): void {
    this.localFilters.update(filters => {
      const updated = [...filters];
      const filter = updated[index];

      // Reset value when field changes
      filter.value = this.isTextField(filter.field!) ? '' : [];
      filter.isComplete = false;

      return updated;
    });
  }

  onValueChange(index: number): void {
    this.localFilters.update(filters => {
      const updated = [...filters];
      const filter = updated[index];

      // Check if complete
      if (Array.isArray(filter.value)) {
        filter.isComplete = filter.value.length > 0;
      } else {
        filter.isComplete = filter.value.trim().length > 0;
      }

      return updated;
    });
  }

  // ==================== HELPERS ====================

  getFieldKeys(): SearchFieldType[] {
    return Object.keys(SEARCH_FIELD_CONFIG) as SearchFieldType[];
  }

  getFieldLabel(field: SearchFieldType): string {
    return SEARCH_FIELD_CONFIG[field].TH;
  }

  isTextField(field: SearchFieldType): boolean {
    return SEARCH_FIELD_CONFIG[field].INPUT_TYPE === 'text';
  }

  getSelectOptions(field: SearchFieldType): { label: string, value: string }[] {
    switch (field) {
      case 'BUILDING':
        return BUILDING_OPTIONS;
      case 'CATEGORY':
        return CATEGORY_OPTIONS;
      case 'CONTRACT_TYPE':
        return Object.entries(CONTRACT_TYPE_LABELS).map(([key, val]) => ({
          label: val.TH,
          value: key
        }));
      case 'STATUS':
        return Object.entries(CONTRACT_STATUS_LABELS).map(([key, val]) => ({
          label: val.TH,
          value: key
        }));
      default:
        return [];
    }
  }

  hasValidFilters(): boolean {
    return this.localFilters().some(f => f.isComplete);
  }

  // ==================== ACTIONS ====================

  onSearch(): void {
    // Only emit complete filters
    const validFilters = this.localFilters().filter(f => f.isComplete);
    this.filtersChange.emit(validFilters);
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }

  // ==================== BOOKMARK MANAGEMENT ====================

  openSaveDialog(): void {
    if (!this.hasValidFilters()) {
      return;
    }
    this.bookmarkName.set('');
    this.showSaveDialog.set(true);
  }

  closeSaveDialog(): void {
    this.showSaveDialog.set(false);
    this.bookmarkName.set('');
  }

  saveBookmark(): void {
    const name = this.bookmarkName().trim();
    if (!name) {
      return;
    }

    const validFilters = this.localFilters().filter(f => f.isComplete);
    if (validFilters.length === 0) {
      return;
    }

    const bookmark: SavedSearch = {
      id: `bookmark-${Date.now()}`,
      name: name,
      filters: JSON.parse(JSON.stringify(validFilters)), // Deep copy
      createdAt: new Date()
    };

    // Save to localStorage
    const existing = this.loadBookmarks();
    existing.push(bookmark);
    localStorage.setItem(this.bookmarkKey, JSON.stringify(existing));

    // Emit to parent
    this.savedSearchChange.emit(bookmark);
    this.closeSaveDialog();
  }

  private loadBookmarks(): SavedSearch[] {
    const raw = localStorage.getItem(this.bookmarkKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as SavedSearch[];
      // Convert date strings back to Date objects
      return parsed.map(b => ({
        ...b,
        createdAt: new Date(b.createdAt)
      }));
    } catch {
      return [];
    }
  }
}
