// user.model.ts - User data interface
export interface User {
  MyFile: File | null;
  USER_ID: string;
  OU_CODE: string;
  USER_NAME: string;
  USER_PASSWORD: string;
  DEPARTMENT: string;
  INACTIVE: 'Y' | 'N';
  USER_LIN: string;
  USER_GROUP: string;
  UPD_BY: string;
  UPD_DATE: string;
  LAST_EXP_DATE: string | null;
  EXP_WITHIN_YEAR: number | null;
  EXP_WITHIN_MONTH: number | null;
  EXP_WITHIN_DAY: number;
  NEVER_EXPIRE: 'Y' | 'N';
  APP_LEVEL: string;
  EMAIL: string | null;
  /** อีเมลลูกค้าสำหรับส่งใบแจ้งหนี้/ใบลดหนี้/ใบเสร็จ */
  BILLING_EMAIL?: string | null;
  /** ประเภทลูกหนี้ */
  DEBTOR_TYPE?: string | null;
  /** คำนำหน้าชื่อ (นาย, นาง, นางสาว, etc.) */
  TITLE_PREFIX?: string | null;
  /** สำนักงานใหญ่/ย่อย */
  OFFICE_TYPE?: string | null;
  /** ที่อยู่ภาษาอังกฤษ */
  ADDRESS_EN?: string | null;
  /** ส่งใบแจ้งหนี้ */
  SEND_INVOICE?: 'Y' | 'N' | null;
  /** ส่งใบลดหนี้ */
  SEND_CREDIT_NOTE?: 'Y' | 'N' | null;
  /** ส่งใบเสร็จรับเงิน */
  SEND_RECEIPT?: 'Y' | 'N' | null;
  /** ส่งใบลดหนี้ใบเสร็จ */
  SEND_CREDIT_RECEIPT?: 'Y' | 'N' | null;
  /** ลำดับการอนุมัติ (1, 2, 3, ...) */
  APPROVAL_SEQUENCE?: number | null;
  /** หน้าจอที่อนุญาต (JSON array of screen keys) */
  ALLOWED_SCREENS?: string | null;
  /** ขอบเขตการเข้าถึงข้อมูล: all | branch | department | own */
  DATA_ACCESS_SCOPE?: string | null;
  PATH_IMG: string | null;
  IS_AGREE: string | null;
  USER_PIN: string | null;
  MOBILE_IMEI: string | null;
  MOBILE_DETAIL: string | null;
  MOBILE_LOGIN: string | null;
  TOKEN: string | null;
  LAST_LOG_IN: string | null;
  DataState: number;
  ReadOnly: boolean;
  IsSelected: boolean;
}

export interface UserResponse {
  data: User[];
  total: number;
}

// Form data structure for creating/editing users
export interface UserFormData {
  userId: string;
  username: string;
  displayName: string;
  fullName: string;
  position: string;
  status: 'active' | 'inactive';
  role: string;
  department: string;
  maxSessions: number;
  warningDays: number;
  email: string;
  /** อีเมลลูกค้าสำหรับส่งใบแจ้งหนี้/ใบลดหนี้/ใบเสร็จ */
  billingEmail: string;
  /** ส่งใบแจ้งหนี้ */
  sendInvoice: boolean;
  /** ส่งใบลดหนี้ */
  sendCreditNote: boolean;
  /** ส่งใบเสร็จรับเงิน */
  sendReceipt: boolean;
  /** ส่งใบลดหนี้ใบเสร็จ */
  sendCreditReceipt: boolean;
  /** ประเภทลูกหนี้ */
  debtorType: string;
  /** คำนำหน้าชื่อ */
  titlePrefix: string;
  /** สำนักงานใหญ่/ย่อย */
  officeType: string;
  /** ที่อยู่ภาษาอังกฤษ */
  addressEn: string;
  /** ลำดับการอนุมัติ (e.g. '1', '2', '3') */
  approvalSequence: string;
  /** หน้าจอที่อนุญาต (screen keys) */
  allowedScreens: string[];
  /** ขอบเขตการเข้าถึงข้อมูล */
  dataAccessScope: string;
  avatar: File | null;
  avatarPreview: string | null;
  password: string;
  confirmPassword: string;
  sendEmail: boolean;
}

// Dropdown options
export interface DropdownOption {
  label: string;
  value: string;
}
