// src/app/core/services/area/area-data.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { Building } from '../../models/building.model';
import { Floor, FloorPlanVersion } from '../../models/floor.model';
import { Area, AreaStatus } from '../../models/area.model';
import { getAllBuildingsData } from '../../data/area-index';
import {
  getModuleColor,
  getModuleLabel,
  getModuleLabelEn,
} from '../ui-settings';

export interface BuildingWithFloors extends Building {
  floors: FloorWithAreas[];
}

export interface FloorWithAreas extends Floor {
  areas: Area[];
}

export interface StatusDistribution {
  id: AreaStatus;
  label: string;
  labelTh: string;
  count: number;
  percentage: number;
  warningCount: number;
  color: string;
}

export type ViewMode = 'normal' | 'pre-rent';

@Injectable({
  providedIn: 'root',
})
export class AreaDataService {
  private buildingsData = signal<BuildingWithFloors[]>(getAllBuildingsData());
  private currentBuildingId = signal<string>(getAllBuildingsData()[0].id);
  private currentMode = signal<ViewMode>('normal');
  private targetDate = signal<Date>(new Date());
  private selectedFloorId = signal<string | null>(null);

  readonly buildings = this.buildingsData.asReadonly();
  readonly mode = this.currentMode.asReadonly();
  readonly selectedDate = this.targetDate.asReadonly();
  readonly currentFloorId = this.selectedFloorId.asReadonly();

  readonly building = computed(
    () =>
      this.buildingsData().find((b) => b.id === this.currentBuildingId()) ??
      this.buildingsData()[0],
  );

  readonly floors = computed(() => this.building()?.floors ?? []);

  readonly currentFloor = computed(() => {
    const floorId = this.selectedFloorId();
    if (!floorId) return null;
    return this.floors().find((f) => f.id === floorId) ?? null;
  });

  readonly buildingStatusDistribution = computed(() =>
    this._calcBuildingStatusDistribution(),
  );

  readonly currentFloorStatusDistribution = computed(() => {
    const floor = this.currentFloor();
    if (!floor) return [];
    return this._calcFloorStatusDistribution(floor);
  });

  constructor() {
    console.log('AreaDataService initialized');
    console.log('All buildings:', this.buildingsData());

    const building = this.building();
    if (building?.floors?.length > 0) {
      this.selectedFloorId.set(building.floors[0].id);
    }
  }

  // ============================================================
  // Setters
  // ============================================================

  addBuilding(building: Building): void {
    const newBuilding: BuildingWithFloors = { ...building, floors: [] };
    this.buildingsData.update((list) => [...list, newBuilding]);
    this.currentBuildingId.set(building.id);
    this.selectedFloorId.set(null);
  }

  updateBuilding(building: Building): void {
    this.buildingsData.update((list) =>
      list.map((b) =>
        b.id === building.id ? { ...b, ...building } : b,
      ),
    );
  }

  toggleBuildingActive(buildingId: string): void {
    this.buildingsData.update((list) =>
      list.map((b) =>
        b.id === buildingId ? { ...b, isActive: !b.isActive } : b,
      ),
    );

    // ถ้า deactivate building ที่กำลัง active อยู่ ให้ fallback ไป building active แรกที่หาได้
    const toggled = this.buildingsData().find((b) => b.id === buildingId);
    if (toggled && !toggled.isActive && this.currentBuildingId() === buildingId) {
      const fallback = this.buildingsData().find((b) => b.isActive);
      if (fallback) {
        this.setCurrentBuilding(fallback.id);
      }
    }
  }

  setCurrentBuilding(buildingId: string): void {
    this.currentBuildingId.set(buildingId);
    const building = this.buildingsData().find((b) => b.id === buildingId);
    const firstActiveFloor = building?.floors?.find((f) => f.isActive !== false);
    this.selectedFloorId.set(firstActiveFloor?.id ?? null);
  }

  setCurrentFloor(floorId: string): void {
    this.selectedFloorId.set(floorId);
  }

  setMode(mode: ViewMode): void {
    this.currentMode.set(mode);
  }

  setTargetDate(date: Date): void {
    this.targetDate.set(date);
  }

  addFloor(floor: Floor): void {
    const floorWithAreas: FloorWithAreas = { ...floor, areas: [] };
    this.buildingsData.update((list) =>
      list.map((b) =>
        b.id === floor.buildingId
          ? { ...b, floors: [...b.floors, floorWithAreas] }
          : b,
      ),
    );
  }

  updateFloor(floor: Floor): void {
    this.buildingsData.update((list) =>
      list.map((b) =>
        b.id === floor.buildingId
          ? {
              ...b,
              floors: b.floors.map((f) =>
                f.id === floor.id ? { ...f, ...floor } : f,
              ),
            }
          : b,
      ),
    );
  }

