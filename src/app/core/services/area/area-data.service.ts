// src/app/core/services/area/area-data.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { Building } from '../../models/building.model';
import { Floor, FloorPlanVersion } from '../../models/floor.model';
import { Area, AreaStatus } from '../../models/area.model';
import { getAllBuildingsData } from '../../data/area-index';
import { getModuleColor, getModuleLabel, getModuleLabelEn } from '../ui-settings';

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
  providedIn: 'root'
})
export class AreaDataService {
  private buildingsData = signal<BuildingWithFloors[]>(getAllBuildingsData());
  private currentBuildingId = signal<string>(getAllBuildingsData()[0].id);
  private currentMode = signal<ViewMode>('normal');
  private targetDate = signal<Date>(new Date());
  private selectedFloorId = signal<string | null>(null);

  // ✅ Public signals
  readonly buildings = this.buildingsData.asReadonly();
  readonly mode = this.currentMode.asReadonly();
  readonly selectedDate = this.targetDate.asReadonly();
  readonly currentFloorId = this.selectedFloorId.asReadonly();

  // ✅ building ปัจจุบัน computed จาก currentBuildingId
  readonly building = computed(() =>
    this.buildingsData().find(b => b.id === this.currentBuildingId())
    ?? this.buildingsData()[0]
  );

  // ✅ floors ของ building ปัจจุบัน — reactive
  readonly floors = computed(() => this.building()?.floors ?? []);

  // ✅ floor ปัจจุบัน — reactive
  readonly currentFloor = computed(() => {
    const floorId = this.selectedFloorId();
    if (!floorId) return null;
    return this.floors().find(f => f.id === floorId) ?? null;
  });

  // ✅ status distribution ระดับ building — reactive
  readonly buildingStatusDistribution = computed(() =>
    this._calcBuildingStatusDistribution()
  );

