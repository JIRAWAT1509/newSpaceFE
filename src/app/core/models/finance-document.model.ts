//finance-document.model.ts

export type DocumentType =
  | 'credit_note'
  | 'invoice'
  | 'cancel_invoice'
  | 'receipt_credit'
  | 'receipt_invoice'
  | 'receipt_cancel';

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
  dateFrom?: string;
  dateTo?: string;
  contractNumber?: string;
  invoiceNumber?: string;
  creditNoteNumber?: string;
  receiptNumber?: string;
  cancelInvoiceNumber?: string;
  invoiceStatus?: string;
  printStatus?: string;
  transferStatus?: string;
  debtStatus?: string;
  status?: string;
  branch?: string;
  cancelReason?: string;
  cnStatus?: string;
  cnDate?: string;
  postingDate?: string;
  referenceNo?: string;
  newInvoiceNo?: string;
  systemRecordDate?: string;
  currency?: string;
  exchangeRate?: number;
  customerCode?: string;
  customerNameTh?: string;
  customerNameEn?: string;
  address?: string;
  category?: string;
  cnReasonCode?: string;
  cnReasonDescription?: string;
  remarks?: string;
}
