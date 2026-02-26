// company.service.ts - ข้อมูล Company / สาขา (ใช้ร่วมกับ Company Data และ User Branch Access)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface CompanyBranch {
  OU_CODE: string;
  STORE_SEQ?: number;
  STORE_CODE: string;
  SHORT_NAME: string;
  STORE_ID: string;
  COMPANY_CODE: string;
  STORE_NAME_T: string;
  STORE_NAME_E?: string;
  ADDRESS_T1?: string;
  ADDRESS_E1?: string;
  TAX_ID?: string;
  MANAGER?: string;
  PLAZA_MANAGER?: string;
  FILE_PASSWORD?: string;
  USE_PRICE_LIST?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) {}

  /**
   * ดึงรายการสาขาจาก Company (ใช้ใน Branch Access Control และหน้าข้อมูลบริษัท)
   */
  getBranches(): Observable<CompanyBranch[]> {
    // Mock data - เดียวกับ Company Data > Branch
    const mockBranches: CompanyBranch[] = [
      {
        OU_CODE: '001',
        STORE_SEQ: 5,
        STORE_CODE: '701',
        SHORT_NAME: '2701',
        STORE_NAME_T: '-',
        STORE_NAME_E: '-',
        ADDRESS_T1: '-',
        ADDRESS_E1: '1988 Bangkapi Huai-Khwang Bangkok 10310',
        STORE_ID: '701',
        TAX_ID: '1111111111111',
        MANAGER: '001 Sinde Manage',
        COMPANY_CODE: '2700',
        PLAZA_MANAGER: '0001',
        FILE_PASSWORD: '12345',
        USE_PRICE_LIST: 'Y'
      },
      {
        OU_CODE: '001',
        STORE_SEQ: 20,
        STORE_CODE: 'BP2',
        SHORT_NAME: 'WBP2',
        STORE_NAME_T: 'Warehouse Bangphee 2',
        STORE_NAME_E: 'Warehouse Bangphee 2',
        ADDRESS_T1: '1 หมู 2 บางพลี',
        STORE_ID: 'BP2',
        TAX_ID: '12345678900983',
        COMPANY_CODE: 'SCAS',
        FILE_PASSWORD: 'ๅ/-ภถ',
        USE_PRICE_LIST: 'N'
      }
    ];

    return of(mockBranches).pipe(delay(200));

    /* เมื่อมี API จริง ให้ใช้แบบนี้แทน:
    return this.http.post<{ data: CompanyBranch[] }>('/API_URL/GetBranches', {}).pipe(
      map(res => res.data),
      catchError(() => of([]))
    );
    */
  }
}
