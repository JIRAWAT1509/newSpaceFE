// src/app/core/data/floor.mock.ts

import { Floor } from '../models/floor.model';
import { MOCK_FLOOR_PLAN_VERSIONS } from './floor-versions.mock';

export const MOCK_FLOOR: Floor = {
  id: 'floor-55',
  buildingId: 'bld-001',
  floorNumber: 55,
  floorName: 'Fl. 55',
  floorNameTh: 'ชั้น 55',
  floorNameEn: 'Floor 55',
  floorPlanVersions: MOCK_FLOOR_PLAN_VERSIONS,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-11-21')
};
