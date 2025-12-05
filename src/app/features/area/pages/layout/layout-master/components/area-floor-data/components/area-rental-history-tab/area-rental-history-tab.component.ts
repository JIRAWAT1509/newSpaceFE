// area-rental-history-tab.component.ts
import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { RentalHistory, MOVE_OUT_CATEGORY_LABELS } from '@core/models/rental-history.model';
import { getRentalHistoryByAreaId } from '@core/data/rental-history.mock';
import { fromDateString } from '@core/utils/date-utils';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-area-rental-history-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './area-rental-history-tab.component.html',
  styleUrl: './area-rental-history-tab.component.css'
})
export class AreaRentalHistoryTabComponent {
  areaId = input.required<string>();

  // Signals
  expandedId = signal<string | null>(null);
  sortBy = signal<string>('date-desc');
  filterCategory = signal<string | null>(null);

  // Sort options
  sortOptions: SortOption[] = [
    { label: 'Date (Newest First)', value: 'date-desc' },
    { label: 'Date (Oldest First)', value: 'date-asc' },
    { label: 'Rent (High to Low)', value: 'rent-desc' },
    { label: 'Rent (Low to High)', value: 'rent-asc' },
    { label: 'Duration (Longest First)', value: 'duration-desc' },
    { label: 'Duration (Shortest First)', value: 'duration-asc' }
  ];

  // Category filter options
  categoryOptions: SortOption[] = [
    { label: 'All Categories', value: '' },
    { label: MOVE_OUT_CATEGORY_LABELS.RELOCATION.TH, value: 'RELOCATION' },
    { label: MOVE_OUT_CATEGORY_LABELS.COST.TH, value: 'COST' },
    { label: MOVE_OUT_CATEGORY_LABELS.DISSATISFACTION.TH, value: 'DISSATISFACTION' },
    { label: MOVE_OUT_CATEGORY_LABELS.BUSINESS_CLOSED.TH, value: 'BUSINESS_CLOSED' },
    { label: MOVE_OUT_CATEGORY_LABELS.OTHER.TH, value: 'OTHER' }
  ];

  // Computed
  rentalHistory = computed<RentalHistory[]>(() => {
    return getRentalHistoryByAreaId(this.areaId());
  });

  filteredHistory = computed<RentalHistory[]>(() => {
    let history = [...this.rentalHistory()];

    // Apply category filter
    const category = this.filterCategory();
    if (category) {
      history = history.filter(h => h.MOVE_OUT_CATEGORY === category);
    }

    // Apply sorting
    const sort = this.sortBy();
    switch (sort) {
      case 'date-desc':
        history.sort((a, b) => this.getTimestamp(b.LEASE_END) - this.getTimestamp(a.LEASE_END));
        break;
      case 'date-asc':
        history.sort((a, b) => this.getTimestamp(a.LEASE_END) - this.getTimestamp(b.LEASE_END));
        break;
      case 'rent-desc':
        history.sort((a, b) => b.MONTHLY_RENT - a.MONTHLY_RENT);
        break;
      case 'rent-asc':
        history.sort((a, b) => a.MONTHLY_RENT - b.MONTHLY_RENT);
        break;
      case 'duration-desc':
        history.sort((a, b) => b.OCCUPANCY_DAYS - a.OCCUPANCY_DAYS);
        break;
      case 'duration-asc':
        history.sort((a, b) => a.OCCUPANCY_DAYS - b.OCCUPANCY_DAYS);
        break;
    }

    return history;
  });

  // ==================== ACTIONS ====================

  toggleExpand(id: string): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(id);
    }
  }

  onSortChange(): void {
    // Signal will automatically trigger recomputation
  }

  onFilterChange(): void {
    // Signal will automatically trigger recomputation
  }

  // ==================== HELPERS ====================

  getCategoryLabel(category: string): string {
    const labels = MOVE_OUT_CATEGORY_LABELS;
    return labels[category as keyof typeof labels]?.TH || category;
  }

  getCategoryColor(category: string): string {
    const labels = MOVE_OUT_CATEGORY_LABELS;
    return labels[category as keyof typeof labels]?.COLOR || '#6B7280';
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }

  formatDate(dateString: string): string {
    const date = fromDateString(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private getTimestamp(dateString: string): number {
    return parseInt(dateString.replace(/\/Date\((\d+)\)\//, '$1'));
  }
}
