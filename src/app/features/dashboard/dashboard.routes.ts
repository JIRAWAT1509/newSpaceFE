// dashboard.routes.ts
import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },

  // Overview (Home page)
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent)
  },

  // Executive Dashboard
  {
    path: 'executive/receive-tracking',
    loadComponent: () => import('./pages/executive/executive-receive-tracking/executive-receive-tracking.component').then(m => m.ExecutiveReceiveTrackingComponent)
  },
  {
    path: 'executive/exhibition',
    loadComponent: () => import('./pages/executive/executive-exhibition/executive-exhibition.component').then(m => m.ExecutiveExhibitionComponent)
  },
  {
    path: 'executive/guarantee',
    loadComponent: () => import('./pages/executive/executive-guarantee/executive-guarantee.component').then(m => m.ExecutiveGuaranteeComponent)
  },
  {
    path: 'executive/expire',
    loadComponent: () => import('./pages/executive/executive-expire/executive-expire.component').then(m => m.ExecutiveExpireComponent)
  },
  {
    path: 'executive/pending',
    loadComponent: () => import('./pages/executive/executive-pending/executive-pending.component').then(m => m.ExecutivePendingComponent)
  },

  // Sales Dashboard
  {
    path: 'sales/traffic',
    loadComponent: () => import('./pages/sales/sales-traffic/sales-traffic.component').then(m => m.SalesTrafficComponent)
  },
  {
    path: 'sales/projection',
    loadComponent: () => import('./pages/sales/sales-projection/sales-projection.component').then(m => m.SalesProjectionComponent)
  },

  // Finance Dashboard
  {
    path: 'finance/receive-order',
    loadComponent: () => import('./pages/finance/finance-receive-order/finance-receive-order.component').then(m => m.FinanceReceiveOrderComponent)
  },
  {
    path: 'finance/receive-group',
    loadComponent: () => import('./pages/finance/finance-receive-group/finance-receive-group.component').then(m => m.FinanceReceiveGroupComponent)
  },
  {
    path: 'finance/invoice-delivery',
    loadComponent: () => import('./pages/finance/finance-invoice-delivery/finance-invoice-delivery.component').then(m => m.FinanceInvoiceDeliveryComponent)
  },

  // Operation Dashboard
  {
    path: 'operation/export-query',
    loadComponent: () => import('./pages/operation/operation-export-query/operation-export-query.component').then(m => m.OperationExportQueryComponent)
  },
  {
    path: 'operation/tools',
    loadComponent: () => import('./pages/operation/operation-tools/operation-tools.component').then(m => m.OperationToolsComponent)
  }
];
