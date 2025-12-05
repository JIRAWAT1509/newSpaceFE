// floor-statistics.mock.ts
import { FloorStatistics, AreaTypeDistribution, StoreCategory, RentRateHistoryPoint } from '@core/models/floor-statistics.model';
import { toDateString } from '@core/utils/date-utils';

// Mock floor statistics data
const FLOOR_STATISTICS_DATA: Record<string, FloorStatistics> = {
  'floor-2m': {
    FLOOR_ID: 'floor-2m',
    FLOOR_NAME: '2M Floor',

    TOTAL_AREA_SQM: 2450.5,
    TOTAL_AREAS_COUNT: 16,
    OCCUPIED_AREAS_COUNT: 10,
    VACANT_AREAS_COUNT: 4,
    UNALLOCATED_AREAS_COUNT: 2,

    AVERAGE_RENT_PER_SQM: 1850,
    TOTAL_MONTHLY_REVENUE: 486000,
    OCCUPANCY_RATE: 62.5,

    AREA_BY_TYPE: [
      {
        TYPE: 'log',
        TYPE_LABEL_TH: 'Log',
        TYPE_LABEL_EN: 'Log',
        COUNT: 8,
        TOTAL_AREA_SQM: 1200,
        AVERAGE_RENT: 42000,
        COLOR: '#2196F3'
      },
      {
        TYPE: 'kiosk',
        TYPE_LABEL_TH: 'Kiosk',
        TYPE_LABEL_EN: 'Kiosk',
        COUNT: 5,
        TOTAL_AREA_SQM: 750,
        AVERAGE_RENT: 28000,
        COLOR: '#FF9800'
      },
      {
        TYPE: 'open-plan',
        TYPE_LABEL_TH: 'Open Plan',
        TYPE_LABEL_EN: 'Open Plan',
        COUNT: 3,
        TOTAL_AREA_SQM: 500.5,
        AVERAGE_RENT: 55000,
        COLOR: '#4CAF50'
      }
    ],

    RECOMMENDED_CATEGORIES: [
      {
        CATEGORY_ID: 'electronics',
        CATEGORY_NAME_TH: 'อิเล็กทรอนิกส์',
        CATEGORY_NAME_EN: 'Electronics',
        RECOMMENDED_SCORE: 5,
        REASON_TH: 'พื้นที่กว้างเหมาะสำหรับการจัดแสดงสินค้า',
        REASON_EN: 'Spacious areas suitable for product displays'
      },
      {
        CATEGORY_ID: 'fashion',
        CATEGORY_NAME_TH: 'แฟชั่น',
        CATEGORY_NAME_EN: 'Fashion',
        RECOMMENDED_SCORE: 4,
        REASON_TH: 'ตำแหน่งดีใกล้ทางเข้าหลัก',
        REASON_EN: 'Good location near main entrance'
      },
      {
        CATEGORY_ID: 'food_beverage',
        CATEGORY_NAME_TH: 'อาหารและเครื่องดื่ม',
        CATEGORY_NAME_EN: 'Food & Beverage',
        RECOMMENDED_SCORE: 5,
        REASON_TH: 'มี Kiosk หลายจุดเหมาะกับร้านอาหารขนาดเล็ก',
        REASON_EN: 'Multiple kiosks perfect for small food shops'
      },
      {
        CATEGORY_ID: 'beauty',
        CATEGORY_NAME_TH: 'ความงาม',
        CATEGORY_NAME_EN: 'Beauty & Cosmetics',
        RECOMMENDED_SCORE: 4,
        REASON_TH: 'พื้นที่ขนาดกลางเหมาะสำหรับร้านเสริมสวย',
        REASON_EN: 'Medium-sized areas suitable for beauty shops'
      }
    ],

    RENT_RATE_HISTORY: generateRentHistory()
  }
};

