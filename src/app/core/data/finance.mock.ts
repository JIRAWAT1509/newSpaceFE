// finance.mock.ts - Complete mock data

import { FinanceStats, Debt, Invoice, Receipt, CreditNote } from './../models/finance.model';

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
  },
  {
    id: 'D005',
    description: 'ค่าเช่าพื้นที่ - เดือน กุมภา.',
    customerName: 'เต๋า',
    contractFile: 'CONTRACT-2025-023.pdf',
    amount: 1000,
    dueDate: '2025-11-30',
    overdueDays: 1,
    status: 'warning'
  }
];

// Mock data (ใบแจ้งหนี้ที่ยังไม่ออกใบเสร็จ)
export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV001',
    contractNumber: 'COWBP125070001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'ready'
  },
  {
    id: 'INV002',
    contractNumber: 'COWBP125070002',
    customerName: 'คุณสมหญิง ค้าขาย',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 35000,
    startDate: '2025-01-15',
    status: 'ready'
  },
  {
    id: 'INV003',
    contractNumber: 'COWBP125070003',
    customerName: 'บริษัท ABC จำกัด',
    collectionItem: 'ค่าเช่าพื้นที่ + ค่าบริการ',
    amount: 50000,
    startDate: '2025-01-10',
    status: 'ready'
  },
  {
    id: 'INV004',
    contractNumber: 'COWBP125070004',
    customerName: 'ร้าน XYZ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 28000,
    startDate: '2025-01-08',
    status: 'ready'
  },
  {
    id: 'INV005',
    contractNumber: 'COWBP125070005',
    customerName: 'คุณสมศักดิ์ ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 42000,
    startDate: '2025-01-20',
    status: 'open'
  },
  {
    id: 'INV006',
    contractNumber: 'COWBP125070006',
    customerName: 'บริษัท DEF จำกัด',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 55000,
    startDate: '2025-01-18',
    status: 'open'
  },
  {
    id: 'INV007',
    contractNumber: 'COWBP125070007',
    customerName: 'ห้างหุ้นส่วน GHI',
    collectionItem: 'ค่าเช่าพื้นที่ + ค่าบริการ',
    amount: 65000,
    startDate: '2025-01-22',
    status: 'open'
  }
];

// Mock data สำหรับรายการรอออกใบเสร็จ (invoices ที่ออกแล้วและรอออกใบเสร็จ)
export const MOCK_RECEIPTS_WAITING: Receipt[] = [
  {
    id: 'RW001',
    contractNumber: 'INV-2025-001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'open'
  },
  {
    id: 'RW002',
    contractNumber: 'INV-2025-002',
    customerName: 'คุณสมหญิง ค้าขาย',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 35000,
    startDate: '2025-01-15',
    status: 'open'
  },
  {
    id: 'RW003',
    contractNumber: 'INV-2025-003',
    customerName: 'บริษัท ABC จำกัด',
    collectionItem: 'ค่าเช่าพื้นที่ + ค่าบริการ',
    amount: 50000,
    startDate: '2025-01-10',
    status: 'open'
  },
  {
    id: 'RW004',
    contractNumber: 'INV-2025-004',
    customerName: 'ร้าน XYZ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 28000,
    startDate: '2025-01-08',
    status: 'open'
  }
];

export const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'REC001',
    contractNumber: 'RCP-2025-001',
    customerName: 'คุณสมชาย ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 25000,
    startDate: '2025-01-12',
    status: 'open'
  },
  {
    id: 'REC002',
    contractNumber: 'RCP-2025-002',
    customerName: 'คุณสมหญิง ค้าขาย',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 35000,
    startDate: '2025-01-15',
    status: 'open'
  },
  {
    id: 'REC003',
    contractNumber: 'RCP-2025-003',
    customerName: 'บริษัท ABC จำกัด',
    collectionItem: 'ค่าเช่าพื้นที่ + ค่าบริการ',
    amount: 50000,
    startDate: '2025-01-10',
    status: 'open'
  },
  {
    id: 'REC004',
    contractNumber: 'RCP-2025-004',
    customerName: 'ร้าน XYZ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 28000,
    startDate: '2025-01-08',
    status: 'cancel'
  },
  {
    id: 'REC005',
    contractNumber: 'RCP-2025-005',
    customerName: 'คุณสมศักดิ์ ธุรกิจ',
    collectionItem: 'ค่าเช่าพื้นที่',
    amount: 42000,
    startDate: '2025-01-20',
    status: 'cancel'
  }
];

