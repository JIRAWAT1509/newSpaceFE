// contract-search.model.ts

export type SearchFieldType =
  | 'BRANCH'           // สาขา
  | 'CUSTOMER'         // ลูกค้า (TENANT_NAME)
  | 'COMPANY_NAME'     // ชื่อกิจการ (TENANT_NAME_TH/EN)
  | 'CONTRACT_NUMBER'  // เลขที่สัญญาเช่า บ.หลัก
  | 'BUILDING'         // อาคาร (BUILDING_CODE from area)
  | 'CATEGORY'         // หมวดสินค้า/บริการ
  | 'CONTRACT_TYPE'    // ประเภทสัญญา
  | 'STATUS'           // สถานะสัญญาเช่า
  | 'AREA_ID';         // รหัสพื้นที่ (NEW)

export const SEARCH_FIELD_CONFIG: Record<SearchFieldType, {
  TH: string,
  EN: string,
  INPUT_TYPE: 'text' | 'select'
}> = {
  BRANCH: {
    TH: 'สาขา',
    EN: 'Branch',
    INPUT_TYPE: 'text'
  },
  CUSTOMER: {
    TH: 'ลูกค้า',
    EN: 'Customer',
    INPUT_TYPE: 'text'
  },
  COMPANY_NAME: {
    TH: 'ชื่อกิจการ',
    EN: 'Company Name',
    INPUT_TYPE: 'text'
  },
  CONTRACT_NUMBER: {
    TH: 'เลขที่สัญญาเช่า บ.หลัก',
    EN: 'Contract Number',
    INPUT_TYPE: 'text'
  },
  BUILDING: {
    TH: 'อาคาร',
    EN: 'Building',
    INPUT_TYPE: 'select'
  },
  CATEGORY: {
    TH: 'หมวดสินค้า/บริการ',
    EN: 'Category',
    INPUT_TYPE: 'select'
  },
  CONTRACT_TYPE: {
    TH: 'ประเภทสัญญา',
    EN: 'Contract Type',
    INPUT_TYPE: 'select'
  },
  STATUS: {
    TH: 'สถานะสัญญาเช่า',
    EN: 'Status',
    INPUT_TYPE: 'select'
  },
  AREA_ID: {
    TH: 'รหัสพื้นที่',
    EN: 'Area ID',
    INPUT_TYPE: 'text'
  }
};

export interface SearchFilter {
  id: string;
  field: SearchFieldType | null;
  value: string | string[];
  isComplete: boolean; // true when user has selected field AND entered value
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  createdAt: Date;
}

// Options for select fields
export const BUILDING_OPTIONS = [
  { label: 'Building A', value: 'A' },
  { label: 'Building B', value: 'B' },
  { label: 'Building C', value: 'C' }
];

export const CATEGORY_OPTIONS = [
  { label: 'อิเล็กทรอนิกส์', value: 'electronics' },
  { label: 'แฟชั่น', value: 'fashion' },
  { label: 'อาหารและเครื่องดื่ม', value: 'food-beverage' },
  { label: 'ความงาม', value: 'beauty' },
  { label: 'ไลฟ์สไตล์', value: 'lifestyle' }
];
