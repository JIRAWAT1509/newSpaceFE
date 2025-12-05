// src/app/core/models/contract.model.ts

export interface Contract {
  CONTRACT_ID: string;
  OU_CODE: string;
  AREA_ID: string;
  RENTAL_HISTORY_ID?: string;

  // Contract identification
  CONTRACT_NUMBER: string;      // "CNT-2024-001"
  CONTRACT_TYPE: ContractType;
  CONTRACT_TOPIC: string;
  CONTRACT_TOPIC_TH: string;
  CONTRACT_TOPIC_EN: string;

  // Dates (using /Date(timestamp)/ format)
  ISSUE_DATE: string;           // "/Date(1704067200000)/"
  START_DATE: string;
  END_DATE: string;
  EXPIRY_DATE: string;
  SIGNED_DATE?: string;

  // Parties
  TENANT_NAME: string;
  TENANT_NAME_TH: string;
  TENANT_NAME_EN: string;
  LANDLORD_NAME: string;

  // Financial terms
  MONTHLY_RENT?: number;
  DEPOSIT_AMOUNT?: number;
  TOTAL_VALUE?: number;

  // Status
  STATUS: ContractStatus;
  STATUS_NAME?: string;

  // Files
  FILES: ContractFile[];

  // Additional info
  NOTES?: string;
  TAGS?: string;               // Comma-separated: "renewal,negotiated"

  // Audit fields
  CREATE_BY: string;
  CREATE_DATE: string;
  UPD_BY: string;
  UPD_DATE: string;
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

export type ContractType =
  | 'LEASE_AGREEMENT'          // สัญญาเช่า
  | 'LEASE_RENEWAL'            // ต่อสัญญาเช่า
  | 'LEASE_AMENDMENT'          // แก้ไขสัญญา
  | 'LEASE_TERMINATION'        // เลิกสัญญา
  | 'DEPOSIT_AGREEMENT'        // สัญญามัดจำ
  | 'QUOTATION_AGREEMENT'      // สัญญาใบเสนอราคา
  | 'MAINTENANCE_AGREEMENT'    // สัญญาบำรุงรักษา
  | 'ADDENDUM'                 // ภาคผนวก
  | 'OTHER';

export type ContractStatus =
  | 'DRAFT'                    // ร่าง
  | 'PENDING'                  // รอลงนาม
  | 'ACTIVE'                   // ใช้งานอยู่
  | 'EXPIRED'                  // หมดอายุ
  | 'TERMINATED'               // ยกเลิก
  | 'COMPLETED';               // เสร็จสิ้น

export const CONTRACT_TYPE_LABELS: Record<ContractType, { TH: string; EN: string }> = {
  'LEASE_AGREEMENT': { TH: 'สัญญาเช่า', EN: 'Lease Agreement' },
  'LEASE_RENEWAL': { TH: 'ต่อสัญญาเช่า', EN: 'Lease Renewal' },
  'LEASE_AMENDMENT': { TH: 'แก้ไขสัญญา', EN: 'Lease Amendment' },
  'LEASE_TERMINATION': { TH: 'เลิกสัญญา', EN: 'Lease Termination' },
  'DEPOSIT_AGREEMENT': { TH: 'สัญญามัดจำ', EN: 'Deposit Agreement' },
  'QUOTATION_AGREEMENT': { TH: 'สัญญาใบเสนอราคา', EN: 'Quotation Agreement' },
  'MAINTENANCE_AGREEMENT': { TH: 'สัญญาบำรุงรักษา', EN: 'Maintenance Agreement' },
  'ADDENDUM': { TH: 'ภาคผนวก', EN: 'Addendum' },
  'OTHER': { TH: 'อื่นๆ', EN: 'Other' }
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, { TH: string; EN: string; COLOR: string }> = {
  'DRAFT': { TH: 'ร่าง', EN: 'Draft', COLOR: '#9CA3AF' },
  'PENDING': { TH: 'รอลงนาม', EN: 'Pending Signature', COLOR: '#F59E0B' },
  'ACTIVE': { TH: 'ใช้งานอยู่', EN: 'Active', COLOR: '#10B981' },
  'EXPIRED': { TH: 'หมดอายุ', EN: 'Expired', COLOR: '#EF4444' },
  'TERMINATED': { TH: 'ยกเลิก', EN: 'Terminated', COLOR: '#DC2626' },
  'COMPLETED': { TH: 'เสร็จสิ้น', EN: 'Completed', COLOR: '#6B7280' }
};