export const MOCK_CREDIT_NOTES: CreditNote[] = [
  {
    id: 'CN001',
    cnNumber: 'CN-2025-001',
    refInvoiceNumber: 'INV-2025-001',
    customerName: 'คุณสมชาย ธุรกิจ',
    amount: 5000,
    date: '2025-01-15',
    reason: 'ปรับปรุงราคาเนื่องจากพื้นที่ชำรุด',
    status: 'open'
  },
  {
    id: 'CN002',
    cnNumber: 'CN-2025-002',
    refInvoiceNumber: 'INV-2025-003',
    customerName: 'บริษัท ABC จำกัด',
    amount: 12500,
    date: '2025-01-18',
    reason: 'ยกเลิกบริการเสริมส่วนเกิน',
    status: 'open'
  },
  {
    id: 'CN003',
    cnNumber: 'CN-2025-003',
    refInvoiceNumber: 'INV-2025-007',
    customerName: 'ห้างหุ้นส่วน GHI',
    amount: 2000,
    date: '2025-01-20',
    reason: 'ส่วนลดพิเศษเนื่องจากชำระเงินล่วงหน้า',
    status: 'open'
  },
  {
    id: 'CN004',
    cnNumber: 'CN-2025-004',
    refInvoiceNumber: 'INV-2025-004',
    customerName: 'ร้าน XYZ',
    amount: 28000,
    date: '2025-01-22',
    reason: 'ออกใบลดหนี้ผิดฉบับ',
    status: 'cancel'
  }
];

// ✅ Mock data สำหรับใบลดหนี้ใบเสร็จ (Receipt Credit Notes)
export const MOCK_RECEIPT_CREDIT_NOTES: CreditNote[] = [
  {
    id: 'RCN001',
    cnNumber: 'RCN-2025-001',
    refInvoiceNumber: 'RCP-2025-001',
    customerName: 'คุณสมชาย ธุรกิจ',
    amount: 3000,
    date: '2025-01-16',
    reason: 'ส่วนลดพิเศษจากการชำระเงินทันที',
    status: 'open'
  },
  {
    id: 'RCN002',
    cnNumber: 'RCN-2025-002',
    refInvoiceNumber: 'RCP-2025-002',
    customerName: 'คุณสมหญิง ค้าขาย',
    amount: 7500,
    date: '2025-01-17',
    reason: 'ปรับปรุงราคาตามข้อตกลง',
    status: 'open'
  },
  {
    id: 'RCN003',
    cnNumber: 'RCN-2025-003',
    refInvoiceNumber: 'RCP-2025-003',
    customerName: 'บริษัท ABC จำกัด',
    amount: 5000,
    date: '2025-01-19',
    reason: 'ยกเลิกค่าบริการบางรายการ',
    status: 'open'
  },
  {
    id: 'RCN004',
    cnNumber: 'RCN-2025-004',
    refInvoiceNumber: 'RCP-2025-004',
    customerName: 'ร้าน XYZ',
    amount: 2800,
    date: '2025-01-21',
    reason: 'คืนเงินค่าบริการที่ยกเลิก',
    status: 'open'
  },
  {
    id: 'RCN005',
    cnNumber: 'RCN-2025-005',
    refInvoiceNumber: 'RCP-2025-005',
    customerName: 'คุณสมศักดิ์ ธุรกิจ',
    amount: 10000,
    date: '2025-01-23',
    reason: 'ออกใบลดหนี้ผิดฉบับ',
    status: 'cancel'
  }
];

export const ISSUED_DOCUMENTS: Record<string, {
  hasCreditNote: boolean;
  hasInvoice: boolean;
  hasCancelInvoice: boolean;
}> = {
  'D001': { hasCreditNote: false, hasInvoice: false, hasCancelInvoice: false },
  'D002': { hasCreditNote: true, hasInvoice: false, hasCancelInvoice: false },
  'D003': { hasCreditNote: false, hasInvoice: true, hasCancelInvoice: false },
  'D004': { hasCreditNote: true, hasInvoice: true, hasCancelInvoice: true }
};
