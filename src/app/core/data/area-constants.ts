// src/app/core/data/area-constants.ts

import { AreaStatus, AreaStatusLabel, AreaTypeLabel } from '../models/area.model';

// Status labels with colors (removed 'inactive' - use isActive flag instead)
export const AREA_STATUS_LABELS: AreaStatusLabel[] = [
  {
    id: 'unallocated',
    labelTh: 'ยังไม่พร้อม',
    labelEn: 'Unallocated',
    color: '#FF6384'
  },
  {
    id: 'quotation',
    labelTh: 'คำใบเสนอราคา',
    labelEn: 'Quotation',
    color: '#4CA3FF'
  },
  {
    id: 'leased',
    labelTh: 'เช่า',
    labelEn: 'Leased',
    color: '#FFD05F'
  },
  {
    id: 'vacant',
    labelTh: 'ว่าง',
    labelEn: 'Vacant',
    color: '#80E08E'
  }
];

// Area type labels with icons
export const AREA_TYPE_LABELS: AreaTypeLabel[] = [
  {
    id: 'log',
    labelTh: 'ล็อก',
    labelEn: 'Log',
    icon: 'pi pi-box'
  },
  {
    id: 'kiosk',
    labelTh: 'คีออส',
    labelEn: 'Kiosk',
    icon: 'pi pi-shopping-cart'
  },
  {
    id: 'open-plan',
    labelTh: 'โอเพ่น',
    labelEn: 'Open Plan',
    icon: 'pi pi-building'
  }
];

// Move out category labels
export const MOVE_OUT_CATEGORIES = [
  { id: 'relocation', labelTh: 'ย้ายสถานที่', labelEn: 'Relocation' },
  { id: 'cost', labelTh: 'ค่าใช้จ่ายสูง', labelEn: 'Cost' },
  { id: 'dissatisfaction', labelTh: 'ไม่พอใจ', labelEn: 'Dissatisfaction' },
  { id: 'business-closed', labelTh: 'ปิดกิจการ', labelEn: 'Business Closed' },
  { id: 'other', labelTh: 'อื่นๆ', labelEn: 'Other' }
];

// Helper function to get status color
export function getStatusColor(status: AreaStatus): string {
  const label = AREA_STATUS_LABELS.find(s => s.id === status);
  return label?.color || '#9CA3AF';
}

// Helper function to get status label (Thai)
export function getStatusLabelTh(status: AreaStatus): string {
  const label = AREA_STATUS_LABELS.find(s => s.id === status);
  return label?.labelTh || status;
}

// Helper function to get status label (English)
export function getStatusLabelEn(status: AreaStatus): string {
  const label = AREA_STATUS_LABELS.find(s => s.id === status);
  return label?.labelEn || status;
}
