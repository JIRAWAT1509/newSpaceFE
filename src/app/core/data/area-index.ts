// src/app/core/data/area-index.ts

export * from '../models/building.model';
export * from '../models/floor.model';
export * from '../models/area.model';
export * from '../models/rental-history.model';

export * from './building.mock';
export * from './floor.mock';
export * from './floor-versions.mock';
export { MOCK_AREAS, MOCK_AREAS_BLD2_FL1, MOCK_AREAS_BLD2_FL2 } from './areas.mock';
export * from './rental-history.mock';
export * from './area-constants';

import { MOCK_BUILDING, MOCK_BUILDING_2 } from './building.mock';
import { MOCK_FLOOR, MOCK_FLOOR_BLD2_1, MOCK_FLOOR_BLD2_2 } from './floor.mock';
import { MOCK_AREAS, MOCK_AREAS_BLD2_FL1, MOCK_AREAS_BLD2_FL2 } from './areas.mock';
import { MOCK_RENTAL_HISTORY } from './rental-history.mock';
import { Area } from '../models/area.model';

export const AREA_MANAGEMENT_DATA = {
  building: MOCK_BUILDING,
  floor: MOCK_FLOOR,
  areas: MOCK_AREAS,
  rentalHistory: MOCK_RENTAL_HISTORY
};

function getCompleteBuildingData_1() {
  return {
    ...MOCK_BUILDING,
    floors: [
      {
        ...MOCK_FLOOR,
        areas: MOCK_AREAS.map((area: Area) => ({
          ...area,
          rentalHistory: MOCK_RENTAL_HISTORY.filter(rh => rh.AREA_ID === area.id)
        }))
      }
    ]
  };
}

function getCompleteBuildingData_2() {
  return {
    ...MOCK_BUILDING_2,
    floors: [
      { ...MOCK_FLOOR_BLD2_1, areas: MOCK_AREAS_BLD2_FL1 },
      { ...MOCK_FLOOR_BLD2_2, areas: MOCK_AREAS_BLD2_FL2 }
    ]
  };
}

// ✅ ใช้ใน AreaDataService เพื่อโหลด buildings ทั้งหมดตั้งแต่แรก
export function getAllBuildingsData() {
  return [
    getCompleteBuildingData_1(),
    getCompleteBuildingData_2()
  ];
}

// backward compat — ใช้ใน component อื่นที่ยังเรียกชื่อเดิม
export function getCompleteBuildingData() {
  return getCompleteBuildingData_1();
}

export function getCompleteFloorData() {
  return {
    ...MOCK_FLOOR,
    areas: MOCK_AREAS.map((area: Area) => ({
      ...area,
      rentalHistory: MOCK_RENTAL_HISTORY.filter(rh => rh.AREA_ID === area.id)
    }))
  };
}
