// src/app/core/models/rental-history.model.ts

export interface RentalHistory {
  id: string;
  areaId: string;

  // Tenant information
  tenantName: string;
  tenantNameTh: string;
  tenantNameEn: string;
  tenantEmail?: string;
  tenantPhone?: string;

  // Lease period
  leaseStart: Date;
  leaseEnd: Date;

  // Financial data
  monthlyRent: number;
  totalRevenue: number;

  // Analytics data
  revenueByWeek: WeeklyRevenue[];
  revenueByYear: YearlyRevenue[];

  // Move out information
  moveOutReason?: string;
  moveOutReasonTh?: string;
  moveOutReasonEn?: string;
  moveOutCategory?: MoveOutCategory;
  moveOutNotes?: string;

  // Calculated metrics
  occupancyDays: number;
  avgRevenuePerDay: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyRevenue {
  weekNumber: number;         // 1-52
  year: number;
  weekStartDate: Date;
  weekEndDate: Date;
  revenue: number;
}

export interface YearlyRevenue {
  year: number;
  revenue: number;
  averageMonthlyRevenue: number;
}

export type MoveOutCategory =
  | 'relocation'      // ย้ายสถานที่
  | 'cost'            // ค่าใช้จ่ายสูง
  | 'dissatisfaction' // ไม่พอใจ
  | 'business-closed' // ปิดกิจการ
  | 'other';          // อื่นๆ
