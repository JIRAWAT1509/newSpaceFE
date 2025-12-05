// src/app/core/data/rental-history.mock.v2.ts

import { RentalHistory } from '../models/rental-history.model';
import { toDateString } from '../utils/date-utils';

export const MOCK_RENTAL_HISTORY: RentalHistory[] = [
  // ========== AREA-001 (2MD001) ==========
  {
    RENTAL_HISTORY_ID: 'RH-001',
    OU_CODE: '001',
    AREA_ID: 'area-001',
    TENANT_NAME: 'ABC Electronics',
    TENANT_NAME_TH: 'บริษัท ABC Electronics จำกัด',
    TENANT_NAME_EN: 'ABC Electronics Co., Ltd.',
    TENANT_EMAIL: 'abc@electronics.com',
    TENANT_PHONE: '02-xxx-xxxx',
    LEASE_START: toDateString(new Date('2023-06-01')),
    LEASE_END: toDateString(new Date('2024-12-31')),
    MONTHLY_RENT: 40000,
    TOTAL_REVENUE: 760000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2023, REVENUE: 280000, AVG_MONTHLY_REVENUE: 40000 },
      { YEAR: 2024, REVENUE: 480000, AVG_MONTHLY_REVENUE: 40000 }
    ],
    MOVE_OUT_REASON: 'ย้ายไปที่ใหญ่กว่า',
    MOVE_OUT_REASON_TH: 'ย้ายไปที่ใหญ่กว่าเพราะต้องการพื้นที่เพิ่ม',
    MOVE_OUT_REASON_EN: 'Moved to larger space due to expansion needs',
    MOVE_OUT_CATEGORY: 'RELOCATION',
    OCCUPANCY_DAYS: 579,
    AVG_REVENUE_PER_DAY: 1312.5,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2023-06-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-12-31'))
  },
  {
    RENTAL_HISTORY_ID: 'RH-011',
    OU_CODE: '001',
    AREA_ID: 'area-001',
    TENANT_NAME: 'Startup Tech',
    TENANT_NAME_TH: 'บริษัท สตาร์ทอัพ เทค จำกัด',
    TENANT_NAME_EN: 'Startup Tech Co., Ltd.',
    TENANT_EMAIL: 'info@startuptech.com',
    TENANT_PHONE: '02-xxx-xxxx',
    LEASE_START: toDateString(new Date('2021-01-01')),
    LEASE_END: toDateString(new Date('2023-05-31')),
    MONTHLY_RENT: 38000,
    TOTAL_REVENUE: 1102000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2021, REVENUE: 456000, AVG_MONTHLY_REVENUE: 38000 },
      { YEAR: 2022, REVENUE: 456000, AVG_MONTHLY_REVENUE: 38000 },
      { YEAR: 2023, REVENUE: 190000, AVG_MONTHLY_REVENUE: 38000 }
    ],
    MOVE_OUT_REASON: 'สัญญาหมด',
    MOVE_OUT_REASON_TH: 'สัญญาหมดและต้องการย้ายขยายธุรกิจ',
    MOVE_OUT_REASON_EN: 'Lease ended, expanding business elsewhere',
    MOVE_OUT_CATEGORY: 'RELOCATION',
    OCCUPANCY_DAYS: 881,
    AVG_REVENUE_PER_DAY: 1250.9,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2021-01-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2023-05-31'))
  },

  // ========== AREA-002 (2MD012) ==========
  {
    RENTAL_HISTORY_ID: 'RH-012',
    OU_CODE: '001',
    AREA_ID: 'area-002',
    TENANT_NAME: 'Diamond Jewelry',
    TENANT_NAME_TH: 'ร้านเครื่องประดับ Diamond',
    TENANT_NAME_EN: 'Diamond Jewelry Shop',
    TENANT_EMAIL: 'diamond@jewelry.com',
    TENANT_PHONE: '02-xxx-xxxx',
    LEASE_START: toDateString(new Date('2022-06-01')),
    LEASE_END: toDateString(new Date('2024-10-31')),
    MONTHLY_RENT: 30000,
    TOTAL_REVENUE: 870000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2022, REVENUE: 210000, AVG_MONTHLY_REVENUE: 30000 },
      { YEAR: 2023, REVENUE: 360000, AVG_MONTHLY_REVENUE: 30000 },
      { YEAR: 2024, REVENUE: 300000, AVG_MONTHLY_REVENUE: 30000 }
    ],
    MOVE_OUT_REASON: 'ย้ายสถานที่',
    MOVE_OUT_REASON_TH: 'ย้ายไปเปิดที่ห้างสรรพสินค้า',
    MOVE_OUT_REASON_EN: 'Relocated to shopping mall',
    MOVE_OUT_CATEGORY: 'RELOCATION',
    OCCUPANCY_DAYS: 884,
    AVG_REVENUE_PER_DAY: 984.2,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2022-06-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-10-31'))
  },

  // Add more rental history entries following the same pattern...
];

