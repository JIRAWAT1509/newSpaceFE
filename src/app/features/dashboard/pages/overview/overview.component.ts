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
type RevenueFilterMode = 'overview' | 'by-building' | 'by-category';

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

  // ==================== REVENUE PERFORMANCE FILTER ====================
  revenueFilterMode: RevenueFilterMode = 'overview';
  revenueBuildings: string[] = ['ชินวัตร ทาวเวอร์ 3', 'Warehouse Bangphee 1', 'Warehouse Bangphee 2'];
  selectedRevenueBuilding: string = '';
  revenueCategories: string[] = ['Office', 'Retail', 'F&B', 'Service', 'Parking'];
  selectedRevenueCategory: string = '';

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

  // MOCK: Revenue performance series (monthly, Jan–Dec 2026)
  revenueLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  revenueActual: (number | null)[] = [1.2, 1.3, 1.5, 1.4, 1.6, 1.8, 1.7, 1.9, 2.1, null, null, null];
  revenueBudget: number[] = [1.1, 1.2, 1.3, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1];
  revenueForecast: (number | null)[] = [null, null, null, null, null, null, null, null, 2.1, 2.3, 2.4, 2.6];

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

  // MOCK: Deep-dive portfolio mix (per-building, initialized to default)
  deepDivePortfolioMix: PortfolioMix[] = [
    { type: 'Office (45%)', percent: 89 },
    { type: 'Retail (28%)', percent: 93 },
    { type: 'F&B (18%)', percent: 87 },
    { type: 'Service (12%)', percent: 84 },
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

  // ==================== BUILDING DEEP-DIVE DATA MAP ====================
  private buildingDeepDiveData: Record<string, {
    revenueMix: BusinessOccupancy[];
    perf2025: number[];
    perf2026: number[];
    portfolioMix: PortfolioMix[];
  }> = {
    'Skyline Tower (HQ)': {
      revenueMix: [
        { type: 'Commercial', percent: 42 },
        { type: 'Retail', percent: 28 },
        { type: 'Parking', percent: 18 },
        { type: 'Other', percent: 12 },
      ],
      perf2025: [2.1, 2.6, 3.0, 2.9],
      perf2026: [2.4, 2.9, 3.3, 3.2],
      portfolioMix: [
        { type: 'Office (45%)', percent: 89 },
        { type: 'Retail (28%)', percent: 93 },
        { type: 'F&B (18%)', percent: 87 },
        { type: 'Service (12%)', percent: 84 },
      ],
    },
    'Grand Plaza': {
      revenueMix: [
        { type: 'Commercial', percent: 35 },
        { type: 'Retail', percent: 38 },
        { type: 'Parking', percent: 15 },
        { type: 'Other', percent: 12 },
      ],
      perf2025: [1.8, 2.2, 2.5, 2.4],
      perf2026: [2.1, 2.5, 2.8, 2.7],
      portfolioMix: [
        { type: 'Office (30%)', percent: 82 },
        { type: 'Retail (40%)', percent: 96 },
        { type: 'F&B (20%)', percent: 91 },
        { type: 'Service (10%)', percent: 78 },
      ],
    },
    'Retail Hub A': {
      revenueMix: [
        { type: 'Commercial', percent: 15 },
        { type: 'Retail', percent: 52 },
        { type: 'Parking', percent: 20 },
        { type: 'Other', percent: 13 },
      ],
      perf2025: [1.5, 1.8, 2.1, 1.9],
      perf2026: [1.7, 2.0, 2.3, 2.2],
      portfolioMix: [
        { type: 'Office (10%)', percent: 72 },
        { type: 'Retail (55%)', percent: 65 },
        { type: 'F&B (25%)', percent: 88 },
        { type: 'Service (10%)', percent: 70 },
      ],
    },
  };

  onAssetChange(): void {
    const data = this.buildingDeepDiveData[this.selectedAsset];
    if (data) {
      this.deepDiveRevenueMix = data.revenueMix;
      this.performanceIndex2025 = data.perf2025;
      this.performanceIndex2026 = data.perf2026;
      this.deepDivePortfolioMix = data.portfolioMix;
      this.deepDivePalette = getChartPalette(this.deepDiveRevenueMix.length);
      // Rebuild deep-dive charts only
      this.deepDiveDonutChart?.destroy();
      this.performanceIndexChart?.destroy();
      setTimeout(() => {
        this.initDeepDiveDonutChart();
        this.initPerformanceIndexChart();
      }, 0);
    }
  }

  // ==================== REVENUE FILTER DATA & METHODS ====================

  private revenueBuildingData: Record<string, {
    actual: (number | null)[];
    budget: number[];
    forecast: (number | null)[];
  }> = {
    'ชินวัตร ทาวเวอร์ 3': {
      actual:   [0.8, 0.9, 1.0, 0.95, 1.1, 1.2, 1.15, 1.3, 1.4, null, null, null],
      budget:   [0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2, 1.3, 1.35, 1.4],
      forecast: [null, null, null, null, null, null, null, null, 1.4, 1.5, 1.55, 1.7],
    },
    'Warehouse Bangphee 1': {
      actual:   [0.25, 0.28, 0.30, 0.27, 0.32, 0.35, 0.33, 0.38, 0.42, null, null, null],
      budget:   [0.24, 0.26, 0.28, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44],
      forecast: [null, null, null, null, null, null, null, null, 0.42, 0.48, 0.50, 0.55],
    },
    'Warehouse Bangphee 2': {
      actual:   [0.15, 0.15, 0.20, 0.18, 0.18, 0.25, 0.22, 0.22, 0.28, null, null, null],
      budget:   [0.14, 0.16, 0.17, 0.15, 0.15, 0.18, 0.17, 0.21, 0.20, 0.19, 0.23, 0.25],
      forecast: [null, null, null, null, null, null, null, null, 0.28, 0.32, 0.35, 0.38],
    },
  };

  private revenueCategoryData: Record<string, {
    actual: (number | null)[];
    budget: number[];
    forecast: (number | null)[];
  }> = {
    'Office': {
      actual:   [0.54, 0.59, 0.68, 0.63, 0.72, 0.81, 0.77, 0.86, 0.95, null, null, null],
      budget:   [0.50, 0.54, 0.59, 0.59, 0.63, 0.68, 0.72, 0.77, 0.81, 0.86, 0.90, 0.95],
      forecast: [null, null, null, null, null, null, null, null, 0.95, 1.04, 1.08, 1.17],
    },
    'Retail': {
      actual:   [0.34, 0.36, 0.42, 0.39, 0.45, 0.50, 0.48, 0.53, 0.59, null, null, null],
      budget:   [0.31, 0.34, 0.36, 0.36, 0.39, 0.42, 0.45, 0.48, 0.50, 0.53, 0.56, 0.59],
      forecast: [null, null, null, null, null, null, null, null, 0.59, 0.64, 0.67, 0.73],
    },
    'F&B': {
      actual:   [0.22, 0.23, 0.27, 0.25, 0.29, 0.32, 0.31, 0.34, 0.38, null, null, null],
      budget:   [0.20, 0.22, 0.23, 0.23, 0.25, 0.27, 0.29, 0.31, 0.32, 0.34, 0.36, 0.38],
      forecast: [null, null, null, null, null, null, null, null, 0.38, 0.41, 0.43, 0.47],
    },
    'Service': {
      actual:   [0.07, 0.08, 0.09, 0.09, 0.10, 0.11, 0.10, 0.12, 0.13, null, null, null],
      budget:   [0.06, 0.07, 0.08, 0.08, 0.08, 0.09, 0.10, 0.10, 0.11, 0.12, 0.12, 0.13],
      forecast: [null, null, null, null, null, null, null, null, 0.13, 0.14, 0.15, 0.16],
    },
    'Parking': {
      actual:   [0.03, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, null, null, null],
      budget:   [0.03, 0.03, 0.03, 0.03, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06],
      forecast: [null, null, null, null, null, null, null, null, 0.05, 0.06, 0.06, 0.07],
    },
  };

  // Overview data (stored so we can revert)
  private overviewRevenueData = {
    actual:   [1.2, 1.3, 1.5, 1.4, 1.6, 1.8, 1.7, 1.9, 2.1, null, null, null] as (number | null)[],
    budget:   [1.1, 1.2, 1.3, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1],
    forecast: [null, null, null, null, null, null, null, null, 2.1, 2.3, 2.4, 2.6] as (number | null)[],
  };

  setRevenueFilter(mode: RevenueFilterMode): void {
    this.revenueFilterMode = mode;
    if (mode === 'overview') {
      this.applyRevenueData(
        this.overviewRevenueData.actual,
        this.overviewRevenueData.budget,
        this.overviewRevenueData.forecast,
      );
    } else if (mode === 'by-building') {
      this.selectedRevenueBuilding = this.revenueBuildings[0];
      this.applyBuildingRevenueData();
    } else if (mode === 'by-category') {
      this.selectedRevenueCategory = this.revenueCategories[0];
      this.applyCategoryRevenueData();
    }
  }

  onRevenueBuildingChange(): void {
    this.applyBuildingRevenueData();
  }

  onRevenueCategoryChange(): void {
    this.applyCategoryRevenueData();
  }

  private applyBuildingRevenueData(): void {
    const data = this.revenueBuildingData[this.selectedRevenueBuilding];
    if (data) {
      this.applyRevenueData(data.actual, data.budget, data.forecast);
    }
  }

  private applyCategoryRevenueData(): void {
    const data = this.revenueCategoryData[this.selectedRevenueCategory];
    if (data) {
      this.applyRevenueData(data.actual, data.budget, data.forecast);
    }
  }

  private applyRevenueData(
    actual: (number | null)[],
    budget: number[],
    forecast: (number | null)[]
  ): void {
    this.revenueActual = actual;
    this.revenueBudget = budget;
    this.revenueForecast = forecast;
    // Rebuild revenue chart only
    this.revPerfChart?.destroy();
    setTimeout(() => this.initRevenuePerformanceChart(), 0);
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

    // ---------- Compute cumulative (running total) lines ----------
    // Actual cumulative: sum up actual values; null after last actual month
    const cumulativeActual: (number | null)[] = [];
    let runningActual = 0;
    let lastActualIndex = -1;
    for (let i = 0; i < this.revenueActual.length; i++) {
      if (this.revenueActual[i] != null) {
        runningActual += this.revenueActual[i]!;
        cumulativeActual.push(parseFloat(runningActual.toFixed(2)));
        lastActualIndex = i;
      } else {
        cumulativeActual.push(null);
      }
    }

    // Budget cumulative: full year running total
    const cumulativeBudget: number[] = [];
    let runningBudget = 0;
    for (let i = 0; i < this.revenueBudget.length; i++) {
      runningBudget += this.revenueBudget[i];
      cumulativeBudget.push(parseFloat(runningBudget.toFixed(2)));
    }

    // Forecast cumulative: starts from last actual cumulative value, then adds forecast increments
    // Only has values from lastActualIndex onward (connects to actual line)
    const cumulativeForecast: (number | null)[] = new Array(this.revenueLabels.length).fill(null);
    if (lastActualIndex >= 0) {
      let runningForecast = cumulativeActual[lastActualIndex]!;
      cumulativeForecast[lastActualIndex] = runningForecast; // start point = same as last actual
      for (let i = lastActualIndex + 1; i < this.revenueForecast.length; i++) {
        if (this.revenueForecast[i] != null) {
          runningForecast += this.revenueForecast[i]!;
          cumulativeForecast[i] = parseFloat(runningForecast.toFixed(2));
        }
      }
    }

    // Compute max Y from all cumulative data for proper scaling
    const allValues = [
      ...cumulativeActual.filter(v => v != null) as number[],
      ...cumulativeBudget,
      ...cumulativeForecast.filter(v => v != null) as number[],
    ];
    const maxVal = Math.max(...allValues, 1);
    const yMax = Math.ceil(maxVal * 1.15); // 15% headroom

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.revenueLabels,
        datasets: [
          // Bars: Budget (ซ้าย)
          {
            type: 'bar',
            label: 'Budget',
            data: this.revenueBudget,
            backgroundColor: success,
            borderRadius: 4,
            barPercentage: 0.45,
            categoryPercentage: 0.7,
            order: 3,
            yAxisID: 'y',
          } as any,
          // Bars: Actual (ขวา, null months render no bar)
          {
            type: 'bar',
            label: 'Actual',
            data: this.revenueActual,
            backgroundColor: primary,
            borderRadius: 4,
            barPercentage: 0.45,
            categoryPercentage: 0.7,
            order: 3,
            yAxisID: 'y',
          } as any,
          // Line: Actual cumulative (breaks at null months)
          {
            type: 'line',
            label: 'Actual (cumulative)',
            data: cumulativeActual,
            borderColor: primary,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: primary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            spanGaps: false,
            order: 1,
            yAxisID: 'y2',
          } as any,
          // Line: Budget cumulative (full year, dashed)
          {
            type: 'line',
            label: 'Budget (cumulative)',
            data: cumulativeBudget,
            borderColor: success,
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: success,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderDash: [6, 4],
            order: 1,
            yAxisID: 'y2',
          } as any,
          // Line: Forecast cumulative (starts from last actual, connects seamlessly)
          {
            type: 'line',
            label: 'Forecast',
            data: cumulativeForecast,
            borderColor: warning,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: warning,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderDash: [6, 4],
            spanGaps: false,
            order: 1,
            yAxisID: 'y2',
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 4, right: 8, bottom: 4, left: 4 } },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              color: fg,
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              font: { size: 12, weight: 500 },
              usePointStyle: true,
              filter: (item) => {
                const label = item.text || '';
                // Show: Actual, Budget, Forecast — hide "cumulative" labels
                return !label.includes('cumulative');
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
            padding: 10,
            titleFont: { size: 11, weight: 600 },
            bodyFont: { size: 11 },
            callbacks: {
              label: (item) => {
                const label = item.dataset.label || '';
                const val = Number(item.raw);
                if (label.includes('cumulative')) {
                  return ` ${label}: $${val.toFixed(1)}M`;
                }
                return ` ${label}: $${val.toFixed(1)}M`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: muted,
              font: { size: 11, weight: 500 },
              maxRotation: 0,
              padding: 4,
            },
          },
          // Left Y-axis: monthly bars
          y: {
            position: 'left',
            min: 0,
            max: 3.0,
            grid: { color: gridColor, drawTicks: false },
            border: { display: false },
            ticks: {
              color: muted,
              font: { size: 11, weight: 500 },
              padding: 6,
              stepSize: 0.5,
              callback: (v) => `$${Number(v).toFixed(1)}M`,
            },
          },
          // Right Y-axis: cumulative lines
          y2: {
            position: 'right',
            min: 0,
            max: yMax,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: muted,
              font: { size: 11, weight: 500 },
              padding: 6,
              callback: (v) => `$${Number(v).toFixed(1)}M`,
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
