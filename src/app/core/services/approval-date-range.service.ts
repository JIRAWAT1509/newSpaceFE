// approval-date-range.service.ts - เก็บช่วงวันที่สำหรับหน้า MY TASK / Centralized approval
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApprovalDateRangeService {
  private readonly defaultDaysBack = 90;

  private dateFrom = signal<Date | null>(null);
  private dateTo = signal<Date | null>(null);

  readonly from = computed(() => this.dateFrom());
  readonly to = computed(() => this.dateTo());

  constructor() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - this.defaultDaysBack);
    this.dateFrom.set(from);
    this.dateTo.set(to);
  }

  setRange(from: Date | null, to: Date | null): void {
    this.dateFrom.set(from);
    this.dateTo.set(to);
  }

  setFrom(value: Date | null): void {
    this.dateFrom.set(value);
  }

  setTo(value: Date | null): void {
    this.dateTo.set(value);
  }

  getFrom(): Date | null {
    return this.dateFrom();
  }

  getTo(): Date | null {
    return this.dateTo();
  }

  /** ใช้กรองว่า date อยู่ภายในช่วงหรือไม่ */
  isDateInRange(dateStr: string | undefined | null): boolean {
    if (!dateStr) return true;
    const from = this.dateFrom();
    const to = this.dateTo();
    const d = this.parseDate(dateStr);
    if (!d) return true;
    if (from && d < from) return false;
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      if (d > toEnd) return false;
    }
    return true;
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const m = value.match(/\/Date\((\d+)\)\//);
    if (m) return new Date(parseInt(m[1], 10));
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
}
