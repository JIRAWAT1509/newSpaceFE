// src/app/core/data/floor.mock.ts

import { Floor } from '../models/floor.model';

// ── SVG Placeholders (offline-safe) ──────────────────────────────────────────
const makeSVG = (label: string, bg: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">` +
  `<rect width="1200" height="800" fill="${bg}" stroke="%23dee2e6" stroke-width="2"/>` +
  `<rect x="40" y="40" width="1120" height="720" fill="none" stroke="%23adb5bd" stroke-width="1.5" stroke-dasharray="8,4"/>` +
  `<text x="600" y="410" text-anchor="middle" font-family="sans-serif" font-size="28" fill="%23adb5bd">${label}</text>` +
  `<rect x="80" y="80" width="320" height="210" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="440" y="80" width="320" height="210" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="800" y="80" width="320" height="210" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="80" y="330" width="220" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="340" y="330" width="220" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="600" y="330" width="220" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="860" y="330" width="260" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="80" y="560" width="500" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `<rect x="620" y="560" width="500" height="180" fill="%23e9ecef" stroke="%23ced4da" stroke-width="1" rx="4"/>` +
  `</svg>`;

const SVG_SL_A_1 = makeSVG('Silom Tower A — ชั้น 1 (Retail)', '%23f8f9fa');
const SVG_SL_A_2 = makeSVG('Silom Tower A — ชั้น 2 (Office)', '%23f0f7ff');
const SVG_SL_A_3 = makeSVG('Silom Tower A — ชั้น 3 (Office)', '%23f0f7ff');
const SVG_SL_B_1 = makeSVG('Silom Tower B — ชั้น 1', '%23fff8f0');
const SVG_AK_A_1 = makeSVG('Asoke Tower A — ชั้น 1 (Retail)', '%23f5f0f8');
const SVG_AK_A_2 = makeSVG('Asoke Tower A — ชั้น 2 (Office)', '%23f0fff4');

// ── bld-001 (Silom A) : 3 ชั้น ───────────────────────────────────────────────
export const FLOOR_SL_A_1: Floor = {
  id: 'floor-sl-a-1',
  buildingId: 'bld-001',
  floorNumber: 1,
  floorName: 'Fl. 1',
  floorNameTh: 'ชั้น 1',
  floorNameEn: 'Floor 1',
  isActive: true,
  unitCount: 10,
  floorPlanVersions: [
    {
      id: 'fpv-sl-a-1-v1',
      floorId: 'floor-sl-a-1',
      versionNumber: 1,
      planImage: SVG_SL_A_1,
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2020-02-01'),
      validUntil: null,
      renovationReasonTh: 'แผนผังเริ่มต้น',
      renovationReasonEn: 'Initial layout',
      createdAt: new Date('2020-02-01'),
      updatedAt: new Date('2020-02-01'),
    },
  ],
  createdAt: new Date('2020-02-01'),
  updatedAt: new Date('2025-01-01'),
};

export const FLOOR_SL_A_2: Floor = {
  id: 'floor-sl-a-2',
  buildingId: 'bld-001',
  floorNumber: 2,
  floorName: 'Fl. 2',
  floorNameTh: 'ชั้น 2',
  floorNameEn: 'Floor 2',
  isActive: true,
  unitCount: 7,
  floorPlanVersions: [
    {
      id: 'fpv-sl-a-2-v1',
      floorId: 'floor-sl-a-2',
      versionNumber: 1,
      planImage: SVG_SL_A_2,
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2020-02-01'),
      validUntil: null,
      renovationReasonTh: 'แผนผังเริ่มต้น',
      renovationReasonEn: 'Initial layout',
      createdAt: new Date('2020-02-01'),
      updatedAt: new Date('2020-02-01'),
    },
  ],
  createdAt: new Date('2020-02-01'),
  updatedAt: new Date('2025-01-01'),
};

export const FLOOR_SL_A_3: Floor = {
  id: 'floor-sl-a-3',
  buildingId: 'bld-001',
  floorNumber: 3,
  floorName: 'Fl. 3',
  floorNameTh: 'ชั้น 3',
  floorNameEn: 'Floor 3',
  isActive: false, // อยู่ระหว่างปรับปรุง
  unitCount: 0,
  floorPlanVersions: [
    {
      id: 'fpv-sl-a-3-v1',
      floorId: 'floor-sl-a-3',
      versionNumber: 1,
      planImage: SVG_SL_A_3,
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2020-02-01'),
      validUntil: null,
      renovationReasonTh: 'ปรับปรุงระบบสาธารณูปโภค',
      renovationReasonEn: 'Utility renovation',
      createdAt: new Date('2020-02-01'),
      updatedAt: new Date('2024-11-01'),
    },
  ],
  createdAt: new Date('2020-02-01'),
  updatedAt: new Date('2024-11-01'),
};

// ── bld-002 (Silom B) : 1 ชั้น (อาคาร inactive) ─────────────────────────────
export const FLOOR_SL_B_1: Floor = {
  id: 'floor-sl-b-1',
  buildingId: 'bld-002',
  floorNumber: 1,
  floorName: 'Fl. 1',
  floorNameTh: 'ชั้น 1',
  floorNameEn: 'Floor 1',
  isActive: false,
  unitCount: 0,
  floorPlanVersions: [
    {
      id: 'fpv-sl-b-1-v1',
      floorId: 'floor-sl-b-1',
      versionNumber: 1,
      planImage: SVG_SL_B_1,
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2020-04-01'),
      validUntil: null,
      renovationReasonTh: 'แผนผังเริ่มต้น',
      renovationReasonEn: 'Initial layout',
      createdAt: new Date('2020-04-01'),
      updatedAt: new Date('2020-04-01'),
    },
  ],
  createdAt: new Date('2020-04-01'),
  updatedAt: new Date('2025-01-20'),
};

// ── bld-003 (Asoke A) : 2 ชั้น ───────────────────────────────────────────────
export const FLOOR_AK_A_1: Floor = {
  id: 'floor-ak-a-1',
  buildingId: 'bld-003',
  floorNumber: 1,
  floorName: 'Fl. 1',
  floorNameTh: 'ชั้น 1',
  floorNameEn: 'Floor 1',
  isActive: true,
  unitCount: 5,
  floorPlanVersions: [
    {
      id: 'fpv-ak-a-1-v1',
      floorId: 'floor-ak-a-1',
      versionNumber: 1,
      planImage: SVG_AK_A_1,
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2021-07-01'),
      validUntil: null,
      renovationReasonTh: 'แผนผังเริ่มต้น',
      renovationReasonEn: 'Initial layout',
      createdAt: new Date('2021-07-01'),
      updatedAt: new Date('2021-07-01'),
    },
  ],
  createdAt: new Date('2021-07-01'),
  updatedAt: new Date('2025-01-10'),
};

export const FLOOR_AK_A_2: Floor = {
  id: 'floor-ak-a-2',
  buildingId: 'bld-003',
  floorNumber: 2,
  floorName: 'Fl. 2',
  floorNameTh: 'ชั้น 2',
  floorNameEn: 'Floor 2',
  isActive: true,
  unitCount: 3,
  floorPlanVersions: [
    {
      id: 'fpv-ak-a-2-v1',
      floorId: 'floor-ak-a-2',
      versionNumber: 1,
      planImage: SVG_AK_A_2,
      planImageWidth: 1200,
      planImageHeight: 800,
      validFrom: new Date('2021-07-01'),
      validUntil: null,
      renovationReasonTh: 'แผนผังเริ่มต้น',
      renovationReasonEn: 'Initial layout',
      createdAt: new Date('2021-07-01'),
      updatedAt: new Date('2021-07-01'),
    },
  ],
  createdAt: new Date('2021-07-01'),
  updatedAt: new Date('2025-01-10'),
};

// ── รวมทุก Floor ──────────────────────────────────────────────────────────────
export const ALL_MOCK_FLOORS: Floor[] = [
  FLOOR_SL_A_1,
  FLOOR_SL_A_2,
  FLOOR_SL_A_3,
  FLOOR_SL_B_1,
  FLOOR_AK_A_1,
  FLOOR_AK_A_2,
];

// Backward compat
export const MOCK_FLOOR = FLOOR_SL_A_1;
export const MOCK_FLOOR_BLD2_1 = FLOOR_AK_A_1;
export const MOCK_FLOOR_BLD2_2 = FLOOR_AK_A_2;

export function getFloorsByBuilding(buildingId: string): Floor[] {
  return ALL_MOCK_FLOORS.filter((f) => f.buildingId === buildingId);
}

export function getFloorById(id: string): Floor | undefined {
  return ALL_MOCK_FLOORS.find((f) => f.id === id);
}
