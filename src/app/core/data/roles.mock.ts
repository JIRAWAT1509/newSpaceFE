// roles.mock.ts - Mock role data for activities section

export interface Role {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  userCount: number;
  color: string;
}

export const MOCK_ROLES: Role[] = [
  {
    id: 'role-001',
    name: 'Sales Director',
    nameTh: 'ผู้อำนวยการฝ่ายขาย',
    description: 'Head of sales department',
    userCount: 1,
    color: '#8b5cf6'
  },
  {
    id: 'role-002',
    name: 'Sales Manager',
    nameTh: 'ผู้จัดการฝ่ายขาย',
    description: 'Manages sales team',
    userCount: 2,
    color: '#3b82f6'
  },
  {
    id: 'role-003',
    name: 'Sales Executive',
    nameTh: 'พนักงานขาย',
    description: 'Handles sales activities',
    userCount: 8,
    color: '#10b981'
  },
  {
    id: 'role-004',
    name: 'Sales Coordinator',
    nameTh: 'ผู้ประสานงานขาย',
    description: 'Coordinates sales operations',
    userCount: 3,
    color: '#f59e0b'
  },
  {
    id: 'role-005',
    name: 'Sales Support',
    nameTh: 'ฝ่ายสนับสนุนการขาย',
    description: 'Provides sales support',
    userCount: 1,
    color: '#6b7280'
  }
];
