// src/app/core/data/area-index.ts

/**
 * Area Management Mock Data - Main Export Index
 *
 * This file exports all mock data and utilities for the Area Management feature.
 * Import from this single file to access all data.
 *
 * Example usage:
 * import { MOCK_BUILDING, MOCK_AREAS, getVersionForDate } from '@core/data/area-index';
 */

// Models
export * from '../models/building.model';
export * from '../models/floor.model';
export * from '../models/area.model';
export * from '../models/rental-history.model';

// Mock Data
export * from './building.mock';
export * from './floor.mock';
export * from './floor-versions.mock';
export { MOCK_AREAS } from './areas.mock';  // Named export to avoid conflicts
export * from './rental-history.mock';

// Constants
export * from './area-constants';

// Utilities
// export * from '../utils/area-utils';

// Re-export combined data structure
import { MOCK_BUILDING } from './building.mock';
import { MOCK_FLOOR } from './floor.mock';
import { MOCK_AREAS } from './areas.mock';
import { MOCK_RENTAL_HISTORY } from './rental-history.mock';
import { Area } from '../models/area.model';

/**
 * Complete data structure with building, floor, areas, and history
 */
export const AREA_MANAGEMENT_DATA = {
  building: MOCK_BUILDING,
  floor: MOCK_FLOOR,
  areas: MOCK_AREAS,
  rentalHistory: MOCK_RENTAL_HISTORY
};

/**
 * Get complete floor data with areas and history
 */
export function getCompleteFloorData() {
  return {
    ...MOCK_FLOOR,
    areas: MOCK_AREAS.map((area: Area) => ({
      ...area,
      rentalHistory: MOCK_RENTAL_HISTORY.filter(rh => rh.areaId === area.id)
    }))
  };
}

/**
 * Get complete building data with all nested information
 */
export function getCompleteBuildingData() {
  return {
    ...MOCK_BUILDING,
    floors: [getCompleteFloorData()]
  };
}
