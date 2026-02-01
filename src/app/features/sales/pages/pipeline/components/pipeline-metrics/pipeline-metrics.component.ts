// pipeline-metrics.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineMetrics, HotFilter } from '@core/models/pipeline.model';

interface MetricCard {
  id: HotFilter;
  label: string;
  value: string | number;
  subtext: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  icon: string;
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

  // Get all metric cards
  getMetricCards(): MetricCard[] {
    const m = this.metrics();

    return [
      {
        id: 'all',
        label: 'Total Deals',
        value: m.totalDeals,
        subtext: 'Active in pipeline',
        change: m.dealsAddedThisWeek > 0 ? `+${m.dealsAddedThisWeek} this week` : undefined,
        changeType: 'up',
        color: 'blue',
        icon: '💼'
      },
      {
        id: 'all',
        label: 'Pipeline Value',
        value: this.formatCurrency(m.totalValue),
        subtext: 'Total deal value',
        change: undefined,
        color: 'green',
        icon: '💰'
      },
      {
        id: 'all',
        label: 'Weighted Value',
        value: this.formatCurrency(m.totalWeightedValue),
        subtext: 'Expected revenue',
        change: `${Math.round((m.totalWeightedValue / m.totalValue) * 100)}% prob`,
        changeType: 'neutral',
        color: 'purple',
        icon: '📈'
      },
      {
        id: 'all',
        label: 'Average Deal',
        value: this.formatCurrency(m.averageDealValue),
        subtext: 'Per deal value',
        change: undefined,
        color: 'orange',
        icon: '📊'
      },
      {
        id: 'overdue',
        label: 'Overdue Deals',
        value: m.overdueDealCount,
        subtext: m.overdueDealCount === 0 ? 'All on track!' : 'Needs attention',
        change: m.overdueDealCount > 0 ? '⚠️ Action needed' : undefined,
        changeType: 'down',
        color: 'red',
        icon: '🔴'
      },
      {
        id: 'near-due',
        label: 'Near Due',
        value: m.nearDueDealCount,
        subtext: 'Due in 1-2 days',
        change: m.nearDueDealCount > 0 ? '⚠️ Watch closely' : undefined,
        changeType: m.nearDueDealCount > 0 ? 'down' : 'neutral',
        color: 'orange',
        icon: '⏰'
      },
      {
        id: 'all',
        label: 'Win Rate',
        value: `${m.winRate}%`,
        subtext: 'Last 90 days',
        change: undefined,
        color: 'cyan',
        icon: '🎯'
      },
      {
        id: 'high-priority',
        label: 'High Priority',
        value: this.getHighPriorityCount(),
        subtext: 'High priority deals',
        change: undefined,
        color: 'red',
        icon: '🔥'
      }
    ];
  }

  // Get high priority count (you'll need to pass this from parent or calculate)
  private getHighPriorityCount(): number {
    // This should come from a proper calculation
    // For now, return 0 as placeholder
    return 0;
  }

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

  // Handle metric card click
  onMetricClick(filterId: HotFilter): void {
    // Toggle filter: if already active, set to 'all', otherwise activate
    const newFilter = this.activeHotFilter() === filterId ? 'all' : filterId;
    this.hotFilterChange.emit(newFilter);
  }

  // Check if metric card is active
  isCardActive(filterId: HotFilter): boolean {
    return this.activeHotFilter() === filterId;
  }
}
