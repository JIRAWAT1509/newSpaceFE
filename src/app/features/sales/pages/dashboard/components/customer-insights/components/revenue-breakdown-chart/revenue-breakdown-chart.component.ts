// revenue-breakdown-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { RevenueSegment } from '@core/models/dashboard.types';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-breakdown-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue-breakdown-chart.component.html',
  styleUrl: './revenue-breakdown-chart.component.css'
})
export class RevenueBreakdownChartComponent implements OnChanges, AfterViewInit {

  @Input() segments: RevenueSegment[] = [];
  @Input() isLoading: boolean = false;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    if (this.segments.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['segments'] && !changes['segments'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.segments.map(s => s.segment);
    const data = this.segments.map(s => s.arr / 1000000); // Convert to millions
    const colors = this.segments.map(s => s.color);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const segment = this.segments[index];
                return [
                  `ARR: ฿${segment.arr.toLocaleString()}`,
                  `Customers: ${segment.customerCount}`,
                  `Share: ${segment.percentage.toFixed(1)}%`,
                  `Avg CSAT: ${segment.avgCSAT}`
                ];
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart || this.segments.length === 0) {
      this.createChart();
      return;
    }

    const labels = this.segments.map(s => s.segment);
    const data = this.segments.map(s => s.arr / 1000000);
    const colors = this.segments.map(s => s.color);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;

    this.chart.update();
  }

  getTotalARR(): string {
    const total = this.segments.reduce((sum, s) => sum + s.arr, 0);
    return this.formatCurrency(total);
  }

  getTotalCustomers(): number {
    return this.segments.reduce((sum, s) => sum + s.customerCount, 0);
  }

  private formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }
}
