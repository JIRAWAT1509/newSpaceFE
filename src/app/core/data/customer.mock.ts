// customer.mock.ts
import { Customer, calculateCustomerClass, calculateChurnRisk } from '../models/customer.model';
import { DateTime } from 'luxon';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    companyName: 'บริษัท ไทยเทค โซลูชั่น จำกัด',
    businessType: 'Software Development',
    channel: 'direct-sales',
    status: 'customer',
    email: 'somchai@thaitech.com',
    phone: '02-123-4567',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-001', areaName: '2MD010B', floorNumber: 1 }
    ],
    budget: 600000,
    expectedClosingDate: '2025-03-15',
    remark: 'ลูกค้าเก่า มีศักยภาพสูง',
    segment: 'Enterprise',
    owner: 'Somchai',
    ownerId: 'user-001',
    arr: 720000,
    csat: 4.5,
    class: 'A',
    churnRisk: 'low',
    nextAction: 'Follow up contract renewal',
    overduePayments: 0,
    activeContracts: 3,
    totalRevenue: 2160000,
    lastContactDate: DateTime.now().minus({ days: 15 }).toISO(),
    createdAt: DateTime.now().minus({ months: 18 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 5 }).toISO()
  },
  {
    id: 'cust-002',
    firstName: 'วิภา',
    lastName: 'สุขสันต์',
    companyName: 'บริษัท เอส เอ็ม อี คอนซัลติ้ง จำกัด',
    businessType: 'Consulting',
    channel: 'website',
    status: 'customer',
    email: 'wipa@smeconsult.com',
    phone: '089-234-5678',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-004', areaName: '2MD012', floorNumber: 1 }
    ],
    budget: 250000,
    segment: 'SME',
    owner: 'Wipa',
    ownerId: 'user-002',
    arr: 264000,
    csat: 4.2,
    class: 'B',
    churnRisk: 'low',
    nextAction: 'Send upsell proposal',
    overduePayments: 0,
    activeContracts: 2,
    totalRevenue: 528000,
    lastContactDate: DateTime.now().minus({ days: 30 }).toISO(),
    createdAt: DateTime.now().minus({ months: 12 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 10 }).toISO()
  },
  {
    id: 'cust-003',
    firstName: 'ธนวัฒน์',
    lastName: 'รุ่งเรือง',
    companyName: 'Startup Innovation Hub',
    businessType: 'Technology',
    channel: 'social-media',
    status: 'qualified-lead',
    email: 'tanawat@startupinno.com',
    phone: '092-345-6789',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-009', areaName: 'OP-01', floorNumber: 1 },
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-010', areaName: 'OP-02', floorNumber: 1 }
    ],
    budget: 180000,
    expectedClosingDate: '2025-04-01',
    remark: 'สนใจพื้นที่ Coworking Space',
    segment: 'Startup',
    owner: 'Tanawat',
    ownerId: 'user-003',
    arr: 0,
    csat: 3.8,
    class: 'D',
    churnRisk: 'medium',
    nextAction: 'Schedule site visit',
    overduePayments: 0,
    activeContracts: 0,
    totalRevenue: 0,
    lastContactDate: DateTime.now().minus({ days: 7 }).toISO(),
    createdAt: DateTime.now().minus({ months: 2 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 1 }).toISO()
  },
  {
    id: 'cust-004',
    firstName: 'นภา',
    lastName: 'วงศ์ใหญ่',
    companyName: 'บริษัท กรุงเทพการค้า จำกัด (มหาชน)',
    businessType: 'Trading',
    channel: 'direct-sales',
    status: 'customer',
    email: 'napa@bkktrading.com',
    phone: '02-456-7890',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-008', areaName: 'LOG-02', floorNumber: 1 }
    ],
    budget: 800000,
    segment: 'Corporate',
    owner: 'Napa',
    ownerId: 'user-004',
    arr: 960000,
    csat: 4.7,
    class: 'A',
    churnRisk: 'low',
    nextAction: 'Prepare annual review',
    overduePayments: 0,
    activeContracts: 4,
    totalRevenue: 3840000,
    lastContactDate: DateTime.now().minus({ days: 20 }).toISO(),
    createdAt: DateTime.now().minus({ months: 24 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 3 }).toISO()
  },
  {
    id: 'cust-005',
    firstName: 'ประเสริฐ',
    lastName: 'มั่งมี',
    companyName: 'ร้านกาแฟสดใจกลางเมือง',
    businessType: 'Food & Beverage',
    channel: 'referral',
    status: 'customer',
    email: 'prasert@coffeecity.com',
    phone: '081-567-8901',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-002', areaName: 'KK-01', floorNumber: 1 }
    ],
    budget: 80000,
    segment: 'Retail',
    owner: 'Prasert',
    ownerId: 'user-005',
    arr: 96000,
    csat: 3.5,
    class: 'C',
    churnRisk: 'medium',
    nextAction: 'Address maintenance issues',
    overduePayments: 1,
    activeContracts: 1,
    totalRevenue: 192000,
    lastContactDate: DateTime.now().minus({ days: 45 }).toISO(),
    createdAt: DateTime.now().minus({ months: 16 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 15 }).toISO()
  },
  {
    id: 'cust-006',
    firstName: 'อรุณี',
    lastName: 'สว่างไสว',
    companyName: undefined, // No company - will show owner name
    businessType: 'Freelance Designer',
    channel: 'website',
    status: 'prospect',
    email: 'arunee.design@gmail.com',
    phone: '095-678-9012',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-011', areaName: 'KK-03', floorNumber: 1 }
    ],
    budget: 15000,
    expectedClosingDate: '2025-05-01',
    remark: 'นักออกแบบอิสระ ต้องการพื้นที่ขนาดเล็ก',
    segment: 'Individual',
    owner: 'Arunee',
    ownerId: 'user-006',
    arr: 0,
    csat: 3.0,
    class: 'D',
    churnRisk: 'high',
    nextAction: 'Send kiosk options',
    overduePayments: 0,
    activeContracts: 0,
    totalRevenue: 0,
    lastContactDate: DateTime.now().minus({ days: 10 }).toISO(),
    createdAt: DateTime.now().minus({ weeks: 3 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 2 }).toISO()
  },
  {
    id: 'cust-007',
    firstName: 'พงศกร',
    lastName: 'ทรงศิลป์',
    companyName: 'บริษัท ดิจิทัล มาร์เก็ตติ้ง โปร จำกัด',
    businessType: 'Digital Marketing',
    channel: 'direct-sales',
    status: 'customer',
    email: 'pongsakorn@digitalmarketingpro.com',
    phone: '02-789-0123',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-010', areaName: 'OP-02', floorNumber: 1 }
    ],
    budget: 350000,
    segment: 'SME',
    owner: 'Pongsakorn',
    ownerId: 'user-007',
    arr: 432000,
    csat: 4.0,
    class: 'B',
    churnRisk: 'low',
    nextAction: 'Quarterly business review',
    overduePayments: 0,
    activeContracts: 2,
    totalRevenue: 864000,
    lastContactDate: DateTime.now().minus({ days: 18 }).toISO(),
    createdAt: DateTime.now().minus({ months: 15 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 4 }).toISO()
  },
  {
    id: 'cust-008',
    firstName: 'สุดา',
    lastName: 'ประทีปพร',
    companyName: 'โรงเรียนกวดวิชาเพชรพิทยา',
    businessType: 'Education',
    channel: 'social-media',
    status: 'customer',
    email: 'suda@petchpittaya.com',
    phone: '089-890-1234',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-007', areaName: 'LOG-01', floorNumber: 1 }
    ],
    budget: 120000,
    segment: 'Education',
    owner: 'Suda',
    ownerId: 'user-008',
    arr: 144000,
    csat: 3.2,
    class: 'B',
    churnRisk: 'medium',
    nextAction: 'Discuss space expansion',
    overduePayments: 1,
    activeContracts: 1,
    totalRevenue: 288000,
    lastContactDate: DateTime.now().minus({ days: 50 }).toISO(),
    createdAt: DateTime.now().minus({ months: 10 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 12 }).toISO()
  },
  {
    id: 'cust-009',
    firstName: 'รัชพล',
    lastName: 'เจริญสุข',
    companyName: 'บริษัท ไอทีออลล์ เซอร์วิส จำกัด',
    businessType: 'IT Services',
    channel: 'website',
    status: 'customer',
    email: 'ratchapon@itallservice.com',
    phone: '02-234-5678',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-001', areaName: '2MD010B', floorNumber: 1 }
    ],
    budget: 10000,
    segment: 'Enterprise',
    owner: 'Ratchapon',
    ownerId: 'user-009',
    arr: 660000,
    csat: 4.4,
    class: 'A',
    churnRisk: 'low',
    nextAction: 'Contract renewal discussion',
    overduePayments: 0,
    activeContracts: 3,
    totalRevenue: 1980000,
    lastContactDate: DateTime.now().minus({ days: 12 }).toISO(),
    createdAt: DateTime.now().minus({ months: 20 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 6 }).toISO()
  },
  {
    id: 'cust-010',
    firstName: 'วรรณา',
    lastName: 'สุขสวัสดิ์',
    companyName: 'คลินิกสุขภาพดีมีสุข',
    businessType: 'Healthcare',
    channel: 'referral',
    status: 'customer',
    email: 'wanna@healthclinic.com',
    phone: '091-345-6789',
    interestedAreas: [
      { buildingId: 'bld-001', buildingName: 'อาคารอิมพีเรียล ทาวเวอร์ 3', areaId: 'area-004', areaName: '2MD012', floorNumber: 1 }
    ],
    budget: 220000,
    segment: 'Healthcare',
    owner: 'Wanna',
    ownerId: 'user-010',
    arr: 264000,
    csat: 4.6,
    class: 'B',
    churnRisk: 'low',
    nextAction: 'Send satisfaction survey',
    overduePayments: 0,
    activeContracts: 2,
    totalRevenue: 528000,
    lastContactDate: DateTime.now().minus({ days: 25 }).toISO(),
    createdAt: DateTime.now().minus({ months: 14 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 8 }).toISO()
  }
];

