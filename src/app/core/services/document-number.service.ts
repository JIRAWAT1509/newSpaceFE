// src/app/core/services/document-number.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentNumberService {

  private counters = {
    credit_note: 1,
    invoice: 1,
    receipt: 1
  };

  /**
   * Generate เลขที่เอกสารใหม่
   */
  generateDocumentNumber(type: 'credit_note' | 'invoice' | 'receipt'): string {
    const prefix = {
      credit_note: 'CN',
      invoice: 'INV',
      receipt: 'RCP'
    };

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const counter = String(this.counters[type]).padStart(5, '0');

    this.counters[type]++;

    return `${prefix[type]}${year}${month}${counter}`;
  }
}
