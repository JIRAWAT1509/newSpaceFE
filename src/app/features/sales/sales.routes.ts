// ============================================
// 9. sales.routes.ts (NEW - Empty for now)

import { Routes } from '@angular/router';

// ============================================
export const SALES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/dashboard/overview',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/sales-dashboard.component').then(
        (m) => m.SalesDashboardComponent
      ),
  },
  // Will be populated in future development
];
