// meter.mock.ts - UPDATED Mock data with Group support

import { Meter, MeterStats, MeterGroup } from '@core/models/meter.model';

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
    unit: 'kWh',
    groupIds: ['GRP-001'] // Building A - Floor 1 Electric
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
    unit: 'kWh',
    groupIds: ['GRP-001'] // Building A - Floor 1 Electric
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
    unit: 'kWh',
    groupIds: [] // No group assigned
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
    unit: 'm³',
    groupIds: ['GRP-002'] // Building B - Water System
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
    unit: 'm³',
    groupIds: ['GRP-002'] // Building B - Water System
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
    unit: 'm³',
    groupIds: [] // No group assigned
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
    unit: 'kWh',
    groupIds: ['GRP-003'] // Zone C - AC Units
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
    unit: 'kWh',
    groupIds: ['GRP-001', 'GRP-004'] // Multiple groups: Building A + Critical Systems
  }
];

// Mock Meter Groups
export const MOCK_METER_GROUPS: MeterGroup[] = [
  {
    id: 'GRP-001',
    name: 'Building A - Floor 1 Electric',
    description: 'All electricity meters on Building A, Floor 1',
    meterIds: ['MTR-001', 'MTR-002', 'MTR-008'],
    createdDate: '2025-01-01',
    updatedDate: '2025-01-10'
  },
  {
    id: 'GRP-002',
    name: 'Building B - Water System',
    description: 'Water meters across all floors in Building B',
    meterIds: ['MTR-004', 'MTR-005'],
    createdDate: '2025-01-05',
    updatedDate: '2025-01-12'
  },
  {
    id: 'GRP-003',
    name: 'Zone C - AC Units',
    description: 'Air conditioning units in Zone C',
    meterIds: ['MTR-007'],
    createdDate: '2025-01-08',
    updatedDate: '2025-01-13'
  },
  {
    id: 'GRP-004',
    name: 'Critical Systems',
    description: 'Meters for critical infrastructure that require priority monitoring',
    meterIds: ['MTR-008'],
    createdDate: '2025-01-10',
    updatedDate: '2025-01-13'
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

// Helper function to get meters by group
export function getMetersByGroup(groupId: string): Meter[] {
  return MOCK_METERS.filter(m => m.groupIds.includes(groupId));
}

// Helper function to get meters without any group
export function getMetersWithoutGroup(): Meter[] {
  return MOCK_METERS.filter(m => m.groupIds.length === 0);
}

// Helper function to get groups that a meter belongs to
export function getGroupsForMeter(meterId: string): MeterGroup[] {
  const meter = MOCK_METERS.find(m => m.id === meterId);
  if (!meter) return [];

  return MOCK_METER_GROUPS.filter(g => meter.groupIds.includes(g.id));
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

// Helper function to get group statistics
export function getGroupStats(groupId: string): {
  totalMeters: number;
  activeMeters: number;
  pendingMeters: number;
  totalConsumption: number;
} {
  const meters = getMetersByGroup(groupId);

  return {
    totalMeters: meters.length,
    activeMeters: meters.filter(m => m.status === 'active').length,
    pendingMeters: meters.filter(m => m.status === 'pending').length,
    totalConsumption: meters.reduce((sum, m) =>
      sum + (m.currentReading - m.previousReading), 0
    )
  };
}
