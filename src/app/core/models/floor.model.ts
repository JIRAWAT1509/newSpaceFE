// src/app/core/models/floor.model.ts

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  floorName: string;         // "Fl. 55"
  floorNameTh: string;       // "ชั้น 55"
  floorNameEn: string;       // "Floor 55"

  // Multiple floor plan versions over time
  floorPlanVersions: FloorPlanVersion[];

  createdAt: Date;
  updatedAt: Date;
}

export interface FloorPlanVersion {
  id: string;
  floorId: string;
  versionNumber: number;      // 1, 2, 3...
  planImage: string;          // URL to floor plan image
  planImageWidth: number;     // Original image width in pixels
  planImageHeight: number;    // Original image height in pixels

  // Time period this version is valid
  validFrom: Date;            // Start date (required)
  validUntil: Date | null;    // End date (null = current/latest version)

  // Renovation details
  renovationReason?: string;  // "ปรับปรุงห้อง 5-6 เป็นห้องใหญ่"
  renovationReasonTh?: string;
  renovationReasonEn?: string;
  renovationNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}
