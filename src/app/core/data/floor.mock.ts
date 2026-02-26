// src/app/core/data/floor.mock.ts

import { Floor } from '../models/floor.model';

// ✅ SVG placeholder ที่ใช้ได้ offline — ไม่ต้องโหลดจาก internet
const FLOOR_PLAN_SVG_BLD1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="%23f8f9fa" stroke="%23dee2e6" stroke-width="2"/><rect x="40" y="40" width="1120" height="720" fill="none" stroke="%23adb5bd" stroke-width="1.5" stroke-dasharray="8,4"/><text x="600" y="420" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%23adb5bd">Floor 55 — Building ST03</text><rect x="80" y="80" width="300" height="200" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="420" y="80" width="300" height="200" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="760" y="80" width="360" height="200" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="80" y="330" width="200" height="160" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="320" y="330" width="200" height="160" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="560" y="330" width="200" height="160" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="800" y="330" width="320" height="160" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="80" y="540" width="460" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="580" y="540" width="540" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/></svg>`;

const FLOOR_PLAN_SVG_BLD2_F1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="%23f0f4f8" stroke="%23dee2e6" stroke-width="2"/><rect x="40" y="40" width="1120" height="720" fill="none" stroke="%23adb5bd" stroke-width="1.5" stroke-dasharray="8,4"/><text x="600" y="420" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%23adb5bd">Floor 1 — Building ST04</text><rect x="80" y="80" width="500" height="280" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="620" y="80" width="500" height="280" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="80" y="410" width="300" height="200" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="420" y="410" width="300" height="200" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="760" y="410" width="360" height="200" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/></svg>`;

const FLOOR_PLAN_SVG_BLD2_F2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="%23f5f0f8" stroke="%23dee2e6" stroke-width="2"/><rect x="40" y="40" width="1120" height="720" fill="none" stroke="%23adb5bd" stroke-width="1.5" stroke-dasharray="8,4"/><text x="600" y="420" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%23adb5bd">Floor 2 — Building ST04</text><rect x="80" y="80" width="700" height="300" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="820" y="80" width="300" height="300" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="80" y="430" width="460" height="250" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/><rect x="580" y="430" width="540" height="250" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/></svg>`;

export const MOCK_FLOOR: Floor = {
  id: 'floor-55',
  buildingId: 'bld-001',
  floorNumber: 55,
  floorName: 'Fl. 55',
  floorNameTh: 'ชั้น 55',
  floorNameEn: 'Floor 55',
  floorPlanVersions: [
    {
      id: 'fpv-003',
      floorId: 'floor-55',
      versionNumber: 3,
      planImage: FLOOR_PLAN_SVG_BLD1,   // ✅ SVG inline แทน URL
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2024-01-01'),
      validUntil: null,
      renovationReason: 'Layout update',
      renovationReasonTh: 'ปรับปรุงผังพื้น',
      renovationReasonEn: 'Layout update',
      renovationNotes: 'Updated floor plan',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const MOCK_FLOOR_BLD2_1: Floor = {
  id: 'floor-bld2-01',
  buildingId: 'bld-002',
  floorNumber: 1,
  floorName: 'Fl. 1',
  floorNameTh: 'ชั้น 1',
  floorNameEn: 'Floor 1',
  floorPlanVersions: [
    {
      id: 'fpv-bld2-001',
      floorId: 'floor-bld2-01',
      versionNumber: 1,
      planImage: FLOOR_PLAN_SVG_BLD2_F1,  // ✅ SVG inline
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2024-03-01'),
      validUntil: null,
      renovationReason: 'Initial',
      renovationReasonTh: 'เริ่มต้น',
      renovationReasonEn: 'Initial',
      renovationNotes: '',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  ],
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01')
};

export const MOCK_FLOOR_BLD2_2: Floor = {
  id: 'floor-bld2-02',
  buildingId: 'bld-002',
  floorNumber: 2,
  floorName: 'Fl. 2',
  floorNameTh: 'ชั้น 2',
  floorNameEn: 'Floor 2',
  floorPlanVersions: [
    {
      id: 'fpv-bld2-002',
      floorId: 'floor-bld2-02',
      versionNumber: 1,
      planImage: FLOOR_PLAN_SVG_BLD2_F2,  // ✅ SVG inline
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2024-03-01'),
      validUntil: null,
      renovationReason: 'Initial',
      renovationReasonTh: 'เริ่มต้น',
      renovationReasonEn: 'Initial',
      renovationNotes: '',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  ],
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01')
};
