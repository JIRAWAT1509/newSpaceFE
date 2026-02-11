export interface HeaderTexts {
  logoText: string;
  greeting: string;
  searchPlaceholder: string;
  languageLabel: string;
  profileLabel: string;
  viewProfile: string;
  settings: string;
  logout: string;
  sales_dashboard: string;
  customer_management: string;
  budget_management: string;
  pipeline_management: string;
  activities_management: string;
}

// This structure allows easy addition of more languages in the future
export const HEADER_TEXTS: { [key: string]: HeaderTexts } = {
  en: {
    logoText: 'SPACE CRM',
    greeting: 'Hello',
    searchPlaceholder: 'Search for...',
    languageLabel: 'Select Language',
    profileLabel: 'User Profile',
    viewProfile: 'View Profile',
    settings: 'Settings',
    logout: 'Logout',
    sales_dashboard: 'Sales Dashboard',
    customer_management: 'Customer Management',
    budget_management: 'Budget Management',
    pipeline_management: 'Pipeline Management',
    activities_management: 'Activities Management',
  },
  th: {
    logoText: 'SPACE CRM',
    greeting: 'สวัสดี',
    searchPlaceholder: 'ค้นหา...',
    languageLabel: 'เลือกภาษา',
    profileLabel: 'โปรไฟล์ผู้ใช้',
    viewProfile: 'ดูโปรไฟล์',
    settings: 'ตั้งค่า',
    logout: 'ออกจากระบบ',
    sales_dashboard: 'แดชบอร์ดการขาย',
    customer_management: 'การจัดการลูกค้า',
    budget_management: 'การจัดการงบประมาณ',
    pipeline_management: 'การจัดการพายไลน์',
    activities_management: 'การจัดการกิจกรรม',
  },
  zh: {
    logoText: 'SPACE CRM',
    greeting: '你好',
    searchPlaceholder: '搜索...',
    languageLabel: '选择语言',
    profileLabel: '用户资料',
    viewProfile: '查看资料',
    settings: '设置',
    logout: '登出',
    sales_dashboard: '销售仪表板',
    customer_management: '客户管理',
    budget_management: '预算管理',
    pipeline_management: '管道管理',
    activities_management: '活动管理',
  }
};
