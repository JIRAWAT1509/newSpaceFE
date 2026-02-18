// src/app/core/models/dashboard.types.ts

import { DateTime } from 'luxon';

// ==================== KPI METRICS ====================

export interface KPIMetrics {
  totalARR: KPIMetric;
  pipelineValue: KPIMetric;
  winRate: KPIMetric;
  teamAttainment: KPIMetric;
}

export interface KPIMetric {
  value: number;
  label: string;
  trend: number; // percentage change
  trendLabel: string; // e.g., "vs last quarter"
  icon: string; // PrimeIcons class
  color: string; // CSS color
  format: 'currency' | 'percentage' | 'number';
}

// ==================== PIPELINE ====================

export interface PipelineOverview {
  totalValue: number;
  weightedValue: number;
  dealCount: number;
  stages: PipelineStageData[];
  averageDealSize: number;
  conversionRates: StageConversion[];
}

export interface PipelineStageData {
  stageId: string;
  stageName: string;
  dealCount: number;
  totalValue: number;
  weightedValue: number;
  averageDays: number;
  winRate: number;
  color: string;
}

export interface StageConversion {
  fromStage: string;
  toStage: string;
  conversionRate: number;
  medianDays: number;
  dealsMoved: number;
  dealsStuck: number;
}

export interface DealVelocity {
  averageDaysToClose: number;
  closingThisWeek: number;
  closingThisMonth: number;
  stuckDeals: StuckDeal[];
  velocityTrend: number; // positive = faster, negative = slower
}

export interface StuckDeal {
  id: string;
  title: string;
  stageName: string;
  daysInStage: number;
  value: number;
  ownerName: string;
  dueDate: string;
}

// ==================== CUSTOMER ====================

export interface CustomerInsights {
  revenueBreakdown: RevenueSegment[];
  classification: CustomerClassification;
  topCustomers: TopCustomer[];
  atRiskCustomers: AtRiskCustomer[];
  healthMetrics: CustomerHealthMetrics;
}

export interface RevenueSegment {
  segment: string;
  arr: number;
  customerCount: number;
  percentage: number;
  color: string;
  avgCSAT: number;
}

export interface CustomerClassification {
  classA: ClassData;
  classB: ClassData;
  classC: ClassData;
  classD: ClassData;
}

export interface ClassData {
  count: number;
  totalARR: number;
  percentage: number;
  avgCSAT: number;
  color: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  companyName?: string;
  arr: number;
  class: string;
  segment: string;
  csat: number;
  churnRisk: string;
  activeContracts: number;
  ownerName: string;
}

export interface AtRiskCustomer {
  id: string;
  name: string;
  companyName?: string;
  arr: number;
  churnRisk: string;
  reason: string;
  recommendedAction: string;
  daysSinceContact: number;
  ownerName: string;
  overduePayments: number;
}

export interface CustomerHealthMetrics {
  averageCSAT: number;
  csatTrend: number;
  churnRate: number;
  churnTrend: number;
  totalCustomers: number;
  activeCustomers: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

// ==================== TEAM PERFORMANCE ====================

export interface TeamPerformance {
  leaderboard: TeamMemberPerformance[];
  teamTotals: TeamTotals;
  topPerformers: TeamMemberPerformance[];
  needsCoaching: TeamMemberPerformance[];
}

export interface TeamMemberPerformance {
  id: string;
  name: string;
  nameTh: string;
  avatar?: string;
  role: string;

  // Sales metrics
  ytdSales: number;
  ytdTarget: number;
  attainment: number;

  thisMonthSales: number;
  thisWeekSales: number;

  // Pipeline metrics
  pipelineValue: number;
  pipelineDeals: number;

  // Performance metrics
  winRate: number;
  dealsWon: number;
  dealsLost: number;
  avgDealSize: number;
  avgDaysToClose: number;

  // Activity metrics
  activitiesThisWeek: number;
  lastActivityDate?: string;

  // Trend
  trend: number; // percentage change
  rank: number;
}

export interface TeamTotals {
  totalYTD: number;
  totalTarget: number;
  teamAttainment: number;
  totalPipeline: number;
  totalDeals: number;
  teamWinRate: number;
}

// ==================== ANALYTICS ====================

export interface DashboardFilters {
  dateRange: {
    start: DateTime;
    end: DateTime;
  };
  selectedRep?: string;
  selectedSegment?: string;
  selectedStage?: string;
}

export interface TrendData {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

// ==================== UTILITY TYPES ====================

export type MetricFormat = 'currency' | 'percentage' | 'number' | 'days';

export type ChurnRiskLevel = 'low' | 'medium' | 'high';

export type CustomerClass = 'A' | 'B' | 'C' | 'D';

export type TrendDirection = 'up' | 'down' | 'neutral';

// ==================== CONSTANTS ====================

export const DASHBOARD_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  gray: '#6b7280',

  // Stage colors
  stages: {
    lead: '#bfdbfe',
    prospect: '#93c5fd',
    quotation: '#60a5fa',
    negotiation: '#3b82f6',
    contract: '#2563eb'
  },

  // Chart colors
  chart: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'],

  // Classification colors
  classification: {
    A: '#10b981', // Green
    B: '#3b82f6', // Blue
    C: '#f59e0b', // Amber
    D: '#6b7280'  // Gray
  },

  // Risk colors
  risk: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  }
};

export const METRIC_ICONS = {
  arr: 'pi pi-dollar',
  pipeline: 'pi pi-chart-line',
  winRate: 'pi pi-percentage',
  attainment: 'pi pi-target'
};
