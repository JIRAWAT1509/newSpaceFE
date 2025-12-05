// src/app/core/models/rental-history.model.ts

export interface RentalHistory {
  RENTAL_HISTORY_ID: string;
  OU_CODE: string;
  AREA_ID: string;

  // Tenant information
  TENANT_NAME: string;
  TENANT_NAME_TH: string;
  TENANT_NAME_EN: string;
  TENANT_EMAIL?: string;
  TENANT_PHONE?: string;

  // Lease period (using /Date(timestamp)/ format)
  LEASE_START: string;
  LEASE_END: string;

  // Financial data
  MONTHLY_RENT: number;
  TOTAL_REVENUE: number;

  // Analytics data
  REVENUE_BY_WEEK: WeeklyRevenue[];
  REVENUE_BY_YEAR: YearlyRevenue[];

  // Move out information
  MOVE_OUT_REASON?: string;
  MOVE_OUT_REASON_TH?: string;
  MOVE_OUT_REASON_EN?: string;
  MOVE_OUT_CATEGORY?: MoveOutCategory;
  MOVE_OUT_NOTES?: string;

  // Calculated metrics
  OCCUPANCY_DAYS: number;
  AVG_REVENUE_PER_DAY: number;

  // Audit fields
  CREATE_BY: string;
  CREATE_DATE: string;
  UPD_BY: string;
  UPD_DATE: string;
}

export interface WeeklyRevenue {
  WEEK_NUMBER: number;         // 1-52
  YEAR: number;
  WEEK_START_DATE: string;
  WEEK_END_DATE: string;
  REVENUE: number;
}

export interface YearlyRevenue {
  YEAR: number;
  REVENUE: number;
  AVG_MONTHLY_REVENUE: number;
}

export type MoveOutCategory =
  | 'RELOCATION'      // ย้ายสถานที่
  | 'COST'            // ค่าใช้จ่ายสูง
  | 'DISSATISFACTION' // ไม่พอใจ
  | 'BUSINESS_CLOSED' // ปิดกิจการ
  | 'OTHER';          // อื่นๆ

export const MOVE_OUT_CATEGORY_LABELS: Record<MoveOutCategory, { TH: string; EN: string; COLOR: string }> = {
  'RELOCATION': { TH: 'ย้ายสถานที่', EN: 'Relocation', COLOR: '#3B82F6' },
  'COST': { TH: 'ค่าใช้จ่ายสูง', EN: 'High Cost', COLOR: '#F59E0B' },
  'DISSATISFACTION': { TH: 'ไม่พอใจ', EN: 'Dissatisfaction', COLOR: '#EF4444' },
  'BUSINESS_CLOSED': { TH: 'ปิดกิจการ', EN: 'Business Closed', COLOR: '#DC2626' },
  'OTHER': { TH: 'อื่นๆ', EN: 'Other', COLOR: '#6B7280' }
};
