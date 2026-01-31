// analytics-charts.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MeterType, getMeterTypeLabel } from '@core/models/meter.model';
import { getChartPalette, getChartPaletteWithAlpha } from '@core/utils/chart-colors';
import { getFacilitiesUtilitiesConfig } from '@core/services/ui-settings';
import { interval, Subscription } from 'rxjs';

Chart.register(...registerables);

interface TimeRange {
  id: string;
  label: string;
  months: number;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './analytics-charts.component.html',
  styleUrl: './analytics-charts.component.css'
})
export class AnalyticsChartsComponent implements OnInit, OnDestroy {
  @ViewChild('consumptionChart') consumptionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeDistributionChart') typeDistributionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topConsumersChart') topConsumersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('costTrendChart') costTrendChartRef!: ElementRef<HTMLCanvasElement>;

  // Charts
  private consumptionChart?: Chart;
  private typeDistributionChart?: Chart;
  private topConsumersChart?: Chart;
  private costTrendChart?: Chart;

  // Filters
  selectedTimeRange = signal<string>('3months');
  selectedMeterType = signal<MeterType | 'all' | string>('all');
  customStartDate = signal<Date | null>(null);
  customEndDate = signal<Date | null>(null);
  showCustomDatePicker = signal<boolean>(false);

  // Config tracking
  private configCheckInterval?: Subscription;
  private configVersion = signal<number>(0);

  // Time range options
  timeRanges: TimeRange[] = [
    { id: 'month', label: 'This Month', months: 1 },
    { id: '3months', label: 'Last 3 Months', months: 3 },
    { id: '6months', label: 'Last 6 Months', months: 6 },
    { id: 'year', label: 'This Year', months: 12 },
    { id: 'custom', label: 'Custom Range', months: 0 }
  ];

  // Meter type filters - computed to include rentable items and be reactive to config changes
  meterTypeFilters = computed(() => {
    this.configVersion(); // Access to make reactive
    const electricityInfo = getMeterTypeLabel('electricity');
    const waterInfo = getMeterTypeLabel('water');
    const gasInfo = getMeterTypeLabel('gas');
    const acInfo = getMeterTypeLabel('ac');

    const baseOptions = [
      { type: 'all' as const, label: 'All Types', icon: 'pi-th-large', color: '#667eea' },
      { type: 'electricity' as const, label: electricityInfo.EN, icon: electricityInfo.icon, color: electricityInfo.color },
      { type: 'water' as const, label: waterInfo.EN, icon: waterInfo.icon, color: waterInfo.color },
      { type: 'gas' as const, label: gasInfo.EN, icon: gasInfo.icon, color: gasInfo.color },
      { type: 'ac' as const, label: acInfo.EN, icon: acInfo.icon, color: acInfo.color }
    ];

    const config = getFacilitiesUtilitiesConfig();
    const rentableItems = config.rentableItems || [];
    const rentableOptions = rentableItems
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        type: `rentable_${item.id}` as const,
        label: item.nameTh || item.name,
        icon: item.icon || 'pi-box',
        color: item.color || '#667eea'
      }));

    return [...baseOptions, ...rentableOptions];
  });

  constructor(private cdr: ChangeDetectorRef) {
    // Rebuild charts when filters change
    effect(() => {
      this.selectedTimeRange();
      this.selectedMeterType();
      this.customStartDate();
      this.customEndDate();
      this.configVersion(); // Also react to config changes

      if (this.consumptionChart) {
        this.updateCharts();
      }
    });
  }

  ngOnInit(): void {
    // Track last config hash to detect changes
    let lastConfigHash = '';
    
    // Check for config changes every 1 second
    this.configCheckInterval = interval(1000).subscribe(() => {
      const config = getFacilitiesUtilitiesConfig();
      const configHash = JSON.stringify({
        colors: config.colors,
        labels: config.labels,
        labelsEn: config.labelsEn,
        icons: config.icons,
        iconTypes: config.iconTypes,
        rentableItems: config.rentableItems
      });
      
      // If config changed, update version to trigger recomputation
      if (configHash !== lastConfigHash) {
        lastConfigHash = configHash;
        this.configVersion.update(v => v + 1);
        this.cdr.markForCheck();
        // Update charts if they're already initialized
        if (this.consumptionChart) {
          this.updateCharts();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.configCheckInterval) {
      this.configCheckInterval.unsubscribe();
    }
    this.destroyCharts();
  }

  // ==================== CHART INITIALIZATION ====================

  initCharts(): void {
    this.initConsumptionTrendChart();
    this.initTypeDistributionChart();
    this.initTopConsumersChart();
    this.initCostTrendChart();
  }

  destroyCharts(): void {
    this.consumptionChart?.destroy();
    this.typeDistributionChart?.destroy();
    this.topConsumersChart?.destroy();
    this.costTrendChart?.destroy();
  }

  updateCharts(): void {
    this.destroyCharts();
    this.initCharts();
  }

  // ==================== CONSUMPTION TREND CHART ====================

  initConsumptionTrendChart(): void {
    const ctx = this.consumptionChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.getConsumptionTrendData();

    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Consumption Trend Over Time',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Consumption (kWh / m³)'
            }
          }
        }
      }
    };

    this.consumptionChart = new Chart(ctx, config);
  }

  getConsumptionTrendData(): ChartData {
    const months = this.getMonthLabels();
    const meterType = this.selectedMeterType();
    const palette = getChartPalette(4);
    const paletteAlpha = getChartPaletteWithAlpha(4, 0.1);

    const showAllTypes = meterType === 'all' || (typeof meterType === 'string' && meterType.startsWith('rentable_'));
    if (showAllTypes) {
      return {
        labels: months,
        datasets: [
          {
            label: 'Electricity (kWh)',
            data: this.generateMockData(months.length, 1000, 1500),
            borderColor: palette[0],
            backgroundColor: paletteAlpha[0],
            tension: 0.4
          },
          {
            label: 'Water (m³)',
            data: this.generateMockData(months.length, 200, 300),
            borderColor: palette[1],
            backgroundColor: paletteAlpha[1],
            tension: 0.4
          },
          {
            label: 'Gas (m³)',
            data: this.generateMockData(months.length, 100, 150),
            borderColor: palette[2],
            backgroundColor: paletteAlpha[2],
            tension: 0.4
          },
          {
            label: 'AC (kWh)',
            data: this.generateMockData(months.length, 300, 400),
            borderColor: palette[3],
            backgroundColor: paletteAlpha[3],
            tension: 0.4
          }
        ]
      };
    }

    const meterTypeIndexMap: Record<MeterType, number> = {
      electricity: 0,
      water: 1,
      gas: 2,
      ac: 3
    };

    const typeKey = meterType as MeterType;
    const typeInfo = getMeterTypeLabel(typeKey);
    const typeIndex = meterTypeIndexMap[typeKey];
    return {
      labels: months,
      datasets: [{
        label: `${typeInfo.TH} Consumption`,
        data: this.generateMockData(months.length, 500, 1000),
        borderColor: palette[typeIndex],
        backgroundColor: paletteAlpha[typeIndex],
        tension: 0.4,
        fill: true
      }]
    };
  }

  // ==================== TYPE DISTRIBUTION CHART ====================

  initTypeDistributionChart(): void {
    const ctx = this.typeDistributionChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const palette = getChartPalette(4);
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Electricity', 'Water', 'Gas', 'AC'],
        datasets: [{
          data: [45, 25, 15, 15],
          backgroundColor: palette,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Consumption by Meter Type (%)',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    };

    this.typeDistributionChart = new Chart(ctx, config);
  }

  // ==================== TOP CONSUMERS CHART ====================

  initTopConsumersChart(): void {
    const ctx = this.topConsumersChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const palette = getChartPalette(5);
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Room 203', 'Room 101', 'Room 103', 'Room 201', 'Room 104'],
        datasets: [{
          label: 'Consumption',
          data: [1567, 1450, 1123, 987, 789],
          backgroundColor: palette,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top 5 Consumers',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Consumption'
            }
          }
        }
      }
    };

    this.topConsumersChart = new Chart(ctx, config);
  }

  // ==================== COST TREND CHART ====================

  initCostTrendChart(): void {
    const ctx = this.costTrendChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const months = this.getMonthLabels();
    const palette = getChartPaletteWithAlpha(1, 0.8);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Total Cost (฿)',
          data: this.generateMockData(months.length, 50000, 80000),
          backgroundColor: palette[0],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Monthly Cost Analysis (฿)',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '฿' + value.toLocaleString()
            }
          }
        }
      }
    };

    this.costTrendChart = new Chart(ctx, config);
  }

  // ==================== HELPER METHODS ====================

  getMonthLabels(): string[] {
    const range = this.selectedTimeRange();
    const rangeData = this.timeRanges.find(r => r.id === range);
    const monthCount = rangeData?.months || 3;

    const months = [];
    const now = new Date();

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    return months;
  }

  generateMockData(length: number, min: number, max: number): number[] {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  }

  // ==================== FILTER ACTIONS ====================

  selectTimeRange(rangeId: string): void {
    this.selectedTimeRange.set(rangeId);

    if (rangeId === 'custom') {
      this.showCustomDatePicker.set(true);
    } else {
      this.showCustomDatePicker.set(false);
    }
  }

  selectMeterType(type: MeterType | 'all' | string): void {
    this.selectedMeterType.set(type);
  }

  isTimeRangeSelected(rangeId: string): boolean {
    return this.selectedTimeRange() === rangeId;
  }

  isMeterTypeSelected(type: MeterType | 'all' | string): boolean {
    return this.selectedMeterType() === type;
  }

  onCustomDateChange(): void {
    // Trigger chart update when custom dates change
    if (this.customStartDate() && this.customEndDate()) {
      this.updateCharts();
    }
  }
}
