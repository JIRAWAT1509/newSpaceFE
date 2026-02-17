// pipeline-metrics.component.ts (SIMPLIFIED - COMBINED URGENT FILTER)
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineMetrics, HotFilter } from '@core/models/pipeline.model';

interface MetricCard {
  label: string;
  value: string | number;
  icon: string;
  filter?: HotFilter;
  isActive: boolean;
}

@Component({
  selector: 'app-pipeline-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline-metrics.component.html',
  styleUrl: './pipeline-metrics.component.css'
})
export class PipelineMetricsComponent {
  // Inputs
  metrics = input.required<PipelineMetrics>();
  activeHotFilter = input.required<HotFilter>();

  // Outputs
  hotFilterChange = output<HotFilter>();

  // Computed metric cards
  metricCards = computed<MetricCard[]>(() => {
    const metrics = this.metrics();
    const activeFilter = this.activeHotFilter();

    // Calculate urgent deals (overdue + near-due)
    const urgentDeals = metrics.overdueDealCount + metrics.nearDueDealCount;

    return [
      {
        label: 'Total Deals',
        value: metrics.totalDeals,
        icon: '📊',
        filter: 'all',
        isActive: activeFilter === 'all'
      },
      {
        label: 'Total Value',
        value: this.formatCurrency(metrics.totalValue),
        icon: '💰',
        filter: undefined,
        isActive: false
      },
      {
        label: 'Urgent Deals',
        value: urgentDeals,
        icon: '🔥',
        filter: 'urgent',
        isActive: activeFilter === 'urgent'
      },
      {
        label: 'High Priority',
        value: this.getHighPriorityCount(),
        icon: '🔴',
        filter: 'high-priority',
        isActive: activeFilter === 'high-priority'
      }
    ];
  });

  // Get high priority count from deals
  private getHighPriorityCount(): number {
    // This will be passed from parent or calculated
    return 0; // Placeholder - parent will provide actual count
  }

  // Handle metric card click
  onMetricClick(filter?: HotFilter): void {
    if (filter) {
      this.hotFilterChange.emit(filter);
    }
  }

  // Format currency
  private formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }
}
