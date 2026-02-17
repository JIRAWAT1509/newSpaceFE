// pipeline.model.ts (UPDATED - URGENT FILTER)
import { DateTime } from 'luxon';

// Hot filters (SIMPLIFIED - combined overdue + near-due into 'urgent')
export type HotFilter = 'all' | 'urgent' | 'high-priority' | 'medium-priority' | 'low-priority';

// Rest of the file remains the same...
export type StageSortBy =
  | 'due-date'
  | 'value-high'
  | 'value-low'
  | 'priority'
  | 'created-date'
  | 'customer-name'
  | 'days-in-stage';

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  forecastWinRate: number;
  defaultDueDays: number;
  order: number;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  companyName?: string;
  stageId: string;
  stageName: string;
  value: number;
  actualWinRate: number;
  weightedValue: number;
  createdAt: string;
  movedToStageAt: string;
  dueDate: string;
  areaId?: string;
  areaName?: string;
  buildingId?: string;
  buildingName?: string;
  floorNumber?: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  notes: string;
  ownerId: string;
  ownerName: string;
  lastActivityAt: string;
  lastActivityType: string;
  daysInStage: number;
  daysUntilDue: number;
  attachmentCount: number;
  activityCount: number;
}

export interface StageMetrics {
  stageId: string;
  stageName: string;
  totalDeals: number;
  totalValue: number;
  totalWeightedValue: number;
  averageDealValue: number;
  forecastWinRate: number;
  actualWinRate: number;
  averageDaysInStage: number;
}

export interface PipelineMetrics {
  totalDeals: number;
  totalValue: number;
  totalWeightedValue: number;
  averageDealValue: number;
  averageDealAge: number;
  overdueDealCount: number;
  nearDueDealCount: number;
  dealsAddedThisWeek: number;
  dealsAddedThisMonth: number;
  dealsWonThisMonth: number;
  dealsLostThisMonth: number;
  winRate: number;
  averageTimeToClose: number;
  stageMetrics: StageMetrics[];
}

export interface StageViewConfig {
  stageId: string;
  sortBy: StageSortBy;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  cardsPerPage: number;
}

export function calculateWeightedValue(value: number, winRate: number): number {
  return (value * winRate) / 100;
}

export function calculateDaysInStage(movedToStageAt: string): number {
  const movedDate = DateTime.fromISO(movedToStageAt);
  const now = DateTime.now();
  return Math.floor(now.diff(movedDate, 'days').days);
}

export function calculateDaysUntilDue(dueDate: string): number {
  const due = DateTime.fromISO(dueDate);
  const now = DateTime.now();
  return Math.floor(due.diff(now, 'days').days);
}

export function getDueStatus(daysUntilDue: number): 'overdue' | 'warning' | 'normal' {
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 2) return 'warning';
  return 'normal';
}

export function calculateAverageWinRate(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  const total = deals.reduce((sum, d) => sum + d.actualWinRate, 0);
  return Math.round(total / deals.length);
}

export const DEFAULT_STAGES: PipelineStage[] = [
  { id: 'stage-001', name: 'Lead', color: '#9ca3af', forecastWinRate: 15, defaultDueDays: 7, order: 0 },
  { id: 'stage-002', name: 'Prospect', color: '#60a5fa', forecastWinRate: 30, defaultDueDays: 14, order: 1 },
  { id: 'stage-003', name: 'Quotation', color: '#fbbf24', forecastWinRate: 50, defaultDueDays: 7, order: 2 },
  { id: 'stage-004', name: 'Negotiation', color: '#fb923c', forecastWinRate: 70, defaultDueDays: 7, order: 3 },
  { id: 'stage-005', name: 'Contract', color: '#34d399', forecastWinRate: 90, defaultDueDays: 14, order: 4 }
];
