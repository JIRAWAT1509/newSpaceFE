// sales-performance.mock.ts - Mock data for performance section
import { DateTime } from 'luxon';

// ==================== INTERFACES ====================

export interface SalesTeamMember {
  id: string;
  name: string;
  nameTh: string;
  region: string;
  regionTh: string;
  avatar?: string;
  email: string;
  role: string;

  // Sales figures
  salesThisYear: number;
  salesThisWeek: number;
  salesLastWeek: number;

  // Performance metrics
  pipelineValue: number;
  coverage: number; // percentage
  winRate: number; // percentage
  coachingHours: number;

  // Weekly sales history (for sparkline) - last 8 weeks
  weeklySalesHistory: number[];
}

export interface PipelineStage {
  stage: string;
  stageTh: string;
  conversionRate: number; // percentage
  medianDays: number;
  count: number; // current number of deals in this stage
}

export interface SourceAttribution {
  source: 'Inbound' | 'Outbound' | 'Partner';
  sourceTh: string;
  percentage: number;
  count: number;
  value: number;
}

export interface MonteCarloSimulation {
  probability: number; // percentage to beat target
  target: number;
  currentPipeline: number;
  expectedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  simulations: number;
}

export interface ExecutiveSummary {
  attainment: number; // percentage YTD
  attainmentChange: number; // +5% MoM
  winRate: number; // percentage
  avgDealCycle: number; // days
  occupancy: number; // percentage
  occupancyTarget: number; // percentage
}

// Sales activity for calendar integration
export interface SalesActivity {
  id: string;
  type: 'meeting' | 'call' | 'demo' | 'followup' | 'contract';
  title: string;
  titleTh: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'completed' | 'canceled';
  dealValue?: number;
  clientName?: string;
  assignedTo: string; // team member id
  createdBy: string;
  createdByName: string;
  color: string;
}

// ==================== MOCK DATA ====================

// Team Members (matching design - 4 main members)
export const MOCK_SALES_TEAM: SalesTeamMember[] = [
  {
    id: 'sm-001',
    name: 'Anan Chai',
    nameTh: 'อนันต์ ชัย',
    region: 'North East',
    regionTh: 'ภาคตะวันออกเฉียงเหนือ',
    avatar: '👨‍💼',
    email: 'anan.chai@company.com',
    role: 'sales-manager',
    salesThisYear: 93800,
    salesThisWeek: 5000,
    salesLastWeek: 4200,
    pipelineValue: 608783,
    coverage: 76,
    winRate: 36,
    coachingHours: 11,
    weeklySalesHistory: [3200, 4100, 3800, 4500, 3900, 4200, 4800, 5000]
  },
  {
    id: 'sm-002',
    name: 'May Supattra',
    nameTh: 'เมย์ สุพัตรา',
    region: 'Mid-West',
    regionTh: 'ภาคกลางตะวันตก',
    avatar: '👩‍💼',
    email: 'may.supattra@company.com',
    role: 'sales-manager',
    salesThisYear: 101000,
    salesThisWeek: 4000,
    salesLastWeek: 5100,
    pipelineValue: 816515,
    coverage: 102,
    winRate: 33,
    coachingHours: 15,
    weeklySalesHistory: [4800, 5200, 4900, 5500, 5100, 5000, 4600, 4000]
  },
  {
    id: 'sm-003',
    name: 'Veera Pradit',
    nameTh: 'วีระ ประดิษฐ์',
    region: 'West',
    regionTh: 'ภาคตะวันตก',
    avatar: '👨‍💼',
    email: 'veera.pradit@company.com',
    role: 'sales-manager',
    salesThisYear: 145000,
    salesThisWeek: 19000,
    salesLastWeek: 17500,
    pipelineValue: 865476,
    coverage: 108,
    winRate: 28,
    coachingHours: 13,
    weeklySalesHistory: [15000, 16200, 15800, 17000, 16500, 17500, 18200, 19000]
  },
  {
    id: 'sm-004',
    name: 'Araya W.',
    nameTh: 'อารยา ว.',
    region: 'South',
    regionTh: 'ภาคใต้',
    avatar: '👩‍💼',
    email: 'araya.w@company.com',
    role: 'sales-manager',
    salesThisYear: 133400,
    salesThisWeek: 25000,
    salesLastWeek: 22000,
    pipelineValue: 938445,
    coverage: 117,
    winRate: 27,
    coachingHours: 15,
    weeklySalesHistory: [18000, 19500, 20000, 21000, 22000, 22000, 23500, 25000]
  }
];

