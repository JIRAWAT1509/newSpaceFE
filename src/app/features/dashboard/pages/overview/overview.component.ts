 import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { getChartPalette, getChartPaletteWithAlpha, getStatusPalette } from '@core/utils/chart-colors';

interface Branch {
  id: string;
  code: string;
  name: string;
  displayName: string;
}

// ==========================================================
// REQUIRED DASHBOARD DATA STRUCTURES
// If real data sources exist later, swap these out.
// Mock data is clearly marked in comments only (not shown in UI).
// ==========================================================

export interface RevenueDelta {
  label: string; // "REV VS. LAST WEEK"
  value: number; // 42500
  unit: string; // "$"
  changePercent: number; // 3.2
  trend: 'up' | 'down';
}

export interface DashboardKPI {
  title: string;
  value: string | number;
  subLabel?: string;
  badge?: string;
  status?: 'on-track' | 'warning' | 'risk';
}

export interface RevenuePerformancePoint {
  period: string; // Q1, Q2, Q3, Q4
  actual: number;
  budget: number;
  forecast: number;
}

export interface BusinessOccupancy {
  type: string; // Commercial, Retail, Parking, Other
  percent: number;
}

export interface PortfolioMix {
  type: string;
  percent: number;
}

export interface BuildingPerformance {
  assetName: string;
  occupancy: number;
  trend: 'Strong' | 'Stable' | 'Improve';
}

export interface SalesPerformance {
  name: string;
  percent: number;
}

export interface CollectionAging {
  bucket: string; // "> 30 DAYS"
  amount: number;
}

