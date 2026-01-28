// contract.mock.ts - Full mock data for testing (UPDATED)

import {
  Contract,
  RenewalAgreement,
  AreaDetail,
  RevenueCode,
  OtherRevenue,
  GuaranteeDocument,
  ReceiptTransfer,
  Installment,
  PaymentTransfer,
  PaymentCheck,
  ContractCondition,
  ContractFile
} from '@core/models/contract.model';

export const MOCK_CONTRACT_FULL: Contract = {
  // ==================== BASIC INFO ====================
  CONTRACT_ID: 'CNT-2024-001',
  OU_CODE: 'OU001',
  AREA_ID: 'AREA-A-1-101',
  CONTRACT_NUMBER: 'CNT-2024-001',
  CONTRACT_TYPE: 'LEASE_AGREEMENT',
  STATUS: 'ACTIVE',
  STATUS_NAME: 'ใช้งานอยู่',

  // Legacy fields
  RENTAL_HISTORY_ID: 'RH-2024-001',
  CONTRACT_TOPIC: 'สัญญาเช่าพื้นที่เพื่อประกอบกิจการร้านกาแฟและเบเกอรี่ ณ ศูนย์การค้าเซ็นทรัลเวิลด์',
  CONTRACT_TOPIC_TH: 'สัญญาเช่าพื้นที่เพื่อประกอบกิจการร้านกาแฟและเบเกอรี่',
  CONTRACT_TOPIC_EN: 'Lease Agreement for Coffee and Bakery Shop Space',
  TENANT_NAME: 'บริษัท กาแฟดีดี จำกัด',
  TENANT_NAME_TH: 'บริษัท กาแฟดีดี จำกัด',
  TENANT_NAME_EN: 'DD Coffee Company Limited',
  LANDLORD_NAME: 'บริษัท เซ็นทรัล พัฒนา จำกัด (มหาชน)',
  ISSUE_DATE: '/Date(1705276800000)/',  // 2024-01-15
  EXPIRY_DATE: '/Date(1817356800000)/', // 2027-08-16
  SIGNED_DATE: '/Date(1705363200000)/',  // 2024-01-16
  MONTHLY_RENT: 150000,
  DEPOSIT_AMOUNT: 450000,
  TOTAL_VALUE: 6300000,  // 35 months × 150,000 + deposit
  NOTES: 'ลูกค้ามีประวัติการชำระเงินตรงเวลา ไม่เคยค้างชำระ',
  TAGS: 'renewal,negotiated,high-value',
  BOOKING_NUMBER: 'BOOK-2024-010',
  QUOTATION_NUMBER: 'QUOT-2024-045',
  BUILDING_CODE: 'A',

  // ==================== TAB 1: GENERAL DETAILS ====================

  // Header Section (10 fields)
  BRANCH_CODE: 'BRANCH-BKK-01',
  CONTRACT_TYPE_CODE: 'LEASE_001',
  CONTRACT_NUMBER_MAIN: 'QUOT-2024-045',
  CONTRACT_NUMBER_SUB: 'QUOT-2024-045-SUB',
  QUOTATION_STATUS: 'APPROVED',
  CONTRACT_DATE: '2024-01-15',
  RECORD_DATE: '2024-01-10',
  APPROVAL_DATE: '2024-01-14',
  INTENTION_LETTER: 'INT-2024-001',
  TRANSFER_TO_BOOKING: 'BOOK-2024-010',

  // Provider Section (6 fields)
  CONTRACT_LOCATION: 'สำนักงานใหญ่ เซ็นทรัลเวิลด์',
  HEAD_OFFICE_ADDRESS: '999/9 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
  REPRESENTATIVE: 'นายสมชาย ใจดี',
  BRANCH_ADDRESS: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
  CONTACT_PERSON: 'นางสาวสมหญิง รักงาน',
  CONTACT_ADDRESS_TYPE: 'headOffice',
  CONTACT_ADDRESS: '999/9 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',

  // Customer Section (10 fields)
  CUSTOMER_ID: 'CUST-2024-078',
  DOCUMENT_ADDRESS: '456 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400',
  BILLING_ADDRESS: '789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
  COMPANY_NAME: 'บริษัท กาแฟดีดี จำกัด',
  AUTHORIZED_PERSON_1: 'นายวิชัย ธุรกิจดี',
  PHONE_1: '0812345678',
  POSITION_1: 'กรรมการผู้จัดการ',
  AUTHORIZED_PERSON_2: 'นางสาวปรียา ช่วยงาน',
  PHONE_2: '0898765432',
  POSITION_2: 'ผู้จัดการทั่วไป',

  // Products Section (11 fields)
  SUB_CATEGORY: 'FOOD_BEVERAGE',
  CATEGORY: 'RESTAURANT',
  PROFIT_CENTER: 'PC-001',
  BUSINESS_NAME: 'DD Coffee & Bakery',
  PRODUCT_CATEGORY: 'อาหารและเครื่องดื่ม',
  PRODUCT_TYPE_1: 'กาแฟ',
  PRODUCT_TYPE_2: 'เบเกอรี่',
  PRODUCT_TYPE_3: 'อาหารว่าง',
  PRODUCT_TYPE_4: 'เครื่องดื่ม',
  PRODUCT_TYPE_5: 'ขนมหวาน',
  PRODUCT_TYPE_6: 'อาหารจานด่วน',

  // Signatories Section (7 fields)
  PROVIDER_1: 'นายประสิทธิ์ ผู้ให้เช่า',
  PROVIDER_POSITION_1: 'กรรมการผู้มีอำนาจ',
  PROVIDER_2: 'นางสาวสุดา ผู้ช่วย',
  PROVIDER_POSITION_2: 'กรรมการ',
  WITNESS_1: 'นายสมศักดิ์ พยาน',
  WITNESS_2: 'นางสาววิไล พยาน',
  CONTRACT_CREATOR: 'SPACE',

  // ==================== TAB 2: CONTRACT DETAILS ====================

  // Contract Info Sub-Tab
  DURATION_YEARS: 3,
  DURATION_MONTHS: 6,
  DURATION_DAYS: 15,
  START_DATE: '2024-02-01',
  END_DATE: '2027-08-16',
  RENT_RATIO: 60,
  SERVICE_RATIO: 40,
  RENT_START_DATE: '2024-02-01',
  RENEWAL_NOTICE_DAYS: 90,
  CREDIT_TERM_RENT: 30,
  CREDIT_TERM_UTILITY: 15,
  PAYMENT_DAY: 5,
  CLOSURE_PENALTY: 5000,
  PAYMENT_METHOD: 'monthly',
  REVENUE_COLLECTION: 'with_cashier',
  HAS_ADDENDUM: true,
  ADJUSTMENT_YEARS: 1,
  ADJUSTMENT_PERCENT: 5,
  EXCLUDED_PRODUCTS: 'บุหรี่, เครื่องดื่มแอลกอฮอล์, สลากกินแบ่งรัฐบาล',

  // Renewal Agreements
  RENEWAL_AGREEMENTS: [
    {
      START_DATE: '2025-02-01',
      END_DATE: '2026-01-31',
      RATE: 5
    },
    {
      START_DATE: '2026-02-01',
      END_DATE: '2027-01-31',
      RATE: 7
    },
    {
      START_DATE: '2027-02-01',
      END_DATE: '2027-08-16',
      RATE: 10
    }
  ],

  // Area Details
  AREA_DETAILS: [
    {
      BUILDING: 'A',
      FLOOR: '1',
      UNIT_NUMBER: '101',
      STATUS: 'Active',
      ZONE: 'North',
      WIDTH: 10,
      LENGTH: 15,
      TOTAL_AREA: 150
    },
    {
      BUILDING: 'A',
      FLOOR: '1',
      UNIT_NUMBER: '102',
      STATUS: 'Active',
      ZONE: 'North',
      WIDTH: 8,
      LENGTH: 12,
      TOTAL_AREA: 96
    },
    {
      BUILDING: 'A',
      FLOOR: '2',
      UNIT_NUMBER: '201',
      STATUS: 'Active',
      ZONE: 'South',
      WIDTH: 12,
      LENGTH: 18,
      TOTAL_AREA: 216
    }
  ],
  REQUEST_AREA_MEASUREMENT: false,

  // Revenue Sub-Tab
  REVENUE_CODES: [
    {
      CODE: 'REV-001',
      NAME: 'ค่าเช่าพื้นที่',
      CHARACTERISTIC: 'รายเดือน',
      REFER_STATUS: 'Active',
      GROUP: 'Rental',
      TYPE: 'Fixed',
      COLLECT_BEFORE: 'วันที่ 1 ของเดือน'
    },
    {
      CODE: 'REV-002',
      NAME: 'ค่าบริการส่วนกลาง',
      CHARACTERISTIC: 'รายเดือน',
      REFER_STATUS: 'Active',
      GROUP: 'Service',
      TYPE: 'Fixed',
      COLLECT_BEFORE: 'วันที่ 1 ของเดือน'
    },
    {
      CODE: 'REV-003',
      NAME: 'ค่าไฟฟ้า',
      CHARACTERISTIC: 'รายเดือน',
      REFER_STATUS: 'Active',
      GROUP: 'Utility',
      TYPE: 'Variable',
      COLLECT_BEFORE: 'วันที่ 5 ของเดือน'
    }
  ],

  OTHER_REVENUES: [
    {
      CODE: 'OTHER-001',
      NAME: 'ค่าประกันความเสียหาย',
      TYPE: 'Deposit',
      AMOUNT: 50000,
      PAYMENT_TYPE: 'ครั้งเดียว'
    },
    {
      CODE: 'OTHER-002',
      NAME: 'ค่าธรรมเนียมการโอน',
      TYPE: 'Fee',
      AMOUNT: 5000,
      PAYMENT_TYPE: 'ครั้งเดียว'
    }
  ],

  RENT_SERVICE_TYPE: 'rent',
  UNIT_NUMBER: '101-102',
  ADVANCE_MONTHS: 3,
  AMOUNT: 150000,
  PAYMENT_DUE_DATE: '2024-01-25',
  TAX_CALCULATION_METHOD: 'by_area',
  TAX_COLLECTION_PERIOD: 'monthly',

  // ==================== TAB 3: INSURANCE (เงินประกัน) ====================

  VAT_RATE: 7,

  // Deposit Configuration
  DEPOSIT_PERIOD: 3,
  RENT_DEPOSIT_RATE: 50000,
  SERVICE_DEPOSIT_RATE: 30000,
  COMMON_DEPOSIT_RATE: 20000,
  TOTAL_DEPOSIT_RATE: 100000,

  // Guarantees
  GUARANTEES: [
    {
      DOCUMENT_NUMBER: 'BG-2024-001',
      AMOUNT: 500000,
      BANK: 'ธนาคารกสิกรไทย',
      BRANCH: 'สาขาสีลม',
      COMPANY: 'บริษัท ประกันภัย AAA จำกัด'
    },
    {
      DOCUMENT_NUMBER: 'BG-2024-002',
      AMOUNT: 300000,
      BANK: 'ธนาคารกรุงเทพ',
      BRANCH: 'สาขาสุขุมวิท',
      COMPANY: 'บริษัท ประกันภัย BBB จำกัด'
    }
  ],

  // Payment Details
  RECEIPT_TRANSFERS: [
    {
      RECEIPT_NUMBER: 'REC-2024-001',
      DATE: '2024-01-15',
      AMOUNT: 100000,
      COMPANY: 'บริษัท กาแฟดีดี จำกัด'
    },
    {
      RECEIPT_NUMBER: 'REC-2024-002',
      DATE: '2024-01-20',
      AMOUNT: 50000,
      COMPANY: 'บริษัท กาแฟดีดี จำกัด'
    }
  ],

  INSTALLMENTS: [
    {
      DUE_DATE: '2024-02-01',
      AMOUNT: 50000,
      RENT_DEPOSIT: 20000,
      SERVICE_DEPOSIT: 15000,
      COMMON_DEPOSIT: 10000,
      TOTAL_WITH_VAT: 101650,
      CASH_PAYMENT: 50000,
      TRANSFERS: [
        {
          DATE: '2024-01-28',
          AMOUNT: 30000,
          BANK: 'ธนาคารกสิกรไทย',
          BRANCH: 'สาขาสีลม',
          COMPANY: 'บริษัท กาแฟดีดี จำกัด'
        }
      ],
      CHECKS: [
        {
          CHECK_NUMBER: 'CHK-001',
          DATE: '2024-02-01',
          AMOUNT: 21650,
          BANK: 'ธนาคารกรุงเทพ',
          BRANCH: 'สาขาสุขุมวิท',
          COMPANY: 'บริษัท กาแฟดีดี จำกัด'
        }
      ]
    },
    {
      DUE_DATE: '2024-03-01',
      AMOUNT: 50000,
      RENT_DEPOSIT: 20000,
      SERVICE_DEPOSIT: 15000,
      COMMON_DEPOSIT: 10000,
      TOTAL_WITH_VAT: 101650,
      CASH_PAYMENT: 101650,
      TRANSFERS: [],
      CHECKS: []
    },
    {
      DUE_DATE: '2024-04-01',
      AMOUNT: 50000,
      RENT_DEPOSIT: 20000,
      SERVICE_DEPOSIT: 15000,
      COMMON_DEPOSIT: 10000,
      TOTAL_WITH_VAT: 101650,
      CASH_PAYMENT: 0,
      TRANSFERS: [
        {
          DATE: '2024-03-29',
          AMOUNT: 101650,
          BANK: 'ธนาคารไทยพาณิชย์',
          BRANCH: 'สาขาพระราม 4',
          COMPANY: 'บริษัท กาแฟดีดี จำกัด'
        }
      ],
      CHECKS: []
    }
  ],

  // Meter/Phone Deposit
  METER_DUE_DATE: '2024-02-15',
  METER_AMOUNT: 10000,
  METER_CASH_PAYMENT: 5000,
  METER_TRANSFERS: [
    {
      DATE: '2024-02-10',
      AMOUNT: 5000,
      BANK: 'ธนาคารกสิกรไทย',
      BRANCH: 'สาขาสีลม',
      COMPANY: 'บริษัท กาแฟดีดี จำกัด'
    }
  ],
  METER_CHECKS: [
    {
      CHECK_NUMBER: 'CHK-METER-001',
      DATE: '2024-02-15',
      AMOUNT: 700,
      BANK: 'ธนาคารกรุงเทพ',
      BRANCH: 'สาขาสุขุมวิท',
      COMPANY: 'บริษัท กาแฟดีดี จำกัด'
    }
  ],

  // Decoration Deposit
  DECORATION_DEPOSIT_DUE_DATE: '2024-01-31',
  DECORATION_DEPOSIT_AMOUNT: 30000,
  DECORATION_DEPOSIT_CASH: 15000,
  DECORATION_DEPOSIT_TRANSFERS: [
    {
      DATE: '2024-01-25',
      AMOUNT: 15000,
      BANK: 'ธนาคารกสิกรไทย',
      BRANCH: 'สาขาสีลม',
      COMPANY: 'บริษัท กาแฟดีดี จำกัด'
    }
  ],
  DECORATION_DEPOSIT_CHECKS: [
    {
      CHECK_NUMBER: 'CHK-DECO-001',
      DATE: '2024-01-31',
      AMOUNT: 2100,
      BANK: 'ธนาคารกรุงไทย',
      BRANCH: 'สาขาอโศก',
      COMPANY: 'บริษัท กาแฟดีดี จำกัด'
    }
  ],

  // ==================== TAB 4: DECORATION (การตกแต่งสถานที่) ====================

  NO_DECORATION: false,
  DECORATION_START_DATE: '2024-01-20',
  DECORATION_END_DATE: '2024-01-31',
  DECORATION_DAYS: 12,
  PRICE_PER_SQM_PER_DAY: 50,
  DECORATION_TOTAL_PRICE: 27720, // 12 days × 50 ฿/sqm/day × 462 sqm

  // Store Details
  OPEN_TIME: '09:00',
  CLOSE_TIME: '22:00',
  SALES_AMOUNT_VAT: 'include',
  PHONE_NUMBER_COUNT: 2,
  ATM_COUNT: 1,
  VENDING_COUNT: 2,
  SIGNAL_INSTALLATION_POINTS: 3,
  SERVICE_CONTRACT_TYPE: 'signal_distribution',

  // ==================== TAB 5: CONDITIONS (เงื่อนไขอื่นๆ) ====================

  SUBJECT: 'สัญญาเช่าพื้นที่เพื่อประกอบกิจการร้านกาแฟและเบเกอรี่ ณ ศูนย์การค้าเซ็นทรัลเวิลด์',

  CONTRACT_CONDITIONS: [
    {
      ITEM_NUMBER: 1,
      TITLE: 'ระยะเวลาการเช่า',
      CONTENT: 'ผู้เช่าตกลงเช่าพื้นที่ดังกล่าวเป็นระยะเวลา 3 ปี 6 เดือน 15 วัน นับตั้งแต่วันที่ 1 กุมภาพันธ์ 2567 ถึงวันที่ 16 สิงหาคม 2570 โดยผู้เช่ามีสิทธิต่ออายุสัญญาได้ภายใต้เงื่อนไขที่กำหนดในสัญญาฉบับนี้'
    },
    {
      ITEM_NUMBER: 2,
      TITLE: 'ค่าเช่าและค่าบริการ',
      CONTENT: 'ผู้เช่าตกลงชำระค่าเช่าเป็นรายเดือน โดยแบ่งเป็นค่าเช่าพื้นที่ 60% และค่าบริการส่วนกลาง 40% ทั้งนี้ค่าเช่าจะมีการปรับขึ้นร้อยละ 5 ทุกๆ 1 ปี ตามสัญญาที่ตกลงกัน การชำระเงินจะต้องชำระภายในวันที่ 5 ของทุกเดือน'
    },
    {
      ITEM_NUMBER: 3,
      TITLE: 'การใช้พื้นที่',
      CONTENT: 'ผู้เช่าสามารถใช้พื้นที่เพื่อประกอบกิจการร้านกาแฟและเบเกอรี่เท่านั้น ห้ามประกอบกิจการอื่นใดที่ไม่ได้รับอนุญาตจากผู้ให้เช่า ห้ามขายสินค้าต้องห้ามตามที่ระบุในสัญญา ได้แก่ บุหรี่ เครื่องดื่มแอลกอฮอล์ และสลากกินแบ่งรัฐบาล'
    },
    {
      ITEM_NUMBER: 4,
      TITLE: 'เวลาทำการ',
      CONTENT: 'ผู้เช่าต้องเปิดทำการตามเวลาที่กำหนด คือ 09:00 - 22:00 น. ทุกวัน หากมีความจำเป็นต้องปิดทำการ ต้องแจ้งให้ผู้ให้เช่าทราบล่วงหน้าอย่างน้อย 7 วัน มิฉะนั้นจะมีค่าปรับวันละ 5,000 บาท'
    },
    {
      ITEM_NUMBER: 5,
      TITLE: 'การตกแต่งและติดตั้ง',
      CONTENT: 'ผู้เช่าได้รับอนุญาตให้ตกแต่งพื้นที่ตั้งแต่วันที่ 20 มกราคม 2567 ถึงวันที่ 31 มกราคม 2567 เป็นเวลา 12 วัน โดยเสียค่าใช้จ่ายในอัตรา 50 บาทต่อตารางเมตรต่อวัน การตกแต่งต้องเป็นไปตามแบบที่ผู้ให้เช่าอนุมัติ'
    },
    {
      ITEM_NUMBER: 6,
      TITLE: 'เงินประกัน',
      CONTENT: 'ผู้เช่าต้องวางเงินประกันเท่ากับค่าเช่า 3 เดือน แบ่งเป็น เงินประกันค่าเช่า 50,000 บาท เงินประกันค่าบริการ 30,000 บาท และเงินประกันส่วนกลาง 20,000 บาท รวมเป็นเงิน 100,000 บาท โดยจะคืนให้เมื่อสิ้นสุดสัญญาและไม่มีหนี้ค้างชำระ'
    },
    {
      ITEM_NUMBER: 7,
      TITLE: 'การต่ออายุสัญญา',
      CONTENT: 'หากผู้เช่าประสงค์จะต่ออายุสัญญา ต้องแจ้งความจำนงเป็นลายลักษณ์อักษรล่วงหน้าอย่างน้อย 90 วัน ก่อนสัญญาสิ้นสุด โดยเงื่อนไขการต่ออายุจะมีการปรับค่าเช่าตามข้อตกลง'
    }
  ],

  INTERNAL_NOTES: `หมายเหตุภายใน:
- ลูกค้ามีประวัติการชำระเงินตรงเวลา ไม่เคยค้างชำระ
- มีการต่อรองลดค่าเช่าในปีที่ 1 จาก 5% เหลือ 3%
- ตกลงให้ติดตั้ง ATM และตู้ Vending โดยไม่คิดค่าใช้จ่ายเพิ่มเติม
- อนุมัติให้ติดตั้งจุดกระจายสัญญาณ 3 จุด
- แนบหนังสือค้ำประกัน 2 ฉบับ รวมมูลค่า 800,000 บาท
- ผู้เช่ามีแผนขยายสาขาในอนาคต อาจเช่าพื้นที่เพิ่มในชั้น 2
- ทีมงานประเมินว่าลูกค้ามีศักยภาพดี แนะนำให้ต่ออายุสัญญา`,

  // ==================== FILES & AUDIT ====================

  FILES: [
    {
      FILE_ID: 'FILE-001',
      CONTRACT_ID: 'CNT-2024-001',
      FILE_NAME: 'สัญญาเช่า_DD_Coffee.pdf',
      FILE_TYPE: 'PDF',
      FILE_URL: '/files/contracts/CNT-2024-001-main.pdf',
      FILE_SIZE_MB: 2.5,
      MIME_TYPE: 'application/pdf',
      UPLOADED_AT: '2024-01-15T10:30:00',
      UPLOADED_BY: 'admin@space.com',
      IS_MAIN_CONTRACT: 'Y',
      PAGE_COUNT: 15,
      THUMBNAIL_URL: '/files/thumbnails/CNT-2024-001-thumb.jpg'
    },
    {
      FILE_ID: 'FILE-002',
      CONTRACT_ID: 'CNT-2024-001',
      FILE_NAME: 'แบบแปลนร้าน.pdf',
      FILE_TYPE: 'PDF',
      FILE_URL: '/files/contracts/CNT-2024-001-plan.pdf',
      FILE_SIZE_MB: 5.2,
      MIME_TYPE: 'application/pdf',
      UPLOADED_AT: '2024-01-15T11:00:00',
      UPLOADED_BY: 'admin@space.com',
      IS_MAIN_CONTRACT: 'N',
      PAGE_COUNT: 3,
      THUMBNAIL_URL: '/files/thumbnails/CNT-2024-001-plan-thumb.jpg'
    },
    {
      FILE_ID: 'FILE-003',
      CONTRACT_ID: 'CNT-2024-001',
      FILE_NAME: 'หนังสือค้ำประกัน.pdf',
      FILE_TYPE: 'PDF',
      FILE_URL: '/files/contracts/CNT-2024-001-guarantee.pdf',
      FILE_SIZE_MB: 1.8,
      MIME_TYPE: 'application/pdf',
      UPLOADED_AT: '2024-01-15T14:20:00',
      UPLOADED_BY: 'admin@space.com',
      IS_MAIN_CONTRACT: 'N',
      PAGE_COUNT: 4,
      THUMBNAIL_URL: '/files/thumbnails/CNT-2024-001-guarantee-thumb.jpg'
    }
  ],

  CREATE_BY: 'admin@space.com',
  CREATE_DATE: '2024-01-10T09:00:00',
  UPD_BY: 'manager@space.com',
  UPD_DATE: '2024-01-15T16:30:00'
};