// Statistics
export const RENTAL_HISTORY_STATISTICS = {
  TOTAL_RECORDS: MOCK_RENTAL_HISTORY.length,
  TOTAL_REVENUE: MOCK_RENTAL_HISTORY.reduce((sum, rh) => sum + rh.TOTAL_REVENUE, 0),
  AVG_OCCUPANCY_DAYS: Math.round(
    MOCK_RENTAL_HISTORY.reduce((sum, rh) => sum + rh.OCCUPANCY_DAYS, 0) / MOCK_RENTAL_HISTORY.length
  ),
  AVG_MONTHLY_RENT: Math.round(
    MOCK_RENTAL_HISTORY.reduce((sum, rh) => sum + rh.MONTHLY_RENT, 0) / MOCK_RENTAL_HISTORY.length
  ),
  BY_MOVE_OUT_CATEGORY: {
    RELOCATION: MOCK_RENTAL_HISTORY.filter(rh => rh.MOVE_OUT_CATEGORY === 'RELOCATION').length,
    COST: MOCK_RENTAL_HISTORY.filter(rh => rh.MOVE_OUT_CATEGORY === 'COST').length,
    DISSATISFACTION: MOCK_RENTAL_HISTORY.filter(rh => rh.MOVE_OUT_CATEGORY === 'DISSATISFACTION').length,
    BUSINESS_CLOSED: MOCK_RENTAL_HISTORY.filter(rh => rh.MOVE_OUT_CATEGORY === 'BUSINESS_CLOSED').length,
    OTHER: MOCK_RENTAL_HISTORY.filter(rh => rh.MOVE_OUT_CATEGORY === 'OTHER').length
  }
};

// Helper to get rental history by area
export function getRentalHistoryByAreaId(areaId: string): RentalHistory[] {
  return MOCK_RENTAL_HISTORY
    .filter(rh => rh.AREA_ID === areaId)
    .sort((a, b) => {
      const dateA = parseInt(a.LEASE_END.replace(/\/Date\((\d+)\)\//, '$1'));
      const dateB = parseInt(b.LEASE_END.replace(/\/Date\((\d+)\)\//, '$1'));
      return dateB - dateA; // Newest first
    });
}

// Helper to get rent rate timeline for chart
export function getRentRateTimeline(areaId: string): { date: Date; rent: number }[] {
  const history = getRentalHistoryByAreaId(areaId);
  const timeline: { date: Date; rent: number }[] = [];

  history.forEach(rh => {
    const startTimestamp = parseInt(rh.LEASE_START.replace(/\/Date\((\d+)\)\//, '$1'));
    const endTimestamp = parseInt(rh.LEASE_END.replace(/\/Date\((\d+)\)\//, '$1'));

    timeline.push({ date: new Date(startTimestamp), rent: rh.MONTHLY_RENT });
    timeline.push({ date: new Date(endTimestamp), rent: rh.MONTHLY_RENT });
  });

  return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
}
