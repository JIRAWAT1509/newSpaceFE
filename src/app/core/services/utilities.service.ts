import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  /**
   * Format number with commas (e.g., 1000000 -> 1,000,000)
   */
  displayNumber(value: number | string): string {
    if (value === null || value === undefined || value === '') return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Display sum value (integer without decimals)
   */
  displaySumValue(value: number | string): string {
    if (value === null || value === undefined || value === '') return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return Math.round(num).toLocaleString('en-US');
  }

  /**
   * Calculate percentage
   */
  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 1000) / 10;
  }

  /**
   * Format currency (Thai Baht)
   */
  formatCurrency(value: number | string): string {
    if (value === null || value === undefined || value === '') return '฿0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '฿0.00';
    return '฿' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
