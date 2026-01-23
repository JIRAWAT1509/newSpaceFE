// customer.model.ts
export type CustomerClass = 'A' | 'B' | 'C' | 'D';
export type CustomerSegment = 'Enterprise' | 'SME' | 'Startup' | 'Retail' | 'Individual' | string;
export type CustomerStatus = 'prospect' | 'qualified-lead' | 'customer';
export type CustomerChannel = 'website' | 'direct-sales' | 'social-media' | 'referral' | 'other';
export type ChurnRisk = 'low' | 'medium' | 'high';

export interface InterestedArea {
  buildingId: string;
  buildingName: string;
  areaId: string;
  areaName: string;
  floorNumber?: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  businessType?: string;
  channel: CustomerChannel;
  status: CustomerStatus;
  email?: string;
  phone?: string;
  interestedAreas: InterestedArea[];
  budget?: number;
  expectedClosingDate?: string;
  remark?: string;

  // Calculated/System fields
  class: CustomerClass;
  segment: CustomerSegment;
  owner: string; // Sales person first name
  ownerId: string;
  arr: number; // Annual Recurring Revenue
  csat: number; // Customer Satisfaction (1-5)
  churnRisk: ChurnRisk;
  nextAction?: string;

  // Metadata
  overduePayments: number;
  activeContracts: number;
  totalRevenue: number;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Class calculation criteria
export interface ClassCriteria {
  class: CustomerClass;
  nameTh: string;
  nameEn: string;
  criteria: {
    arrMin?: number;
    arrMax?: number;
    overdueMax: number;
    csatMin: number;
    description: string;
  };
  color: string;
  bgColor: string;
}

export const CLASS_DEFINITIONS: ClassCriteria[] = [
  {
    class: 'A',
    nameTh: 'รายได้เยอะ',
    nameEn: 'High Revenue',
    criteria: {
      arrMin: 500000,
      overdueMax: 0,
      csatMin: 4.0,
      description: 'ARR ≥ ฿500,000/year, No overdue payments, CSAT ≥ 4.0'
    },
    color: '#10b981',
    bgColor: '#d1fae5'
  },
  {
    class: 'B',
    nameTh: 'รายได้กลาง',
    nameEn: 'Medium Revenue',
    criteria: {
      arrMin: 100000,
      arrMax: 499999,
      overdueMax: 1,
      csatMin: 3.0,
      description: 'ARR ฿100,000-฿499,999/year, Overdue ≤ 1, CSAT ≥ 3.0'
    },
    color: '#3b82f6',
    bgColor: '#dbeafe'
  },
  {
    class: 'C',
    nameTh: 'Price Sensitive',
    nameEn: 'Low Margin',
    criteria: {
      arrMin: 50000,
      arrMax: 99999,
      overdueMax: 2,
      csatMin: 2.0,
      description: 'ARR ฿50,000-฿99,999/year, Overdue ≤ 2, Low margin'
    },
    color: '#f59e0b',
    bgColor: '#fef3c7'
  },
  {
    class: 'D',
    nameTh: 'เฝ้าระวัง/Blacklist',
    nameEn: 'Watch/Blacklist',
    criteria: {
      arrMax: 49999,
      overdueMax: 999,
      csatMin: 0,
      description: 'ARR < ฿50,000/year, Overdue > 2, CSAT < 2.5'
    },
    color: '#ef4444',
    bgColor: '#fee2e2'
  }
];

// Helper functions
export function calculateCustomerClass(
  arr: number,
  overduePayments: number,
  csat: number
): CustomerClass {
  if (arr >= 500000 && overduePayments === 0 && csat >= 4.0) return 'A';
  if (arr >= 100000 && arr < 500000 && overduePayments <= 1 && csat >= 3.0) return 'B';
  if (arr >= 50000 && arr < 100000 && overduePayments <= 2 && csat >= 2.0) return 'C';
  return 'D';
}

export function calculateChurnRisk(
  csat: number,
  overduePayments: number,
  lastContactDays: number
): ChurnRisk {
  if (csat < 2.5 || overduePayments > 2 || lastContactDays > 90) return 'high';
  if (csat < 3.5 || overduePayments > 0 || lastContactDays > 60) return 'medium';
  return 'low';
}

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  'Enterprise', 'SME', 'Startup', 'Retail', 'Individual',
  'Corporate', 'Government', 'Education', 'Healthcare', 'Technology'
];

export const CHANNEL_LABELS: Record<CustomerChannel, { th: string; en: string }> = {
  'website': { th: 'เว็บไซต์', en: 'Website' },
  'direct-sales': { th: 'ขายตรง', en: 'Direct Sales' },
  'social-media': { th: 'โซเชียลมีเดีย', en: 'Social Media' },
  'referral': { th: 'แนะนำ', en: 'Referral' },
  'other': { th: 'อื่นๆ', en: 'Other' }
};

export const STATUS_LABELS: Record<CustomerStatus, { th: string; en: string; color: string }> = {
  'prospect': { th: 'ผู้สนใจ', en: 'Prospect', color: '#6b7280' },
  'qualified-lead': { th: 'ผู้มีคุณสมบัติ', en: 'Qualified Lead', color: '#3b82f6' },
  'customer': { th: 'ลูกค้า', en: 'Customer', color: '#10b981' }
};

export const CHURN_RISK_LABELS: Record<ChurnRisk, { th: string; en: string; color: string }> = {
  'low': { th: 'ต่ำ', en: 'Low', color: '#10b981' },
  'medium': { th: 'กลาง', en: 'Medium', color: '#f59e0b' },
  'high': { th: 'สูง', en: 'High', color: '#ef4444' }
};