// Generate 12 months of rent history data
function generateRentHistory(): RentRateHistoryPoint[] {
  const history: RentRateHistoryPoint[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    // Simulate gradual rent increase with some variation
    const baseRent = 1650 + (i * 15);
    const variation = Math.random() * 50 - 25;

    history.push({
      DATE: toDateString(date),
      AVERAGE_RENT: Math.round(baseRent + variation),
      LOG_AVERAGE: Math.round((baseRent + variation) * 1.1),
      KIOSK_AVERAGE: Math.round((baseRent + variation) * 0.75),
      OPEN_PLAN_AVERAGE: Math.round((baseRent + variation) * 1.3)
    });
  }

  return history;
}

// Export helper function
export function getFloorStatistics(floorId: string): FloorStatistics | null {
  return FLOOR_STATISTICS_DATA[floorId] || null;
}

// Generate statistics for any floor (fallback)
export function generateFloorStatistics(floorId: string, floorName: string): FloorStatistics {
  return {
    FLOOR_ID: floorId,
    FLOOR_NAME: floorName,

    TOTAL_AREA_SQM: 2000 + Math.random() * 1000,
    TOTAL_AREAS_COUNT: 12 + Math.floor(Math.random() * 8),
    OCCUPIED_AREAS_COUNT: 8 + Math.floor(Math.random() * 6),
    VACANT_AREAS_COUNT: 3 + Math.floor(Math.random() * 3),
    UNALLOCATED_AREAS_COUNT: 1 + Math.floor(Math.random() * 2),

    AVERAGE_RENT_PER_SQM: 1600 + Math.random() * 400,
    TOTAL_MONTHLY_REVENUE: 400000 + Math.random() * 200000,
    OCCUPANCY_RATE: 50 + Math.random() * 40,

    AREA_BY_TYPE: [
      {
        TYPE: 'log',
        TYPE_LABEL_TH: 'Log',
        TYPE_LABEL_EN: 'Log',
        COUNT: 5 + Math.floor(Math.random() * 3),
        TOTAL_AREA_SQM: 1000 + Math.random() * 300,
        AVERAGE_RENT: 40000 + Math.random() * 10000,
        COLOR: '#2196F3'
      },
      {
        TYPE: 'kiosk',
        TYPE_LABEL_TH: 'Kiosk',
        TYPE_LABEL_EN: 'Kiosk',
        COUNT: 4 + Math.floor(Math.random() * 2),
        TOTAL_AREA_SQM: 600 + Math.random() * 200,
        AVERAGE_RENT: 25000 + Math.random() * 8000,
        COLOR: '#FF9800'
      },
      {
        TYPE: 'open-plan',
        TYPE_LABEL_TH: 'Open Plan',
        TYPE_LABEL_EN: 'Open Plan',
        COUNT: 2 + Math.floor(Math.random() * 2),
        TOTAL_AREA_SQM: 400 + Math.random() * 200,
        AVERAGE_RENT: 50000 + Math.random() * 15000,
        COLOR: '#4CAF50'
      }
    ],

    RECOMMENDED_CATEGORIES: [
      {
        CATEGORY_ID: 'electronics',
        CATEGORY_NAME_TH: 'อิเล็กทรอนิกส์',
        CATEGORY_NAME_EN: 'Electronics',
        RECOMMENDED_SCORE: 4 + Math.floor(Math.random() * 2),
        REASON_TH: 'พื้นที่เหมาะสำหรับการจัดแสดงสินค้า',
        REASON_EN: 'Suitable area for product displays'
      },
      {
        CATEGORY_ID: 'fashion',
        CATEGORY_NAME_TH: 'แฟชั่น',
        CATEGORY_NAME_EN: 'Fashion',
        RECOMMENDED_SCORE: 3 + Math.floor(Math.random() * 2),
        REASON_TH: 'ตำแหน่งดีมีการสัญจรผ่านสูง',
        REASON_EN: 'Good location with high foot traffic'
      }
    ],

    RENT_RATE_HISTORY: generateRentHistory()
  };
}
