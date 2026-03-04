// src/app/core/data/building.mock.ts

import { Building } from '../models/building.model';

export const MOCK_BUILDINGS: Building[] = [
  // ── สาขาสีลม : 2 อาคาร ───────────────────────────────────
  {
    id: 'bld-001',
    branchId: 'branch-001',
    code: 'SL-A',
    name: 'อาคาร A สีลม',
    nameTh: 'อาคาร A สีลม',
    nameEn: 'Silom Tower A',
    address: '191/1 ถ.สีลม เขตบางรัก กรุงเทพฯ 10500',
    addressTh: '191/1 ถ.สีลม เขตบางรัก กรุงเทพมหานคร 10500',
    addressEn: '191/1 Silom Rd, Bang Rak, Bangkok 10500',
    isActive: true,
    contactPerson: 'นายสมชาย รักงาน',
    contactPhone: '02-234-5678',
    optionalInfo: 'อาคารหลัก — ลิฟต์ 6 ตัว, ที่จอดรถ B1–B3',
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'bld-002',
    branchId: 'branch-001',
    code: 'SL-B',
    name: 'อาคาร B สีลม',
    nameTh: 'อาคาร B สีลม',
    nameEn: 'Silom Tower B',
    address: '191/2 ถ.สีลม เขตบางรัก กรุงเทพฯ 10500',
    addressTh: '191/2 ถ.สีลม เขตบางรัก กรุงเทพมหานคร 10500',
    addressEn: '191/2 Silom Rd, Bang Rak, Bangkok 10500',
    isActive: false,          // อยู่ระหว่างปรับปรุง
    contactPerson: 'นางสาวมณี จันทร์ดี',
    contactPhone: '02-234-5699',
    optionalInfo: 'ปิดปรับปรุงถึง Q3/2025',
    createdAt: new Date('2020-03-01'),
    updatedAt: new Date('2025-01-20'),
  },

  // ── สาขาอโศก : 1 อาคาร ───────────────────────────────────
  {
    id: 'bld-003',
    branchId: 'branch-002',
    code: 'AK-A',
    name: 'อาคาร A อโศก',
    nameTh: 'อาคาร A อโศก',
    nameEn: 'Asoke Tower A',
    address: '88/1 ถ.สุขุมวิท 21 เขตวัฒนา กรุงเทพฯ 10110',
    addressTh: '88/1 ถ.สุขุมวิท 21 เขตวัฒนา กรุงเทพมหานคร 10110',
    addressEn: '88/1 Sukhumvit 21 Rd, Watthana, Bangkok 10110',
    isActive: true,
    contactPerson: 'นายวิชัย ตั้งมั่น',
    contactPhone: '02-108-9900',
    optionalInfo: 'ลิฟต์ 4 ตัว, ที่จอดรถ B1–B2',
    createdAt: new Date('2021-06-15'),
    updatedAt: new Date('2025-02-10'),
  },
];

export const MOCK_BUILDING = MOCK_BUILDINGS[0];

export function getBuildingById(id: string): Building | undefined {
  return MOCK_BUILDINGS.find(b => b.id === id);
}

export function getBuildingsByBranch(branchId: string): Building[] {
  if (!branchId) return MOCK_BUILDINGS;
  return MOCK_BUILDINGS.filter(b => b.branchId === branchId);
}