  toggleFloorActive(floorId: string): void {
    this.buildingsData.update((list) =>
      list.map((b) => ({
        ...b,
        floors: b.floors.map((f) =>
          f.id === floorId ? { ...f, isActive: !f.isActive } : f,
        ),
      })),
    );

    // ถ้า deactivate floor ที่กำลัง selected อยู่ ให้ fallback ไป floor active แรก
    if (this.selectedFloorId() === floorId) {
      const toggled = this.building().floors.find((f) => f.id === floorId);
      if (toggled && !toggled.isActive) {
        const fallback = this.building().floors.find((f) => f.isActive !== false);
        this.selectedFloorId.set(fallback?.id ?? null);
      }
    }
  }

  updateArea(updatedArea: Area): void {
    this.buildingsData.update((buildings) =>
      buildings.map((building) =>
        building.id === this.currentBuildingId()
          ? {
              ...building,
              floors: building.floors.map((floor) =>
                floor.id === updatedArea.floorId
                  ? {
                      ...floor,
                      areas: floor.areas.map((area) =>
                        area.id === updatedArea.id ? updatedArea : area,
                      ),
                    }
                  : floor,
              ),
            }
          : building,
      ),
    );
  }

  addArea(newArea: Area): void {
    this.buildingsData.update((buildings) =>
      buildings.map((building) =>
        building.id === this.currentBuildingId()
          ? {
              ...building,
              floors: building.floors.map((floor) =>
                floor.id === newArea.floorId
                  ? { ...floor, areas: [...floor.areas, newArea] }
                  : floor,
              ),
            }
          : building,
      ),
    );
  }

  // ============================================================
  // Non-reactive helpers
  // ============================================================

  getFloors(): FloorWithAreas[] {
    return this.floors();
  }

  getFloorById(floorId: string): FloorWithAreas | null {
    return this.floors().find((f) => f.id === floorId) ?? null;
  }

  getCurrentFloor(): FloorWithAreas | null {
    return this.currentFloor();
  }

  getStatusDistribution(floor: FloorWithAreas): StatusDistribution[] {
    return this._calcFloorStatusDistribution(floor);
  }

  getBuildingStatusDistribution(): StatusDistribution[] {
    return this._calcBuildingStatusDistribution();
  }

  // ============================================================
  // Floor Plan Version
  // ============================================================