type ExecTab = 'portfolio' | 'building' | 'collections';

Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',

})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  // Branch selection
  branches: Branch[] = [
    { id: '1', code: 'ทั้งหมด', name: 'ทั้งหมด', displayName: 'ทั้งหมด' },
    { id: '2', code: 'ST03', name: 'อาคารชินวัตร ทาวเวอร์ 3', displayName: 'ST03 : อาคารชินวัตร ทาวเวอร์ 3' },
    { id: '3', code: 'WBP1', name: 'Warehouse Bangphee 1', displayName: 'WBP1 : Warehouse Bangphee 1' },
    { id: '4', code: 'WBP2', name: 'Warehouse Bangphee 2', displayName: 'WBP2 : Warehouse Bangphee 2' }
  ];

  selectedBranch: string = '2'; // Default to ST03

  // ==================== UI STATE ====================
  activeTab: ExecTab = 'portfolio';

  // Deep-dive selector
  assets: string[] = ['Skyline Tower (HQ)', 'Grand Plaza', 'Retail Hub A'];
  selectedAsset: string = this.assets[0];

  // ==================== MOCK DATA (replace with real data when available) ====================
  // MOCK: hero pills
  revenueDeltas: RevenueDelta[] = [
    { label: 'REV VS. LAST WEEK', value: 42500, unit: '$', changePercent: 3.2, trend: 'up' },
    { label: 'REV VS. LAST MONTH', value: 128000, unit: '$', changePercent: 8.4, trend: 'up' },
  ];

  // MOCK: KPI cards row
  kpis: DashboardKPI[] = [
    { title: 'PORTFOLIO OCCUPANCY', value: '94.2%', badge: '+1.2% YoY' },
    { title: 'ACTUAL YTD REVENUE', value: '$14.2M', badge: 'YoY +12%', subLabel: 'Budget: $423.0M' },
    { title: 'FORECAST (DEC 2026)', value: '$18.1M', status: 'on-track' },
    { title: 'AVG LEASE DURATION', value: '3.2 yrs', subLabel: 'New Contracts YTD' },
  ];

  // MOCK: Revenue performance series
  revenuePerformance: RevenuePerformancePoint[] = [
    { period: 'Q1', actual: 3.2, budget: 3.0, forecast: 3.3 },
    { period: 'Q2', actual: 4.1, budget: 3.8, forecast: 4.2 },
    { period: 'Q3 (YTD)', actual: 5.0, budget: 4.5, forecast: 5.1 },
    { period: 'Q4 (FCST)', actual: 5.8, budget: 5.2, forecast: 6.0 },
  ];

  // MOCK: Occupancy donut
  occupancyByBusinessType: BusinessOccupancy[] = [
    { type: 'Commercial', percent: 42 },
    { type: 'Retail', percent: 28 },
    { type: 'Parking', percent: 18 },
    { type: 'Other', percent: 12 },
  ];

  /** Colors for Occupancy by Business Type (donut + legend), same order as occupancyByBusinessType */
  occupancyPalette: string[] = [];

  /** Colors for Portfolio by Business Type bars: Office, Retail, F&B, Service (same order as portfolioMix) */
  portfolioBarPalette: string[] = [];

  // MOCK: Portfolio mix bars
  portfolioMix: PortfolioMix[] = [
    { type: 'Office (45%)', percent: 89 },
    { type: 'Retail (28%)', percent: 93 },
    { type: 'F&B (18%)', percent: 87 },
    { type: 'Service (12%)', percent: 84 },
  ];

  // MOCK: Building performance list
  buildingPerformance: BuildingPerformance[] = [
    { assetName: 'Skyline Tower', occupancy: 98, trend: 'Strong' },
    { assetName: 'Grand Plaza', occupancy: 92, trend: 'Stable' },
    { assetName: 'Retail Hub A', occupancy: 65, trend: 'Improve' },
  ];

  // MOCK: Deep-dive revenue mix donut (same segments as reference legend)
  deepDiveRevenueMix: BusinessOccupancy[] = [
    { type: 'Commercial', percent: 42 },
    { type: 'Retail', percent: 28 },
    { type: 'Parking', percent: 18 },
    { type: 'Other', percent: 12 },
  ];

  // MOCK: Performance index bars (2025 vs 2026)
  performanceIndexLabels: string[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  performanceIndex2025: number[] = [2.1, 2.6, 3.0, 2.9];
  performanceIndex2026: number[] = [2.4, 2.9, 3.3, 3.2];

  // MOCK: Sales team vs budget
  salesTeamPerformance: SalesPerformance[] = [
    { name: 'Sarah Miller', percent: 115 },
    { name: 'Kevin Park', percent: 98 },
    { name: 'Lisa Wong', percent: 62 },
  ];

  // MOCK: Revenue collection aging
  collectionAging: CollectionAging[] = [
    { bucket: '> 30 DAYS', amount: 450000 },
    { bucket: '> 60 DAYS', amount: 280000 },
    { bucket: '> 90 DAYS', amount: 112000 },
  ];

  /** Colors for Revenue Collection Aging bars: 30d=info, 60d=warning, 90d=danger */
  agingBarPalette: string[] = [];

  /** Colors for Revenue Mix by Segment donut + legend (Commercial, Retail, Parking, Other) */
  deepDivePalette: string[] = [];

  // ==================== CHART REFS ====================
  @ViewChild('revPerfChart') revPerfChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('occupancyDonutChart') occupancyDonutChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('deepDiveDonutChart') deepDiveDonutChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceIndexChart') performanceIndexChartRef?: ElementRef<HTMLCanvasElement>;

  private revPerfChart?: Chart;
  private occupancyDonutChart?: Chart;
  private deepDiveDonutChart?: Chart;
  private performanceIndexChart?: Chart;

  constructor() { }

  ngOnInit(): void {
    this.occupancyPalette = getChartPalette(this.occupancyByBusinessType.length);
    const info = this.getCssColor('--info', '#38BDF8');
    const success = this.getCssColor('--success', '#22C55E');
    const warning = this.getCssColor('--warning', '#F59E0B');
    this.portfolioBarPalette = [
      info,
      '#8B5CF6',
      success,
      warning,
    ].slice(0, this.portfolioMix.length);
    const danger = this.getCssColor('--danger', '#EF4444');
    this.agingBarPalette = [info, warning, danger].slice(0, this.collectionAging.length);
    this.deepDivePalette = getChartPalette(this.deepDiveRevenueMix.length);
  }

  ngAfterViewInit(): void {
    // Init charts after view is painted
    setTimeout(() => this.initCharts(), 0);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  onBranchChange(branchId: string): void {
    this.selectedBranch = branchId;
    // TODO: reload/refresh dashboard data based on branch filter when API is available.
    this.rebuildCharts();
  }

  getSelectedBranchName(): string {
    const branch = this.branches.find(b => b.id === this.selectedBranch);
    return branch ? branch.displayName : '';
  }

  setTab(tab: ExecTab): void {
    this.activeTab = tab;
  }

  // ==================== CHARTS ====================

  private initCharts(): void {
    this.destroyCharts();
    this.initRevenuePerformanceChart();
    this.initOccupancyDonutChart();
    this.initDeepDiveDonutChart();
    this.initPerformanceIndexChart();
  }

  private rebuildCharts(): void {
    // Keep it simple: destroy + recreate for deterministic render
    setTimeout(() => this.initCharts(), 0);
  }

  private destroyCharts(): void {
    this.revPerfChart?.destroy();
    this.occupancyDonutChart?.destroy();
    this.deepDiveDonutChart?.destroy();
    this.performanceIndexChart?.destroy();
  }

  private initRevenuePerformanceChart(): void {
    const ctx = this.revPerfChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const fg = this.getCssColor('--fg', '#111827');
    const muted = this.getCssColor('--muted', '#6B7280');
    const gridColor = this.getCssColorWithAlpha('--border', 0.35, 'rgba(229,231,235,0.35)');
    const primary = this.getCssColor('--primary', '#2563eb');
    const success = this.getCssColor('--success', '#22C55E');
    const warning = this.getCssColor('--warning', '#F59E0B');

    const labels = this.revenuePerformance.map(p => p.period);
    const actual = this.revenuePerformance.map(p => p.actual);
    const budget = this.revenuePerformance.map(p => p.budget);
    const forecast = this.revenuePerformance.map(p => p.forecast);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          // Bar charts
          {
            type: 'bar',
            label: 'Actual',
            data: actual,
            backgroundColor: primary,
            borderRadius: 6,
            barPercentage: 0.5,
            categoryPercentage: 0.7,
            order: 3,
          } as any,
          {
            type: 'bar',
            label: 'Budget',
            data: budget,
            backgroundColor: success,
            borderRadius: 6,
            barPercentage: 0.5,
            categoryPercentage: 0.7,
            order: 3,
          } as any,
          // Line charts
          {
            type: 'line',
            label: 'Actual (trend)',
            data: actual,
            borderColor: primary,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: primary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            order: 1,
          } as any,
          {
            type: 'line',
            label: 'Budget (trend)',
            data: budget,
            borderColor: success,
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: success,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderDash: [6, 4],
            order: 1,
          } as any,
          {
            type: 'line',
            label: 'Forecast',
            data: forecast,
            borderColor: warning,
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: warning,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderDash: [3, 3],
            order: 1,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, right: 20, bottom: 10, left: 10 } },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              color: fg,
              boxWidth: 14,
              boxHeight: 14,
              padding: 20,
              font: { size: 12, weight: 500 },
              usePointStyle: true,
              filter: (item) => {
                // Hide trend lines from legend (show only Actual, Budget, Forecast)
                return !item.text.includes('trend');
              },
            },
          },
          tooltip: {
            displayColors: true,
            backgroundColor: 'rgba(255,255,255,0.98)',
            titleColor: fg,
            bodyColor: fg,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 12, weight: 600 },
            bodyFont: { size: 12 },
            filter: (item) => {
              // Hide trend lines from tooltip
              return !item.dataset.label?.includes('trend');
            },
            callbacks: {
              label: (item) => ` ${item.dataset.label}: $${Number(item.raw).toFixed(1)}M`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: muted,
              font: { size: 12, weight: 500 },
              maxRotation: 0,
              padding: 8,
            },
          },
          y: {
            min: 0,
            max: 7,
            grid: { color: gridColor, drawTicks: false },
            border: { display: false },
            ticks: {
              color: muted,
              font: { size: 11, weight: 500 },
              padding: 8,
              stepSize: 1,
              callback: (v) => `$${Number(v)}M`,
            },
          },
        },
      },
    };

    this.revPerfChart = new Chart(ctx, config);
  }

  private initOccupancyDonutChart(): void {
    const ctx = this.occupancyDonutChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.occupancyByBusinessType.map(d => d.type);
    const data = this.occupancyByBusinessType.map(d => d.percent);
    const palette = this.occupancyPalette.length ? this.occupancyPalette : getChartPalette(labels.length);

    const borderColor = this.getCssColor('--card', '#ffffff');
    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels,
        datasets: [
          ({
            data,
            backgroundColor: palette,
            borderColor,
            borderWidth: 2,
            hoverOffset: 8,
            hoverBorderWidth: 2,
            cutout: '62%',
          } as any),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (item) => `${item.label}: ${item.raw}%` },
          },
        },
      },
    };

    this.occupancyDonutChart = new Chart(ctx, config);
  }

  private initDeepDiveDonutChart(): void {
    const ctx = this.deepDiveDonutChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.deepDiveRevenueMix.map(d => d.type);
    const data = this.deepDiveRevenueMix.map(d => d.percent);
    const palette = this.deepDivePalette.length ? this.deepDivePalette : getChartPalette(labels.length);

    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels,
        datasets: [
          ({
            data,
            backgroundColor: palette,
            borderWidth: 0,
            cutout: '72%',
          } as any),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    };

    this.deepDiveDonutChart = new Chart(ctx, config);
  }

  private initPerformanceIndexChart(): void {
    const ctx = this.performanceIndexChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const fg = this.getCssColor('--fg', '#111827');
    const muted = this.getCssColor('--muted', '#6B7280');
    const border = this.getCssColor('--border', '#E5E7EB');

    const palette = getChartPalette(2);
    const mutedAlpha = this.getCssColorWithAlpha('--muted', 0.18, 'rgba(107,114,128,0.18)');

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.performanceIndexLabels,
        datasets: [
          {
            label: '2025',
            data: this.performanceIndex2025,
            backgroundColor: mutedAlpha,
            borderRadius: 8,
            barPercentage: 0.75,
            categoryPercentage: 0.62,
          },
          {
            label: '2026',
            data: this.performanceIndex2026,
            backgroundColor: palette[0],
            borderRadius: 8,
            barPercentage: 0.75,
            categoryPercentage: 0.62,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: fg,
              boxWidth: 14,
              boxHeight: 10,
              padding: 12,
              font: { size: 11, weight: 600 },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: muted, font: { size: 11 } },
          },
          y: {
            grid: { color: border },
            ticks: { color: muted, font: { size: 10 } },
          },
        },
      },
    };

    this.performanceIndexChart = new Chart(ctx, config);
  }

  // ==================== PRESENTATION HELPERS ====================

  private getCssColor(varName: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!raw) return fallback;
    // Theme variables are stored as "r g b"
    const parts = raw.split(/\s+/).map((p) => Number(p));
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => !Number.isNaN(n))) {
      return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
    }
    // If already a css color string, use as-is
    return raw;
  }

  private getCssColorWithAlpha(varName: string, alpha: number, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!raw) return fallback;
    const parts = raw.split(/\s+/).map((p) => Number(p));
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => !Number.isNaN(n))) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
    return fallback;
  }

  formatMoneyCompact(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`;
    return `$${amount.toLocaleString()}`;
  }

  formatMoney(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  getKpiStatusLabel(status?: DashboardKPI['status']): string {
    if (status === 'on-track') return 'On Track';
    if (status === 'warning') return 'Watch';
    if (status === 'risk') return 'At Risk';
    return '';
  }

  getKpiIcon(title: string): string {
    switch (title) {
      case 'PORTFOLIO OCCUPANCY':
        return 'pi-percentage';
      case 'ACTUAL YTD REVENUE':
        return 'pi-dollar';
      case 'FORECAST (DEC 2026)':
        return 'pi-compass';
      case 'AVG LEASE DURATION':
        return 'pi-calendar';
      default:
        return 'pi-chart-bar';
    }
  }

  getKpiIconClass(title: string): string {
    switch (title) {
      case 'PORTFOLIO OCCUPANCY':
        return 'tone-success';
      case 'ACTUAL YTD REVENUE':
        return 'tone-primary';
      case 'FORECAST (DEC 2026)':
        return 'tone-info';
      case 'AVG LEASE DURATION':
        return 'tone-warning';
      default:
        return 'tone-primary';
    }
  }

  getTrendColor(trend: RevenueDelta['trend']): string {
    const status = getStatusPalette();
    return trend === 'up' ? status.success : status.danger;
  }

  getBuildingTrendClass(trend: BuildingPerformance['trend']): string {
    if (trend === 'Strong') return 'trend-strong';
    if (trend === 'Stable') return 'trend-stable';
    return 'trend-improve';
  }

  /** Sales row status for bar/name/pct color: over=primary, on-track=success, risk=danger */
  getSalesRowClass(percent: number): 'sales-over' | 'sales-on-track' | 'sales-risk' {
    if (percent >= 100) return 'sales-over';
    if (percent >= 90) return 'sales-on-track';
    return 'sales-risk';
  }

  /** Max amount for Revenue Collection Aging bar scale */
  get maxAgingAmount(): number {
    if (!this.collectionAging.length) return 1;
    return Math.max(...this.collectionAging.map((b) => b.amount));
  }
}
