// kanban-board.component.ts (FIXED - USES STAGE-COLUMN)
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal, PipelineStage, StageSortBy, StageViewConfig, StageMetrics } from '@core/models/pipeline.model';
import { StageColumnComponent } from '../stage-column/stage-column.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, StageColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent {
  // Inputs
  stages = input.required<PipelineStage[]>();
  dealsByStage = input.required<Map<string, Deal[]>>();
  stageViewConfigs = input.required<Map<string, StageViewConfig>>();

  // Outputs
  stageSortChange = output<{ stageId: string; sortBy: StageSortBy }>();
  stagePageChange = output<{ stageId: string; page: number }>();
  stageSettings = output<string>();
  dealClicked = output<string>();
  dealMenuClicked = output<string>();
  dealMoved = output<{ dealId: string; fromStageId: string; toStageId: string }>();

  // Current drag state
  protected currentDragDealId: string | null = null;
  private currentDragFromStageId: string | null = null;
  isDragging = signal(false); // Global drag state for all columns
  currentMousePosition = signal<{ x: number; y: number } | null>(null);

  // Track global mouse position during drag
  private globalMouseMoveHandler = (event: MouseEvent) => {
    if (this.isDragging()) {
      this.currentMousePosition.set({ x: event.clientX, y: event.clientY });
    }
  };

  constructor() {
    // Add global mouse listener
    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', this.globalMouseMoveHandler);
    }
  }

  ngOnDestroy() {
    // Clean up global listener
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', this.globalMouseMoveHandler);
    }
  }

  // Handle sort change from stage column
  onSortChange(stageId: string, sortBy: StageSortBy): void {
    this.stageSortChange.emit({ stageId, sortBy });
  }

  // Handle page change from stage column
  onPageChange(stageId: string, page: number): void {
    this.stagePageChange.emit({ stageId, page });
  }

  // Handle cards per page change from stage column
  onCardsPerPageChange(stageId: string, cardsPerPage: number): void {
    const config = this.stageViewConfigs().get(stageId);
    if (config) {
      // Update config with new cardsPerPage (you'll need to add this output if needed)
      ////console.log(`Cards per page changed for ${stageId}:`, cardsPerPage);
    }
  }

  // Handle settings click from stage column
  onSettingsClick(stageId: string): void {
    this.stageSettings.emit(stageId);
  }

  // Handle deal click from stage column
  onDealClick(dealId: string): void {
    this.dealClicked.emit(dealId);
  }

  // Handle deal menu from stage column
  onDealMenu(dealId: string): void {
    this.dealMenuClicked.emit(dealId);
  }

  // Handle drag start - remember which deal and stage
  onDealDragStart(dealId: string): void {
    this.currentDragDealId = dealId;
    this.isDragging.set(true); // Set global drag state

    // Find which stage this deal is in
    for (const [stageId, deals] of this.dealsByStage().entries()) {
      if (deals.some(d => d.id === dealId)) {
        this.currentDragFromStageId = stageId;
        const stageName = this.stages().find(s => s.id === stageId)?.name;
        ////console.log('🎯 KANBAN-BOARD: Drag started');
        ////console.log('   - Deal ID:', dealId);
        ////console.log('   - From Stage ID:', stageId);
        ////console.log('   - From Stage Name:', stageName);
        break;
      }
    }

    if (!this.currentDragFromStageId) {
      console.error('❌ KANBAN-BOARD: Could not find source stage for deal:', dealId);
    }
  }

  // Handle drag end - called when mouse is released
  onDealDragEnd(sourceStageId: string): void {
    ////console.log('🎯 KANBAN-BOARD: Drag ended, waiting for columns to check...');

    // Delay clearing drag state to allow effects to fire and detect drops
    setTimeout(() => {
      ////console.log('🎯 KANBAN-BOARD: Clearing drag state');
      this.isDragging.set(false);
      this.currentMousePosition.set(null);
    }, 50); // 50ms delay
  }

  // Handle drop - stage-column already detected which stage
  onDealDrop(event: { dealId: string; targetStageId: string }): void {
    ////console.log('📥 KANBAN-BOARD: Drop event received');
    ////console.log('   - Deal ID:', event.dealId);
    ////console.log('   - Target Stage ID:', event.targetStageId);
    ////console.log('   - Source Stage ID:', this.currentDragFromStageId);

    if (!this.currentDragFromStageId) {
      console.error('❌ KANBAN-BOARD: Drop without knowing source stage!');
      return;
    }

    const fromStageId = this.currentDragFromStageId;
    const toStageId = event.targetStageId;

    const fromStageName = this.stages().find(s => s.id === fromStageId)?.name;
    const toStageName = this.stages().find(s => s.id === toStageId)?.name;

    ////console.log('✅ KANBAN-BOARD: Emitting dealMoved event');
    ////console.log('   - From:', fromStageName, `(${fromStageId})`);
    ////console.log('   - To:', toStageName, `(${toStageId})`);

    // Emit to pipeline-master
    this.dealMoved.emit({
      dealId: event.dealId,
      fromStageId: fromStageId,
      toStageId: toStageId
    });

    ////console.log('✅ KANBAN-BOARD: dealMoved event emitted successfully');

    // Reset drag state
    this.currentDragDealId = null;
    this.currentDragFromStageId = null;
    this.isDragging.set(false);
    this.currentMousePosition.set(null);
  }

  // Get stage metrics for a stage
  getStageMetrics(stageId: string): StageMetrics {
    const stage = this.stages().find(s => s.id === stageId);
    const deals = this.dealsByStage().get(stageId) || [];
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const totalWeightedValue = deals.reduce((sum, d) => sum + d.weightedValue, 0);
    const avgWinRate = deals.length > 0
      ? deals.reduce((sum, d) => sum + d.actualWinRate, 0) / deals.length
      : 0;
    const avgDaysInStage = deals.length > 0
      ? deals.reduce((sum, d) => sum + d.daysInStage, 0) / deals.length
      : 0;

    return {
      stageId: stageId,
      stageName: stage?.name || '',
      totalDeals: deals.length,
      totalValue: totalValue,
      totalWeightedValue: totalWeightedValue,
      averageDealValue: deals.length > 0 ? totalValue / deals.length : 0,
      forecastWinRate: stage?.forecastWinRate || 0,
      actualWinRate: Math.round(avgWinRate),
      averageDaysInStage: Math.round(avgDaysInStage)
    };
  }

  // Get view config for a stage
  getStageConfig(stageId: string): StageViewConfig {
    return this.stageViewConfigs().get(stageId) || {
      stageId: stageId,
      sortBy: 'due-date',
      sortOrder: 'asc',
      currentPage: 1,
      cardsPerPage: 8
    };
  }

  // Get deals for a stage
  getStageDeals(stageId: string): Deal[] {
    return this.dealsByStage().get(stageId) || [];
  }
}