  private toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }

  getVersionForDate(floor: Floor, date: Date): FloorPlanVersion | null {
    const targetTime = date.getTime();
    return (
      floor.floorPlanVersions.find((v) => {
        const validFromTime = this.toDate(v.validFrom).getTime();
        const validUntilTime = v.validUntil
          ? this.toDate(v.validUntil).getTime()
          : Infinity;
        return targetTime >= validFromTime && targetTime <= validUntilTime;
      }) || null
    );
  }

  getLatestVersion(floor: Floor): FloorPlanVersion | null {
    const currentVersion = floor.floorPlanVersions.find(
      (v) => v.validUntil === null,
    );
    if (currentVersion) return currentVersion;
    return (
      floor.floorPlanVersions.sort(
        (a, b) =>
          this.toDate(b.validFrom).getTime() -
          this.toDate(a.validFrom).getTime(),
      )[0] || null
    );
  }

  getAreasForVersion(floor: FloorWithAreas, versionId: string): Area[] {
    if (!floor.areas?.length) return [];
    return floor.areas.filter(
      (area) => area.floorPlanVersionId === versionId && !area.isDeleted,
    );
  }

  getAreasForCurrentContext(floor: FloorWithAreas): Area[] {
    const mode = this.currentMode();
    const date = this.targetDate();
    const version =
      mode === 'normal'
        ? this.getLatestVersion(floor)
        : this.getVersionForDate(floor, date);
    if (!version) return [];
    return this.getAreasForVersion(floor, version.id);
  }

  // ============================================================
  // Warnings / Inactive
  // ============================================================

  private calculateDaysUntil(
    targetDate: Date | string,
    referenceDate: Date,
  ): number {
    const target = this.toDate(targetDate);
    return Math.floor(
      (target.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private hasContractWarning(area: Area, referenceDate: Date): boolean {
    if (!area.currentTenant) return false;
    const daysUntil = this.calculateDaysUntil(
      area.currentTenant.leaseEnd,
      referenceDate,
    );
    return daysUntil >= 0 && daysUntil <= 90;
  }

  updateContractWarnings(areas: Area[], referenceDate: Date): void {
    areas.forEach((area) => {
      if (area.currentTenant) {
        const daysUntil = this.calculateDaysUntil(
          area.currentTenant.leaseEnd,
          referenceDate,
        );
        area.currentTenant.daysUntilExpiry = daysUntil;
        area.currentTenant.hasWarning = daysUntil >= 0 && daysUntil <= 90;
      }
    });
  }

  private isCurrentlyInactive(area: Area, referenceDate: Date): boolean {
    if (!area.inactivePeriod) return false;
    const refTime = referenceDate.getTime();
    const start = this.toDate(area.inactivePeriod.startDate).getTime();
    const end = this.toDate(area.inactivePeriod.endDate).getTime();
    return refTime >= start && refTime <= end;
  }

  updateInactiveStatus(areas: Area[], referenceDate: Date): void {
    areas.forEach((area) => {
      if (area.inactivePeriod) {
        const isCurrentlyActive = this.isCurrentlyInactive(area, referenceDate);
        area.inactivePeriod.isCurrentlyActive = isCurrentlyActive;
        if (isCurrentlyActive) area.isActive = false;
      }
    });
  }

  // ============================================================
  // Private calculation
  // ============================================================

  private _calcBuildingStatusDistribution(): StatusDistribution[] {
    const building = this.building();
    const referenceDate = this.targetDate();
    const allAreas: Area[] = [];
    building.floors.forEach((floor) => {
      const areas = this.getAreasForCurrentContext(floor);
      allAreas.push(...areas);
    });
    this.updateContractWarnings(allAreas, referenceDate);
    this.updateInactiveStatus(allAreas, referenceDate);
    return this.calculateStatusDistribution(allAreas, referenceDate);
  }

  private _calcFloorStatusDistribution(
    floor: FloorWithAreas,
  ): StatusDistribution[] {
    const referenceDate = this.targetDate();
    const areas = this.getAreasForCurrentContext(floor);
    this.updateContractWarnings(areas, referenceDate);
    this.updateInactiveStatus(areas, referenceDate);
    return this.calculateStatusDistribution(areas, referenceDate);
  }

  private calculateStatusDistribution(
    areas: Area[],
    referenceDate: Date,
  ): StatusDistribution[] {
    const statusCounts = new Map<
      AreaStatus,
      { count: number; warningCount: number }
    >();
    const allStatuses: AreaStatus[] = [
      'vacant',
      'leased',
      'quotation',
      'unallocated',
    ];
    allStatuses.forEach((status) =>
      statusCounts.set(status, { count: 0, warningCount: 0 }),
    );

    areas.forEach((area) => {
      if (!area.isActive) return;
      const current = statusCounts.get(area.status) || {
        count: 0,
        warningCount: 0,
      };
      current.count++;
      if (this.hasContractWarning(area, referenceDate)) current.warningCount++;
      statusCounts.set(area.status, current);
    });

    const total = areas.filter((a) => a.isActive).length;

    const getStatusColor = (statusId: AreaStatus): string => {
      const configColor = getModuleColor('areaAvailability', statusId);
      if (configColor && configColor !== '#000000') {
        const hex = configColor.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      const fallbackMap: Record<AreaStatus, string> = {
        unallocated: 'rgb(var(--danger))',
        quotation: 'rgb(var(--info))',
        leased: 'rgb(var(--warning))',
        vacant: 'rgb(var(--success))',
      };
      return fallbackMap[statusId] || 'rgb(var(--muted))';
    };

    const getStatusLabel = (statusId: AreaStatus, isTh: boolean): string => {
      if (isTh) {
        const configLabel = getModuleLabel('areaAvailability', statusId);
        if (configLabel && configLabel !== statusId) return configLabel;
        const fallbackLabels: Record<AreaStatus, string> = {
          unallocated: 'ยังไม่พร้อม',
          quotation: 'คำใบเสนอราคา',
          leased: 'เช่า',
          vacant: 'ว่าง',
        };
        return fallbackLabels[statusId] || statusId;
      } else {
        const configLabelEn = getModuleLabelEn('areaAvailability', statusId);
        if (configLabelEn && configLabelEn !== statusId) return configLabelEn;
        const fallbackLabels: Record<AreaStatus, string> = {
          unallocated: 'Unallocated',
          quotation: 'Quotation',
          leased: 'Leased',
          vacant: 'Vacant',
        };
        return fallbackLabels[statusId] || statusId;
      }
    };

    return [
      {
        id: 'unallocated',
        label: getStatusLabel('unallocated', false),
        labelTh: getStatusLabel('unallocated', true),
        count: statusCounts.get('unallocated')!.count,
        percentage:
          total > 0
            ? (statusCounts.get('unallocated')!.count / total) * 100
            : 0,
        warningCount: statusCounts.get('unallocated')!.warningCount,
        color: getStatusColor('unallocated'),
      },
      {
        id: 'quotation',
        label: getStatusLabel('quotation', false),
        labelTh: getStatusLabel('quotation', true),
        count: statusCounts.get('quotation')!.count,
        percentage:
          total > 0 ? (statusCounts.get('quotation')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('quotation')!.warningCount,
        color: getStatusColor('quotation'),
      },
      {
        id: 'leased',
        label: getStatusLabel('leased', false),
        labelTh: getStatusLabel('leased', true),
        count: statusCounts.get('leased')!.count,
        percentage:
          total > 0 ? (statusCounts.get('leased')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('leased')!.warningCount,
        color: getStatusColor('leased'),
      },
      {
        id: 'vacant',
        label: getStatusLabel('vacant', false),
        labelTh: getStatusLabel('vacant', true),
        count: statusCounts.get('vacant')!.count,
        percentage:
          total > 0 ? (statusCounts.get('vacant')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('vacant')!.warningCount,
        color: getStatusColor('vacant'),
      },
    ];
  }
}
