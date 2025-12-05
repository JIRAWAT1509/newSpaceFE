// floor-statistics.model.ts

export interface FloorStatistics {
  FLOOR_ID: string;
  FLOOR_NAME: string;

  // Area Statistics
  TOTAL_AREA_SQM: number;           // Total floor area
  TOTAL_AREAS_COUNT: number;        // Number of rental areas
  OCCUPIED_AREAS_COUNT: number;     // Leased areas
  VACANT_AREAS_COUNT: number;       // Ready to rent
  UNALLOCATED_AREAS_COUNT: number;  // Not ready

  // Financial Statistics
  AVERAGE_RENT_PER_SQM: number;     // Average rent/sqm
  TOTAL_MONTHLY_REVENUE: number;    // Sum of all rents
  OCCUPANCY_RATE: number;           // Percentage (0-100)

  // Area Distribution by Type
  AREA_BY_TYPE: AreaTypeDistribution[];

  // Recommended Store Categories
  RECOMMENDED_CATEGORIES: StoreCategory[];

  // Rent Rate History
  RENT_RATE_HISTORY: RentRateHistoryPoint[];
}

export interface AreaTypeDistribution {
  TYPE: 'log' | 'kiosk' | 'open-plan';
  TYPE_LABEL_TH: string;
  TYPE_LABEL_EN: string;
  COUNT: number;
  TOTAL_AREA_SQM: number;
  AVERAGE_RENT: number;
  COLOR: string;
}

export interface StoreCategory {
  CATEGORY_ID: string;
  CATEGORY_NAME_TH: string;
  CATEGORY_NAME_EN: string;
  RECOMMENDED_SCORE: number;  // 1-5 stars
  REASON_TH: string;
  REASON_EN: string;
}

export interface RentRateHistoryPoint {
  DATE: string;  // /Date(timestamp)/
  AVERAGE_RENT: number;
  LOG_AVERAGE?: number;
  KIOSK_AVERAGE?: number;
  OPEN_PLAN_AVERAGE?: number;
}

// Helper constants
export const AREA_TYPE_LABELS = {
  log: { TH: 'Log', EN: 'Log', COLOR: '#2196F3' },
  kiosk: { TH: 'Kiosk', EN: 'Kiosk', COLOR: '#FF9800' },
  'open-plan': { TH: 'Open Plan', EN: 'Open Plan', COLOR: '#4CAF50' }
};

export const STORE_CATEGORIES = {
  ELECTRONICS: { TH: 'อิเล็กทรอนิกส์', EN: 'Electronics' },
  FASHION: { TH: 'แฟชั่น', EN: 'Fashion' },
  FOOD_BEVERAGE: { TH: 'อาหารและเครื่องดื่ม', EN: 'Food & Beverage' },
  BEAUTY: { TH: 'ความงาม', EN: 'Beauty & Cosmetics' },
  LIFESTYLE: { TH: 'ไลฟ์สไตล์', EN: 'Lifestyle' },
  SERVICES: { TH: 'บริการ', EN: 'Services' },
  SPORTS: { TH: 'กีฬา', EN: 'Sports & Fitness' },
  TOYS: { TH: 'ของเล่น', EN: 'Toys & Games' }
};
