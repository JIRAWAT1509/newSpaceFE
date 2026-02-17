// contract.model.ts - COMPLETE VERSION with all form fields (backwards compatible)

export interface Contract {
  // ==================== BASIC INFO ====================
  CONTRACT_ID: string;
  OU_CODE: string;
  AREA_ID: string;
  CONTRACT_NUMBER: string;
  CONTRACT_TYPE: ContractType;
  STATUS: ContractStatus;
  STATUS_NAME?: string;                   // For display (e.g., "Active", "Pending")

  // Legacy fields for backwards compatibility
  RENTAL_HISTORY_ID?: string;
  CONTRACT_TOPIC: string;                 // Full topic
  CONTRACT_TOPIC_TH: string;              // Thai topic
  CONTRACT_TOPIC_EN: string;              // English topic
  TENANT_NAME: string;                    // Full tenant name
  TENANT_NAME_TH: string;                 // Thai tenant name
  TENANT_NAME_EN: string;                 // English tenant name
  LANDLORD_NAME: string;                  // Landlord name
  ISSUE_DATE: string;                     // Date contract was issued (Date format)
  EXPIRY_DATE: string;                    // Date contract expires (Date format)
  SIGNED_DATE?: string;                   // Date contract was signed
  MONTHLY_RENT?: number;                  // Monthly rent amount
  DEPOSIT_AMOUNT?: number;                // Deposit amount
  TOTAL_VALUE?: number;                   // Total contract value
  NOTES?: string;                         // Additional notes
  TAGS?: string;                          // Comma-separated tags

  // Related Contracts
  BOOKING_NUMBER?: string;
  QUOTATION_NUMBER?: string;
  BUILDING_CODE?: string;

  // ==================== TAB 1: GENERAL DETAILS ====================

  // Header Section (10 fields)
  BRANCH_CODE: string;                    // สาขา
  CONTRACT_TYPE_CODE: string;             // ประเภทสัญญา
  CONTRACT_NUMBER_MAIN?: string;          // เลขที่ใบเสนอราคา (หลัก)
  CONTRACT_NUMBER_SUB?: string;           // เลขที่ใบเสนอราคา (ร่วม)
  QUOTATION_STATUS?: string;              // สถานะ
  CONTRACT_DATE: string;                  // สัญญาลงวันที่
  RECORD_DATE?: string;                   // วันที่บันทึก
  APPROVAL_DATE?: string;                 // วันที่อนุมัติ
  INTENTION_LETTER?: string;              // ใบแสดงเจตนา
  TRANSFER_TO_BOOKING?: string;           // การโอนไปสัญญาจอง
  TRANSFER_TO_LEASE?: string;             // การโอนไปสัญญาเช่า

  // Provider Section (6 fields)
  CONTRACT_LOCATION: string;              // สถานที่ทำสัญญา
  HEAD_OFFICE_ADDRESS: string;            // ที่อยู่สำนักงานใหญ่
  REPRESENTATIVE: string;                 // ผู้ดำเนินการแทน
  BRANCH_ADDRESS?: string;                // ที่อยู่สาขา
  CONTACT_PERSON?: string;                // ผู้ติดต่อ
  CONTACT_ADDRESS_TYPE?: 'headOffice' | 'branch';  // ที่อยู่ผู้ติดต่อ
  CONTACT_ADDRESS?: string;

  // Customer Section (10 fields)
  CUSTOMER_ID: string;                    // รหัสลูกค้า
  DOCUMENT_ADDRESS?: string;              // ที่อยู่จัดส่งเอกสาร
  BILLING_ADDRESS?: string;               // ที่อยู่ออกใบแจ้งหนี้
  COMPANY_NAME?: string;                  // ชื่อบริษัท
  AUTHORIZED_PERSON_1: string;            // ผู้ดำเนินการ 1
  PHONE_1: string;                        // โทรศัพท์ 1
  POSITION_1: string;                     // ในฐานะ 1
  AUTHORIZED_PERSON_2?: string;           // ผู้ดำเนินการ 2
  PHONE_2?: string;                       // โทรศัพท์ 2
  POSITION_2?: string;                    // ในฐานะ 2

