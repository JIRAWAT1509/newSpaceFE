// src/app/core/models/finance-document.model.ts

export type DocumentType =
  | 'credit_note'        // ออกใบลดหนี้
  | 'invoice'            // ออกใบแจ้งหนี้
  | 'cancel_invoice'     // ยกเลิกใบแจ้งหนี้
  | 'receipt_credit'     // ใบเสร็จใบลดหนี้
  | 'receipt_invoice'   // ใบเสร็จใบแจ้งหนี้
  | 'receipt_cancel';    // ✅ ออกใบเสร็จใบยกเลิก (ใหม่)

export interface FinanceDocumentConfig {
  type: DocumentType;
  title: string;
  fields: FieldConfig[];
  submitLabel: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'daterange' | 'dropdown';
  disabled?: boolean;
  required?: boolean;
  value?: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface FinanceDocumentFormData {
  documentType: DocumentType;
  customerName?: string;
  documentNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  contractNumber?: string;
  invoiceNumber?: string;
  creditNoteNumber?: string;
  receiptNumber?: string;
  invoiceStatus?: string;
  printStatus?: string;
  transferStatus?: string;
  debtStatus?: string;
  status?: string;
}
