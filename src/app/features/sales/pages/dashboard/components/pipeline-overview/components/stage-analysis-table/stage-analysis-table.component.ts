// stage-analysis-table.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineStageData, StageConversion } from '@core/models/dashboard.types';

@Component({
  selector: 'app-stage-analysis-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-analysis-table.component.html',
  styleUrl: './stage-analysis-table.component.css'
})
export class StageAnalysisTableComponent {

  @Input() stages: PipelineStageData[] = [];
  @Input() conversions: StageConversion[] = [];
  @Input() isLoading: boolean = false;

  // ==================== FORMATTING ====================

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  getConversionForStage(stageIndex: number): StageConversion | null {
    if (stageIndex >= this.conversions.length) return null;
    return this.conversions[stageIndex];
  }

  getConversionClass(rate: number): string {
    if (rate >= 50) return 'conversion-high';
    if (rate >= 30) return 'conversion-medium';
    return 'conversion-low';
  }

  getStageIndex(stageId: string): number {
    return this.stages.findIndex(s => s.stageId === stageId);
  }
}
