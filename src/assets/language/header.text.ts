export interface HeaderTexts {
  logoText: string;
  greeting: string;
  searchPlaceholder: string;
  languageLabel: string;
  profileLabel: string;
  viewProfile: string;
  settings: string;
  logout: string;
}

// This structure allows easy addition of more languages in the future
export const HEADER_TEXTS: { [key: string]: HeaderTexts } = {
  en: {
    logoText: 'S P A C E',
    greeting: 'Hello',
    searchPlaceholder: 'Search for...',
    languageLabel: 'Select Language',
    profileLabel: 'User Profile',
    viewProfile: 'View Profile',
    settings: 'Settings',
    logout: 'Logout'
  },
  th: {
    logoText: 'S P A C E',
    greeting: 'สวัสดี',
    searchPlaceholder: 'ค้นหา...',
    languageLabel: 'เลือกภาษา',
    profileLabel: 'โปรไฟล์ผู้ใช้',
    viewProfile: 'ดูโปรไฟล์',
    settings: 'ตั้งค่า',
    logout: 'ออกจากระบบ'
  },
  zh: {
    logoText: 'S P A C E',
    greeting: '你好',
    searchPlaceholder: '搜索...',
    languageLabel: '选择语言',
    profileLabel: '用户资料',
    viewProfile: '查看资料',
    settings: '设置',
    logout: '登出'
  }
};
