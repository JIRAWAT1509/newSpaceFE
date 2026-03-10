// app.routes.ts - Updated routing structure
import { Routes } from '@angular/router';

export const routes: Routes = [
  // ============================================
  // AUTH – Login, Forgot Password, Reset Password (เต็มจอ ไม่มี header/sidebar)
  // ============================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password-redirect.component').then((m) => m.ForgotPasswordRedirectComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // ============================================
  // DEFAULT / HOME REDIRECT
  // ============================================
  {
    path: '',
    redirectTo: '/dashboard/overview',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    redirectTo: 'dashboard/overview',
    pathMatch: 'full'
  },

  // ============================================
  // 1. SALES MODULE (Empty for now - Future implementation)
  // ============================================
  {
    path: 'sales',
    redirectTo: 'sales/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'sales',
    loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES),
    data: { module: 'sales' }
  },

  // ============================================
  // 2. AREA MODULE
  // ============================================
  {
    path: 'area',
    redirectTo: 'area/layout/master',
    pathMatch: 'full'
  },
  {
    path: 'area',
    loadChildren: () => import('./features/area/area.routes').then(m => m.AREA_ROUTES),
    data: { module: 'area' }
  },

  // ============================================
  // 3. CONTRACT MODULE
  // ============================================
  {
    path: 'contract',
    redirectTo: 'contract/management',
    pathMatch: 'full'
  },
  {
    path: 'contract',
    loadChildren: () => import('./features/contract/contract.routes').then(m => m.CONTRACT_ROUTES),
    data: { module: 'contract' }
  },

  // ============================================
  // CENTRALIZED APPROVAL (Task icon in header)
  // ============================================
  {
    path: 'approval',
    loadChildren: () => import('./features/approval/approval.routes').then(m => m.APPROVAL_ROUTES),
    data: { module: 'approval' }
  },

  // ============================================
  // 4. COLLECTION AND FINANCE MODULE
  // ============================================
  {
    path: 'collection',
    loadChildren: () => import('./features/collection/collection.routes').then(m => m.COLLECTION_ROUTES),
  },
  {
    path: 'finance',
    redirectTo: 'finance/master',
    pathMatch: 'full'
  },
  {
    path: 'finance',
    loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES),
    data: { module: 'finance' }
  },

  // ============================================
  // 5. FACILITIES MANAGEMENT MODULE
  // ============================================
  {
    path: 'facilities',
    redirectTo: 'facilities/utilities/master',
    pathMatch: 'full'
  },
  {
    path: 'facilities',
    loadChildren: () => import('./features/facilities/facilities.routes').then(m => m.FACILITIES_ROUTES),
    data: { module: 'facilities' }
  },

  // ============================================
  // 6. REPORT AND DASHBOARD MODULE
  // ============================================
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
    data: { module: 'report_dashboard' }
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    data: { module: 'dashboard' }
  },

  // ============================================
  // 7. SETTING MODULE
  // ============================================
  {
    path: 'setting',
    redirectTo: 'setting/user-accounts/data',
    pathMatch: 'full'
  },
  {
    path: 'setting',
    loadChildren: () => import('./features/setting/setting.routes').then(m => m.SETTING_ROUTES),
    data: { module: 'setting' }
  },

  // ============================================
  // 8. VENDOR MAINTENANCE MODULE
  // ============================================
  {
    path: 'vendor',
    redirectTo: 'vendor/maintenance',
    pathMatch: 'full'
  },
  {
    path: 'vendor',
    loadChildren: () => import('./features/vendor/vendor.routes').then(m => m.VENDOR_ROUTES),
    data: { module: 'vendor' }
  },

  // ============================================
  // WILDCARD - CATCH ALL
  // ============================================
  {
    path: '**',
    redirectTo: '/dashboard/overview'
  }
];
