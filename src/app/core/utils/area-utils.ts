// src/app/core/utils/area-utils.ts

import { Area, Tenant, InactivePeriod } from '../models/area.model';
import { Floor, FloorPlanVersion } from '../models/floor.model';

/**
 * Calculate days until a specific date from today
 */
export function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate and update contract warning for a tenant
 */
export function calculateContractWarning(tenant: Tenant): void {
  const daysUntil = calculateDaysUntil(tenant.leaseEnd);
  tenant.daysUntilExpiry = daysUntil;
  tenant.hasWarning = daysUntil >= 0 && daysUntil <= 90; // 3 months = 90 days
}

/**
 * Check if an inactive period is currently active
 */
export function isInactivePeriodActive(period: InactivePeriod): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(period.startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(period.endDate);
  end.setHours(0, 0, 0, 0);

  return today >= start && today <= end;
}

/**
 * Update inactive period status based on current date
 */
export function updateInactivePeriodStatus(area: Area): void {
  if (!area.inactivePeriod) return;

  area.inactivePeriod.isCurrentlyActive = isInactivePeriodActive(area.inactivePeriod);

  // Update area status if inactive period is active
  if (area.inactivePeriod.isCurrentlyActive) {
    area.status = 'inactive';
  }
}

/**
 * Get floor plan version valid for a specific date
 */
export function getVersionForDate(floor: Floor, targetDate: Date): FloorPlanVersion | null {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  return floor.floorPlanVersions.find(version => {
    const validFrom = new Date(version.validFrom);
    validFrom.setHours(0, 0, 0, 0);

    // Check if date is after validFrom
    if (target < validFrom) return false;

    // If validUntil is null, this is the current version
    if (version.validUntil === null) {
      return target >= validFrom;
    }

    const validUntil = new Date(version.validUntil);
    validUntil.setHours(0, 0, 0, 0);

    return target >= validFrom && target <= validUntil;
  }) || null;
}

/**
 * Get current (latest) floor plan version
 */
export function getCurrentVersion(floor: Floor): FloorPlanVersion | null {
  return floor.floorPlanVersions.find(v => v.validUntil === null) || null;
}

/**
 * Get areas for a specific floor plan version
 */
export function getAreasForVersion(areas: Area[], versionId: string): Area[] {
  return areas.filter(area =>
    area.floorPlanVersionId === versionId &&
    !area.isDeleted
  );
}

/**
 * Check if an area is available on a specific date
 */
export function isAreaAvailableOnDate(area: Area, targetDate: Date): boolean {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  // Check if area is deleted
  if (area.isDeleted) return false;

  // Check inactive period
  if (area.inactivePeriod) {
    const start = new Date(area.inactivePeriod.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(area.inactivePeriod.endDate);
    end.setHours(0, 0, 0, 0);

    if (target >= start && target <= end) {
      return false; // Area is inactive on this date
    }
  }

  // Check if currently leased
  if (area.currentTenant) {
    const leaseStart = new Date(area.currentTenant.leaseStart);
    leaseStart.setHours(0, 0, 0, 0);

    const leaseEnd = new Date(area.currentTenant.leaseEnd);
    leaseEnd.setHours(0, 0, 0, 0);

    if (target >= leaseStart && target <= leaseEnd) {
      return false; // Area is leased on this date
    }
  }

  return true;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `฿${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `฿${(value / 1000).toFixed(1)}K`;
  }
  return `฿${value.toLocaleString()}`;
}

/**
 * Format area size
 */
export function formatAreaSize(sqm: number): string {
  return `${sqm} ตร.ม.`;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    'unallocated': '#FF6384',
    'quotation': '#4CA3FF',
    'leased': '#FFD05F',
    'vacant': '#80E08E',
    'inactive': '#9CA3AF'
  };
  return colorMap[status] || '#9CA3AF';
}

/**
 * Get type icon
 */
export function getTypeIcon(type: string): string {
  const iconMap: { [key: string]: string } = {
    'log': 'pi pi-box',
    'kiosk': 'pi pi-shopping-cart',
    'open-plan': 'pi pi-building'
  };
  return iconMap[type] || 'pi pi-box';
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Group areas by status
 */
export function groupAreasByStatus(areas: Area[]): { [key: string]: Area[] } {
  return areas.reduce((acc, area) => {
    if (!acc[area.status]) {
      acc[area.status] = [];
    }
    acc[area.status].push(area);
    return acc;
  }, {} as { [key: string]: Area[] });
}

/**
 * Group areas by type
 */
export function groupAreasByType(areas: Area[]): { [key: string]: Area[] } {
  return areas.reduce((acc, area) => {
    if (!acc[area.type]) {
      acc[area.type] = [];
    }
    acc[area.type].push(area);
    return acc;
  }, {} as { [key: string]: Area[] });
}

/**
 * Get areas with warnings
 */
export function getAreasWithWarnings(areas: Area[]): Area[] {
  return areas.filter(area => area.currentTenant?.hasWarning);
}

/**
 * Get inactive areas
 */
export function getInactiveAreas(areas: Area[]): Area[] {
  return areas.filter(area => area.status === 'inactive');
}

/**
 * Update all contract warnings in areas array
 */
export function updateAllContractWarnings(areas: Area[]): void {
  areas.forEach(area => {
    if (area.currentTenant) {
      calculateContractWarning(area.currentTenant);
    }
  });
}

/**
 * Update all inactive period statuses in areas array
 */
export function updateAllInactivePeriods(areas: Area[]): void {
  areas.forEach(area => {
    updateInactivePeriodStatus(area);
  });
}
