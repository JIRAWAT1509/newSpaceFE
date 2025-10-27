// facilities.routes.ts
import { Routes } from '@angular/router';

export const FACILITIES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'utilities/master',
    pathMatch: 'full'
  },

  // Utilities - Meter Management
  {
    path: 'utilities/master',
    loadComponent: () => import('./pages/utilities/utilities-master/utilities-master.component').then(m => m.UtilitiesMasterComponent)
  },
  {
    path: 'utilities/daily',
    loadComponent: () => import('./pages/utilities/utilities-daily/utilities-daily.component').then(m => m.UtilitiesDailyComponent)
  },
  {
    path: 'utilities/processing',
    loadComponent: () => import('./pages/utilities/utilities-processing/utilities-processing.component').then(m => m.UtilitiesProcessingComponent)
  },
  {
    path: 'utilities/reports',
    loadComponent: () => import('./pages/utilities/utilities-reports/utilities-reports.component').then(m => m.UtilitiesReportsComponent)
  },

  // Utilities - Overtime AC
  {
    path: 'overtime-ac/master',
    loadComponent: () => import('./pages/overtime-ac/overtime-ac-master/overtime-ac-master.component').then(m => m.OvertimeAcMasterComponent)
  },
  {
    path: 'overtime-ac/daily',
    loadComponent: () => import('./pages/overtime-ac/overtime-ac-daily/overtime-ac-daily.component').then(m => m.OvertimeAcDailyComponent)
  },
  {
    path: 'overtime-ac/reports',
    loadComponent: () => import('./pages/overtime-ac/overtime-ac-reports/overtime-ac-reports.component').then(m => m.OvertimeAcReportsComponent)
  },

  // Work Order
  {
    path: 'workorder/daily',
    loadComponent: () => import('./pages/workorder/workorder-daily/workorder-daily.component').then(m => m.WorkorderDailyComponent)
  },
  {
    path: 'workorder/reports',
    loadComponent: () => import('./pages/workorder/workorder-reports/workorder-reports.component').then(m => m.WorkorderReportsComponent)
  }
];
