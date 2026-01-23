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
  new: { color: 'rgb(var(--success))', icon: 'pi-circle-fill', label: 'NEW' },
  warning: { color: 'rgb(var(--warning))', icon: 'pi-exclamation-circle', label: '1-3 เดือน' },
  critical: { color: 'rgb(var(--danger))', icon: 'pi-times-circle', label: 'เกิน 3 เดือน' }
};
