// vendor-contract.model.ts

export type ContractType = 'Software' | 'Hardware' | 'Disposable' | 'MA' | 'Preventive' | 'SLA' | 'Consulting';
export type ContractStatus = 'Active' | 'Expiring' | 'Expired' | 'Draft';
export type PMStatus = 'Overdue' | 'Due Soon' | 'Scheduled' | 'Completed';

export interface VendorContract {
  id: string;
  name: string;
  type: ContractType;
  building: string;
  vendor: string;
  vendorContact: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorAddress: string;
  owner: string;
  dept: string;
  ownerEmail: string;
  value: number;
  recurring: string;
  payment: string;
  autoRenew: string;
  penalty: string;
  start: string;
  end: string;
  noticePeriod: number;
  status: ContractStatus;
  category: string;
  priority: string;
  pmFreq: string;
  technician: string;
  detail: string;
}

export interface PMTask {
  id: string;
  task: string;
  building: string;
  category: string;
  freq: string;
  lastDone: string;
  nextDue: string;
  tech: string;
  status: PMStatus;
  linked: string;
}

export interface VendorStats {
  totalContracts: number;
  expiringCount: number;
  expiredCount: number;
  totalValue: number;
  expiringCritical: number;
  expiringWarning: number;
}

export const TYPE_COLORS: Record<string, string> = {
  'Software': '#1a6fd4',
  'Hardware': '#22c55e',
  'Disposable': '#06b6d4',
  'MA': '#f59e0b',
  'Preventive': '#8b5cf6',
  'SLA': '#ec4899',
  'Consulting': '#64748b'
};

export const TYPE_BG: Record<string, string> = {
  'Software': '#dbeafe',
  'Hardware': '#dcfce7',
  'Disposable': '#cffafe',
  'MA': '#fef3c7',
  'Preventive': '#f3e8ff',
  'SLA': '#fce7f3',
  'Consulting': '#f1f5f9'
};

export function getDaysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

export function computeStatus(contract: VendorContract): ContractStatus {
  if (contract.status === 'Draft') return 'Draft';
  const days = getDaysUntil(contract.end);
  if (days < 0) return 'Expired';
  if (days <= 90) return 'Expiring';
  return 'Active';
}
