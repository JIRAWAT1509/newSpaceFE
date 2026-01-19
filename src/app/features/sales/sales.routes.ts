// sales.routes.ts - RESTRUCTURED (5 main pages)

import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/sales-dashboard.component').then(
        (m) => m.SalesDashboardComponent
      ),
  },
  {
    path: 'customer',
    loadComponent: () =>
      import('./pages/customer/customer-master/customer-master.component').then(
        (m) => m.CustomerMasterComponent
      ),
  },
  {
    path: 'budget',
    loadComponent: () =>
      import('./pages/budget/budget-master/budget-master.component').then(
        (m) => m.BudgetMasterComponent
      ),
  },
  {
    path: 'pipeline',
    loadComponent: () =>
      import('./pages/pipeline/pipeline-master/pipeline-master.component').then(
        (m) => m.PipelineMasterComponent
      ),
  },
  {
    path: 'activities',
    loadComponent: () =>
      import('./pages/activities/activities-master/activities-master.component').then(
        (m) => m.ActivitiesMasterComponent
      ),
  },
];
