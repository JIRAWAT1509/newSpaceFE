// stage-conversion-table.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineStage } from '@core/data/sales-performance.mock';

@Component({
  selector: 'app-stage-conversion-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-conversion-table.component.html',
  styleUrl: './stage-conversion-table.component.css'
})
export class StageConversionTableComponent {

  // ==================== INPUTS ====================
  @Input() stages: PipelineStage[] = [];

  // ==================== FORMATTING ====================

  formatPercentage(value: number): string {
    return `${value}%`;
  }

  formatDays(value: number): string {
    return value.toFixed(1);
  }

  // Get color class based on conversion rate
  getConversionColorClass(rate: number): string {
    if (rate >= 60) return 'excellent';
    if (rate >= 50) return 'good';
    if (rate >= 40) return 'fair';
    return 'poor';
  }

  // Get icon based on conversion rate
  getConversionIcon(rate: number): string {
    if (rate >= 60) return 'pi-arrow-up';
    if (rate >= 50) return 'pi-arrow-right';
    if (rate >= 40) return 'pi-arrow-down-right';
    return 'pi-arrow-down';
  }

  // Calculate total deals in pipeline
  getTotalDeals(): number {
    return this.stages.reduce((sum, stage) => sum + stage.count, 0);
  }

  // Calculate average conversion rate
  getAverageConversion(): number {
    if (this.stages.length === 0) return 0;
    const total = this.stages.reduce((sum, stage) => sum + stage.conversionRate, 0);
    return Math.round(total / this.stages.length);
  }

  // Calculate average median days
  getAverageMedianDays(): number {
    if (this.stages.length === 0) return 0;
    const total = this.stages.reduce((sum, stage) => sum + stage.medianDays, 0);
    return +(total / this.stages.length).toFixed(1);
  }

  // Get stage icon
  getStageIcon(index: number): string {
    const icons = [
      'pi-search',      // Prospect → Qualify
      'pi-check-circle', // Qualify → Proposal
      'pi-file-edit',    // Proposal → Negotiate
      'pi-handshake'     // Negotiate → Close
    ];
    return icons[index] || 'pi-circle';
  }

  // Get stage color
  getStageColor(index: number): string {
    const colors = ['blue', 'green', 'purple', 'orange'];
    return colors[index] || 'blue';
  }
}
