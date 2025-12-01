// team-overview-panel.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesTeamMember } from '@core/data/sales-performance.mock';

@Component({
  selector: 'app-team-overview-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-overview-panel.component.html',
  styleUrl: './team-overview-panel.component.css'
})
export class TeamOverviewPanelComponent {

  @Input() teamTotals: {
    thisYear: number;
    thisWeek: number;
    lastWeek: number;
    weekChange: number;
  } = {
    thisYear: 0,
    thisWeek: 0,
    lastWeek: 0,
    weekChange: 0
  };

  @Input() leaderboard: SalesTeamMember[] = [];
  @Input() weeklySales: Array<{ week: string; sales: number }> = [];

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  // Format large number with K suffix
  formatNumber(value: number): string {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  // Generate SVG chart points
  generateChartPoints(): string {
    if (this.weeklySales.length === 0) return '';

    const maxSales = Math.max(...this.weeklySales.map(w => w.sales));
    const width = 200;
    const height = 60;
    const padding = 5;

    const points = this.weeklySales.map((week, index) => {
      const x = (index / (this.weeklySales.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((week.sales / maxSales) * (height - padding * 2));
      return `${x},${y}`;
    });

    // Add bottom corners for filled area
    const lastX = padding + (width - padding * 2);
    points.push(`${lastX},${height}`);
    points.push(`${padding},${height}`);

    return points.join(' ');
  }
}
