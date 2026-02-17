// pipeline-funnel-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PipelineStageData } from '@core/models/dashboard.types';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-pipeline-funnel-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline-funnel-chart.component.html',
  styleUrl: './pipeline-funnel-chart.component.css'
})
export class PipelineFunnelChartComponent implements OnChanges, AfterViewInit {

  @Input() stages: PipelineStageData[] = [];
  @Input() isLoading: boolean = false;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  // ==================== LIFECYCLE ====================

  ngAfterViewInit(): void {
    if (this.stages.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stages'] && !changes['stages'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // ==================== CHART CREATION ====================

  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Prepare data
    const labels = this.stages.map(s => s.stageName);
    const values = this.stages.map(s => s.totalValue / 1000000); // Convert to millions
    const counts = this.stages.map(s => s.dealCount);
    const colors = this.stages.map(s => s.color);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pipeline Value (฿M)',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => this.darkenColor(c)),
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const value = values[index];
                const count = counts[index];
                return [
                  `Value: ฿${value.toFixed(1)}M`,
                  `Deals: ${count}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            },
            ticks: {
              callback: (value) => `฿${value}M`,
              font: {
                size: 12
              },
              color: '#6b7280'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 13,
                weight: 'bold'
              },
              color: '#1f2937'
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart || this.stages.length === 0) {
      this.createChart();
      return;
    }

    const labels = this.stages.map(s => s.stageName);
    const values = this.stages.map(s => s.totalValue / 1000000);
    const colors = this.stages.map(s => s.color);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.data.datasets[0].borderColor = colors.map(c => this.darkenColor(c));

    this.chart.update();
  }

  // ==================== UTILITY ====================

  private darkenColor(color: string): string {
    // Simple darken function for border
    const amount = 20;
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  getTotalValue(): string {
    const total = this.stages.reduce((sum, s) => sum + s.totalValue, 0);
    return this.formatCurrency(total);
  }

  getTotalDeals(): number {
    return this.stages.reduce((sum, s) => sum + s.dealCount, 0);
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
