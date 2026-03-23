// finance.model.ts

export interface FinanceStats {
  totalItems: number;
  invoicesIssued: number;
  taxInvoicesIssued: number;
  totalOutstanding: number;
}

export interface Debt {
  id: string;
  description: string;
  customerName: string;
  contractFile: string;
  amount: number;
  dueDate: string;
  overdueDays: number;
  status: 'new' | 'warning' | 'critical';
  branchId?: string;
}

export interface DebtStatusConfig {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface Invoice {
  id: string;
  contractFile?: string;
  contractNumber: string;
  customerName: string;
  collectionItem: string;
  amount: number;
  startDate: string;
  status: 'ready' | 'open' | 'cancel';
  branchId?: string; 
}

export interface InvoiceStatusConfig {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface Receipt {
  id: string;
  contractNumber: string;
  customerName: string;
  collectionItem: string;
  amount: number;
  startDate: string;
  status: 'open' | 'cancel';
}

export interface CreditNote {
  id: string;
  cnNumber: string;
  refInvoiceNumber: string;
  customerName: string;
  amount: number;
  date: string;
  reason: string;
  status: 'open' | 'cancel';
}

export const DEBT_STATUS_CONFIG = {
  new: {
    label: 'New',
    icon: 'pi-info-circle',
    color: 'text-green-600',
    description: 'หนี้ที่เกิดขึ้นใหม่ ยังไม่เกินกำหนดชำระมากนัก'
  },
  warning: {
    label: 'เตือน',
    icon: 'pi-exclamation-triangle',
    color: 'text-yellow-600',
    description: 'หนี้ที่เกินกำหนดชำระแล้ว ควรติดตามการชำระเงิน'
  },
  critical: {
    label: 'ด่วน',
    icon: 'pi-times-circle',
    color: 'text-red-600',
    description: 'หนี้ที่เกินกำหนดชำระมากแล้ว ต้องดำเนินการเร่งด่วน'
  }
} as const;
