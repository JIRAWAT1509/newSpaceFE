import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Meter, MeterGroup, UtilityRate, MeterType } from '@core/models/meter.model';
import { MOCK_METERS, MOCK_METER_GROUPS, MOCK_UTILITY_RATES } from '@core/data/meter.mock';

export interface SaveReadingParams {
  meterId: string;
  reading: number;
  photos: string[];
}

export interface SaveReadingResult {
  success: boolean;
  message?: string;
}

/**
 * Service สำหรับจัดการข้อมูลมิเตอร์ กลุ่มมิเตอร์ และอัตราค่าบริการ
 * ปัจจุบันใช้ mock data; เมื่อมี API จริงให้เปลี่ยนไปเรียก HTTP ในเมธอดเหล่านี้
 */
@Injectable({
  providedIn: 'root'
})
export class MeterService {

  // Centralized state for utility rates
  private _rates = signal<UtilityRate[]>([...MOCK_UTILITY_RATES]);
  private _groups = signal<MeterGroup[]>([...MOCK_METER_GROUPS]);

  /** Signal-based reactive rates */
  readonly rates = this._rates.asReadonly();
  readonly groups$ = this._groups.asReadonly();

  constructor() {}

  // ==================== METERS ====================

  /**
   * โหลดรายการมิเตอร์ทั้งหมด
   * TODO: แทนที่ด้วย HTTP เช่น this.http.get<Meter[]>(`${apiUrl}/meters`)
   */
  getMeters(): Observable<Meter[]> {
    return of([...MOCK_METERS]).pipe(delay(0));
  }

  /**
   * โหลดกลุ่มมิเตอร์
   * TODO: แทนที่ด้วย HTTP เช่น this.http.get<MeterGroup[]>(`${apiUrl}/meter-groups`)
   */
  getGroups(): Observable<MeterGroup[]> {
    return of([...this._groups()]).pipe(delay(0));
  }

  /**
   * บันทึกค่าอ่านมิเตอร์ (และรูปแนบถ้ามี)
   */
  saveReading(params: SaveReadingParams): Observable<SaveReadingResult> {
    const { meterId, reading, photos } = params;
    console.log('[MeterService] saveReading', { meterId, reading, photoCount: photos?.length ?? 0 });
    return of({ success: true, message: 'บันทึกสำเร็จ' }).pipe(delay(300));
  }

  // ==================== UTILITY RATES ====================

  /**
   * โหลดอัตราค่าบริการทั้งหมด
   */
  getRates(): Observable<UtilityRate[]> {
    return of([...this._rates()]).pipe(delay(0));
  }

  /**
   * ดึงอัตราค่าบริการตามประเภท (active rate)
   */
  getRateByType(type: MeterType): number {
    const rate = this._rates().find(r => r.meterType === type && r.isActive);
    return rate?.rate ?? 0;
  }

  /**
   * ดึง cost rate map สำหรับคำนวณค่าใช้จ่าย
   * ใช้ group rate ก่อน → ถ้าไม่มี ใช้ default rate
   */
  getCostRates(): Record<MeterType, number> {
    const rates = this._rates();
    const result: Record<MeterType, number> = {
      electricity: 0,
      water: 0,
      gas: 0,
      ac: 0
    };
    for (const r of rates) {
      if (r.isActive) {
        result[r.meterType] = r.rate;
      }
    }
    return result;
  }

  /**
   * ดึง rate สำหรับมิเตอร์เฉพาะตัว (ตาม group rate หรือ default)
   */
  getRateForMeter(meterId: string, meterType: MeterType): number {
    // Check group-specific rate first
    const groups = this._groups();
    const meterGroup = groups.find(g => g.meterIds.includes(meterId));
    if (meterGroup && meterGroup.rate > 0) {
      return meterGroup.rate;
    }
    // Fallback to default rate
    return this.getRateByType(meterType);
  }

  /**
   * อัพเดทอัตราค่าบริการ
   */
  updateRate(rateId: string, newRate: number): Observable<{ success: boolean }> {
    this._rates.update(rates =>
      rates.map(r => r.id === rateId ? { ...r, rate: newRate } : r)
    );
    console.log('[MeterService] updateRate', { rateId, newRate });
    return of({ success: true }).pipe(delay(200));
  }

  /**
   * สร้างอัตราค่าบริการใหม่
   */
  createRate(rate: Omit<UtilityRate, 'id'>): Observable<UtilityRate> {
    const newRate: UtilityRate = {
      ...rate,
      id: `RATE-${Date.now()}`
    };
    this._rates.update(rates => [...rates, newRate]);
    console.log('[MeterService] createRate', newRate);
    return of(newRate).pipe(delay(200));
  }

  // ==================== GROUPS WITH RATES ====================

  /**
   * บันทึกกลุ่มมิเตอร์พร้อมอัตราค่าบริการ
   */
  saveGroup(group: MeterGroup): Observable<{ success: boolean }> {
    const groups = this._groups();
    const existingIdx = groups.findIndex(g => g.id === group.id);

    if (existingIdx >= 0) {
      // Update
      this._groups.update(gs => gs.map(g => g.id === group.id ? group : g));
    } else {
      // Create
      this._groups.update(gs => [...gs, group]);
    }

    console.log('[MeterService] saveGroup', group);
    return of({ success: true }).pipe(delay(200));
  }

  /**
   * ลบกลุ่มมิเตอร์
   */
  deleteGroup(groupId: string): Observable<{ success: boolean }> {
    this._groups.update(gs => gs.filter(g => g.id !== groupId));
    console.log('[MeterService] deleteGroup', groupId);
    return of({ success: true }).pipe(delay(200));
  }
}
