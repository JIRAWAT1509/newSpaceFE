// src/app/core/utils/date-utils.ts

/**
 * Convert JavaScript Date to /Date(timestamp)/ format
 */
export function toDateString(date: Date): string {
  return `/Date(${date.getTime()})/`;
}

/**
 * Convert /Date(timestamp)/ format to JavaScript Date
 */
export function fromDateString(dateString: string): Date {
  const timestamp = parseInt(dateString.replace(/\/Date\((\d+)\)\//, '$1'));
  return new Date(timestamp);
}

/**
 * Get current date in /Date(timestamp)/ format
 */
export function nowDateString(): string {
  return toDateString(new Date());
}

/**
 * Parse various date formats to Date object
 */
export function parseToDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const match = value.match(/\/Date\((\d+)\)\//);
    if (match) return new Date(parseInt(match[1], 10));
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/**
 * Format date for display (handles /Date()/, ISO string, Date object)
 */
export function formatDateForDisplay(value: unknown, locale = 'th-TH'): string {
  const date = parseToDate(value);
  if (!date) return typeof value === 'string' ? value : '-';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
