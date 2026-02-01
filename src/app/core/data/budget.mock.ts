// budget.mock.ts
import {
  Company,
  Team,
  TeamMember,
  calculateBudgetAllocation,
  generateMonthlyBreakdown
} from '../models/budget.model';

// Sample company 1
const company1Teams: Team[] = [
  {
    id: 'team-001',
    name: 'Bangkok East Sales',
    leaderId: 'user-001',
    leaderName: 'Somchai Jindarat',
    budget: calculateBudgetAllocation(3200000, 4000000),
    members: [
      {
        id: 'member-001',
        userId: 'user-001',
        name: 'Somchai Jindarat',
        role: 'leader',
        budget: calculateBudgetAllocation(1200000, 1500000)
      },
      {
        id: 'member-002',
        userId: 'user-002',
        name: 'Wipa Suksan',
        role: 'member',
        budget: calculateBudgetAllocation(1000000, 1300000)
      },
      {
        id: 'member-003',
        userId: 'user-003',
        name: 'Tanawat Rungrueang',
        role: 'member',
        budget: calculateBudgetAllocation(1000000, 1200000)
      }
    ],
    monthlyBreakdown: []
  },
  {
    id: 'team-002',
    name: 'Bangkok West Sales',
    leaderId: 'user-004',
    leaderName: 'Napa Wongyai',
    budget: calculateBudgetAllocation(2400000, 3200000),
    members: [
      {
        id: 'member-004',
        userId: 'user-004',
        name: 'Napa Wongyai',
        role: 'leader',
        budget: calculateBudgetAllocation(1100000, 1400000)
      },
      {
        id: 'member-005',
        userId: 'user-005',
        name: 'Prasert Mangmee',
        role: 'member',
        budget: calculateBudgetAllocation(800000, 1000000)
      },
      {
        id: 'member-006',
        userId: 'user-006',
        name: 'Arunee Sawangsai',
        role: 'member',
        budget: calculateBudgetAllocation(500000, 800000)
      }
    ],
    monthlyBreakdown: []
  },
  {
    id: 'team-003',
    name: 'Industrial District',
    leaderId: 'user-007',
    leaderName: 'Pongsakorn Songsin',
    budget: calculateBudgetAllocation(1900000, 2800000),
    members: [
      {
        id: 'member-007',
        userId: 'user-007',
        name: 'Pongsakorn Songsin',
        role: 'leader',
        budget: calculateBudgetAllocation(1000000, 1400000)
      },
      {
        id: 'member-008',
        userId: 'user-008',
        name: 'Suda Prateepporn',
        role: 'member',
        budget: calculateBudgetAllocation(900000, 1400000)
      }
    ],
    monthlyBreakdown: []
  }
];

const company1: Company = {
  id: 'comp-001',
  name: 'บริษัท ไทย สเปซ จำกัด (Thai Space Co., Ltd.)',
  year: 2026,
  budget: calculateBudgetAllocation(7500000, 10000000),
  monthlyBreakdown: generateMonthlyBreakdown(10000000).map((month, index) => ({
    ...month,
    actual: [650000, 620000, 680000, 700000, 630000, 640000, 620000, 600000, 0, 0, 0, 0][index]
  })),
  teams: company1Teams,
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date().toISOString()
};

// Sample company 2
const company2Teams: Team[] = [
  {
    id: 'team-004',
    name: 'Retail Team',
    leaderId: 'user-009',
    leaderName: 'Ratchapon Charensuk',
    budget: calculateBudgetAllocation(1800000, 2500000),
    members: [
      {
        id: 'member-009',
        userId: 'user-009',
        name: 'Ratchapon Charensuk',
        role: 'leader',
        budget: calculateBudgetAllocation(1000000, 1300000)
      },
      {
        id: 'member-010',
        userId: 'user-010',
        name: 'Wanna Suksawat',
        role: 'member',
        budget: calculateBudgetAllocation(800000, 1200000)
      }
    ],
    monthlyBreakdown: []
  }
];

const company2: Company = {
  id: 'comp-002',
  name: 'บริษัท เอส เอ็ม อี คอนซัลติ้ง จำกัด (SME Consulting Co., Ltd.)',
  year: 2026,
  budget: calculateBudgetAllocation(1800000, 2500000),
  monthlyBreakdown: generateMonthlyBreakdown(2500000).map((month, index) => ({
    ...month,
    actual: [210000, 200000, 180000, 190000, 150000, 170000, 180000, 150000, 0, 0, 0, 0][index]
  })),
  teams: company2Teams,
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date().toISOString()
};

export const MOCK_COMPANIES: Company[] = [company1, company2];

// Available users for team/member creation
export const AVAILABLE_USERS = [
  { id: 'user-011', name: 'Supachai Rattana', role: 'Sales Manager' },
  { id: 'user-012', name: 'Pornpimol Srisuk', role: 'Sales Representative' },
  { id: 'user-013', name: 'Krit Boonmee', role: 'Sales Representative' },
  { id: 'user-014', name: 'Jiraporn Tangtong', role: 'Account Manager' },
  { id: 'user-015', name: 'Chalerm Wongwan', role: 'Sales Representative' }
];
