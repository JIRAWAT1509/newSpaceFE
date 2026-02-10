// finance.mock.ts - Complete mock data

import { FinanceStats, Debt, Invoice, Receipt } from './../models/finance.model';

export const MOCK_FINANCE_STATS: FinanceStats = {
  totalItems: 73,
  invoicesIssued: 19,
  taxInvoicesIssued: 40,
  totalOutstanding: 14
};

export const MOCK_DEBTS: Debt[] = [
  {
    id: 'D001',
    description: 'ค่าเช่าพื้นที่ - เดือน ธ.ค. 2568',
    customerName: 'บริษัท ABC จำกัด',
    contractFile: 'CONTRACT-2024-001.pdf',
    amount: 125000,
    dueDate: '2024-12-31',
    overdueDays: 5,
    status: 'new'
  },
  {
    id: 'D002',
    description: 'ค่าเช่าพื้นที่ + ค่าบริการ',
    customerName: 'ร้าน XYZ',
    contractFile: 'CONTRACT-2024-045.pdf',
    amount: 85000,
    dueDate: '2024-10-15',
    overdueDays: 75,
    status: 'warning'
  },
  {
    id: 'D003',
    description: 'ค่าเช่าพื้นที่ - Q3',
    customerName: 'บริษัท DEF จำกัด',
    contractFile: 'CONTRACT-2024-012.pdf',
    amount: 250000,
    dueDate: '2024-07-01',
    overdueDays: 180,
    status: 'critical'
  },
  {
    id: 'D004',
    description: 'ค่าเช่าพื้นที่ - เดือน พ.ย.',
    customerName: 'ห้างหุ้นส่วน GHI',
    contractFile: 'CONTRACT-2024-023.pdf',
    amount: 95000,
    dueDate: '2024-11-30',
    overdueDays: 35,
    status: 'warning'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV001',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพ ื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV002',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV003',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV004',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV005',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV006',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV007',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  }
];

export const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'REC001',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'open'
  },
  {
    id: 'REC002',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'open'
  },
  {
    id: 'REC003',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'open'
  },
  {
    id: 'REC004',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมหญิง',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'cancel'
  },
  {
    id: 'REC005',
    contractNumber: 'COWBP125070001',
    customerName: 'กรุณาเลือก',
    collectionItem: 'กรุณาเลือก',
    amount: 0,
    startDate: '2025-01-12',
    status: 'cancel'
  }
];

// finance.mock.ts - แก้ไข ISSUED_DOCUMENTS

export const ISSUED_DOCUMENTS: Record<string, {
  hasCreditNote: boolean;
  hasInvoice: boolean;
  hasCancelInvoice: boolean;  // ✅ เพิ่ม
}> = {
  'D001': { hasCreditNote: false, hasInvoice: false, hasCancelInvoice: false },
  'D002': { hasCreditNote: true, hasInvoice: false, hasCancelInvoice: false },
  'D003': { hasCreditNote: false, hasInvoice: true, hasCancelInvoice: false },
  'D004': { hasCreditNote: true, hasInvoice: true, hasCancelInvoice: true }
};
