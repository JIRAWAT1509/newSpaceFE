import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { Contract } from '@core/models/contract.model';
import { MOCK_CONTRACTS } from '@core/data/contract.mock';
import { environment } from '@env/environment';

const STORAGE_KEY = 'contract_management_list';

export type CancelType = 'quotation' | 'booking' | 'lease';

export interface CancelResult {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Contract`;

  /** โหลดรายการสัญญาจาก localStorage หรือ mock */
  getContracts(): Contract[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Contract[];
        return Array.isArray(parsed) ? parsed : [...MOCK_CONTRACTS];
      }
    } catch {
      // ignore
    }
    return [...MOCK_CONTRACTS];
  }

  /** บันทึกรายการสัญญาไป localStorage (ใช้หลังเพิ่ม/แก้ไข/ยกเลิก) */
  saveContracts(list: Contract[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('ContractService.saveContracts failed', e);
    }
  }

  /** API: ยกเลิกใบเสนอราคา */
  cancelQuotation(contractId: string): Observable<CancelResult> {
    return this.http
      .post<CancelResult>(`${this.apiUrl}/CancelQuotation`, { contractId })
      .pipe(
        catchError(() => of({ success: false, message: 'เรียก API ไม่ได้ ใช้การอัปเดตท้องถิ่น' }))
      );
  }

  /** API: ยกเลิกสัญญาจอง */
  cancelBooking(contractId: string): Observable<CancelResult> {
    return this.http
      .post<CancelResult>(`${this.apiUrl}/CancelBooking`, { contractId })
      .pipe(
        catchError(() => of({ success: false, message: 'เรียก API ไม่ได้ ใช้การอัปเดตท้องถิ่น' }))
      );
  }

  /** API: ยกเลิกสัญญาเช่า / ภาคผนวก */
  terminateLease(contractId: string): Observable<CancelResult> {
    return this.http
      .post<CancelResult>(`${this.apiUrl}/TerminateLease`, { contractId })
      .pipe(
        catchError(() => of({ success: false, message: 'เรียก API ไม่ได้ ใช้การอัปเดตท้องถิ่น' }))
      );
  }
}
