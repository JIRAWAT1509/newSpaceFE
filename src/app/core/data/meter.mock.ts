// meter.mock.ts - Mock data for Meter Management

import { Meter, MeterStats } from '@core/models/meter.model';

export const MOCK_METER_STATS: MeterStats = {
  totalActiveMeters: 127,
  pendingReadings: 23,
  lastMonthConsumption: 45678,
  lastMonthConsumptionUnit: 'kWh',
  costSavings: 12450,
  changePercent: {
    meters: 5.2,
    pending: -12.3,
    consumption: 3.8,
    savings: 8.4
  }
};

export const MOCK_METERS: Meter[] = [
  {
    id: 'MTR-001',
    roomNumber: '101',
    tenantName: 'John Doe',
    meterType: 'electricity',
    meterNumber: 'ELEC-2024-001',
    installationDate: '2024-01-15',
    currentReading: 1450,
    previousReading: 1289,
    averageConsumption: 155,
    expectedMin: 1400,
    expectedMax: 1450,
    lastUpdated: '2024-12-25',
    status: 'active',
    unit: 'kWh'
  },
  {
    id: 'MTR-002',
    roomNumber: '102',
    tenantName: 'Jane Smith',
    meterType: 'electricity',
    meterNumber: 'ELEC-2024-002',
    installationDate: '2024-01-20',
    currentReading: 987,
    previousReading: 822,
    averageConsumption: 165,
    expectedMin: 1140,
    expectedMax: 1180,
    lastUpdated: '2024-12-23',
    status: 'pending',
    unit: 'kWh'
  },
  {
    id: 'MTR-003',
    roomNumber: '103',
    tenantName: 'Mike Johnson',
    meterType: 'electricity',
    meterNumber: 'ELEC-2024-003',
    installationDate: '2024-02-01',
    currentReading: 1567,
    previousReading: 1357,
    averageConsumption: 210,
    expectedMin: 1760,
    expectedMax: 1800,
    lastUpdated: '2024-12-18',
    status: 'pending',
    unit: 'kWh'
  },
  {
    id: 'MTR-004',
    roomNumber: '104',
    tenantName: 'Sarah Williams',
    meterType: 'water',
    meterNumber: 'WATER-2024-001',
    installationDate: '2024-01-15',
    currentReading: 245,
    previousReading: 228,
    averageConsumption: 18,
    expectedMin: 260,
    expectedMax: 270,
    lastUpdated: '2024-12-25',
    status: 'active',
    unit: 'm³'
  },
  {
    id: 'MTR-005',
    roomNumber: '105',
    tenantName: 'David Brown',
    meterType: 'water',
    meterNumber: 'WATER-2024-002',
    installationDate: '2024-01-18',
    currentReading: 189,
    previousReading: 167,
    averageConsumption: 22,
    expectedMin: 210,
    expectedMax: 220,
    lastUpdated: '2024-12-24',
    status: 'pending',
    unit: 'm³'
  },
  {
    id: 'MTR-006',
    roomNumber: '201',
    tenantName: 'Emma Davis',
    meterType: 'gas',
    meterNumber: 'GAS-2024-001',
    installationDate: '2024-02-05',
    currentReading: 456,
    previousReading: 441,
    averageConsumption: 15,
    expectedMin: 470,
    expectedMax: 480,
    lastUpdated: '2024-12-25',
    status: 'active',
    unit: 'm³'
  },
  {
    id: 'MTR-007',
    roomNumber: '202',
    tenantName: 'Robert Wilson',
    meterType: 'ac',
    meterNumber: 'AC-2024-001',
    installationDate: '2024-02-10',
    currentReading: 789,
    previousReading: 678,
    averageConsumption: 111,
    expectedMin: 880,
    expectedMax: 920,
    lastUpdated: '2024-12-22',
    status: 'pending',
    unit: 'kWh'
  },
  {
    id: 'MTR-008',
    roomNumber: '203',
    tenantName: 'Lisa Anderson',
    meterType: 'electricity',
    meterNumber: 'ELEC-2024-004',
    installationDate: '2024-02-12',
    currentReading: 1123,
    previousReading: 998,
    averageConsumption: 125,
    expectedMin: 1220,
    expectedMax: 1260,
    lastUpdated: '2024-12-25',
    status: 'active',
    unit: 'kWh'
  }
];

// Helper function to get meters by type
export function getMetersByType(type: string): Meter[] {
  return MOCK_METERS.filter(m => m.meterType === type);
}

// Helper function to get pending meters
export function getPendingMeters(): Meter[] {
  return MOCK_METERS.filter(m => m.status === 'pending');
}

// Helper function to calculate stats
export function calculateMeterStats(): MeterStats {
  const activeMeters = MOCK_METERS.filter(m => m.status === 'active').length;
  const pendingMeters = MOCK_METERS.filter(m => m.status === 'pending').length;
  const totalConsumption = MOCK_METERS.reduce((sum, m) =>
    sum + (m.currentReading - m.previousReading), 0
  );

  return {
    totalActiveMeters: activeMeters,
    pendingReadings: pendingMeters,
    lastMonthConsumption: totalConsumption,
    lastMonthConsumptionUnit: 'kWh',
    costSavings: totalConsumption * 4.5, // Assume 4.5 baht per unit saved
    changePercent: {
      meters: 5.2,
      pending: -12.3,
      consumption: 3.8,
      savings: 8.4
    }
  };
}
