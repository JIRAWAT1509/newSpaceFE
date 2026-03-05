// src/app/core/data/rental-history.mock.v2.ts

import { RentalHistory } from '../models/rental-history.model';
import { toDateString } from '../utils/date-utils';

// rental-history.mock.v2.ts — แก้ AREA_ID ให้ตรงกับ areas.mock.ts

export const MOCK_RENTAL_HISTORY: RentalHistory[] = [

  // ── area-sl-a1-001 (SL-A1-001 / The Coffee Club ปัจจุบัน) ──
  {
    RENTAL_HISTORY_ID: 'RH-001',
    OU_CODE: '001',
    AREA_ID: 'area-sl-a1-001',          // ✅ ตรงกับ areas.mock.ts
    TENANT_NAME: 'ABC Electronics',
    TENANT_NAME_TH: 'บริษัท ABC Electronics จำกัด',
    TENANT_NAME_EN: 'ABC Electronics Co., Ltd.',
    TENANT_EMAIL: 'abc@electronics.com',
    TENANT_PHONE: '02-xxx-xxxx',
    LEASE_START: toDateString(new Date('2021-01-01')),
    LEASE_END: toDateString(new Date('2023-03-31')),
    MONTHLY_RENT: 45000,
    TOTAL_REVENUE: 1215000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2021, REVENUE: 540000, AVG_MONTHLY_REVENUE: 45000 },
      { YEAR: 2022, REVENUE: 540000, AVG_MONTHLY_REVENUE: 45000 },
      { YEAR: 2023, REVENUE: 135000, AVG_MONTHLY_REVENUE: 45000 },
    ],
    MOVE_OUT_REASON: 'สัญญาหมด',
    MOVE_OUT_REASON_TH: 'สัญญาครบกำหนด ไม่ต่อสัญญา',
    MOVE_OUT_REASON_EN: 'Lease expired, did not renew',
    MOVE_OUT_CATEGORY: 'RELOCATION',
    OCCUPANCY_DAYS: 820,
    AVG_REVENUE_PER_DAY: 1481.7,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2021-01-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2023-03-31')),
  },
  {
    RENTAL_HISTORY_ID: 'RH-002',
    OU_CODE: '001',
    AREA_ID: 'area-sl-a1-001',          // ✅ same area — previous tenant
    TENANT_NAME: 'Startup Tech',
    TENANT_NAME_TH: 'บริษัท สตาร์ทอัพ เทค จำกัด',
    TENANT_NAME_EN: 'Startup Tech Co., Ltd.',
    TENANT_EMAIL: 'info@startuptech.com',
    TENANT_PHONE: '02-yyy-yyyy',
    LEASE_START: toDateString(new Date('2018-06-01')),
    LEASE_END: toDateString(new Date('2020-12-31')),
    MONTHLY_RENT: 38000,
    TOTAL_REVENUE: 1102000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2018, REVENUE: 266000, AVG_MONTHLY_REVENUE: 38000 },
      { YEAR: 2019, REVENUE: 456000, AVG_MONTHLY_REVENUE: 38000 },
      { YEAR: 2020, REVENUE: 380000, AVG_MONTHLY_REVENUE: 38000 },
    ],
    MOVE_OUT_REASON: 'ย้ายออก',
    MOVE_OUT_REASON_TH: 'ย้ายไปพื้นที่ใหม่ที่ใหญ่กว่า',
    MOVE_OUT_REASON_EN: 'Relocated to larger space',
    MOVE_OUT_CATEGORY: 'RELOCATION',
    OCCUPANCY_DAYS: 944,
    AVG_REVENUE_PER_DAY: 1167.4,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2018-06-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2020-12-31')),
  },

  // ── area-sl-a1-002 (SL-A1-002 / Boots Pharmacy ปัจจุบัน) ──
  {
    RENTAL_HISTORY_ID: 'RH-003',
    OU_CODE: '001',
    AREA_ID: 'area-sl-a1-002',
    TENANT_NAME: 'Diamond Jewelry',
    TENANT_NAME_TH: 'ร้านเครื่องประดับ Diamond',
    TENANT_NAME_EN: 'Diamond Jewelry Shop',
    TENANT_EMAIL: 'diamond@jewelry.com',
    TENANT_PHONE: '02-xxx-xxxx',
    LEASE_START: toDateString(new Date('2019-03-01')),
    LEASE_END: toDateString(new Date('2022-06-30')),
    MONTHLY_RENT: 30000,
    TOTAL_REVENUE: 1200000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2019, REVENUE: 300000, AVG_MONTHLY_REVENUE: 30000 },
      { YEAR: 2020, REVENUE: 360000, AVG_MONTHLY_REVENUE: 30000 },
      { YEAR: 2021, REVENUE: 360000, AVG_MONTHLY_REVENUE: 30000 },
      { YEAR: 2022, REVENUE: 180000, AVG_MONTHLY_REVENUE: 30000 },
    ],
    MOVE_OUT_REASON: 'ค่าเช่าแพง',
    MOVE_OUT_REASON_TH: 'ค่าเช่าสูงเกินไปสำหรับยอดขาย',
    MOVE_OUT_REASON_EN: 'Rent too high relative to sales volume',
    MOVE_OUT_CATEGORY: 'COST',
    OCCUPANCY_DAYS: 1218,
    AVG_REVENUE_PER_DAY: 985.2,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2019-03-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2022-06-30')),
  },

  // ── area-sl-a2-001 (SL-A2-201 / Deloitte ปัจจุบัน) ──
  {
    RENTAL_HISTORY_ID: 'RH-004',
    OU_CODE: '001',
    AREA_ID: 'area-sl-a2-001',
    TENANT_NAME: 'PWC Thailand',
    TENANT_NAME_TH: 'ไพร้ซวอเตอร์เฮาส์คูเปอร์ส ประเทศไทย',
    TENANT_NAME_EN: 'PricewaterhouseCoopers Thailand',
    TENANT_EMAIL: 'realestate@pwc.com',
    TENANT_PHONE: '02-344-1000',
    LEASE_START: toDateString(new Date('2018-01-01')),
    LEASE_END: toDateString(new Date('2022-12-31')),
    MONTHLY_RENT: 68000,
    TOTAL_REVENUE: 4080000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2018, REVENUE: 816000, AVG_MONTHLY_REVENUE: 68000 },
      { YEAR: 2019, REVENUE: 816000, AVG_MONTHLY_REVENUE: 68000 },
      { YEAR: 2020, REVENUE: 816000, AVG_MONTHLY_REVENUE: 68000 },
      { YEAR: 2021, REVENUE: 816000, AVG_MONTHLY_REVENUE: 68000 },
      { YEAR: 2022, REVENUE: 816000, AVG_MONTHLY_REVENUE: 68000 },
    ],
    MOVE_OUT_REASON: 'ย้ายออฟฟิศ',
    MOVE_OUT_REASON_TH: 'ย้ายไปอาคารใหม่ของตัวเอง',
    MOVE_OUT_REASON_EN: 'Relocated to own premises',
    MOVE_OUT_CATEGORY: 'RELOCATION',
    OCCUPANCY_DAYS: 1826,
    AVG_REVENUE_PER_DAY: 2234.1,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2018-01-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2022-12-31')),
  },

  // ── area-ak-a1-001 (AK-A1-001 / Starbucks ปัจจุบัน) ──
  {
    RENTAL_HISTORY_ID: 'RH-005',
    OU_CODE: '001',
    AREA_ID: 'area-ak-a1-001',
    TENANT_NAME: 'True Coffee',
    TENANT_NAME_TH: 'ทรู คอฟฟี่',
    TENANT_NAME_EN: 'True Coffee',
    TENANT_EMAIL: 'ops@truecoffee.co.th',
    TENANT_PHONE: '02-900-9999',
    LEASE_START: toDateString(new Date('2019-07-01')),
    LEASE_END: toDateString(new Date('2021-12-31')),
    MONTHLY_RENT: 60000,
    TOTAL_REVENUE: 1800000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2019, REVENUE: 360000, AVG_MONTHLY_REVENUE: 60000 },
      { YEAR: 2020, REVENUE: 720000, AVG_MONTHLY_REVENUE: 60000 },
      { YEAR: 2021, REVENUE: 720000, AVG_MONTHLY_REVENUE: 60000 },
    ],
    MOVE_OUT_REASON: 'ปิดกิจการ',
    MOVE_OUT_REASON_TH: 'ปิดสาขาเนื่องจากผลประกอบการไม่ดี',
    MOVE_OUT_REASON_EN: 'Branch closed due to poor performance',
    MOVE_OUT_CATEGORY: 'BUSINESS_CLOSED',
    OCCUPANCY_DAYS: 915,
    AVG_REVENUE_PER_DAY: 1967.2,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2019-07-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2021-12-31')),
  },

  // ── area-ak-a2-003 (AK-A2-203 / Bitkub ปัจจุบัน) ──
  {
    RENTAL_HISTORY_ID: 'RH-006',
    OU_CODE: '001',
    AREA_ID: 'area-ak-a2-003',
    TENANT_NAME: 'FinTech Startup X',
    TENANT_NAME_TH: 'บริษัท ฟินเทค สตาร์ทอัพ เอ็กซ์ จำกัด',
    TENANT_NAME_EN: 'FinTech Startup X Co., Ltd.',
    TENANT_EMAIL: 'office@fintechx.io',
    TENANT_PHONE: '02-111-2222',
    LEASE_START: toDateString(new Date('2021-08-01')),
    LEASE_END: toDateString(new Date('2023-07-31')),
    MONTHLY_RENT: 44000,
    TOTAL_REVENUE: 1056000,
    REVENUE_BY_WEEK: [],
    REVENUE_BY_YEAR: [
      { YEAR: 2021, REVENUE: 220000, AVG_MONTHLY_REVENUE: 44000 },
      { YEAR: 2022, REVENUE: 528000, AVG_MONTHLY_REVENUE: 44000 },
      { YEAR: 2023, REVENUE: 308000, AVG_MONTHLY_REVENUE: 44000 },
    ],
    MOVE_OUT_REASON: 'ไม่พอใจ',
    MOVE_OUT_REASON_TH: 'ไม่พอใจเรื่องระบบ AC และการบริการ',
    MOVE_OUT_REASON_EN: 'Dissatisfied with HVAC system and service quality',
    MOVE_OUT_CATEGORY: 'DISSATISFACTION',
    OCCUPANCY_DAYS: 730,
    AVG_REVENUE_PER_DAY: 1446.6,
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2021-08-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2023-07-31')),
  },
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