// Additional team members for leaderboard
export const MOCK_EXTENDED_SALES_TEAM: SalesTeamMember[] = [
  ...MOCK_SALES_TEAM,
  {
    id: 'sm-005',
    name: 'Somchai R.',
    nameTh: 'สมชาย ร.',
    region: 'Central',
    regionTh: 'ภาคกลาง',
    avatar: '👨‍💼',
    email: 'somchai.r@company.com',
    role: 'sales-executive',
    salesThisYear: 89200,
    salesThisWeek: 3800,
    salesLastWeek: 4100,
    pipelineValue: 520000,
    coverage: 68,
    winRate: 31,
    coachingHours: 9,
    weeklySalesHistory: [3000, 3500, 3200, 3800, 3600, 4100, 4000, 3800]
  },
  {
    id: 'sm-006',
    name: 'N. Kanyarat',
    nameTh: 'น. กัญญารัตน์',
    region: 'East',
    regionTh: 'ภาคตะวันออก',
    avatar: '👩‍💼',
    email: 'n.kanyarat@company.com',
    role: 'sales-executive',
    salesThisYear: 76500,
    salesThisWeek: 3200,
    salesLastWeek: 3500,
    pipelineValue: 455000,
    coverage: 62,
    winRate: 29,
    coachingHours: 10,
    weeklySalesHistory: [2800, 3000, 3200, 3100, 3400, 3500, 3300, 3200]
  },
  {
    id: 'sm-007',
    name: 'Prasert V.',
    nameTh: 'ประเสริฐ ว.',
    region: 'North',
    regionTh: 'ภาคเหนือ',
    avatar: '👨‍💼',
    email: 'prasert.v@company.com',
    role: 'sales-executive',
    salesThisYear: 68300,
    salesThisWeek: 2900,
    salesLastWeek: 3100,
    pipelineValue: 410000,
    coverage: 58,
    winRate: 26,
    coachingHours: 8,
    weeklySalesHistory: [2500, 2700, 2800, 2900, 3000, 3100, 3000, 2900]
  },
  {
    id: 'sm-008',
    name: 'Arisa K.',
    nameTh: 'อริสา ก.',
    region: 'South East',
    regionTh: 'ภาคตะวันออกเฉียงใต้',
    avatar: '👩‍💼',
    email: 'arisa.k@company.com',
    role: 'sales-executive',
    salesThisYear: 72100,
    salesThisWeek: 3100,
    salesLastWeek: 3300,
    pipelineValue: 430000,
    coverage: 64,
    winRate: 30,
    coachingHours: 11,
    weeklySalesHistory: [2600, 2900, 3000, 3100, 3200, 3300, 3200, 3100]
  }
];

// Pipeline Stages (from design)
export const MOCK_PIPELINE_STAGES: PipelineStage[] = [
  {
    stage: 'Prospect → Qualify',
    stageTh: 'ผู้มีโอกาส → คัดกรอง',
    conversionRate: 62,
    medianDays: 3.1,
    count: 245
  },
  {
    stage: 'Qualify → Proposal',
    stageTh: 'คัดกรอง → เสนอราคา',
    conversionRate: 54,
    medianDays: 5.4,
    count: 152
  },
  {
    stage: 'Proposal → Negotiate',
    stageTh: 'เสนอราคา → เจรจา',
    conversionRate: 48,
    medianDays: 6.8,
    count: 82
  },
  {
    stage: 'Negotiate → Close',
    stageTh: 'เจรจา → ปิดการขาย',
    conversionRate: 41,
    medianDays: 7.2,
    count: 39
  }
];

// Source Attribution (from design - last 60d)
export const MOCK_SOURCE_ATTRIBUTION: SourceAttribution[] = [
  {
    source: 'Inbound',
    sourceTh: 'ติดต่อเข้า',
    percentage: 40,
    count: 156,
    value: 1850000
  },
  {
    source: 'Outbound',
    sourceTh: 'ติดต่อออก',
    percentage: 30,
    count: 117,
    value: 1387500
  },
  {
    source: 'Partner',
    sourceTh: 'พันธมิตร',
    percentage: 30,
    count: 117,
    value: 1387500
  }
];

