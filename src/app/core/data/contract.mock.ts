// contract.mock.v3.ts - Updated with all required fields

import { Contract, ContractFile } from '@core/models/contract.model';
import { toDateString } from '@core/utils/date-utils';

// Helper function to generate contract files
function createContractFiles(contractId: string, count: number, includeImages: boolean = false): ContractFile[] {
  const files: ContractFile[] = [];

  // Main contract PDF
  files.push({
    FILE_ID: `${contractId}-F001`,
    CONTRACT_ID: contractId,
    FILE_NAME: `contract-${contractId}.pdf`,
    FILE_TYPE: 'PDF',
    FILE_URL: `/assets/contracts/${contractId}/main-contract.pdf`,
    FILE_SIZE_MB: 1.2,
    MIME_TYPE: 'application/pdf',
    UPLOADED_AT: toDateString(new Date()),
    IS_MAIN_CONTRACT: 'Y',
    PAGE_COUNT: 8,
    THUMBNAIL_URL: `/assets/contracts/${contractId}/thumbnail.jpg`
  });

  if (count > 1) {
    files.push({
      FILE_ID: `${contractId}-F002`,
      CONTRACT_ID: contractId,
      FILE_NAME: `addendum-${contractId}.pdf`,
      FILE_TYPE: 'PDF',
      FILE_URL: `/assets/contracts/${contractId}/addendum.pdf`,
      FILE_SIZE_MB: 0.5,
      MIME_TYPE: 'application/pdf',
      UPLOADED_AT: toDateString(new Date()),
      IS_MAIN_CONTRACT: 'N',
      PAGE_COUNT: 2,
      THUMBNAIL_URL: `/assets/contracts/${contractId}/addendum-thumb.jpg`
    });
  }

  if (includeImages) {
    files.push({
      FILE_ID: `${contractId}-F003`,
      CONTRACT_ID: contractId,
      FILE_NAME: 'signed-page-1.jpg',
      FILE_TYPE: 'IMAGE',
      FILE_URL: `/assets/contracts/${contractId}/signed-1.jpg`,
      FILE_SIZE_MB: 2.1,
      MIME_TYPE: 'image/jpeg',
      UPLOADED_AT: toDateString(new Date()),
      IS_MAIN_CONTRACT: 'N',
      THUMBNAIL_URL: `/assets/contracts/${contractId}/signed-1-thumb.jpg`
    });
  }

  return files;
}

