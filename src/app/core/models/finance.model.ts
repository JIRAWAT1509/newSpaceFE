// finance.model.ts - Complete finance data models

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
  status: 'new' | 'warning' | 'critical'; // new=<30days, warning=30-90, critical=>90
}

export interface DebtStatusConfig {
  label: string;
  icon: string;
  color: string;
  description: string; // ✅ เพิ่ม
}

export interface Invoice {
  id: string;
  contractNumber: string;
  customerName: string;
  collectionItem: string;
  amount: number;
  startDate: string;
  status: 'ready' | 'open' | 'cancel';
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

export const DEBT_STATUS_CONFIG = {
  new: {
    label: 'เพิ่งเกิดขึ้น',
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
    label: 'วิกฤต',
    icon: 'pi-times-circle',
    color: 'text-red-600',
    description: 'หนี้ที่เกินกำหนดชำระมากแล้ว ต้องดำเนินการเร่งด่วน'
  }
} as const;
