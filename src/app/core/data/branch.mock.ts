// src/app/core/data/branch.mock.ts

import { Branch } from '../models/branch.model';

export const MOCK_BRANCHES: Branch[] = [
  {
    id: '',
    code: 'ALL',
    name: 'All',
    nameTh: 'ทั้งหมด',
    nameEn: 'All',
    address: '',
    addressTh: '',
    addressEn: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'branch-001',
    code: 'ST03',
    name: 'สาขา สีลม',
    nameTh: 'สาขา สีลม',
    nameEn: 'Silom Branch',
    address: '191 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    addressTh: '191 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500',
    addressEn: '191 Silom Rd, Si Lom, Bang Rak, Bangkok 10500',
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'branch-002',
    code: 'ST04',
    name: 'สาขา อโศก',
    nameTh: 'สาขา อโศก',
    nameEn: 'Asoke Branch',
    address: '88 ถ.สุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    addressTh: '88 ถ.สุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    addressEn: '88 Sukhumvit 21 Rd, Khlong Toei Nuea, Watthana, Bangkok 10110',
    createdAt: new Date('2021-06-01'),
    updatedAt: new Date('2025-01-15'),
  },
];

export const REAL_BRANCH_IDS = MOCK_BRANCHES
  .filter(b => b.id !== '')
  .map(b => b.id);

export function getBranchById(id: string): Branch | undefined {
  return MOCK_BRANCHES.find(b => b.id === id);
}
