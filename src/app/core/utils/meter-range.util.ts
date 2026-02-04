import { Meter } from '@core/models/meter.model';

/** Result of expected range calculation. Either a real range (min < max) or minimum-only. */
export interface ExpectedRangeResult {
  /** Minimum allowed reading (always > lastReading). */
  min: number;
  /** Maximum of expected range; only set when hasRange is true. */
  max: number | null;
  /** True when we show "Expected range: X - Y"; false when we show "Minimum allowed: X" only. */
  hasRange: boolean;
}

const MIN_GAP = 1; // Ensure max - min >= 1 when we have a "range"
const EPSILON = 0.01; // Minimum step above last reading

/**
 * Compute expected range for current meter reading (this month).
 * - expectedMin must be strictly greater than lastReading.
 * - expectedMax must be greater than expectedMin (real range).
 * Uses Avg Monthly when available; otherwise minimum-only.
 */
export function computeExpectedRange(meter: Meter): ExpectedRangeResult {
  const lastReading = meter.currentReading ?? 0;
  const avgMonthly = meter.averageConsumption;

  // No valid avg monthly -> do NOT show a fake range; minimum only
  if (avgMonthly == null || avgMonthly <= 0) {
    const min = lastReading + EPSILON;
    return { min, max: null, hasRange: false };
  }

  // tolerance = max(10, round(avgMonthly * 0.25))
  const tolerance = Math.max(10, Math.round(avgMonthly * 0.25));
  let expectedMin = lastReading + Math.max(EPSILON, avgMonthly - tolerance);
  let expectedMax = lastReading + (avgMonthly + tolerance);

  // Ensure strictly greater than lastReading
  expectedMin = Math.max(expectedMin, lastReading + EPSILON);
  expectedMax = Math.max(expectedMax, expectedMin + MIN_GAP);

  // If they ended up equal or too close, expand to a reasonable range
  if (expectedMax - expectedMin < MIN_GAP) {
    expectedMax = expectedMin + MIN_GAP;
  }

  return {
    min: expectedMin,
    max: expectedMax,
    hasRange: true
  };
}

/**
 * Format min value for display (e.g. "1,450.01").
 */
export function formatMinForDisplay(min: number): string {
  return min.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format range "X - Y" for display when hasRange is true.
 */
export function formatRangeForDisplay(min: number, max: number): string {
  const minStr = min.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const maxStr = max.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${minStr} - ${maxStr}`;
}

/**
 * Example outputs (for manual verification; call from browser console: runExpectedRangeExamples()):
 * a) avgMonthly=155, lastReading=1450 -> range ~1566 - 1644 (tolerance 39)
 * b) avgMonthly missing/0 -> hasRange false, min = lastReading + 0.01 only
 * c) avgMonthly very small (e.g. 5) -> hasRange true, max > min (gap at least 1)
 */
export function runExpectedRangeExamples(): void {
  const base: Meter = {
    id: '', roomNumber: '', tenantName: '', meterType: 'electricity', meterNumber: '',
    installationDate: '', currentReading: 0, previousReading: 0, averageConsumption: 0,
    expectedMin: 0, expectedMax: 0, lastUpdated: '', status: 'active', unit: 'kWh', groupIds: []
  };
  const examples: Array<{ name: string; meter: Meter }> = [
    { name: 'a) avgMonthly=155, lastReading=1450', meter: { ...base, currentReading: 1450, averageConsumption: 155 } },
    { name: 'b) avgMonthly missing', meter: { ...base, currentReading: 1000, averageConsumption: 0 } },
    { name: 'c) avgMonthly very small', meter: { ...base, currentReading: 100, averageConsumption: 5 } }
  ];
  examples.forEach(({ name, meter: m }) => {
    const r = computeExpectedRange(m);
    console.log(`[meter-range] ${name}`, r);
  });
}
