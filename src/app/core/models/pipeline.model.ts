// src/app/core/models/pipeline.model.ts

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  forecastWinRate: number; // Default/Forecast win rate for the stage (0-100)
  defaultDueDays: number; // Default days until due for new deals
  color: string;
  isClosedWon: boolean;
  isClosedLost: boolean;
}

export interface Deal {
  id: string;
  title: string;

  // Customer info
  customerId: string;
  customerName: string;
  companyName?: string;

  // Stage & status
  stageId: string;
  stageName: string;

  // Financial
  value: number; // Deal value in THB
  actualWinRate: number; // Actual win rate for THIS specific deal (0-100), manually configurable
  weightedValue: number; // value * actualWinRate / 100

  // Dates
  createdAt: string;
  movedToStageAt: string;
  dueDate: string;
  closedAt?: string;

  // Related data (from your existing system)
  areaId?: string;
  areaName?: string;
  buildingId?: string;
  buildingName?: string;
  floorNumber?: number;
  contractId?: string;

  // Contact info
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;

  // Classification
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  notes: string;

  // Ownership
  ownerId: string;
  ownerName: string;

  // Activity tracking
  lastActivityAt: string;
  lastActivityType?: 'note' | 'email' | 'call' | 'meeting';
  daysInStage: number;
  daysUntilDue: number;

  // Additional tracking
  attachmentCount: number;
  activityCount: number;
  nextAction?: string;
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: 'note' | 'email' | 'call' | 'meeting' | 'stage_change' | 'value_change' | 'win_rate_change';
  description: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  metadata?: Record<string, any>;
}

export interface StageMetrics {
  stageId: string;
  stageName: string;

  // Deal counts
  totalDeals: number;

  // Financial metrics
  totalValue: number;
  totalWeightedValue: number;
  averageDealValue: number;

  // Win rates
  forecastWinRate: number; // From stage configuration
  actualWinRate: number; // Average of all deals' actualWinRate in this stage

  // Time metrics
  averageDaysInStage: number;

  // Conversion (historical)
  conversionRate?: number; // % of deals that moved to next stage
}

export interface PipelineMetrics {
  // Overall counts
  totalDeals: number;

  // Financial
  totalValue: number;
  totalWeightedValue: number;
  averageDealValue: number;

  // Time & status
  averageDealAge: number;
  overdueDealCount: number;
  nearDueDealCount: number; // Due in 1-2 days

  // Activity
  dealsAddedThisWeek: number;
  dealsAddedThisMonth: number;
  dealsWonThisMonth: number;
  dealsLostThisMonth: number;

  // Performance
  winRate: number; // Historical win rate
  averageTimeToClose: number; // Days

  // Per-stage metrics
  stageMetrics: StageMetrics[];
}

export interface PipelineConfig {
  stages: PipelineStage[];
  minStages: number; // 5
  maxStages: number; // 7
  defaultCardsPerPage: number; // 8
  minCardsPerPage: number; // 4
  maxCardsPerPage: number; // 15
}

export type HotFilter =
  | 'all'
  | 'overdue'
  | 'near-due'
  | 'high-priority'
  | 'medium-priority'
  | 'low-priority'
  | 'my-deals';

export type StageSortBy =
  | 'due-date'
  | 'value'
  | 'probability'
  | 'name'
  | 'priority'
  | 'created-date'
  | 'days-in-stage';

export interface StageViewConfig {
  stageId: string;
  sortBy: StageSortBy;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  cardsPerPage: number;
}

// Helper functions
export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateDaysInStage(movedToStageAt: string): number {
  const moved = new Date(movedToStageAt);
  const now = new Date();
  const diff = now.getTime() - moved.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDueStatus(daysUntilDue: number): 'overdue' | 'warning' | 'ok' {
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 2) return 'warning';
  return 'ok';
}

export function calculateWeightedValue(value: number, actualWinRate: number): number {
  return (value * actualWinRate) / 100;
}

export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateAverageWinRate(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  const sum = deals.reduce((acc, deal) => acc + deal.actualWinRate, 0);
  return Math.round(sum / deals.length);
}

export const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Prospect',
    order: 1,
    forecastWinRate: 15,
    defaultDueDays: 7,
    color: '#9CA3AF',
    isClosedWon: false,
    isClosedLost: false
  },
  {
    id: 'stage-2',
    name: 'Site Visit',
    order: 2,
    forecastWinRate: 30,
    defaultDueDays: 7,
    color: '#3B82F6',
    isClosedWon: false,
    isClosedLost: false
  },
  {
    id: 'stage-3',
    name: 'Quotation',
    order: 3,
    forecastWinRate: 50,
    defaultDueDays: 14,
    color: '#F59E0B',
    isClosedWon: false,
    isClosedLost: false
  },
  {
    id: 'stage-4',
    name: 'Negotiation',
    order: 4,
    forecastWinRate: 70,
    defaultDueDays: 10,
    color: '#8B5CF6',
    isClosedWon: false,
    isClosedLost: false
  },
  {
    id: 'stage-5',
    name: 'Closing',
    order: 5,
    forecastWinRate: 90,
    defaultDueDays: 7,
    color: '#10B981',
    isClosedWon: true,
    isClosedLost: false
  }
];

export const PRIORITY_COLORS = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444'
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export const PRIORITY_LABELS_TH = {
  low: 'ต่ำ',
  medium: 'ปานกลาง',
  high: 'สูง'
};

export const DEFAULT_CONFIG: PipelineConfig = {
  stages: DEFAULT_STAGES,
  minStages: 5,
  maxStages: 7,
  defaultCardsPerPage: 8,
  minCardsPerPage: 4,
  maxCardsPerPage: 15
};