  // Products Section (11 fields)
  SUB_CATEGORY: string;                   // Sub Category
  CATEGORY?: string;                      // Category
  PROFIT_CENTER?: string;                 // Profit Center
  BUSINESS_NAME?: string;                 // ชื่อกิจการ
  PRODUCT_CATEGORY?: string;              // หมวดสินค้า
  PRODUCT_TYPE_1?: string;                // ประเภทสินค้า 1-6
  PRODUCT_TYPE_2?: string;
  PRODUCT_TYPE_3?: string;
  PRODUCT_TYPE_4?: string;
  PRODUCT_TYPE_5?: string;
  PRODUCT_TYPE_6?: string;

  // Signatories Section (7 fields)
  PROVIDER_1?: string;                    // ผู้ให้บริการ 1
  PROVIDER_POSITION_1?: string;           // ในฐานะ 1
  PROVIDER_2?: string;                    // ผู้ให้บริการ 2
  PROVIDER_POSITION_2?: string;           // ในฐานะ 2
  WITNESS_1?: string;                     // พยาน 1
  WITNESS_2?: string;                     // พยาน 2
  CONTRACT_CREATOR?: string;              // ชื่อผู้ทำสัญญา

  // ==================== TAB 2: CONTRACT DETAILS ====================

  // Contract Info Sub-Tab
  DURATION_YEARS: number;                 // ระยะเวลาสัญญา (ปี)
  DURATION_MONTHS?: number;               // (เดือน)
  DURATION_DAYS?: number;                 // (วัน)
  START_DATE: string;                     // วันที่เริ่มต้นสัญญา
  END_DATE: string;                       // วันที่สิ้นสุดสัญญา
  RENT_RATIO?: number;                    // อัตราส่วนค่าเช่า
  SERVICE_RATIO?: number;                 // อัตราส่วนค่าบริการ
  RENT_START_DATE: string;                // วันที่เริ่มคิดค่าเช่า
  RENEWAL_NOTICE_DAYS?: number;           // แจ้งต่ออายุล่วงหน้า (วัน)
  CREDIT_TERM_RENT: number;               // Credit Term (Rent/Service)
  CREDIT_TERM_UTILITY: number;            // Credit Term (Utility)
  PAYMENT_DAY?: number;                   // นำส่งเงินให้แก่ผู้บริการทุกวันที่
  CLOSURE_PENALTY?: number;               // เงินปรับกรณีร้านค้าหยุดทำการ
  PAYMENT_METHOD: 'lump_sum' | 'daily' | 'monthly' | 'yearly';  // การชำระค่าเช่า
  REVENUE_COLLECTION?: 'none' | 'with_cashier' | 'without_cashier';  // การรับเงินยอดขาย
  HAS_ADDENDUM?: boolean;                 // มีบันทึกแนบท้ายสัญญา
  ADJUSTMENT_YEARS?: number;              // ปรับอัตราค่าเช่า/ค่าบริการทุกๆ (ปี)
  ADJUSTMENT_PERCENT?: number;            // ร้อยละ
  EXCLUDED_PRODUCTS?: string;             // สินค้ายกเว้นการคิดยอดรายได้

  // Renewal Agreements
  RENEWAL_AGREEMENTS: RenewalAgreement[];

  // Area Details
  AREA_DETAILS: AreaDetail[];
  REQUEST_AREA_MEASUREMENT?: boolean;     // ขอวัดขนาดพื้นที่

  // Revenue Sub-Tab
  REVENUE_CODES: RevenueCode[];           // รหัสรายได้
  OTHER_REVENUES: OtherRevenue[];         // รายได้อื่นๆ
  RENT_SERVICE_TYPE?: string;             // ประเภทรายได้ (ค่าเช่า/ค่าบริการ)
  UNIT_NUMBER?: string;                   // เลขที่ยูนิต
  ADVANCE_MONTHS?: number;                // ค่าเช่าค่าบริการล่วงหน้า(เดือน)
  AMOUNT?: number;                        // จำนวนเงิน(บาท)
  PAYMENT_DUE_DATE?: string;              // ชำระเงินภายในวันที่
  TAX_CALCULATION_METHOD?: string;        // วิธีคำนวน (ภาษีโรงเรือน)
  TAX_COLLECTION_PERIOD?: string;         // งวดการเรียกเก็บ

  // ==================== TAB 3: INSURANCE (เงินประกัน) ====================

