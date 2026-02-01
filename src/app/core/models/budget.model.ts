// budget.model.ts

export interface BudgetAllocation {
  actual: number; // Current spending/achievement
  forecast: number; // Original/target budget
  percentage: number; // actual / forecast * 100
}

export interface MonthlyBreakdown {
  month: number; // 1-12
  monthName: string;
  actual: number;
  forecast: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  role: 'leader' | 'member';
  budget: BudgetAllocation;
  monthlyBreakdown?: MonthlyBreakdown[];
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  budget: BudgetAllocation;
  monthlyBreakdown?: MonthlyBreakdown[];
}

export interface Company {
  id: string;
  name: string;
  year: number;
  budget: BudgetAllocation;
  monthlyBreakdown: MonthlyBreakdown[];
  teams: Team[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'yearly' | 'monthly';

// Helper functions
export function calculateBudgetAllocation(actual: number, forecast: number): BudgetAllocation {
  return {
    actual,
    forecast,
    percentage: forecast > 0 ? (actual / forecast) * 100 : 0
  };
}

export function generateMonthlyBreakdown(yearlyForecast: number): MonthlyBreakdown[] {
  const monthlyForecast = yearlyForecast / 12;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return months.map((monthName, index) => ({
    month: index + 1,
    monthName,
    actual: 0,
    forecast: monthlyForecast
  }));
}

export function sumTeamBudgets(teams: Team[]): BudgetAllocation {
  const totalActual = teams.reduce((sum, team) => sum + team.budget.actual, 0);
  const totalForecast = teams.reduce((sum, team) => sum + team.budget.forecast, 0);
  return calculateBudgetAllocation(totalActual, totalForecast);
}

export function sumMemberBudgets(members: TeamMember[]): BudgetAllocation {
  const totalActual = members.reduce((sum, member) => sum + member.budget.actual, 0);
  const totalForecast = members.reduce((sum, member) => sum + member.budget.forecast, 0);
  return calculateBudgetAllocation(totalActual, totalForecast);
}

// Validation
export function validateBudgetSum(parentForecast: number, childrenForecast: number): {
  valid: boolean;
  difference: number;
  message: string;
} {
  const diff = Math.abs(parentForecast - childrenForecast);
  const tolerance = 0.01; // Allow 0.01 difference for rounding

  if (diff <= tolerance) {
    return {
      valid: true,
      difference: 0,
      message: 'Budget allocation is balanced'
    };
  }

  if (childrenForecast > parentForecast) {
    return {
      valid: false,
      difference: childrenForecast - parentForecast,
      message: `Over-allocated by ฿${(childrenForecast - parentForecast).toLocaleString()}`
    };
  }

  return {
    valid: false,
    difference: parentForecast - childrenForecast,
    message: `Under-allocated by ฿${(parentForecast - childrenForecast).toLocaleString()}`
  };
}

export const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