export const MOCK_CONTRACTS: Contract[] = [
  // ========== QUOTATION_AGREEMENT (ใบเสนอราคา) ==========
  {
    CONTRACT_ID: 'QT-001',
    OU_CODE: '001',
    AREA_ID: 'area-005',
    CONTRACT_NUMBER: 'COWBP125070001',
    CONTRACT_TYPE: 'QUOTATION_AGREEMENT',
    CONTRACT_TOPIC: 'Quotation - Premium Retail Space',
    CONTRACT_TOPIC_TH: 'ใบเสนอราคา - พื้นที่ร้านค้าพรีเมียม',
    CONTRACT_TOPIC_EN: 'Quotation - Premium Retail Space',
    ISSUE_DATE: toDateString(new Date('2025-07-15')),
    START_DATE: toDateString(new Date('2025-08-01')),
    END_DATE: toDateString(new Date('2027-07-31')),
    EXPIRY_DATE: toDateString(new Date('2025-08-15')), // Quotation expires soon
    TENANT_NAME: 'Premium Fashion Co.',
    TENANT_NAME_TH: 'บริษัท Premium Fashion จำกัด',
    TENANT_NAME_EN: 'Premium Fashion Co., Ltd.',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2025-001',
    QUOTATION_NUMBER: 'COWBP125070001',
    BUILDING_CODE: 'A',
    MONTHLY_RENT: 50000,
    DEPOSIT_AMOUNT: 150000,
    TOTAL_VALUE: 1200000,
    STATUS: 'PENDING',
    STATUS_NAME: 'รอลงนาม',
    FILES: createContractFiles('QT-001', 1, false),
    TAGS: 'pending,fashion,retail',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2025-07-15')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2025-07-15'))
  },
  {
    CONTRACT_ID: 'QT-002',
    OU_CODE: '001',
    AREA_ID: 'area-006',
    CONTRACT_NUMBER: 'COWBP125070002',
    CONTRACT_TYPE: 'QUOTATION_AGREEMENT',
    CONTRACT_TOPIC: 'Quotation - Tech Store',
    CONTRACT_TOPIC_TH: 'ใบเสนอราคา - ร้านเทคโนโลยี',
    CONTRACT_TOPIC_EN: 'Quotation - Tech Store',
    ISSUE_DATE: toDateString(new Date('2025-07-20')),
    START_DATE: toDateString(new Date('2025-09-01')),
    END_DATE: toDateString(new Date('2027-08-31')),
    EXPIRY_DATE: toDateString(new Date('2025-08-20')),
    TENANT_NAME: 'TechZone',
    TENANT_NAME_TH: 'บริษัท TechZone จำกัด',
    TENANT_NAME_EN: 'TechZone Co., Ltd.',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2025-002',
    QUOTATION_NUMBER: 'COWBP125070002',
    BUILDING_CODE: 'B',
    MONTHLY_RENT: 38000,
    DEPOSIT_AMOUNT: 114000,
    TOTAL_VALUE: 912000,
    STATUS: 'DRAFT',
    STATUS_NAME: 'ร่าง',
    FILES: createContractFiles('QT-002', 1, false),
    TAGS: 'draft,electronics',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2025-07-20')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2025-07-20'))
  },

  // ========== DEPOSIT_AGREEMENT (สัญญาจอง) ==========
  {
    CONTRACT_ID: 'BK-001',
    OU_CODE: '001',
    AREA_ID: 'area-007',
    CONTRACT_NUMBER: 'RSWBP125070001',
    CONTRACT_TYPE: 'DEPOSIT_AGREEMENT',
    CONTRACT_TOPIC: 'Booking Agreement - Coffee Shop',
    CONTRACT_TOPIC_TH: 'สัญญาจอง - ร้านกาแฟ',
    CONTRACT_TOPIC_EN: 'Booking Agreement - Coffee Shop',
    ISSUE_DATE: toDateString(new Date('2025-06-01')),
    START_DATE: toDateString(new Date('2025-07-01')),
    END_DATE: toDateString(new Date('2027-06-30')),
    EXPIRY_DATE: toDateString(new Date('2027-06-30')),
    SIGNED_DATE: toDateString(new Date('2025-06-05')),
    TENANT_NAME: 'Cafe Aroma',
    TENANT_NAME_TH: 'ร้าน Cafe Aroma',
    TENANT_NAME_EN: 'Cafe Aroma',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2025-003',
    BOOKING_NUMBER: 'RSWBP125070001',
    QUOTATION_NUMBER: 'COWBP125060001', // Reference to quotation
    BUILDING_CODE: 'A',
    MONTHLY_RENT: 30000,
    DEPOSIT_AMOUNT: 90000,
    TOTAL_VALUE: 720000,
    STATUS: 'ACTIVE',
    STATUS_NAME: 'ใช้งานอยู่',
    FILES: createContractFiles('BK-001', 1, false),
    TAGS: 'active,food-beverage',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2025-06-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2025-06-05'))
  },
  {
    CONTRACT_ID: 'BK-002',
    OU_CODE: '001',
    AREA_ID: 'area-008',
    CONTRACT_NUMBER: 'RSWBP125070002',
    CONTRACT_TYPE: 'DEPOSIT_AGREEMENT',
    CONTRACT_TOPIC: 'Booking Agreement - Bookstore',
    CONTRACT_TOPIC_TH: 'สัญญาจอง - ร้านหนังสือ',
    CONTRACT_TOPIC_EN: 'Booking Agreement - Bookstore',
    ISSUE_DATE: toDateString(new Date('2025-05-15')),
    START_DATE: toDateString(new Date('2025-06-15')),
    END_DATE: toDateString(new Date('2027-06-14')),
    EXPIRY_DATE: toDateString(new Date('2027-06-14')),
    TENANT_NAME: 'BookHaven',
    TENANT_NAME_TH: 'ร้าน BookHaven',
    TENANT_NAME_EN: 'BookHaven Store',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2025-004',
    BOOKING_NUMBER: 'RSWBP125070002',
    QUOTATION_NUMBER: 'COWBP125050001',
    BUILDING_CODE: 'C',
    MONTHLY_RENT: 25000,
    DEPOSIT_AMOUNT: 75000,
    TOTAL_VALUE: 600000,
    STATUS: 'PENDING',
    STATUS_NAME: 'รอลงนาม',
    FILES: createContractFiles('BK-002', 1, false),
    TAGS: 'pending,retail',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2025-05-15')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2025-05-15'))
  },

  // ========== LEASE_AGREEMENT (สัญญาเช่า) ==========
  {
    CONTRACT_ID: 'CNT-001',
    OU_CODE: '001',
    AREA_ID: 'area-001',
    RENTAL_HISTORY_ID: 'RH-001',
    CONTRACT_NUMBER: 'CNT-2023-001',
    CONTRACT_TYPE: 'LEASE_AGREEMENT',
    CONTRACT_TOPIC: 'Lease Agreement - ABC Electronics',
    CONTRACT_TOPIC_TH: 'สัญญาเช่า - ABC Electronics',
    CONTRACT_TOPIC_EN: 'Lease Agreement - ABC Electronics',
    ISSUE_DATE: toDateString(new Date('2023-05-15')),
    START_DATE: toDateString(new Date('2023-06-01')),
    END_DATE: toDateString(new Date('2024-12-31')),
    EXPIRY_DATE: toDateString(new Date('2024-12-31')),
    SIGNED_DATE: toDateString(new Date('2023-05-20')),
    TENANT_NAME: 'ABC Electronics',
    TENANT_NAME_TH: 'บริษัท ABC Electronics จำกัด',
    TENANT_NAME_EN: 'ABC Electronics Co., Ltd.',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2023-001',
    BOOKING_NUMBER: 'RSWBP123050001',
    QUOTATION_NUMBER: 'COWBP123040001',
    BUILDING_CODE: 'A',
    MONTHLY_RENT: 40000,
    DEPOSIT_AMOUNT: 120000,
    TOTAL_VALUE: 760000,
    STATUS: 'COMPLETED',
    STATUS_NAME: 'เสร็จสิ้น',
    FILES: createContractFiles('CNT-001', 2, true),
    TAGS: 'completed,electronics',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2023-05-15')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-12-31'))
  },
  {
    CONTRACT_ID: 'CNT-002',
    OU_CODE: '001',
    AREA_ID: 'area-001',
    CONTRACT_NUMBER: 'CNT-2025-045',
    CONTRACT_TYPE: 'LEASE_AGREEMENT',
    CONTRACT_TOPIC: 'New Lease Agreement - TechStart Hub',
    CONTRACT_TOPIC_TH: 'สัญญาเช่าใหม่ - TechStart Hub',
    CONTRACT_TOPIC_EN: 'New Lease Agreement - TechStart Hub',
    ISSUE_DATE: toDateString(new Date('2025-01-05')),
    START_DATE: toDateString(new Date('2025-02-01')),
    END_DATE: toDateString(new Date('2027-01-31')),
    EXPIRY_DATE: toDateString(new Date('2027-01-31')),
    SIGNED_DATE: toDateString(new Date('2025-01-10')),
    TENANT_NAME: 'TechStart Hub',
    TENANT_NAME_TH: 'บริษัท TechStart Hub จำกัด',
    TENANT_NAME_EN: 'TechStart Hub Co., Ltd.',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2024-012',
    BOOKING_NUMBER: 'RSWBP124120001',
    QUOTATION_NUMBER: 'COWBP124110001',
    BUILDING_CODE: 'A',
    MONTHLY_RENT: 45000,
    DEPOSIT_AMOUNT: 135000,
    TOTAL_VALUE: 1080000,
    STATUS: 'ACTIVE',
    STATUS_NAME: 'ใช้งานอยู่',
    FILES: createContractFiles('CNT-002', 1, false),
    TAGS: 'active,tech-startup',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2025-01-05')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2025-01-10'))
  },
  {
    CONTRACT_ID: 'CNT-003',
    OU_CODE: '001',
    AREA_ID: 'area-002',
    CONTRACT_NUMBER: 'CNT-2024-089',
    CONTRACT_TYPE: 'LEASE_AGREEMENT',
    CONTRACT_TOPIC: 'Lease Agreement - Fashion Hub',
    CONTRACT_TOPIC_TH: 'สัญญาเช่า - Fashion Hub',
    CONTRACT_TOPIC_EN: 'Lease Agreement - Fashion Hub',
    ISSUE_DATE: toDateString(new Date('2024-10-10')),
    START_DATE: toDateString(new Date('2024-11-01')),
    END_DATE: toDateString(new Date('2026-10-31')),
    EXPIRY_DATE: toDateString(new Date('2026-10-31')),
    SIGNED_DATE: toDateString(new Date('2024-10-15')),
    TENANT_NAME: 'Fashion Hub',
    TENANT_NAME_TH: 'ร้าน Fashion Hub',
    TENANT_NAME_EN: 'Fashion Hub Store',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2024-008',
    BOOKING_NUMBER: 'RSWBP124090001',
    QUOTATION_NUMBER: 'COWBP124080001',
    BUILDING_CODE: 'B',
    MONTHLY_RENT: 32000,
    DEPOSIT_AMOUNT: 96000,
    TOTAL_VALUE: 768000,
    STATUS: 'ACTIVE',
    STATUS_NAME: 'ใช้งานอยู่',
    FILES: createContractFiles('CNT-003', 2, true),
    TAGS: 'active,fashion,retail',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2024-10-10')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-10-15'))
  },
  {
    CONTRACT_ID: 'CNT-004',
    OU_CODE: '001',
    AREA_ID: 'area-002',
    CONTRACT_NUMBER: 'CNT-2025-012',
    CONTRACT_TYPE: 'LEASE_AMENDMENT',
    CONTRACT_TOPIC: 'Amendment - Rent Adjustment',
    CONTRACT_TOPIC_TH: 'แก้ไขสัญญา - ปรับค่าเช่า',
    CONTRACT_TOPIC_EN: 'Amendment - Rent Adjustment',
    ISSUE_DATE: toDateString(new Date('2025-06-01')),
    START_DATE: toDateString(new Date('2025-07-01')),
    END_DATE: toDateString(new Date('2026-10-31')),
    EXPIRY_DATE: toDateString(new Date('2026-10-31')),
    TENANT_NAME: 'Fashion Hub',
    TENANT_NAME_TH: 'ร้าน Fashion Hub',
    TENANT_NAME_EN: 'Fashion Hub Store',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2024-008',
    BOOKING_NUMBER: 'RSWBP124090001',
    BUILDING_CODE: 'B',
    MONTHLY_RENT: 34000,
    STATUS: 'ACTIVE',
    STATUS_NAME: 'ใช้งานอยู่',
    FILES: createContractFiles('CNT-004', 1, false),
    TAGS: 'active,amendment',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2025-06-01')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2025-06-01'))
  },
  {
    CONTRACT_ID: 'CNT-005',
    OU_CODE: '001',
    AREA_ID: 'area-003',
    CONTRACT_NUMBER: 'CNT-2024-156',
    CONTRACT_TYPE: 'LEASE_AGREEMENT',
    CONTRACT_TOPIC: 'Lease Agreement - Coffee Corner',
    CONTRACT_TOPIC_TH: 'สัญญาเช่า - Coffee Corner',
    CONTRACT_TOPIC_EN: 'Lease Agreement - Coffee Corner',
    ISSUE_DATE: toDateString(new Date('2024-11-15')),
    START_DATE: toDateString(new Date('2024-12-01')),
    END_DATE: toDateString(new Date('2026-11-30')),
    EXPIRY_DATE: toDateString(new Date('2026-11-30')),
    SIGNED_DATE: toDateString(new Date('2024-11-20')),
    TENANT_NAME: 'Coffee Corner',
    TENANT_NAME_TH: 'ร้าน Coffee Corner',
    TENANT_NAME_EN: 'Coffee Corner Cafe',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2024-011',
    BOOKING_NUMBER: 'RSWBP124100001',
    QUOTATION_NUMBER: 'COWBP124090002',
    BUILDING_CODE: 'C',
    MONTHLY_RENT: 28000,
    DEPOSIT_AMOUNT: 84000,
    TOTAL_VALUE: 672000,
    STATUS: 'ACTIVE',
    STATUS_NAME: 'ใช้งานอยู่',
    FILES: createContractFiles('CNT-005', 2, false),
    TAGS: 'active,food-beverage',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2024-11-15')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-11-20'))
  },
  {
    CONTRACT_ID: 'CNT-006',
    OU_CODE: '001',
    AREA_ID: 'area-004',
    RENTAL_HISTORY_ID: 'RH-002',
    CONTRACT_NUMBER: 'CNT-2024-034',
    CONTRACT_TYPE: 'LEASE_AGREEMENT',
    CONTRACT_TOPIC: 'Lease Agreement - Delicious Restaurant',
    CONTRACT_TOPIC_TH: 'สัญญาเช่า - ร้านอาหาร Delicious',
    CONTRACT_TOPIC_EN: 'Lease Agreement - Delicious Restaurant',
    ISSUE_DATE: toDateString(new Date('2024-02-15')),
    START_DATE: toDateString(new Date('2024-03-01')),
    END_DATE: toDateString(new Date('2024-10-31')),
    EXPIRY_DATE: toDateString(new Date('2024-10-31')),
    SIGNED_DATE: toDateString(new Date('2024-02-20')),
    TENANT_NAME: 'Delicious Restaurant',
    TENANT_NAME_TH: 'ร้านอาหาร Delicious',
    TENANT_NAME_EN: 'Delicious Restaurant',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2024-002',
    BOOKING_NUMBER: 'RSWBP124010001',
    QUOTATION_NUMBER: 'COWBP123120001',
    BUILDING_CODE: 'A',
    MONTHLY_RENT: 22000,
    DEPOSIT_AMOUNT: 66000,
    TOTAL_VALUE: 176000,
    STATUS: 'TERMINATED',
    STATUS_NAME: 'ยกเลิก',
    FILES: createContractFiles('CNT-006', 2, true),
    NOTES: 'Terminated early due to business closure',
    TAGS: 'terminated,food-beverage',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2024-02-15')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-10-31'))
  },
  {
    CONTRACT_ID: 'CNT-007',
    OU_CODE: '001',
    AREA_ID: 'area-004',
    CONTRACT_NUMBER: 'CNT-2024-167',
    CONTRACT_TYPE: 'LEASE_TERMINATION',
    CONTRACT_TOPIC: 'Early Termination Agreement',
    CONTRACT_TOPIC_TH: 'สัญญายกเลิกก่อนกำหนด',
    CONTRACT_TOPIC_EN: 'Early Termination Agreement',
    ISSUE_DATE: toDateString(new Date('2024-10-15')),
    START_DATE: toDateString(new Date('2024-10-31')),
    END_DATE: toDateString(new Date('2024-10-31')),
    EXPIRY_DATE: toDateString(new Date('2024-10-31')),
    SIGNED_DATE: toDateString(new Date('2024-10-20')),
    TENANT_NAME: 'Delicious Restaurant',
    TENANT_NAME_TH: 'ร้านอาหาร Delicious',
    TENANT_NAME_EN: 'Delicious Restaurant',
    LANDLORD_NAME: 'Imperial Tower Management',
    CUSTOMER_ID: 'CUST-2024-002',
    BOOKING_NUMBER: 'RSWBP124010001',
    BUILDING_CODE: 'A',
    STATUS: 'COMPLETED',
    STATUS_NAME: 'เสร็จสิ้น',
    FILES: createContractFiles('CNT-007', 1, false),
    TAGS: 'completed,termination',
    CREATE_BY: 'SPACE',
    CREATE_DATE: toDateString(new Date('2024-10-15')),
    UPD_BY: 'SPACE',
    UPD_DATE: toDateString(new Date('2024-10-31'))
  }
];

// Helper functions
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
    TERMINATED: MOCK_CONTRACTS.filter(c => c.STATUS === 'TERMINATED').length,
    DRAFT: MOCK_CONTRACTS.filter(c => c.STATUS === 'DRAFT').length
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