// Monte Carlo Simulation Results
export const MOCK_MONTE_CARLO: MonteCarloSimulation = {
  probability: 0, // Will be calculated
  target: 2000000,
  currentPipeline: 4625219, // Sum of all pipeline values
  expectedRevenue: 1850000,
  confidenceInterval: {
    lower: 1650000,
    upper: 2050000
  },
  simulations: 1000
};

// Executive Summary (from Reports section)
export const MOCK_EXECUTIVE_SUMMARY: ExecutiveSummary = {
  attainment: 72, // 72% YTD on track with +5% MoM
  attainmentChange: 5,
  winRate: 31, // 31% (60d)
  avgDealCycle: 22.4, // 22.4 days average
  occupancy: 86,
  occupancyTarget: 85
};

// Team sales totals
export const MOCK_TEAM_TOTALS = {
  thisYear: MOCK_EXTENDED_SALES_TEAM.reduce((sum, m) => sum + m.salesThisYear, 0),
  thisWeek: MOCK_EXTENDED_SALES_TEAM.reduce((sum, m) => sum + m.salesThisWeek, 0),
  lastWeek: MOCK_EXTENDED_SALES_TEAM.reduce((sum, m) => sum + m.salesLastWeek, 0),
  weekChange: 0 // Will be calculated
};

MOCK_TEAM_TOTALS.weekChange = Math.round(
  ((MOCK_TEAM_TOTALS.thisWeek - MOCK_TEAM_TOTALS.lastWeek) / MOCK_TEAM_TOTALS.lastWeek) * 100
);

// Weekly sales history for team (last 8 weeks)
export const MOCK_TEAM_WEEKLY_SALES = [
  { week: 'W1', sales: 45000 },
  { week: 'W2', sales: 48300 },
  { week: 'W3', sales: 46800 },
  { week: 'W4', sales: 50200 },
  { week: 'W5', sales: 49100 },
  { week: 'W6', sales: 51300 },
  { week: 'W7', sales: 52100 },
  { week: 'W8', sales: MOCK_TEAM_TOTALS.thisWeek }
];