  VAT_RATE?: number;                      // อัตราภาษี VAT (%)

  // Deposit Configuration
  DEPOSIT_PERIOD: 'none' | number;        // วางเงินประกัน (0-12 เดือน)
  RENT_DEPOSIT_RATE?: number;             // เงินประกันค่าเช่า (อัตรา/เดือน)
  SERVICE_DEPOSIT_RATE?: number;          // เงินประกันค่าบริการ
  COMMON_DEPOSIT_RATE?: number;           // เงินประกันส่วนกลาง
  TOTAL_DEPOSIT_RATE?: number;            // จำนวนเงิน

  // Guarantees
  GUARANTEES: GuaranteeDocument[];        // หลักประกัน

  // Payment Details
  RECEIPT_TRANSFERS: ReceiptTransfer[];   // เงินโอนจากใบเสร็จ
  INSTALLMENTS: Installment[];            // งวดการชำระ

  // Meter/Phone Deposit
  METER_DUE_DATE?: string;
  METER_AMOUNT?: number;
  METER_CASH_PAYMENT?: number;
  METER_TRANSFERS: PaymentTransfer[];
  METER_CHECKS: PaymentCheck[];

  // Decoration Deposit
  DECORATION_DEPOSIT_DUE_DATE?: string;
  DECORATION_DEPOSIT_AMOUNT?: number;
  DECORATION_DEPOSIT_CASH?: number;
  DECORATION_DEPOSIT_TRANSFERS: PaymentTransfer[];
  DECORATION_DEPOSIT_CHECKS: PaymentCheck[];

  // ==================== TAB 4: DECORATION (การตกแต่งสถานที่) ====================

  NO_DECORATION?: boolean;                // ไม่ตกแต่ง
  DECORATION_START_DATE?: string;         // วันที่ตกแต่งสถานที่เช่าเริ่มต้น
  DECORATION_END_DATE?: string;           // สิ้นสุด
  DECORATION_DAYS?: number;               // จำนวน(วัน) - calculated
  PRICE_PER_SQM_PER_DAY?: number;         // ราคา/ตารางเมตร/วัน
  DECORATION_TOTAL_PRICE?: number;        // รวมราคา - calculated

  // Store Details
  OPEN_TIME?: string;                     // เวลาเปิด/ปิดบริการ
  CLOSE_TIME?: string;
  SALES_AMOUNT_VAT?: 'include' | 'exclude';  // ยอดจำหน่ายสินค้า
  PHONE_NUMBER_COUNT?: number;            // จำนวนหมายเลขโทรศัพท์
  ATM_COUNT?: number;                     // จำนวนเครื่อง ATM
  VENDING_COUNT?: number;                 // จำนวนเครื่อง Vending
  SIGNAL_INSTALLATION_POINTS?: number;    // จำนวนจุดติดตั้งสัญญาณโทรศัพท์
  SERVICE_CONTRACT_TYPE?: 'signal_distribution' | 'cell_tower';  // สัญญาใช้บริการสถานที่เพื่อติดตั้ง

  // ==================== TAB 5: CONDITIONS (เงื่อนไขอื่นๆ) ====================

  SUBJECT?: string;                       // เรื่อง
  CONTRACT_CONDITIONS: ContractCondition[];  // เงื่อนไขตามสัญญา
  INTERNAL_NOTES?: string;                // บันทึกภายใน

  // ==================== FILES & AUDIT ====================

  FILES: ContractFile[];

  CREATE_BY: string;
  CREATE_DATE: string;
  UPD_BY: string;
  UPD_DATE: string;
}

// ==================== NESTED INTERFACES ====================

export interface RenewalAgreement {
  START_DATE: string;
  END_DATE: string;
  RATE: number;
}

export interface AreaDetail {
  BUILDING: string;
  FLOOR: string;
  UNIT_NUMBER: string;
  STATUS: string;
  ZONE: string;
  WIDTH: number;
  LENGTH: number;
  TOTAL_AREA: number;
}

export interface RevenueCode {
  CODE: string;
  NAME: string;
  CHARACTERISTIC: string;
  REFER_STATUS: string;
  GROUP: string;
  TYPE: string;
  COLLECT_BEFORE: string;
}

export interface OtherRevenue {
  CODE: string;
  NAME: string;
  TYPE: string;
  AMOUNT: number;
  PAYMENT_TYPE: string;
}

