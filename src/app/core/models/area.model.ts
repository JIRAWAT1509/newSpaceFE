// src/app/core/models/area.model.ts

export interface Area {
  id: string;
  floorId: string;
  roomNumber: string;         // "OP-001", "LOG-02", "KK-05"
  type: AreaType;
  status: AreaStatus;

  // Single position (label + dot bound together)
  position: {
    x: number;                // 0-100% from left
    y: number;                // 0-100% from top
  };

  // Which floor plan version this area belongs to
  floorPlanVersionId: string;

  // Area properties
  size: number;               // Square meters
  monthlyRent?: number;

  // Area plan (detailed room layout)
  areaPlanImage?: string;     // URL to room layout image
  areaPlanWidth?: number;
  areaPlanHeight?: number;

  // Current lease info
  currentTenant?: Tenant;

  // Inactive period (for maintenance/renovation)
  inactivePeriod?: InactivePeriod;

  // Flags
  isActive: boolean;          // true = shown on map, false = hidden in inactive list
  isDeleted: boolean;         // Soft delete

  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  name: string;
  nameTh: string;
  nameEn: string;
  contactEmail?: string;
  contactPhone?: string;

  leaseStart: Date;
  leaseEnd: Date;
  monthlyRent: number;

  // Contract warning (auto-calculated)
  hasWarning: boolean;        // true if < 3 months until expiry
  daysUntilExpiry: number;    // calculated from today
}

export interface InactivePeriod {
  startDate: Date;
  endDate: Date;
  reason: string;             // "ปรับปรุง" | "ปิดชั่วคราว"
  reasonTh: string;
  reasonEn: string;
  notes?: string;
  isCurrentlyActive: boolean; // Auto-calculated based on today's date
}

export type AreaType = 'log' | 'kiosk' | 'open-plan';

export type AreaStatus =
  | 'unallocated'   // ว่าง (not ready/empty)
  | 'quotation'     // จอง (reserved/quoted)
  | 'leased'        // เช่า (currently rented)
  | 'vacant';       // ว่าง (ready to rent)

// Helper type for status labels
export interface AreaStatusLabel {
  id: AreaStatus;
  labelTh: string;
  labelEn: string;
  color: string;
}

// Helper type for area type labels
export interface AreaTypeLabel {
  id: AreaType;
  labelTh: string;
  labelEn: string;
  icon: string;
}
