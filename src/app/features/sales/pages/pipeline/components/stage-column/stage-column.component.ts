// stage-column.component.ts (FIXED DROP DETECTION)
import { Component, input, output, computed, signal, ElementRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal, PipelineStage, StageMetrics, StageSortBy, StageViewConfig } from '@core/models/pipeline.model';
import { StagePaginationComponent } from '../stage-pagination/stage-pagination.component';
import { DealCardComponent } from '../deal-card/deal-card.component';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';

interface SortOption {
  label: string;
  value: StageSortBy;
}

@Component({
  selector: 'app-stage-column',
  standalone: true,
  imports: [CommonModule, StagePaginationComponent, DealCardComponent, Select, FormsModule],
  templateUrl: './stage-column.component.html',
  styleUrl: './stage-column.component.css'
})
export class StageColumnComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  stage = input.required<PipelineStage>();
  deals = input.required<Deal[]>();
  viewConfig = input.required<StageViewConfig>();
  metrics = input.required<StageMetrics>();
  isDraggingGlobal = input<boolean>(false); // Global drag state from kanban-board
  globalMousePosition = input<{ x: number; y: number } | null>(null); // Global mouse position during drag
  currentDragDealId = input<string | null>(null); // Currently dragging deal ID

  // Outputs
  sortChange = output<StageSortBy>();
  pageChange = output<number>();
  cardsPerPageChange = output<number>();
  settingsClick = output<void>();
  dealClick = output<string>();
  dealMenuClick = output<string>();
  dealDragStart = output<string>();
  dealDragEnd = output<void>();
  dealDrop = output<{ dealId: string; targetStageId: string }>();

  // Drag state
  isDragOver = signal(false);
  private wasOver = false; // Track previous state to detect drop

  constructor() {
    // Watch global mouse position and check if over this column's deals-list
    effect(() => {
      const mousePos = this.globalMousePosition();
      const isDragging = this.isDraggingGlobal();
      const dragDealId = this.currentDragDealId();

      // If drag just ended and we were over this column, emit drop
      if (!isDragging && this.wasOver && dragDealId) {
        ////console.log('🎯 Effect detected drop on:', this.stage().name, 'deal:', dragDealId);
        this.dealDrop.emit({
          dealId: dragDealId,
          targetStageId: this.stage().id
        });
        this.wasOver = false;
        this.isDragOver.set(false);
        return;
      }

      // Reset if not dragging
      if (!isDragging || !mousePos) {
        this.isDragOver.set(false);
        this.wasOver = false;
        return;
      }

      // Get deals-list element for this column
      const dealsListElement = this.elementRef.nativeElement.querySelector('.deals-list');
      if (!dealsListElement) {
        this.isDragOver.set(false);
        this.wasOver = false;
        return;
      }

      const rect = dealsListElement.getBoundingClientRect();
      const isOver = (
        mousePos.x >= rect.left &&
        mousePos.x <= rect.right &&
        mousePos.y >= rect.top &&
        mousePos.y <= rect.bottom
      );

      // Only log state changes
      if (isOver !== this.isDragOver()) {
        if (isOver) {
          ////console.log('✅ Mouse OVER:', this.stage().name);
        } else if (this.isDragOver()) {
          ////console.log('❌ Mouse LEFT:', this.stage().name);
        }
      }

      this.wasOver = isOver;
      this.isDragOver.set(isOver);
    });
  }

  // Sort options
  sortOptions: SortOption[] = [
    { label: 'Due Date', value: 'dueDate' as StageSortBy },
    { label: 'Value (High-Low)', value: 'valueDesc' as StageSortBy },
    { label: 'Value (Low-High)', value: 'valueAsc' as StageSortBy },
    { label: 'Win Rate (High-Low)', value: 'winRateDesc' as StageSortBy },
    { label: 'Win Rate (Low-High)', value: 'winRateAsc' as StageSortBy },
    { label: 'Recent First', value: 'recent' as StageSortBy },
    { label: 'Oldest First', value: 'oldest' as StageSortBy }
  ];

  // Computed: Sorted deals
  sortedDeals = computed(() => {
    const deals = [...this.deals()];
    const sortBy = this.viewConfig().sortBy as StageSortBy;

    switch (sortBy) {
      case 'dueDate' as StageSortBy:
        return deals.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      case 'valueDesc' as StageSortBy:
        return deals.sort((a, b) => b.value - a.value);
      case 'valueAsc' as StageSortBy:
        return deals.sort((a, b) => a.value - b.value);
      case 'winRateDesc' as StageSortBy:
        return deals.sort((a, b) => b.actualWinRate - a.actualWinRate);
      case 'winRateAsc' as StageSortBy:
        return deals.sort((a, b) => a.actualWinRate - b.actualWinRate);
      case 'recent' as StageSortBy:
        return deals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest' as StageSortBy:
        return deals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return deals;
    }
  });

  // Computed: Paginated deals
  paginatedDeals = computed(() => {
    const deals = this.sortedDeals();
    const config = this.viewConfig();
    const startIndex = (config.currentPage - 1) * config.cardsPerPage;
    const endIndex = startIndex + config.cardsPerPage;
    return deals.slice(startIndex, endIndex);
  });

  // Computed: Total pages
  totalPages = computed(() => {
    const totalDeals = this.deals().length;
    const cardsPerPage = this.viewConfig().cardsPerPage;
    return Math.ceil(totalDeals / cardsPerPage);
  });

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }

  // Handle sort change
  onSortChange(sortBy: StageSortBy): void {
    this.sortChange.emit(sortBy);
  }

  // Handle page change
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  // Handle cards per page change
  onCardsPerPageChange(cardsPerPage: number): void {
    this.cardsPerPageChange.emit(cardsPerPage);
  }

  // Handle previous page
  onPreviousPage(): void {
    const currentPage = this.viewConfig().currentPage;
    if (currentPage > 1) {
      this.pageChange.emit(currentPage - 1);
    }
  }

  // Handle next page
  onNextPage(): void {
    const currentPage = this.viewConfig().currentPage;
    const totalPages = this.totalPages();
    if (currentPage < totalPages) {
      this.pageChange.emit(currentPage + 1);
    }
  }

  // Handle settings click
  onSettingsClick(): void {
    this.settingsClick.emit();
  }

  // Handle deal click
  onDealClick(dealId: string): void {
    this.dealClick.emit(dealId);
  }

  // Handle deal menu
  onDealMenu(dealId: string): void {
    this.dealMenuClick.emit(dealId);
  }

  // Handle deal drag start - just notify kanban-board
  onDealDragStart(event: { dealId: string; event: MouseEvent }): void {
    this.dealDragStart.emit(event.dealId);
    ////console.log('📍 Column', this.stage().name, 'registered drag:', event.dealId);
  }

  // Handle deal drag end - effect will handle drop if over this column
  onDealDragEnd(event: MouseEvent): void {
    ////console.log('🎯 Stage-column: Drag ended, notifying kanban-board');
    this.dealDragEnd.emit();
    // Effect watches isDraggingGlobal and will emit drop if this column is the target
  }
}
