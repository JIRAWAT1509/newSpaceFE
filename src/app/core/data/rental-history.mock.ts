// src/app/core/data/rental-history.mock.ts

import { RentalHistory } from '../models/rental-history.model';

export const MOCK_RENTAL_HISTORY: RentalHistory[] = [
  // History for area-001 (2MD001)
  {
    id: 'rh-001',
    areaId: 'area-001',
    tenantName: 'บริษัท ซอฟต์แวร์ เก่า จำกัด',
    tenantNameTh: 'บริษัท ซอฟต์แวร์ เก่า จำกัด',
    tenantNameEn: 'Old Software Co., Ltd.',
    tenantEmail: 'old@software.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2023-06-01'),
    leaseEnd: new Date('2024-12-31'),
    monthlyRent: 40000,
    totalRevenue: 760000, // 19 months * 40000
    revenueByWeek: [], // Can be populated if needed
    revenueByYear: [
      { year: 2023, revenue: 280000, averageMonthlyRevenue: 40000 }, // 7 months
      { year: 2024, revenue: 480000, averageMonthlyRevenue: 40000 }  // 12 months
    ],
    moveOutReason: 'ย้ายไปที่ใหญ่กว่า',
    moveOutReasonTh: 'ย้ายไปที่ใหญ่กว่าเพราะต้องการพื้นที่เพิ่ม',
    moveOutReasonEn: 'Moved to larger space due to expansion needs',
    moveOutCategory: 'relocation',
    occupancyDays: 579, // ~19 months
    avgRevenuePerDay: 1312.5,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-12-31')
  },

  // History for area-004 (2MD003)
  {
    id: 'rh-002',
    areaId: 'area-004',
    tenantName: 'ร้านอาหาร เดลิเชียส',
    tenantNameTh: 'ร้านอาหาร เดลิเชียส',
    tenantNameEn: 'Delicious Restaurant',
    tenantEmail: 'info@delicious.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2024-03-01'),
    leaseEnd: new Date('2024-10-31'),
    monthlyRent: 22000,
    totalRevenue: 176000, // 8 months * 22000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2024, revenue: 176000, averageMonthlyRevenue: 22000 }
    ],
    moveOutReason: 'ปิดกิจการ',
    moveOutReasonTh: 'ปิดกิจการเนื่องจากยอดขายไม่ดี',
    moveOutReasonEn: 'Business closed due to poor sales',
    moveOutCategory: 'business-closed',
    occupancyDays: 245,
    avgRevenuePerDay: 718.4,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-10-31')
  },

  // History for area-005 (2MD004)
  {
    id: 'rh-003',
    areaId: 'area-005',
    tenantName: 'บริษัท ครีเอทีฟ เอเจนซี่',
    tenantNameTh: 'บริษัท ครีเอทีฟ เอเจนซี่',
    tenantNameEn: 'Creative Agency Co.',
    tenantEmail: 'hello@creative.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2023-01-15'),
    leaseEnd: new Date('2025-01-14'),
    monthlyRent: 45000,
    totalRevenue: 1080000, // 24 months * 45000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2023, revenue: 540000, averageMonthlyRevenue: 45000 },
      { year: 2024, revenue: 540000, averageMonthlyRevenue: 45000 }
    ],
    moveOutReason: 'สัญญาหมด ไม่ต่อ',
    moveOutReasonTh: 'สัญญาหมดและไม่ประสงค์จะต่อสัญญา',
    moveOutReasonEn: 'Lease ended, chose not to renew',
    moveOutCategory: 'other',
    occupancyDays: 730,
    avgRevenuePerDay: 1479.5,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2025-01-14')
  },

  // History for area-009 (2MD008)
  {
    id: 'rh-004',
    areaId: 'area-009',
    tenantName: 'คลินิกทันตกรรม สไมล์',
    tenantNameTh: 'คลินิกทันตกรรม สไมล์',
    tenantNameEn: 'Smile Dental Clinic',
    tenantEmail: 'info@smiledental.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2023-08-01'),
    leaseEnd: new Date('2024-07-31'),
    monthlyRent: 26000,
    totalRevenue: 312000, // 12 months * 26000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2023, revenue: 130000, averageMonthlyRevenue: 26000 }, // 5 months
      { year: 2024, revenue: 182000, averageMonthlyRevenue: 26000 }  // 7 months
    ],
    moveOutReason: 'ค่าเช่าสูงเกินไป',
    moveOutReasonTh: 'ค่าเช่าสูงเกินไปสำหรับรายได้ของคลินิก',
    moveOutReasonEn: 'Rent too high for clinic revenue',
    moveOutCategory: 'cost',
    occupancyDays: 366,
    avgRevenuePerDay: 852.5,
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-07-31')
  },

  // History for area-010 (2MD009)
  {
    id: 'rh-005',
    areaId: 'area-010',
    tenantName: 'ร้าน เบเกอรี่ โฮม',
    tenantNameTh: 'ร้าน เบเกอรี่ โฮม',
    tenantNameEn: 'Home Bakery Shop',
    tenantEmail: 'home@bakery.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2022-10-01'),
    leaseEnd: new Date('2024-09-30'),
    monthlyRent: 25000,
    totalRevenue: 600000, // 24 months * 25000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2022, revenue: 75000, averageMonthlyRevenue: 25000 },   // 3 months
      { year: 2023, revenue: 300000, averageMonthlyRevenue: 25000 },  // 12 months
      { year: 2024, revenue: 225000, averageMonthlyRevenue: 25000 }   // 9 months
    ],
    moveOutReason: 'ย้ายสาขา',
    moveOutReasonTh: 'ย้ายไปเปิดสาขาในทำเลที่ดีกว่า',
    moveOutReasonEn: 'Relocated to better location',
    moveOutCategory: 'relocation',
    occupancyDays: 730,
    avgRevenuePerDay: 821.9,
    createdAt: new Date('2022-10-01'),
    updatedAt: new Date('2024-09-30')
  },

  // History for area-013 (KK-01)
  {
    id: 'rh-006',
    areaId: 'area-013',
    tenantName: 'ร้าน ขนมไทย',
    tenantNameTh: 'ร้าน ขนมไทย',
    tenantNameEn: 'Thai Dessert Shop',
    tenantEmail: 'thai@dessert.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2024-01-01'),
    leaseEnd: new Date('2024-06-30'),
    monthlyRent: 8500,
    totalRevenue: 51000, // 6 months * 8500
    revenueByWeek: [],
    revenueByYear: [
      { year: 2024, revenue: 51000, averageMonthlyRevenue: 8500 }
    ],
    moveOutReason: 'ไม่พอใจบริการ',
    moveOutReasonTh: 'ไม่พอใจกับการบริการและการดูแลอาคาร',
    moveOutReasonEn: 'Dissatisfied with building services and management',
    moveOutCategory: 'dissatisfaction',
    occupancyDays: 182,
    avgRevenuePerDay: 280.2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-30')
  },

  // More history for area-012 (2MD010B)
  {
    id: 'rh-007',
    areaId: 'area-012',
    tenantName: 'ร้านเสริมสวย บิวตี้',
    tenantNameTh: 'ร้านเสริมสวย บิวตี้',
    tenantNameEn: 'Beauty Salon',
    tenantEmail: 'beauty@salon.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2023-05-01'),
    leaseEnd: new Date('2024-04-30'),
    monthlyRent: 18000,
    totalRevenue: 216000, // 12 months * 18000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2023, revenue: 144000, averageMonthlyRevenue: 18000 }, // 8 months
      { year: 2024, revenue: 72000, averageMonthlyRevenue: 18000 }   // 4 months
    ],
    moveOutReason: 'ย้ายสถานที่',
    moveOutReasonTh: 'ย้ายไปเปิดร้านที่ห้างสรรพสินค้า',
    moveOutReasonEn: 'Moved to shopping mall location',
    moveOutCategory: 'relocation',
    occupancyDays: 366,
    avgRevenuePerDay: 590.2,
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2024-04-30')
  },

  // History for area-017 (2MD013)
  {
    id: 'rh-008',
    areaId: 'area-017',
    tenantName: 'สตูดิโอถ่ายภาพ',
    tenantNameTh: 'สตูดิโอถ่ายภาพ',
    tenantNameEn: 'Photography Studio',
    tenantEmail: 'photo@studio.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2023-11-01'),
    leaseEnd: new Date('2024-10-31'),
    monthlyRent: 24000,
    totalRevenue: 288000, // 12 months * 24000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2023, revenue: 48000, averageMonthlyRevenue: 24000 },  // 2 months
      { year: 2024, revenue: 240000, averageMonthlyRevenue: 24000 }  // 10 months
    ],
    moveOutReason: 'สัญญาหมด',
    moveOutReasonTh: 'สัญญาหมดและต้องการต่อสัญญาใหม่',
    moveOutReasonEn: 'Lease ended, ready for new contract',
    moveOutCategory: 'other',
    occupancyDays: 366,
    avgRevenuePerDay: 786.9,
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-10-31')
  },

  // History for area-006 (2MD005) - quotation that became rental
  {
    id: 'rh-009',
    areaId: 'area-006',
    tenantName: 'บริษัท อีคอมเมิร์ซ จำกัด',
    tenantNameTh: 'บริษัท อีคอมเมิร์ซ จำกัด',
    tenantNameEn: 'E-commerce Co., Ltd.',
    tenantEmail: 'info@ecommerce.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2024-01-01'),
    leaseEnd: new Date('2024-12-31'),
    monthlyRent: 40000,
    totalRevenue: 480000, // 12 months * 40000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2024, revenue: 480000, averageMonthlyRevenue: 40000 }
    ],
    moveOutReason: 'สัญญาหมด',
    moveOutReasonTh: 'สัญญาหมดและกำลังเจรจาสัญญาใหม่',
    moveOutReasonEn: 'Lease ended, negotiating new contract',
    moveOutCategory: 'other',
    occupancyDays: 366,
    avgRevenuePerDay: 1311.5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-31')
  },

  // History for area-007 (2MD006)
  {
    id: 'rh-010',
    areaId: 'area-007',
    tenantName: 'บริษัท ดิจิตอล มาร์เก็ตติ้ง',
    tenantNameTh: 'บริษัท ดิจิตอล มาร์เก็ตติ้ง',
    tenantNameEn: 'Digital Marketing Co.',
    tenantEmail: 'digital@marketing.com',
    tenantPhone: '02-xxx-xxxx',
    leaseStart: new Date('2023-03-01'),
    leaseEnd: new Date('2024-02-29'),
    monthlyRent: 42000,
    totalRevenue: 504000, // 12 months * 42000
    revenueByWeek: [],
    revenueByYear: [
      { year: 2023, revenue: 420000, averageMonthlyRevenue: 42000 }, // 10 months
      { year: 2024, revenue: 84000, averageMonthlyRevenue: 42000 }   // 2 months
    ],
    moveOutReason: 'ย้ายออก',
    moveOutReasonTh: 'ย้ายไปรวมบริษัทกับสำนักงานใหญ่',
    moveOutReasonEn: 'Consolidated with main office',
    moveOutCategory: 'relocation',
    occupancyDays: 366,
    avgRevenuePerDay: 1377.0,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-02-29')
  }
];

// Summary statistics
export const RENTAL_HISTORY_STATISTICS = {
  totalRecords: MOCK_RENTAL_HISTORY.length,
  totalRevenue: MOCK_RENTAL_HISTORY.reduce((sum, rh) => sum + rh.totalRevenue, 0),
  averageOccupancyDays: Math.round(
    MOCK_RENTAL_HISTORY.reduce((sum, rh) => sum + rh.occupancyDays, 0) / MOCK_RENTAL_HISTORY.length
  ),
  moveOutReasons: {
    relocation: MOCK_RENTAL_HISTORY.filter(rh => rh.moveOutCategory === 'relocation').length,
    cost: MOCK_RENTAL_HISTORY.filter(rh => rh.moveOutCategory === 'cost').length,
    dissatisfaction: MOCK_RENTAL_HISTORY.filter(rh => rh.moveOutCategory === 'dissatisfaction').length,
    businessClosed: MOCK_RENTAL_HISTORY.filter(rh => rh.moveOutCategory === 'business-closed').length,
    other: MOCK_RENTAL_HISTORY.filter(rh => rh.moveOutCategory === 'other').length
  }
};
