// finance.routes.ts
import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'receipt/daily',
    pathMatch: 'full'
  },

  // Receipts
  {
    path: 'receipt/daily',
    loadComponent: () => import('./pages/receipt/receipt-daily/receipt-daily.component').then(m => m.ReceiptDailyComponent)
  },
  {
    path: 'receipt/reports',
    loadComponent: () => import('./pages/receipt/receipt-reports/receipt-reports.component').then(m => m.ReceiptReportsComponent)
  },

  // Credit Note
  {
    path: 'credit/daily',
    loadComponent: () => import('./pages/credit/credit-daily/credit-daily.component').then(m => m.CreditDailyComponent)
  },
  {
    path: 'credit/reports',
    loadComponent: () => import('./pages/credit/credit-reports/credit-reports.component').then(m => m.CreditReportsComponent)
  }
];
