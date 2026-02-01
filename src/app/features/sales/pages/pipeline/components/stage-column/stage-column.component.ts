// stage-column.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import {
  Deal,
  PipelineStage,
  StageMetrics,
  StageSortBy,
  StageViewConfig
} from '@core/models/pipeline.model';
import { DealCardComponent } from '../deal-card/deal-card.component';
import { StagePaginationComponent } from '../stage-pagination/stage-pagination.component';

interface SortOption {
  label: string;
  value: StageSortBy;
}

@Component({
  selector: 'app-stage-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    DealCardComponent,
    StagePaginationComponent
  ],
  templateUrl: './stage-column.component.html',
  styleUrl: './stage-column.component.css'
})
export class StageColumnComponent {
  // Inputs
  stage = input.required<PipelineStage>();
  deals = input.required<Deal[]>();
  viewConfig = input.required<StageViewConfig>();
  stageMetrics = input.required<StageMetrics>();

  // Outputs
  sortChange = output<StageSortBy>();
  pageChange = output<number>();
  cardsPerPageChange = output<number>();
  stageSettings = output<void>();
  dealClicked = output<string>();
  dealMenuClicked = output<string>();
  dealDropped = output<string>(); // Emits dealId when dropped in this column

  // Sort options
  sortOptions: SortOption[] = [
    { label: '📅 Due Date', value: 'due-date' },
    { label: '💰 Value', value: 'value' },
    { label: '📊 Probability', value: 'probability' },
    { label: '🔤 Name', value: 'name' },
    { label: '🚨 Priority', value: 'priority' },
    { label: '📆 Created Date', value: 'created-date' },
    { label: '🕐 Days in Stage', value: 'days-in-stage' }
  ];

  // Computed: Sorted deals
  sortedDeals = computed(() => {
    const deals = [...this.deals()];
    const sortBy = this.viewConfig().sortBy;
    const sortOrder = this.viewConfig().sortOrder;

    deals.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'due-date':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'value':
          comparison = b.value - a.value; // Highest first by default
          break;
        case 'probability':
          comparison = b.actualWinRate - a.actualWinRate; // Highest first
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'created-date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'days-in-stage':
          comparison = b.daysInStage - a.daysInStage; // Longest first
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return deals;
  });

  // Computed: Total pages
  totalPages = computed(() => {
    const total = this.sortedDeals().length;
    const perPage = this.viewConfig().cardsPerPage;
    return Math.ceil(total / perPage) || 1;
  });

  // Computed: Paginated deals
  paginatedDeals = computed(() => {
    const sorted = this.sortedDeals();
    const page = this.viewConfig().currentPage;
    const perPage = this.viewConfig().cardsPerPage;

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return sorted.slice(startIndex, endIndex);
  });

  // Format currency
  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `฿${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `฿${(amount / 1000).toFixed(0)}K`;
    }
    return `฿${amount.toLocaleString()}`;
  }

  // Handle sort change
  onSortChange(value: StageSortBy): void {
    this.sortChange.emit(value);
  }

  // Handle page change
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  // Handle cards per page change
  onCardsPerPageChange(value: number): void {
    this.cardsPerPageChange.emit(value);
  }

  // Handle stage settings
  onStageSettings(): void {
    this.stageSettings.emit();
  }

  // Handle deal clicks
  onDealClicked(dealId: string): void {
    this.dealClicked.emit(dealId);
  }

  onDealMenuClicked(dealId: string): void {
    this.dealMenuClicked.emit(dealId);
  }

  // Drop zone handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const dealId = event.dataTransfer!.getData('dealId');
    if (dealId) {
      this.dealDropped.emit(dealId);
    }
  }
}
