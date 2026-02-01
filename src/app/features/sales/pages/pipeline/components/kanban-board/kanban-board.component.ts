// kanban-board.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Deal,
  PipelineStage,
  StageMetrics,
  StageSortBy,
  StageViewConfig
} from '@core/models/pipeline.model';
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
  stageMetrics = input.required<Map<string, StageMetrics>>();

  // Outputs
  stageSortChange = output<{ stageId: string; sortBy: StageSortBy }>();
  stagePageChange = output<{ stageId: string; page: number }>();
  stageCardsPerPageChange = output<{ stageId: string; cardsPerPage: number }>();
  stageSettings = output<string>(); // Emits stageId
  dealClicked = output<string>(); // Emits dealId
  dealMenuClicked = output<string>(); // Emits dealId
  dealMoved = output<{ dealId: string; fromStageId: string; toStageId: string }>();

  // Track dragging state
  private draggedDealId: string | null = null;
  private sourceStageId: string | null = null;

  // Get deals for a stage
  getDealsForStage(stageId: string): Deal[] {
    return this.dealsByStage().get(stageId) || [];
  }

  // Get view config for a stage
  getViewConfigForStage(stageId: string): StageViewConfig {
    return this.stageViewConfigs().get(stageId) || {
      stageId,
      sortBy: 'due-date',
      sortOrder: 'asc',
      currentPage: 1,
      cardsPerPage: 8
    };
  }

  // Get metrics for a stage
  getMetricsForStage(stageId: string): StageMetrics {
    return this.stageMetrics().get(stageId) || {
      stageId,
      stageName: '',
      totalDeals: 0,
      totalValue: 0,
      totalWeightedValue: 0,
      averageDealValue: 0,
      forecastWinRate: 0,
      actualWinRate: 0,
      averageDaysInStage: 0
    };
  }

  // Handle sort change
  onStageSortChange(stageId: string, sortBy: StageSortBy): void {
    this.stageSortChange.emit({ stageId, sortBy });
  }

  // Handle page change
  onStagePageChange(stageId: string, page: number): void {
    this.stagePageChange.emit({ stageId, page });
  }

  // Handle cards per page change
  onStageCardsPerPageChange(stageId: string, cardsPerPage: number): void {
    this.stageCardsPerPageChange.emit({ stageId, cardsPerPage });
  }

  // Handle stage settings
  onStageSettings(stageId: string): void {
    this.stageSettings.emit(stageId);
  }

  // Handle deal clicked
  onDealClicked(dealId: string): void {
    this.dealClicked.emit(dealId);
  }

  // Handle deal menu clicked
  onDealMenuClicked(dealId: string): void {
    this.dealMenuClicked.emit(dealId);
  }

  // Handle deal dropped in a column
  onDealDropped(dealId: string, toStageId: string): void {
    // Find which stage the deal came from
    let fromStageId: string | null = null;

    for (const [stageId, deals] of this.dealsByStage().entries()) {
      if (deals.some(d => d.id === dealId)) {
        fromStageId = stageId;
        break;
      }
    }

    if (fromStageId && fromStageId !== toStageId) {
      this.dealMoved.emit({
        dealId,
        fromStageId,
        toStageId
      });
    }
  }
}
