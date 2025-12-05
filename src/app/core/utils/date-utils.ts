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
