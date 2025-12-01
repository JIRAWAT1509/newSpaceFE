// users.mock.ts - Mock user data for activities section

export interface User {
  id: string;
  name: string;
  nameTh: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  isActive: boolean;
}

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'John Smith',
    nameTh: 'จอห์น สมิธ',
    email: 'john.smith@company.com',
    avatar: '👨‍💼',
    role: 'sales-manager',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-002',
    name: 'Jane Cooper',
    nameTh: 'เจน คูเปอร์',
    email: 'jane.cooper@company.com',
    avatar: '👩‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-003',
    name: 'Robert Fox',
    nameTh: 'โรเบิร์ต ฟอกซ์',
    email: 'robert.fox@company.com',
    avatar: '👨‍💻',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-004',
    name: 'Sarah Wilson',
    nameTh: 'ซาราห์ วิลสัน',
    email: 'sarah.wilson@company.com',
    avatar: '👩‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-005',
    name: 'Michael Brown',
    nameTh: 'ไมเคิล บราวน์',
    email: 'michael.brown@company.com',
    avatar: '👨‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-006',
    name: 'Emily Davis',
    nameTh: 'เอมิลี่ เดวิส',
    email: 'emily.davis@company.com',
    avatar: '👩‍💼',
    role: 'sales-coordinator',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-007',
    name: 'David Miller',
    nameTh: 'เดวิด มิลเลอร์',
    email: 'david.miller@company.com',
    avatar: '👨‍💼',
    role: 'sales-coordinator',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-008',
    name: 'Lisa Anderson',
    nameTh: 'ลิซ่า แอนเดอร์สัน',
    email: 'lisa.anderson@company.com',
    avatar: '👩‍💼',
    role: 'sales-director',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-009',
    name: 'James Taylor',
    nameTh: 'เจมส์ เทย์เลอร์',
    email: 'james.taylor@company.com',
    avatar: '👨‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-010',
    name: 'Maria Garcia',
    nameTh: 'มาเรีย การ์เซีย',
    email: 'maria.garcia@company.com',
    avatar: '👩‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-011',
    name: 'Thomas White',
    nameTh: 'โทมัส ไวท์',
    email: 'thomas.white@company.com',
    avatar: '👨‍💼',
    role: 'sales-coordinator',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-012',
    name: 'Jessica Lee',
    nameTh: 'เจสสิก้า ลี',
    email: 'jessica.lee@company.com',
    avatar: '👩‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-013',
    name: 'Christopher Martin',
    nameTh: 'คริสโตเฟอร์ มาร์ติน',
    email: 'christopher.martin@company.com',
    avatar: '👨‍💼',
    role: 'sales-manager',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-014',
    name: 'Amanda Thompson',
    nameTh: 'อแมนด้า ทอมป์สัน',
    email: 'amanda.thompson@company.com',
    avatar: '👩‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user-015',
    name: 'Daniel Harris',
    nameTh: 'แดเนียล แฮร์ริส',
    email: 'daniel.harris@company.com',
    avatar: '👨‍💼',
    role: 'sales-executive',
    department: 'Sales',
    isActive: true
  }
];

// Current logged-in user (for demo)
export const CURRENT_USER: User = MOCK_USERS[0]; // John Smith
