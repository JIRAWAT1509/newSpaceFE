// vendor.routes.ts
import { Routes } from '@angular/router';

export const VENDOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'maintenance',
    pathMatch: 'full'
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./pages/vendor-maintenance/vendor-maintenance.component').then(
        m => m.VendorMaintenanceComponent
      )
  }
];