export interface GuaranteeDocument {
  DOCUMENT_NUMBER: string;
  AMOUNT: number;
  BANK: string;
  BRANCH: string;
  COMPANY: string;
}

export interface ReceiptTransfer {
  RECEIPT_NUMBER: string;
  DATE: string;
  AMOUNT: number;
  COMPANY: string;
}

export interface Installment {
  DUE_DATE: string;
  AMOUNT: number;
  RENT_DEPOSIT: number;
  SERVICE_DEPOSIT: number;
  COMMON_DEPOSIT: number;
  TOTAL_WITH_VAT: number;
  CASH_PAYMENT: number;
  TRANSFERS: PaymentTransfer[];
  CHECKS: PaymentCheck[];
}

export interface PaymentTransfer {
  DATE: string;
  AMOUNT: number;
  BANK: string;
  BRANCH: string;
  COMPANY: string;
}

export interface PaymentCheck {
  CHECK_NUMBER: string;
  DATE: string;
  AMOUNT: number;
  BANK: string;
  BRANCH: string;
  COMPANY: string;
}

export interface ContractCondition {
  ITEM_NUMBER: number;
  TITLE: string;
  CONTENT: string;
}

export interface ContractFile {
  FILE_ID: string;
  CONTRACT_ID: string;
  FILE_NAME: string;
  FILE_TYPE: 'PDF' | 'IMAGE' | 'DOC';
  FILE_URL: string;
  FILE_SIZE_MB: number;
  MIME_TYPE: string;
  UPLOADED_AT: string;
  UPLOADED_BY?: string;
  IS_MAIN_CONTRACT: 'Y' | 'N';
  PAGE_COUNT?: number;
  THUMBNAIL_URL?: string;
}

// ==================== ENUMS (from original) ====================

export type ContractType =
  | 'LEASE_AGREEMENT'
  | 'LEASE_RENEWAL'
  | 'LEASE_AMENDMENT'
  | 'LEASE_TERMINATION'
  | 'DEPOSIT_AGREEMENT'
  | 'QUOTATION_AGREEMENT'
  | 'MAINTENANCE_AGREEMENT'
  | 'ADDENDUM'
  | 'OTHER';

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'COMPLETED';

export const CONTRACT_TYPE_LABELS: Record<ContractType, { TH: string; EN: string }> = {
  'LEASE_AGREEMENT': { TH: 'สัญญาเช่า', EN: 'Lease Agreement' },
  'LEASE_RENEWAL': { TH: 'ต่อสัญญาเช่า', EN: 'Lease Renewal' },
  'LEASE_AMENDMENT': { TH: 'แก้ไขสัญญา', EN: 'Lease Amendment' },
  'LEASE_TERMINATION': { TH: 'เลิกสัญญา', EN: 'Lease Termination' },
  'DEPOSIT_AGREEMENT': { TH: 'สัญญาจอง', EN: 'Reservation Contract' },
  'QUOTATION_AGREEMENT': { TH: 'ใบเสนอราคา', EN: 'Quotation Agreement' },
  'MAINTENANCE_AGREEMENT': { TH: 'สัญญาบำรุงรักษา', EN: 'Maintenance Agreement' },
  'ADDENDUM': { TH: 'ภาคผนวก', EN: 'Addendum' },
  'OTHER': { TH: 'อื่นๆ', EN: 'Other' }
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, { TH: string; EN: string; COLOR: string }> = {
  'DRAFT': { TH: 'ร่าง', EN: 'Draft', COLOR: 'rgb(var(--muted))' },
  'PENDING': { TH: 'รอลงนาม', EN: 'Pending Signature', COLOR: 'rgb(var(--warning))' },
  'ACTIVE': { TH: 'ใช้งานอยู่', EN: 'Active', COLOR: 'rgb(var(--success))' },
  'EXPIRED': { TH: 'หมดอายุ', EN: 'Expired', COLOR: 'rgb(var(--danger))' },
  'TERMINATED': { TH: 'ยกเลิก', EN: 'Terminated', COLOR: 'rgb(var(--danger))' },
  'COMPLETED': { TH: 'เสร็จสิ้น', EN: 'Completed', COLOR: 'rgb(var(--muted))' }
};
