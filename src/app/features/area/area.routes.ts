// area.routes.ts
import { Routes } from '@angular/router';

export const AREA_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'layout/master',
    pathMatch: 'full'
  },

  // Layout Management
  {
    path: 'layout/master',
    loadComponent: () => import('./pages/layout/layout-master/layout-master.component').then(m => m.LayoutMasterComponent)
  },
  {
    path: 'layout/inquiry',
    loadComponent: () => import('./pages/layout/layout-inquiry/layout-inquiry.component').then(m => m.LayoutInquiryComponent)
  },
  {
    path: 'layout/reports',
    loadComponent: () => import('./pages/layout/layout-reports/layout-reports.component').then(m => m.LayoutReportsComponent)
  },

  // Maintenance Closure
  {
    path: 'maintenance/daily',
    loadComponent: () => import('./pages/maintenance/maintenance-daily/maintenance-daily.component').then(m => m.MaintenanceDailyComponent)
  },
  {
    path: 'maintenance/processing',
    loadComponent: () => import('./pages/maintenance/maintenance-processing/maintenance-processing.component').then(m => m.MaintenanceProcessingComponent)
  },
  {
    path: 'maintenance/reports',
    loadComponent: () => import('./pages/maintenance/maintenance-reports/maintenance-reports.component').then(m => m.MaintenanceReportsComponent)
  },

  // Measurement
  {
    path: 'measurement/daily',
    loadComponent: () => import('./pages/measurement/measurement-daily/measurement-daily.component').then(m => m.MeasurementDailyComponent)
  },
  {
    path: 'measurement/reports',
    loadComponent: () => import('./pages/measurement/measurement-reports/measurement-reports.component').then(m => m.MeasurementReportsComponent)
  }
];
