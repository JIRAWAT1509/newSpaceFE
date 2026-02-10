import { computeExpectedRange, formatMinForDisplay, formatRangeForDisplay } from './meter-range.util';
import { Meter } from '@core/models/meter.model';

function meter(overrides: Partial<Meter>): Meter {
  return {
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
    groupIds: [],
    ...overrides
  };
}

describe('meter-range.util', () => {
  describe('computeExpectedRange', () => {
    it('a) avgMonthly=155, lastReading=1450 -> expected range around 1550~1620 (or similar)', () => {
      const m = meter({ currentReading: 1450, averageConsumption: 155 });
      const result = computeExpectedRange(m);
      expect(result.hasRange).toBe(true);
      expect(result.max).not.toBeNull();
      expect(result.min).toBeGreaterThan(1450);
      expect(result.max!).toBeGreaterThan(result.min);
      // tolerance = max(10, 38.75) = 39; min = 1450 + 116 = 1566; max = 1450 + 194 = 1644
      expect(result.min).toBeGreaterThanOrEqual(1560);
      expect(result.max!).toBeLessThanOrEqual(1650);
    });

    it('b) avgMonthly missing -> show minimum allowed only (hasRange false)', () => {
      const m = meter({ currentReading: 1000, averageConsumption: 0 });
      const result = computeExpectedRange(m);
      expect(result.hasRange).toBe(false);
      expect(result.max).toBeNull();
      expect(result.min).toBe(1000 + 0.01);
    });

    it('c) avgMonthly very small -> ensure range (max > min)', () => {
      const m = meter({ currentReading: 100, averageConsumption: 5 });
      const result = computeExpectedRange(m);
      expect(result.hasRange).toBe(true);
      expect(result.max).not.toBeNull();
      expect(result.max!).toBeGreaterThan(result.min);
      expect(result.min).toBeGreaterThan(100);
    });

    it('expectedMin is strictly greater than lastReading', () => {
      const m = meter({ currentReading: 500, averageConsumption: 100 });
      const result = computeExpectedRange(m);
      expect(result.min).toBeGreaterThan(500);
    });

    it('when avgMonthly is null/undefined, returns minimum only', () => {
      const m = meter({ currentReading: 200, averageConsumption: undefined as unknown as number });
      const result = computeExpectedRange(m);
      expect(result.hasRange).toBe(false);
      expect(result.max).toBeNull();
      expect(result.min).toBe(200.01);
    });
  });

  describe('formatMinForDisplay / formatRangeForDisplay', () => {
    it('formats min and range for display', () => {
      expect(formatMinForDisplay(1450.01)).toMatch(/1,450\.01/);
      expect(formatRangeForDisplay(1566, 1644)).toMatch(/1,566.*1,644/);
    });
  });
});
