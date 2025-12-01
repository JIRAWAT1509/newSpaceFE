// src/app/core/services/area/area-data.service.ts

import { Injectable, signal } from '@angular/core';
import { Building } from '../../models/building.model';
import { Floor, FloorPlanVersion } from '../../models/floor.model';
import { Area, AreaStatus } from '../../models/area.model';
import { getCompleteBuildingData } from '../../data/area-index';

// Extended Building interface with floors
export interface BuildingWithFloors extends Building {
  floors: FloorWithAreas[];
}

// Extended Floor interface with areas
export interface FloorWithAreas extends Floor {
  areas: Area[];
}

export interface StatusDistribution {
  id: AreaStatus;
  label: string;
  labelTh: string;
  count: number;
  percentage: number;
  warningCount: number; // Count of areas with contract warnings
  color: string;
}

export type ViewMode = 'normal' | 'pre-rent';

@Injectable({
  providedIn: 'root'
})
export class AreaDataService {
  // Signals for reactive data
  private buildingData = signal<BuildingWithFloors>(getCompleteBuildingData());
  private currentMode = signal<ViewMode>('normal');
  private targetDate = signal<Date>(new Date());

  // Public read-only signals
  readonly building = this.buildingData.asReadonly();
  readonly mode = this.currentMode.asReadonly();
  readonly selectedDate = this.targetDate.asReadonly();

  constructor() {
    console.log('AreaDataService initialized');
    console.log('Building data:', this.buildingData());
  }

  /**
   * Set the current view mode (Normal or Pre-Rent)
   */
  setMode(mode: ViewMode): void {
    this.currentMode.set(mode);
  }

  /**
   * Set the target date for Pre-Rent mode
   */
  setTargetDate(date: Date): void {
    this.targetDate.set(date);
  }

  /**
   * Get the appropriate floor plan version for a given date
   */
  getVersionForDate(floor: Floor, date: Date): FloorPlanVersion | null {
    const targetTime = date.getTime();

    const version = floor.floorPlanVersions.find(v => {
      const validFromTime = v.validFrom.getTime();
      const validUntilTime = v.validUntil ? v.validUntil.getTime() : Infinity;

      return targetTime >= validFromTime && targetTime <= validUntilTime;
    });

    return version || null;
  }

