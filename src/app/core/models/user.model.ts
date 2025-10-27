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
