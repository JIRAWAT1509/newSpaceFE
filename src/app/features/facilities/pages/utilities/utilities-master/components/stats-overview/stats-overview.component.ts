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
  tone: 'primary' | 'warning' | 'info' | 'success';
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
        tone: 'primary'
      },
      {
        icon: 'pi-clock',
        label: 'Pending Readings',
        value: statsData.pendingReadings,
        change: statsData.changePercent.pending,
        changeLabel: 'vs last month',
        tone: 'warning'
      },
      {
        icon: 'pi-chart-line',
        label: 'Last Month Consumption',
        value: statsData.lastMonthConsumption.toLocaleString(),
        unit: statsData.lastMonthConsumptionUnit,
        change: statsData.changePercent.consumption,
        changeLabel: 'vs previous month',
        tone: 'info'
      },
      {
        icon: 'pi-dollar',
        label: 'Cost Savings',
        value: `฿${statsData.costSavings.toLocaleString()}`,
        change: statsData.changePercent.savings,
        changeLabel: 'vs last month',
        tone: 'success'
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
}
