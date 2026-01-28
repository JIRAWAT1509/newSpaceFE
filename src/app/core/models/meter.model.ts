// meter.model.ts - UPDATED with Group support

import { getFacilitiesUtilitiesConfig, getModuleColor, getModuleLabel, getModuleLabelEn, getModuleIcon } from '../services/ui-settings';

export interface Meter {
  id: string;
  roomNumber: string;
  tenantName: string;
  meterType: MeterType;
  meterNumber: string;
  installationDate: string;
  currentReading: number;
  previousReading: number;
  averageConsumption: number;
  expectedMin: number;
  expectedMax: number;
  lastUpdated: string;
  status: MeterStatus;
  unit: string;
  groupIds: string[]; // NEW: Array of group IDs this meter belongs to
}

export interface MeterGroup {
  id: string;
  name: string;
  description: string;
  meterIds: string[]; // Array of meter IDs in this group
  createdDate: string;
  updatedDate: string;
}

export type MeterType = 'electricity' | 'water' | 'gas' | 'ac';
export type MeterStatus = 'active' | 'inactive' | 'pending';

export interface MeterStats {
  totalActiveMeters: number;
  pendingReadings: number;
  lastMonthConsumption: number;
  lastMonthConsumptionUnit: string;
  costSavings: number;
  changePercent: {
    meters: number;
    pending: number;
    consumption: number;
    savings: number;
  };
}

export interface MeterReading {
  meterId: string;
  reading: number;
  readingDate: string;
  readBy: string;
  notes?: string;
}

// Default labels (fallback)
const DEFAULT_METER_TYPE_LABELS: Record<MeterType, { TH: string; EN: string; icon: string; color: string }> = {
  electricity: {
    TH: 'ไฟฟ้า',
    EN: 'Electricity',
    icon: 'pi-bolt',
    color: '#FFD700'
  },
  water: {
    TH: 'น้ำ',
    EN: 'Water',
    icon: 'pi-droplet',
    color: '#4CA3FF'
  },
  gas: {
    TH: 'แก๊ส',
    EN: 'Gas',
    icon: 'pi-fire',
    color: '#FF6384'
  },
  ac: {
    TH: 'แอร์',
    EN: 'Air Conditioning',
    icon: 'pi-sun',
    color: '#80E08E'
  }
};

/**
 * Get meter type labels with config override and fallback
 * This function reads from module config but falls back to defaults
 * IMPORTANT: This does NOT affect data fetching - only presentation (colors/labels/icons)
 */
export const getMeterTypeLabel = (type: MeterType): { TH: string; EN: string; icon: string; color: string } => {
  try {
    const config = getFacilitiesUtilitiesConfig();
    const defaultLabel = DEFAULT_METER_TYPE_LABELS[type];
    
    // Get from config with fallback - prioritize labelsEn for English
    const labelTh = getModuleLabel('facilitiesUtilities', type) || defaultLabel.TH;
    const labelEn = getModuleLabelEn('facilitiesUtilities', type) || defaultLabel.EN;
    const color = getModuleColor('facilitiesUtilities', type) || defaultLabel.color;
    const icon = getModuleIcon('facilitiesUtilities', type) || defaultLabel.icon;
    
    // Check if config has meterTypes override (legacy support)
    const meterTypeConfig = config.meterTypes?.[type];
    const finalLabelEn = meterTypeConfig?.label || labelEn;
    const finalIcon = meterTypeConfig?.icon || icon;
    const finalColor = meterTypeConfig?.color || color;
    
    return {
      TH: labelTh,
      EN: finalLabelEn,
      icon: finalIcon,
      color: finalColor,
    };
  } catch (error) {
    // Fallback to defaults on any error
    console.warn('Error loading meter type config, using defaults:', error);
    return DEFAULT_METER_TYPE_LABELS[type];
  }
};

/**
 * Legacy export for backward compatibility
 * NOTE: This is now a function that returns fresh values from config
 * Components should use getMeterTypeLabel() directly for better performance
 */
export const getMeterTypeLabels = (): Record<MeterType, { TH: string; EN: string; icon: string; color: string }> => {
  return {
    electricity: getMeterTypeLabel('electricity'),
    water: getMeterTypeLabel('water'),
    gas: getMeterTypeLabel('gas'),
    ac: getMeterTypeLabel('ac')
  };
};

/**
 * Legacy constant - now returns fresh values each time
 * @deprecated Use getMeterTypeLabel() or getMeterTypeLabels() instead
 */
export const METER_TYPE_LABELS: Record<MeterType, { TH: string; EN: string; icon: string; color: string }> = {
  get electricity() { return getMeterTypeLabel('electricity'); },
  get water() { return getMeterTypeLabel('water'); },
  get gas() { return getMeterTypeLabel('gas'); },
  get ac() { return getMeterTypeLabel('ac'); }
};

export const METER_STATUS_LABELS: Record<MeterStatus, { TH: string; EN: string; COLOR: string }> = {
  active: { TH: 'ใช้งาน', EN: 'Active', COLOR: '#10B981' },
  inactive: { TH: 'ไม่ใช้งาน', EN: 'Inactive', COLOR: '#6B7280' },
  pending: { TH: 'รอบันทึก', EN: 'Pending', COLOR: '#F59E0B' }
};