// Additional mock contracts for table testing
export const MOCK_CONTRACTS: Contract[] = [
  MOCK_CONTRACT_FULL,

  // Contract 2 - Simpler version
  {
    ...MOCK_CONTRACT_FULL,
    CONTRACT_ID: 'CNT-2024-002',
    CONTRACT_NUMBER: 'CNT-2024-002',
    CUSTOMER_ID: 'CUST-2024-089',
    COMPANY_NAME: 'ร้านอาหารญี่ปุ่น ซูชิโอะ',
    BUSINESS_NAME: 'Sushi O',
    STATUS: 'PENDING',
    DEPOSIT_PERIOD: 2,
    DURATION_YEARS: 2,
    DURATION_MONTHS: 0,
    DURATION_DAYS: 0,
    NO_DECORATION: true,
    DECORATION_START_DATE: undefined,
    DECORATION_END_DATE: undefined,
    AREA_DETAILS: [
      {
        BUILDING: 'B',
        FLOOR: '3',
        UNIT_NUMBER: '305',
        STATUS: 'Active',
        ZONE: 'East',
        WIDTH: 15,
        LENGTH: 20,
        TOTAL_AREA: 300
      }
    ],
    INSTALLMENTS: [],
    GUARANTEES: [],
    CONTRACT_CONDITIONS: [
      {
        ITEM_NUMBER: 1,
        TITLE: 'ระยะเวลาการเช่า',
        CONTENT: 'สัญญาเช่า 2 ปี'
      }
    ]
  },

  // Contract 3 - Expired
  {
    ...MOCK_CONTRACT_FULL,
    CONTRACT_ID: 'CNT-2023-150',
    CONTRACT_NUMBER: 'CNT-2023-150',
    CUSTOMER_ID: 'CUST-2023-045',
    COMPANY_NAME: 'บริษัท แฟชั่นโมเดิร์น จำกัด',
    BUSINESS_NAME: 'Fashion Modern',
    STATUS: 'EXPIRED',
    START_DATE: '2023-01-01',
    END_DATE: '2024-12-31',
    DEPOSIT_PERIOD: 6,
    AREA_DETAILS: [
      {
        BUILDING: 'C',
        FLOOR: '2',
        UNIT_NUMBER: '210',
        STATUS: 'Inactive',
        ZONE: 'West',
        WIDTH: 20,
        LENGTH: 25,
        TOTAL_AREA: 500
      }
    ]
  }
];

