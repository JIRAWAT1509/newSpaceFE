import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Meter, MeterGroup } from '@core/models/meter.model';
import { MOCK_METERS, MOCK_METER_GROUPS } from '@core/data/meter.mock';

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
 * Service สำหรับจัดการข้อมูลมิเตอร์และกลุ่มมิเตอร์
 * ปัจจุบันใช้ mock data; เมื่อมี API จริงให้เปลี่ยนไปเรียก HTTP ในเมธอดเหล่านี้
 */
@Injectable({
  providedIn: 'root'
})
export class MeterService {

  constructor() {}

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
    return of([...MOCK_METER_GROUPS]).pipe(delay(0));
  }

  /**
   * บันทึกค่าอ่านมิเตอร์ (และรูปแนบถ้ามี)
   * ปัจจุบันจำลองความสำเร็จ; เมื่อมี API ให้ส่ง POST ไปที่ backend
   */
  saveReading(params: SaveReadingParams): Observable<SaveReadingResult> {
    const { meterId, reading, photos } = params;
    // จำลองการส่งไป backend
    console.log('[MeterService] saveReading', { meterId, reading, photoCount: photos?.length ?? 0 });
    return of({ success: true, message: 'บันทึกสำเร็จ' }).pipe(delay(300));
  }
}
