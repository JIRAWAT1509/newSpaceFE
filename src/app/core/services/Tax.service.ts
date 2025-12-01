import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Models
export interface VATTax {
  id?: number;
  code: string;
  name: string;
  rate: number;
  sapAccountCode: string;
  accountNumber: string;
  relatedAccountNumber: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface WithholdingTax {
  id?: number;
  code: string;
  name: string;
  rate: number;
  accountNumber: string;
  relatedAccountNumber: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/tax`;

  // ==================== VAT TAX ENDPOINTS ====================

  /**
   * Get all VAT taxes
   */
  getVATTaxes(): Observable<VATTax[]> {
    return this.http.get<VATTax[]>(`${this.apiUrl}/vat`);
  }

  /**
   * Get VAT tax by ID
   */
  getVATById(id: number): Observable<VATTax> {
    return this.http.get<VATTax>(`${this.apiUrl}/vat/${id}`);
  }

  /**
   * Create new VAT tax
   */
  createVAT(data: VATTax): Observable<VATTax> {
    return this.http.post<VATTax>(`${this.apiUrl}/vat`, data);
  }

  /**
   * Update existing VAT tax
   */
  updateVAT(id: number, data: VATTax): Observable<VATTax> {
    return this.http.put<VATTax>(`${this.apiUrl}/vat/${id}`, data);
  }

  /**
   * Delete VAT tax
   */
  deleteVAT(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vat/${id}`);
  }

  /**
   * Search VAT taxes
   */
  searchVAT(query: string): Observable<VATTax[]> {
    return this.http.get<VATTax[]>(`${this.apiUrl}/vat/search`, {
      params: { q: query }
    });
  }

  // ==================== WITHHOLDING TAX ENDPOINTS ====================

  /**
   * Get all withholding taxes
   */
  getWithholdingTaxes(): Observable<WithholdingTax[]> {
    return this.http.get<WithholdingTax[]>(`${this.apiUrl}/withholding`);
  }

  /**
   * Get withholding tax by ID
   */
  getWithholdingById(id: number): Observable<WithholdingTax> {
    return this.http.get<WithholdingTax>(`${this.apiUrl}/withholding/${id}`);
  }

  /**
   * Create new withholding tax
   */
  createWithholding(data: WithholdingTax): Observable<WithholdingTax> {
    return this.http.post<WithholdingTax>(`${this.apiUrl}/withholding`, data);
  }

  /**
   * Update existing withholding tax
   */
  updateWithholding(id: number, data: WithholdingTax): Observable<WithholdingTax> {
    return this.http.put<WithholdingTax>(`${this.apiUrl}/withholding/${id}`, data);
  }

  /**
   * Delete withholding tax
   */
  deleteWithholding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/withholding/${id}`);
  }

  /**
   * Search withholding taxes
   */
  searchWithholding(query: string): Observable<WithholdingTax[]> {
    return this.http.get<WithholdingTax[]>(`${this.apiUrl}/withholding/search`, {
      params: { q: query }
    });
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Delete multiple VAT taxes
   */
  bulkDeleteVAT(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/vat/bulk-delete`, { ids });
  }

  /**
   * Delete multiple withholding taxes
   */
  bulkDeleteWithholding(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/withholding/bulk-delete`, { ids });
  }

  /**
   * Toggle active status for VAT tax
   */
  toggleVATStatus(id: number, isActive: boolean): Observable<VATTax> {
    return this.http.patch<VATTax>(`${this.apiUrl}/vat/${id}/status`, { isActive });
  }

  /**
   * Toggle active status for withholding tax
   */
  toggleWithholdingStatus(id: number, isActive: boolean): Observable<WithholdingTax> {
    return this.http.patch<WithholdingTax>(`${this.apiUrl}/withholding/${id}/status`, { isActive });
  }
}
