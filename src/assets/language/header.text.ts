export interface HeaderTexts {
  logoText: string;
  home: string;
  greeting: string;
  searchPlaceholder: string;
  languageLabel: string;
  profileLabel: string;
  viewProfile: string;
  settings: string;
  logout: string;
  dateRangeFrom: string;
  dateRangeTo: string;
  datePlaceholderFrom: string;
  datePlaceholderTo: string;
}

// This structure allows easy addition of more languages in the future
export const HEADER_TEXTS: { [key: string]: HeaderTexts } = {
  en: {
    logoText: 'S P A C E',
    home: 'Home',
    greeting: 'Hello',
    searchPlaceholder: 'Search for...',
    languageLabel: 'Select Language',
    profileLabel: 'User Profile',
    viewProfile: 'View Profile',
    settings: 'Settings',
    logout: 'Logout',
    dateRangeFrom: 'Select Date range from',
    dateRangeTo: 'to',
    datePlaceholderFrom: 'From',
    datePlaceholderTo: 'To'
  },
  th: {
    logoText: 'S P A C E',
    home: 'หน้าหลัก',
    greeting: 'สวัสดี',
    searchPlaceholder: 'ค้นหา...',
    languageLabel: 'เลือกภาษา',
    profileLabel: 'โปรไฟล์ผู้ใช้',
    viewProfile: 'ดูโปรไฟล์',
    settings: 'ตั้งค่า',
    logout: 'ออกจากระบบ',
    dateRangeFrom: 'เลือกช่วงวันที่ตั้งแต่',
    dateRangeTo: 'ถึง',
    datePlaceholderFrom: 'ตั้งแต่',
    datePlaceholderTo: 'ถึง'
  },
  zh: {
    logoText: 'S P A C E',
    home: '首页',
    greeting: '你好',
    searchPlaceholder: '搜索...',
    languageLabel: '选择语言',
    profileLabel: '用户资料',
    viewProfile: '查看资料',
    settings: '设置',
    logout: '登出',
    dateRangeFrom: '选择日期范围 从',
    dateRangeTo: '到',
    datePlaceholderFrom: '从',
    datePlaceholderTo: '到'
  }
};
