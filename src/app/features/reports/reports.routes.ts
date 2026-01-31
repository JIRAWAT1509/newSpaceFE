// reports.routes.ts
import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports-home/reports-home.component').then(
        (m) => m.ReportsHomeComponent
      )
  },
  {
    path: 'category/:category',
    loadComponent: () =>
      import('./pages/reports-home/reports-home.component').then(
        (m) => m.ReportsHomeComponent
      )
  },

  // Budget Reports
  {
    path: 'budget/revenue-main',
    loadComponent: () => import('./pages/budget/budget-revenue-main/budget-revenue-main.component').then(m => m.BudgetRevenueMainComponent)
  },
  {
    path: 'budget/revenue-discount',
    loadComponent: () => import('./pages/budget/budget-revenue-discount/budget-revenue-discount.component').then(m => m.BudgetRevenueDiscountComponent)
  },
  {
    path: 'budget/revenue-other',
    loadComponent: () => import('./pages/budget/budget-revenue-other/budget-revenue-other.component').then(m => m.BudgetRevenueOtherComponent)
  },
  {
    path: 'budget/salable-area',
    loadComponent: () => import('./pages/budget/budget-salable-area/budget-salable-area.component').then(m => m.BudgetSalableAreaComponent)
  },
  {
    path: 'budget/vs-budget-actual',
    loadComponent: () => import('./pages/budget/budget-vs-budget-actual/budget-vs-budget-actual.component').then(m => m.BudgetVsBudgetActualComponent)
  },
  {
    path: 'budget/vs-budget-income',
    loadComponent: () => import('./pages/budget/budget-vs-budget-income/budget-vs-budget-income.component').then(m => m.BudgetVsBudgetIncomeComponent)
  }
];
