// stats-overview.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeterStats } from '@core/models/meter.model';
import { MOCK_METER_STATS } from '@core/data/meter.mock';

interface StatCard {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  change: number;
  changeLabel: string;
  color: string;
  bgGradient: string;
}

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-overview.component.html',
  styleUrl: './stats-overview.component.css'
})
export class StatsOverviewComponent implements OnInit {
  stats = signal<MeterStats>(MOCK_METER_STATS);
  statCards = signal<StatCard[]>([]);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    const statsData = this.stats();

    const cards: StatCard[] = [
      {
        icon: 'pi-check-circle',
        label: 'Total Active Meters',
        value: statsData.totalActiveMeters,
        change: statsData.changePercent.meters,
        changeLabel: 'vs last month',
        color: '#667eea',
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        icon: 'pi-clock',
        label: 'Pending Readings',
        value: statsData.pendingReadings,
        change: statsData.changePercent.pending,
        changeLabel: 'vs last month',
        color: '#f093fb',
        bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        icon: 'pi-chart-line',
        label: 'Last Month Consumption',
        value: statsData.lastMonthConsumption.toLocaleString(),
        unit: statsData.lastMonthConsumptionUnit,
        change: statsData.changePercent.consumption,
        changeLabel: 'vs previous month',
        color: '#4facfe',
        bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        icon: 'pi-dollar',
        label: 'Cost Savings',
        value: `฿${statsData.costSavings.toLocaleString()}`,
        change: statsData.changePercent.savings,
        changeLabel: 'vs last month',
        color: '#43e97b',
        bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    ];

    this.statCards.set(cards);
  }

  isPositiveChange(change: number): boolean {
    return change > 0;
  }

  getChangeIcon(change: number): string {
    return change > 0 ? 'pi-arrow-up' : 'pi-arrow-down';
  }

  getChangeColor(change: number): string {
    return change > 0 ? '#10B981' : '#EF4444';
  }
}
