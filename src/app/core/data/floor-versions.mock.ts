// src/app/core/data/floor-versions.mock.ts

import { FloorPlanVersion } from '../models/floor.model';

export const MOCK_FLOOR_PLAN_VERSIONS: FloorPlanVersion[] = [
  {
    id: 'fpv-001',
    floorId: 'floor-55',
    versionNumber: 1,
    planImage: 'assets/temp/floorPlan1.png',
    planImageWidth: 1920,
    planImageHeight: 1080,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2026-05-31'),
    renovationReason: 'แผนพื้นเดิม',
    renovationReasonTh: 'แผนพื้นเดิม - เปิดใช้งานครั้งแรก',
    renovationReasonEn: 'Original floor plan - Initial opening',
    renovationNotes: 'Initial floor layout with 10 individual rooms',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'fpv-002',
    floorId: 'floor-55',
    versionNumber: 2,
    planImage: 'assets/temp/floorPlan1.png',
    planImageWidth: 1920,
    planImageHeight: 1080,
    validFrom: new Date('2026-06-01'),
    validUntil: new Date('2027-12-31'),
    renovationReason: 'รวมห้อง 2MD001 และ 2MD002',
    renovationReasonTh: 'ปรับปรุงห้อง 2MD001 และ 2MD002 เป็นห้องใหญ่',
    renovationReasonEn: 'Merged rooms 2MD001 and 2MD002 into large suite',
    renovationNotes: 'Combined two rooms to create larger space for corporate client',
    createdAt: new Date('2026-05-15'),
    updatedAt: new Date('2026-05-15')
  },
  {
    id: 'fpv-003',
    floorId: 'floor-55',
    versionNumber: 3,
    planImage: 'assets/temp/floorPlan1.png',
    planImageWidth: 1920,
    planImageHeight: 1080,
    validFrom: new Date('2028-01-01'),
    validUntil: null, // Current version
    renovationReason: 'แบ่งห้อง 2MD010 และเพิ่ม Kiosk',
    renovationReasonTh: 'แบ่งห้อง 2MD010 เป็น 2 ห้อง และเพิ่มพื้นที่ Kiosk',
    renovationReasonEn: 'Split room 2MD010 into 2 rooms and added Kiosk area',
    renovationNotes: 'Current layout with 11 rooms total and 2 kiosk spaces',
    createdAt: new Date('2027-12-15'),
    updatedAt: new Date('2025-11-21')
  }
];