// Sales Activities for calendar (assignment type only, no personal tasks)
export const MOCK_SALES_ACTIVITIES: SalesActivity[] = [
  // This week activities
  {
    id: 'sa-001',
    type: 'meeting',
    title: 'Client Meeting - ABC Corp',
    titleTh: 'ประชุมลูกค้า - ABC Corp',
    startDate: DateTime.now().plus({ days: 1 }).set({ hour: 10, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 1 }).set({ hour: 11, minute: 30 }).toISO(),
    status: 'scheduled',
    dealValue: 150000,
    clientName: 'ABC Corp',
    assignedTo: 'sm-001',
    createdBy: 'sm-001',
    createdByName: 'Anan Chai',
    color: '#3b82f6'
  },
  {
    id: 'sa-002',
    type: 'demo',
    title: 'Product Demo - XYZ Ltd',
    titleTh: 'สาธิตสินค้า - XYZ Ltd',
    startDate: DateTime.now().plus({ days: 2 }).set({ hour: 14, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 2 }).set({ hour: 15, minute: 30 }).toISO(),
    status: 'scheduled',
    dealValue: 230000,
    clientName: 'XYZ Ltd',
    assignedTo: 'sm-002',
    createdBy: 'sm-002',
    createdByName: 'May Supattra',
    color: '#3b82f6'
  },
  {
    id: 'sa-003',
    type: 'call',
    title: 'Follow-up Call - Tech Solutions',
    titleTh: 'โทรติดตาม - Tech Solutions',
    startDate: DateTime.now().plus({ days: 1 }).set({ hour: 15, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 1 }).set({ hour: 15, minute: 30 }).toISO(),
    status: 'scheduled',
    dealValue: 85000,
    clientName: 'Tech Solutions',
    assignedTo: 'sm-003',
    createdBy: 'sm-003',
    createdByName: 'Veera Pradit',
    color: '#3b82f6'
  },
  {
    id: 'sa-004',
    type: 'contract',
    title: 'Contract Signing - Global Inc',
    titleTh: 'ลงนามสัญญา - Global Inc',
    startDate: DateTime.now().plus({ days: 3 }).set({ hour: 11, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 3 }).set({ hour: 12, minute: 0 }).toISO(),
    status: 'scheduled',
    dealValue: 450000,
    clientName: 'Global Inc',
    assignedTo: 'sm-004',
    createdBy: 'sm-004',
    createdByName: 'Araya W.',
    color: '#10b981'
  },
  {
    id: 'sa-005',
    type: 'meeting',
    title: 'Quarterly Review - StarTech',
    titleTh: 'ทบทวนรายไตรมาส - StarTech',
    startDate: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 0 }).toISO(),
    endDate: DateTime.now().minus({ days: 2 }).set({ hour: 10, minute: 30 }).toISO(),
    status: 'completed',
    dealValue: 180000,
    clientName: 'StarTech',
    assignedTo: 'sm-001',
    createdBy: 'sm-001',
    createdByName: 'Anan Chai',
    color: '#3b82f6'
  },
  // More activities spread across the month
  {
    id: 'sa-006',
    type: 'demo',
    title: 'Software Demo - MegaCorp',
    titleTh: 'สาธิตซอฟต์แวร์ - MegaCorp',
    startDate: DateTime.now().plus({ days: 5 }).set({ hour: 13, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 5 }).set({ hour: 14, minute: 30 }).toISO(),
    status: 'scheduled',
    dealValue: 320000,
    clientName: 'MegaCorp',
    assignedTo: 'sm-002',
    createdBy: 'sm-002',
    createdByName: 'May Supattra',
    color: '#3b82f6'
  },
  {
    id: 'sa-007',
    type: 'followup',
    title: 'Client Check-in - Bright Future Co',
    titleTh: 'ติดตามลูกค้า - Bright Future Co',
    startDate: DateTime.now().plus({ days: 4 }).set({ hour: 16, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 4 }).set({ hour: 16, minute: 45 }).toISO(),
    status: 'scheduled',
    dealValue: 95000,
    clientName: 'Bright Future Co',
    assignedTo: 'sm-003',
    createdBy: 'sm-003',
    createdByName: 'Veera Pradit',
    color: '#3b82f6'
  },
  {
    id: 'sa-008',
    type: 'meeting',
    title: 'Negotiation Meeting - Apex Group',
    titleTh: 'ประชุมเจรจา - Apex Group',
    startDate: DateTime.now().plus({ days: 7 }).set({ hour: 10, minute: 30 }).toISO(),
    endDate: DateTime.now().plus({ days: 7 }).set({ hour: 12, minute: 0 }).toISO(),
    status: 'scheduled',
    dealValue: 520000,
    clientName: 'Apex Group',
    assignedTo: 'sm-004',
    createdBy: 'sm-004',
    createdByName: 'Araya W.',
    color: '#3b82f6'
  },
  {
    id: 'sa-009',
    type: 'call',
    title: 'Discovery Call - New Prospect',
    titleTh: 'โทรสำรวจ - ลูกค้าใหม่',
    startDate: DateTime.now().plus({ days: 1 }).set({ hour: 9, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 1 }).set({ hour: 9, minute: 30 }).toISO(),
    status: 'scheduled',
    dealValue: 75000,
    clientName: 'New Prospect',
    assignedTo: 'sm-001',
    createdBy: 'sm-001',
    createdByName: 'Anan Chai',
    color: '#3b82f6'
  },
  {
    id: 'sa-010',
    type: 'meeting',
    title: 'Proposal Presentation - Elite Systems',
    titleTh: 'นำเสนอข้อเสนอ - Elite Systems',
    startDate: DateTime.now().plus({ days: 6 }).set({ hour: 14, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 6 }).set({ hour: 15, minute: 30 }).toISO(),
    status: 'scheduled',
    dealValue: 280000,
    clientName: 'Elite Systems',
    assignedTo: 'sm-002',
    createdBy: 'sm-002',
    createdByName: 'May Supattra',
    color: '#3b82f6'
  }
];

// Helper function to calculate Monte Carlo probability
export function calculateMonteCarloProbability(
  currentPipeline: number,
  target: number,
  winRate: number = 0.31
): number {
  // Simple calculation: (pipeline * win rate) / target
  const expectedRevenue = currentPipeline * winRate;
  const probability = Math.min((expectedRevenue / target) * 100, 100);
  return Math.round(probability);
}

// Update Monte Carlo with calculated probability
MOCK_MONTE_CARLO.probability = calculateMonteCarloProbability(
  MOCK_MONTE_CARLO.currentPipeline,
  MOCK_MONTE_CARLO.target
);
