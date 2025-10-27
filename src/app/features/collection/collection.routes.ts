// collection.routes.ts
import { Routes } from '@angular/router';

export const COLLECTION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'sales/daily',
    pathMatch: 'full'
  },

  // Sales Recording
  {
    path: 'sales/daily',
    loadComponent: () => import('./pages/sales/sales-daily/sales-daily.component').then(m => m.SalesDailyComponent)
  },
  {
    path: 'sales/reports',
    loadComponent: () => import('./pages/sales/sales-reports/sales-reports.component').then(m => m.SalesReportsComponent)
  },

  // Invoicing
  {
    path: 'invoice/daily',
    loadComponent: () => import('./pages/invoice/invoice-daily/invoice-daily.component').then(m => m.InvoiceDailyComponent)
  },
  {
    path: 'invoice/processing',
    loadComponent: () => import('./pages/invoice/invoice-processing/invoice-processing.component').then(m => m.InvoiceProcessingComponent)
  },
  {
    path: 'invoice/reports',
    loadComponent: () => import('./pages/invoice/invoice-reports/invoice-reports.component').then(m => m.InvoiceReportsComponent)
  },

  // Credit Note
  {
    path: 'credit/daily',
    loadComponent: () => import('./pages/credit/credit-daily/credit-daily.component').then(m => m.CreditDailyComponent)
  },
  {
    path: 'credit/reports',
    loadComponent: () => import('./pages/credit/credit-reports/credit-reports.component').then(m => m.CreditReportsComponent)
  },

  // Reminders
  {
    path: 'reminder/daily',
    loadComponent: () => import('./pages/reminder/reminder-daily/reminder-daily.component').then(m => m.ReminderDailyComponent)
  },
  {
    path: 'reminder/processing',
    loadComponent: () => import('./pages/reminder/reminder-processing/reminder-processing.component').then(m => m.ReminderProcessingComponent)
  },
  {
    path: 'reminder/reports',
    loadComponent: () => import('./pages/reminder/reminder-reports/reminder-reports.component').then(m => m.ReminderReportsComponent)
  }
];