export default MOCK_CONTRACT_FULL;

// ==================== HELPER FUNCTIONS ====================

export function getContractsByAreaId(areaId: string): Contract[] {
  return MOCK_CONTRACTS
    .filter(c => c.AREA_ID === areaId)
    .sort((a, b) => {
      const dateA = parseInt(a.ISSUE_DATE.replace(/\/Date\((\d+)\)\//, '$1'));
      const dateB = parseInt(b.ISSUE_DATE.replace(/\/Date\((\d+)\)\//, '$1'));
      return dateB - dateA;
    });
}

export function getContractsByType(type: 'quotation' | 'booking' | 'lease'): Contract[] {
  switch (type) {
    case 'quotation':
      return MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'QUOTATION_AGREEMENT');
    case 'booking':
      return MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT');
    case 'lease':
      return MOCK_CONTRACTS.filter(c =>
        c.CONTRACT_TYPE === 'LEASE_AGREEMENT' ||
        c.CONTRACT_TYPE === 'LEASE_RENEWAL' ||
        c.CONTRACT_TYPE === 'LEASE_AMENDMENT' ||
        c.CONTRACT_TYPE === 'LEASE_TERMINATION'
      );
    default:
      return [];
  }
}

export const CONTRACT_STATISTICS = {
  TOTAL: MOCK_CONTRACTS.length,
  BY_STATUS: {
    ACTIVE: MOCK_CONTRACTS.filter(c => c.STATUS === 'ACTIVE').length,
    PENDING: MOCK_CONTRACTS.filter(c => c.STATUS === 'PENDING').length,
    COMPLETED: MOCK_CONTRACTS.filter(c => c.STATUS === 'COMPLETED').length,
    EXPIRED: MOCK_CONTRACTS.filter(c => c.STATUS === 'EXPIRED').length,
    TERMINATED: MOCK_CONTRACTS.filter(c => c.STATUS === 'TERMINATED').length
  },
  BY_TYPE: {
    QUOTATION: MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'QUOTATION_AGREEMENT').length,
    BOOKING: MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'DEPOSIT_AGREEMENT').length,
    LEASE: MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'LEASE_AGREEMENT').length,
    RENEWAL: MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'LEASE_RENEWAL').length,
    AMENDMENT: MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'LEASE_AMENDMENT').length,
    TERMINATION: MOCK_CONTRACTS.filter(c => c.CONTRACT_TYPE === 'LEASE_TERMINATION').length
  }
};