// Continue with 15 more customers for comprehensive demo...
// (In production, you would add more here)

export const MOCK_CUSTOMER_STATS = {
  totalCustomers: MOCK_CUSTOMERS.length,
  averageCSAT: 4.1,
  csatTrend: 5.2, // +5.2%
  churnRate: 8.5, // 8.5%
  churnTrend: -2.1, // -2.1% (improvement)
  activeDeals: 28,
  dealsTrend: 12.5 // +12.5%
};

// CSAT trend data (last 12 months)
export const MOCK_CSAT_TREND = [
  { month: 'Jan', value: 3.8 },
  { month: 'Feb', value: 3.9 },
  { month: 'Mar', value: 3.9 },
  { month: 'Apr', value: 4.0 },
  { month: 'May', value: 4.1 },
  { month: 'Jun', value: 4.0 },
  { month: 'Jul', value: 4.2 },
  { month: 'Aug', value: 4.1 },
  { month: 'Sep', value: 4.3 },
  { month: 'Oct', value: 4.2 },
  { month: 'Nov', value: 4.1 },
  { month: 'Dec', value: 4.1 }
];

// Churn rate data
export const MOCK_CHURN_DATA = {
  currentRate: 8.5,
  previousRate: 10.6,
  customersLost: 5,
  totalCustomers: 59,
  reasons: [
    { reason: 'Price increase', percentage: 35 },
    { reason: 'Found alternative', percentage: 28 },
    { reason: 'Business closure', percentage: 22 },
    { reason: 'Relocation', percentage: 15 }
  ]
};