  /**
   * Get the latest (current) floor plan version
   */
  getLatestVersion(floor: Floor): FloorPlanVersion | null {
    const currentVersion = floor.floorPlanVersions.find(v => v.validUntil === null);

    if (currentVersion) {
      return currentVersion;
    }

    // Fallback: return the version with the latest validFrom date
    return floor.floorPlanVersions
      .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())[0] || null;
  }

  /**
   * Get areas for a specific floor plan version
   */
  getAreasForVersion(floor: FloorWithAreas, versionId: string): Area[] {
    // Check if floor has areas
    if (!floor.areas || floor.areas.length === 0) {
      return [];
    }

    return floor.areas.filter(area =>
      area.floorPlanVersionId === versionId &&
      !area.isDeleted
    );
  }

  /**
   * Get areas for current mode and date
   */
  getAreasForCurrentContext(floor: FloorWithAreas): Area[] {
    const mode = this.currentMode();
    const date = this.targetDate();

    const version = mode === 'normal'
      ? this.getLatestVersion(floor)
      : this.getVersionForDate(floor, date);

    if (!version) {
      return [];
    }

    return this.getAreasForVersion(floor, version.id);
  }

  /**
   * Calculate days until a date from reference date
   */
  private calculateDaysUntil(targetDate: Date, referenceDate: Date): number {
    const timeDiff = targetDate.getTime() - referenceDate.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if an area has a contract warning (< 90 days until expiry)
   */
  private hasContractWarning(area: Area, referenceDate: Date): boolean {
    if (!area.currentTenant) {
      return false;
    }

    const daysUntil = this.calculateDaysUntil(area.currentTenant.leaseEnd, referenceDate);
    return daysUntil >= 0 && daysUntil <= 90;
  }

  /**
   * Update contract warnings for all areas based on reference date
   */
  updateContractWarnings(areas: Area[], referenceDate: Date): void {
    areas.forEach(area => {
      if (area.currentTenant) {
        const daysUntil = this.calculateDaysUntil(area.currentTenant.leaseEnd, referenceDate);
        area.currentTenant.daysUntilExpiry = daysUntil;
        area.currentTenant.hasWarning = daysUntil >= 0 && daysUntil <= 90;
      }
    });
  }

  /**
   * Check if area is currently in inactive period
   */
  private isCurrentlyInactive(area: Area, referenceDate: Date): boolean {
    if (!area.inactivePeriod) {
      return false;
    }

    const refTime = referenceDate.getTime();
    const startTime = area.inactivePeriod.startDate.getTime();
    const endTime = area.inactivePeriod.endDate.getTime();

    return refTime >= startTime && refTime <= endTime;
  }

  /**
   * Update inactive status for all areas based on reference date
   * NOTE: We don't change area.status anymore, just update the inactivePeriod flag
   */
  updateInactiveStatus(areas: Area[], referenceDate: Date): void {
    areas.forEach(area => {
      if (area.inactivePeriod) {
        const isCurrentlyActive = this.isCurrentlyInactive(area, referenceDate);
        area.inactivePeriod.isCurrentlyActive = isCurrentlyActive;

        // Don't set status to 'inactive' - use isActive flag instead
        // If in inactive period, set isActive = false
        if (isCurrentlyActive) {
          area.isActive = false;
        }
      }
    });
  }

  /**
   * Get status distribution for a floor based on current mode and date
   */
  getStatusDistribution(floor: FloorWithAreas): StatusDistribution[] {
    const referenceDate = this.targetDate();
    const areas = this.getAreasForCurrentContext(floor);

    // Update warnings and inactive status based on reference date
    this.updateContractWarnings(areas, referenceDate);
    this.updateInactiveStatus(areas, referenceDate);

    return this.calculateStatusDistribution(areas, referenceDate);
  }

  /**
   * Get status distribution for entire building (all floors combined)
   */
  getBuildingStatusDistribution(): StatusDistribution[] {
    const building = this.buildingData();
    const referenceDate = this.targetDate();

    // Collect all areas from all floors
    const allAreas: Area[] = [];

    building.floors.forEach(floor => {
      const areas = this.getAreasForCurrentContext(floor);
      allAreas.push(...areas);
    });

    // Update warnings and inactive status
    this.updateContractWarnings(allAreas, referenceDate);
    this.updateInactiveStatus(allAreas, referenceDate);

    return this.calculateStatusDistribution(allAreas, referenceDate);
  }

  /**
   * Calculate status distribution from a list of areas
   */
  private calculateStatusDistribution(areas: Area[], referenceDate: Date): StatusDistribution[] {
    // Count areas by status
    const statusCounts = new Map<AreaStatus, { count: number; warningCount: number }>();

    // Initialize all statuses (removed 'inactive' - use isActive flag instead)
    const allStatuses: AreaStatus[] = ['vacant', 'leased', 'quotation', 'unallocated'];
    allStatuses.forEach(status => {
      statusCounts.set(status, { count: 0, warningCount: 0 });
    });

    // Count areas and warnings (only count active areas)
    areas.forEach(area => {
      // Skip inactive areas (isActive = false)
      if (!area.isActive) {
        return;
      }

      const current = statusCounts.get(area.status) || { count: 0, warningCount: 0 };
      current.count++;

      if (this.hasContractWarning(area, referenceDate)) {
        current.warningCount++;
      }

      statusCounts.set(area.status, current);
    });

    // Calculate total for percentages (only active areas)
    const total = areas.filter(a => a.isActive).length;

    // Build distribution array (4 statuses only)
    const distribution: StatusDistribution[] = [
      {
        id: 'unallocated',
        label: 'Unallocated',
        labelTh: 'ยังไม่พร้อม',
        count: statusCounts.get('unallocated')!.count,
        percentage: total > 0 ? (statusCounts.get('unallocated')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('unallocated')!.warningCount,
        color: '#FF6384'
      },
      {
        id: 'quotation',
        label: 'Quotation',
        labelTh: 'คำใบเสนอราคา',
        count: statusCounts.get('quotation')!.count,
        percentage: total > 0 ? (statusCounts.get('quotation')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('quotation')!.warningCount,
        color: '#4CA3FF'
      },
      {
        id: 'leased',
        label: 'Leased',
        labelTh: 'เช่า',
        count: statusCounts.get('leased')!.count,
        percentage: total > 0 ? (statusCounts.get('leased')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('leased')!.warningCount,
        color: '#FFD05F'
      },
      {
        id: 'vacant',
        label: 'Vacant',
        labelTh: 'ว่าง',
        count: statusCounts.get('vacant')!.count,
        percentage: total > 0 ? (statusCounts.get('vacant')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('vacant')!.warningCount,
        color: '#80E08E'
      }
    ];

    return distribution;
  }

  /**
   * Get all floors from the building
   */
  getFloors(): FloorWithAreas[] {
    const building = this.buildingData();
    return building.floors || [];
  }

  /**
   * Get a specific floor by ID
   */
  getFloorById(floorId: string): FloorWithAreas | null {
    const floors = this.getFloors();
    return floors.find(f => f.id === floorId) || null;
  }
}
