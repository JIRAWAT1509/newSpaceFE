// src/app/core/data/area-index.ts

// ── Models ────────────────────────────────────────────────────────────────────
export * from '../models/building.model';
export * from '../models/floor.model';
export * from '../models/area.model';
export * from '../models/rental-history.model';

// ── Mock Data ─────────────────────────────────────────────────────────────────
export * from './branch.mock';
export * from './building.mock';
export * from './floor.mock';
export * from './floor-versions.mock';
export * from './rental-history.mock';
export * from './area-constants';

export {
  AREAS_SL_A_1,
  AREAS_SL_A_2,
  AREAS_AK_A_1,
  AREAS_AK_A_2,
  // backward compat
  MOCK_AREAS,
  MOCK_AREAS_BLD2_FL1,
  MOCK_AREAS_BLD2_FL2,
} from './areas.mock';

// ── Internal imports ──────────────────────────────────────────────────────────
import { MOCK_BUILDINGS, getBuildingsByBranch } from './building.mock';
import { ALL_MOCK_FLOORS, getFloorsByBuilding } from './floor.mock';
import {
  AREAS_SL_A_1, AREAS_SL_A_2,
  AREAS_AK_A_1, AREAS_AK_A_2,
} from './areas.mock';
import { MOCK_RENTAL_HISTORY } from './rental-history.mock';
import { Area } from '../models/area.model';
import { Floor } from '../models/floor.model';

// ── Helpers ───────────────────────────────────────────────────────────────────
const mapRentalHistory = (areas: Area[]): Area[] =>
  areas.map(area => ({
    ...area,
    rentalHistory: MOCK_RENTAL_HISTORY.filter(rh => rh.AREA_ID === area.id),
  }));

/** Map floorId → areas */
const FLOOR_AREA_MAP: Record<string, Area[]> = {
  'floor-sl-a-1': AREAS_SL_A_1,
  'floor-sl-a-2': AREAS_SL_A_2,
  'floor-sl-a-3': [],           // inactive floor — no areas yet
  'floor-sl-b-1': [],           // inactive building
  'floor-ak-a-1': AREAS_AK_A_1,
  'floor-ak-a-2': AREAS_AK_A_2,
};

const getAreasForFloor = (floorId: string): Area[] =>
  mapRentalHistory(FLOOR_AREA_MAP[floorId] ?? []);

// ── Main helpers ──────────────────────────────────────────────────────────────
export function getAllBuildingsData() {
  return MOCK_BUILDINGS.map(building => ({
    ...building,
    floors: getFloorsByBuilding(building.id).map(floor => ({
      ...floor,
      areas: getAreasForFloor(floor.id),
    })),
  }));
}

export function getBuildingDataByBranch(branchId: string) {
  const buildings = branchId ? getBuildingsByBranch(branchId) : MOCK_BUILDINGS;
  return buildings.map(building => ({
    ...building,
    floors: getFloorsByBuilding(building.id).map(floor => ({
      ...floor,
      areas: getAreasForFloor(floor.id),
    })),
  }));
}

// ── Backward compat ───────────────────────────────────────────────────────────
/** @deprecated ใช้ getAllBuildingsData()[0] แทน */
export function getCompleteBuildingData() { return getAllBuildingsData()[0]; }

/** @deprecated */
export function getCompleteFloorData(): Floor & { areas: Area[] } {
  return getAllBuildingsData()[0].floors[0] as Floor & { areas: Area[] };
}

export const AREA_MANAGEMENT_DATA = {
  building: MOCK_BUILDINGS[0],
  floor:    ALL_MOCK_FLOORS[0],
  areas:    AREAS_SL_A_1,
  rentalHistory: MOCK_RENTAL_HISTORY,
};