  // ✅ status distribution ระดับ floor ปัจจุบัน — reactive
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
    this.buildingsData.update(list => [...list, newBuilding]);
    this.currentBuildingId.set(building.id);
    this.selectedFloorId.set(null);
  }

  setCurrentBuilding(buildingId: string): void {
    this.currentBuildingId.set(buildingId);
    const building = this.buildingsData().find(b => b.id === buildingId);
    const firstFloor = building?.floors?.[0];
    this.selectedFloorId.set(firstFloor?.id ?? null);
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
    this.buildingsData.update(list =>
      list.map(b =>
        b.id === this.currentBuildingId()
          ? { ...b, floors: [...b.floors, floorWithAreas] }
          : b
      )
    );
  }

  updateArea(updatedArea: Area): void {
    this.buildingsData.update(buildings =>
      buildings.map(building =>
        building.id === this.currentBuildingId()
          ? {
              ...building,
              floors: building.floors.map(floor =>
                floor.id === updatedArea.floorId
                  ? {
                      ...floor,
                      areas: floor.areas.map(area =>
                        area.id === updatedArea.id ? updatedArea : area
                      )
                    }
                  : floor
              )
            }
          : building
      )
    );
  }

  // ============================================================
  // Non-reactive helpers (ยังเก็บไว้ backward compat)
  // ============================================================

  /** @deprecated ใช้ computed `floors` แทน */
  getFloors(): FloorWithAreas[] {
    return this.floors();
  }

  /** @deprecated ใช้ computed `currentFloor` แทน */
  getFloorById(floorId: string): FloorWithAreas | null {
    return this.floors().find(f => f.id === floorId) ?? null;
  }

  /** @deprecated ใช้ computed `currentFloor` แทน */
  getCurrentFloor(): FloorWithAreas | null {
    return this.currentFloor();
  }

  /** @deprecated ใช้ computed `currentFloorStatusDistribution` แทน */
  getStatusDistribution(floor: FloorWithAreas): StatusDistribution[] {
    return this._calcFloorStatusDistribution(floor);
  }

  /** @deprecated ใช้ computed `buildingStatusDistribution` แทน */
  getBuildingStatusDistribution(): StatusDistribution[] {
    return this._calcBuildingStatusDistribution();
  }

  // ============================================================
  // Floor Plan Version
  // ============================================================

  getVersionForDate(floor: Floor, date: Date): FloorPlanVersion | null {
    const targetTime = date.getTime();
    return floor.floorPlanVersions.find(v => {
      const validFromTime = v.validFrom.getTime();
      const validUntilTime = v.validUntil ? v.validUntil.getTime() : Infinity;
      return targetTime >= validFromTime && targetTime <= validUntilTime;
    }) || null;
  }

  getLatestVersion(floor: Floor): FloorPlanVersion | null {
    const currentVersion = floor.floorPlanVersions.find(v => v.validUntil === null);
    if (currentVersion) return currentVersion;
    return floor.floorPlanVersions
      .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())[0] || null;
  }

  getAreasForVersion(floor: FloorWithAreas, versionId: string): Area[] {
    if (!floor.areas?.length) return [];
    return floor.areas.filter(area =>
      area.floorPlanVersionId === versionId && !area.isDeleted
    );
  }

  getAreasForCurrentContext(floor: FloorWithAreas): Area[] {
    const mode = this.currentMode();
    const date = this.targetDate();
    const version = mode === 'normal'
      ? this.getLatestVersion(floor)
      : this.getVersionForDate(floor, date);
    if (!version) return [];
    return this.getAreasForVersion(floor, version.id);
  }

  // ============================================================
  // Warnings / Inactive
  // ============================================================

  private calculateDaysUntil(targetDate: Date, referenceDate: Date): number {
    return Math.floor((targetDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private hasContractWarning(area: Area, referenceDate: Date): boolean {
    if (!area.currentTenant) return false;
    const daysUntil = this.calculateDaysUntil(area.currentTenant.leaseEnd, referenceDate);
    return daysUntil >= 0 && daysUntil <= 90;
  }

  updateContractWarnings(areas: Area[], referenceDate: Date): void {
    areas.forEach(area => {
      if (area.currentTenant) {
        const daysUntil = this.calculateDaysUntil(area.currentTenant.leaseEnd, referenceDate);
        area.currentTenant.daysUntilExpiry = daysUntil;
        area.currentTenant.hasWarning = daysUntil >= 0 && daysUntil <= 90;
      }
    });
  }

  private isCurrentlyInactive(area: Area, referenceDate: Date): boolean {
    if (!area.inactivePeriod) return false;
    const refTime = referenceDate.getTime();
    return refTime >= area.inactivePeriod.startDate.getTime()
      && refTime <= area.inactivePeriod.endDate.getTime();
  }

  updateInactiveStatus(areas: Area[], referenceDate: Date): void {
    areas.forEach(area => {
      if (area.inactivePeriod) {
        const isCurrentlyActive = this.isCurrentlyInactive(area, referenceDate);
        area.inactivePeriod.isCurrentlyActive = isCurrentlyActive;
        if (isCurrentlyActive) area.isActive = false;
      }
    });
  }

  // ============================================================
  // Private calculation (ทั้งคู่อ่าน signal ผ่าน this.xxx()
  // จึง reactive เมื่อถูกเรียกจาก computed())
  // ============================================================

  private _calcBuildingStatusDistribution(): StatusDistribution[] {
    const building = this.building();        // reactive dependency
    const referenceDate = this.targetDate(); // reactive dependency
    const allAreas: Area[] = [];
    building.floors.forEach(floor => {
      const areas = this.getAreasForCurrentContext(floor);
      allAreas.push(...areas);
    });
    this.updateContractWarnings(allAreas, referenceDate);
    this.updateInactiveStatus(allAreas, referenceDate);
    return this.calculateStatusDistribution(allAreas, referenceDate);
  }

  private _calcFloorStatusDistribution(floor: FloorWithAreas): StatusDistribution[] {
    const referenceDate = this.targetDate(); // reactive dependency
    const areas = this.getAreasForCurrentContext(floor);
    this.updateContractWarnings(areas, referenceDate);
    this.updateInactiveStatus(areas, referenceDate);
    return this.calculateStatusDistribution(areas, referenceDate);
  }

  private calculateStatusDistribution(areas: Area[], referenceDate: Date): StatusDistribution[] {
    const statusCounts = new Map<AreaStatus, { count: number; warningCount: number }>();
    const allStatuses: AreaStatus[] = ['vacant', 'leased', 'quotation', 'unallocated'];
    allStatuses.forEach(status => statusCounts.set(status, { count: 0, warningCount: 0 }));

    areas.forEach(area => {
      if (!area.isActive) return;
      const current = statusCounts.get(area.status) || { count: 0, warningCount: 0 };
      current.count++;
      if (this.hasContractWarning(area, referenceDate)) current.warningCount++;
      statusCounts.set(area.status, current);
    });

    const total = areas.filter(a => a.isActive).length;

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
        percentage: total > 0 ? (statusCounts.get('unallocated')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('unallocated')!.warningCount,
        color: getStatusColor('unallocated')
      },
      {
        id: 'quotation',
        label: getStatusLabel('quotation', false),
        labelTh: getStatusLabel('quotation', true),
        count: statusCounts.get('quotation')!.count,
        percentage: total > 0 ? (statusCounts.get('quotation')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('quotation')!.warningCount,
        color: getStatusColor('quotation')
      },
      {
        id: 'leased',
        label: getStatusLabel('leased', false),
        labelTh: getStatusLabel('leased', true),
        count: statusCounts.get('leased')!.count,
        percentage: total > 0 ? (statusCounts.get('leased')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('leased')!.warningCount,
        color: getStatusColor('leased')
      },
      {
        id: 'vacant',
        label: getStatusLabel('vacant', false),
        labelTh: getStatusLabel('vacant', true),
        count: statusCounts.get('vacant')!.count,
        percentage: total > 0 ? (statusCounts.get('vacant')!.count / total) * 100 : 0,
        warningCount: statusCounts.get('vacant')!.warningCount,
        color: getStatusColor('vacant')
      }
    ];
  }
}
