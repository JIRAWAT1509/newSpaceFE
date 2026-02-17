// churn-chart.component.ts
import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

export interface ChurnData {
  currentRate: number;
  previousRate: number;
  customersLost: number;
  totalCustomers: number;
  reasons: ChurnReason[];
}

export interface ChurnReason {
  reason: string;
  percentage: number;
}

type TimePeriod = 'month' | 'quarter' | 'year';

@Component({
  selector: 'app-churn-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './churn-chart.component.html',
  styleUrl: './churn-chart.component.css'
})
export class ChurnChartComponent {
  // Inputs
  data = input.required<ChurnData>();

  // State
  selectedPeriod = signal<TimePeriod>('month');

  // Chart configuration
  chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.data().reasons.map(r => r.reason),
    datasets: [
      {
        data: this.data().reasons.map(r => r.percentage),
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#3b82f6',
          '#10b981'
        ],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  }));

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
    cutout: '65%'
  };

  // Period selector
  selectPeriod(period: TimePeriod): void {
    this.selectedPeriod.set(period);
    // In production, this would trigger data reload
    ////console.log('Selected period:', period);
  }

  isPeriodSelected(period: TimePeriod): boolean {
    return this.selectedPeriod() === period;
  }

  // Calculate trend
  getTrend(): number {
    return this.data().currentRate - this.data().previousRate;
  }

  isImprovement(): boolean {
    return this.getTrend() < 0;
  }

  // Math for template
  Math = Math;
}
