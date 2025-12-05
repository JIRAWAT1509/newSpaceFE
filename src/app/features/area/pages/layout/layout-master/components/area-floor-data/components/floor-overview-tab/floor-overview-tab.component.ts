// floor-overview-tab.component.ts
import { Component, input, signal, computed, effect, viewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { FloorStatistics, AreaTypeDistribution, RentRateHistoryPoint } from '@core/models/floor-statistics.model';
import { getFloorStatistics, generateFloorStatistics } from '@core/data/floor-statistics.mock';
import { fromDateString } from '@core/utils/date-utils';

Chart.register(...registerables);

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-floor-overview-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, MultiSelect],
  templateUrl: './floor-overview-tab.component.html',
  styleUrl: './floor-overview-tab.component.css'
})
export class FloorOverviewTabComponent implements AfterViewInit, OnDestroy {
  floorId = input.required<string>();

  pieChart = viewChild<ElementRef>('pieChart');
  lineChart = viewChild<ElementRef>('lineChart');

  // Signals
  pieChartInstance = signal<Chart | null>(null);
  lineChartInstance = signal<Chart | null>(null);
  typeVisibility = signal<Record<string, boolean>>({
    'log': true,
    'kiosk': true,
    'open-plan': true
  });

  selectedTypes = signal<string[]>(['average', 'log', 'kiosk', 'open-plan']);
  timeRange = signal<string>('12');

  // Filter Options
  typeFilterOptions: FilterOption[] = [
    { label: 'Average', value: 'average' },
    { label: 'Log', value: 'log' },
    { label: 'Kiosk', value: 'kiosk' },
    { label: 'Open Plan', value: 'open-plan' }
  ];

  timeRangeOptions: FilterOption[] = [
    { label: 'Last 3 Months', value: '3' },
    { label: 'Last 6 Months', value: '6' },
    { label: 'Last 12 Months', value: '12' }
  ];

  // Computed
  floorStats = computed<FloorStatistics | null>(() => {
    const id = this.floorId();
    if (!id) return null;

    // Try to get from mock data, fallback to generated
    let stats = getFloorStatistics(id);
    if (!stats) {
      stats = generateFloorStatistics(id, `Floor ${id}`);
    }
    return stats;
  });

  filteredHistory = computed<RentRateHistoryPoint[]>(() => {
    const stats = this.floorStats();
    if (!stats) return [];

    const range = parseInt(this.timeRange());
    const history = stats.RENT_RATE_HISTORY;

    return history.slice(-range);
  });

  constructor() {
    // Watch for data changes
    effect(() => {
      const stats = this.floorStats();
      if (stats) {
        setTimeout(() => {
          this.updatePieChart();
          this.updateLineChart();
        }, 100);
      }
    });

    // Watch for filter changes
    effect(() => {
      this.selectedTypes();
      this.timeRange();
      setTimeout(() => this.updateLineChart(), 50);
    });
  }

  ngAfterViewInit(): void {
    this.initPieChart();
    this.initLineChart();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // ==================== PIE CHART ====================

  initPieChart(): void {
    const canvas = this.pieChart();
    const stats = this.floorStats();
    if (!canvas || !stats) return;

    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const visibility = this.typeVisibility();
    const data = stats.AREA_BY_TYPE.map(t => visibility[t.TYPE] ? t.COUNT : 0);
    const colors = stats.AREA_BY_TYPE.map(t => visibility[t.TYPE] ? t.COLOR : 'transparent');

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: stats.AREA_BY_TYPE.map(t => t.TYPE_LABEL_EN),
        datasets: [{
          data: data,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                if (value === 0) return '';
                return `${context.label}: ${value} areas`;
              }
            }
          }
        },
        cutout: '65%'
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const width = chart.width;
          const height = chart.height;

          ctx.restore();
          const fontSize = (height / 200).toFixed(2);
          ctx.font = `bold ${fontSize}em sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#374151';

          const total = stats.TOTAL_AREAS_COUNT;
          const text = `${total}`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 - 8;

          ctx.fillText(text, textX, textY);

          // Label
          const fontSize2 = (height / 300).toFixed(2);
          ctx.font = `${fontSize2}em sans-serif`;
          ctx.fillStyle = '#6B7280';

          const text2 = 'Total Areas';
          const textX2 = Math.round((width - ctx.measureText(text2).width) / 2);
          const textY2 = height / 2 + 12;

          ctx.fillText(text2, textX2, textY2);
          ctx.save();
        }
      }]
    };

    const chart = new Chart(ctx, config);
    this.pieChartInstance.set(chart);
  }

  updatePieChart(): void {
    this.destroyPieChart();
    this.initPieChart();
  }

  destroyPieChart(): void {
    const chart = this.pieChartInstance();
    if (chart) {
      chart.destroy();
      this.pieChartInstance.set(null);
    }
  }

  toggleType(type: string): void {
    const current = this.typeVisibility();
    this.typeVisibility.set({
      ...current,
      [type]: !current[type]
    });
    this.updatePieChart();
  }

  // ==================== LINE CHART ====================

  initLineChart(): void {
    const canvas = this.lineChart();
    const history = this.filteredHistory();
    if (!canvas || history.length === 0) return;

    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const selectedTypes = this.selectedTypes();
    const datasets: any[] = [];

    // Average dataset
    if (selectedTypes.includes('average')) {
      datasets.push({
        label: 'Average',
        data: history.map(h => h.AVERAGE_RENT),
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#9C27B0'
      });
    }

    // Log dataset
    if (selectedTypes.includes('log')) {
      datasets.push({
        label: 'Log',
        data: history.map(h => h.LOG_AVERAGE || 0),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2196F3'
      });
    }

    // Kiosk dataset
    if (selectedTypes.includes('kiosk')) {
      datasets.push({
        label: 'Kiosk',
        data: history.map(h => h.KIOSK_AVERAGE || 0),
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#FF9800'
      });
    }

    // Open Plan dataset
    if (selectedTypes.includes('open-plan')) {
      datasets.push({
        label: 'Open Plan',
        data: history.map(h => h.OPEN_PLAN_AVERAGE || 0),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#4CAF50'
      });
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: history.map(h => this.formatDate(h.DATE)),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: ฿${this.formatNumber(value ?? 0)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => `฿${this.formatNumber(Number(value))}`
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.lineChartInstance.set(chart);
  }

  updateLineChart(): void {
    this.destroyLineChart();
    this.initLineChart();
  }

  destroyLineChart(): void {
    const chart = this.lineChartInstance();
    if (chart) {
      chart.destroy();
      this.lineChartInstance.set(null);
    }
  }

  onFilterChange(): void {
    // Triggers computed signal update
  }

  // ==================== CLEANUP ====================

  destroyCharts(): void {
    this.destroyPieChart();
    this.destroyLineChart();
  }

  // ==================== HELPERS ====================

  formatNumber(value: number): string {
    return Math.round(value).toLocaleString('en-US');
  }

  formatDate(dateString: string): string {
    const date = fromDateString(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short'
    });
  }
}
