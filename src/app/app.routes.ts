// app.routes.ts - Updated routing structure
import { Routes } from '@angular/router';

export const routes: Routes = [
  // ============================================
  // DEFAULT / HOME REDIRECT
  // ============================================
  {
    path: '',
    redirectTo: '/dashboard/overview',
    pathMatch: 'full'
  },

  // ============================================
  // 1. SALES MODULE (Empty for now - Future implementation)
  // ============================================
  {
    path: 'sales',
    loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES)
  },

  // ============================================
  // 2. AREA MODULE
  // ============================================
  {
    path: 'area',
    loadChildren: () => import('./features/area/area.routes').then(m => m.AREA_ROUTES)
  },

  // ============================================
  // 3. CONTRACT MODULE
  // ============================================
  {
    path: 'contract',
    loadChildren: () => import('./features/contract/contract.routes').then(m => m.CONTRACT_ROUTES)
  },

  // ============================================
  // 4. COLLECTION AND FINANCE MODULE
  // ============================================
  {
    path: 'collection',
    loadChildren: () => import('./features/collection/collection.routes').then(m => m.COLLECTION_ROUTES)
  },
  {
    path: 'finance',
    loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES)
  },

  // ============================================
  // 5. FACILITIES MANAGEMENT MODULE
  // ============================================
  {
    path: 'facilities',
    loadChildren: () => import('./features/facilities/facilities.routes').then(m => m.FACILITIES_ROUTES)
  },

  // ============================================
  // 6. REPORT AND DASHBOARD MODULE
  // ============================================
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },

  // ============================================
  // 7. SETTING MODULE
  // ============================================
  {
    path: 'setting',
    loadChildren: () => import('./features/setting/setting.routes').then(m => m.SETTING_ROUTES)
  },

  // ============================================
  // WILDCARD - CATCH ALL
  // ============================================
  {
    path: '**',
    redirectTo: '/dashboard/overview'
  }
];
