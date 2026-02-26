// approval.routes.ts - Centralized approval page (ข้อมูลสัญญารออนุมัติ)
import { Routes } from '@angular/router';

export const APPROVAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/centralized-approval/centralized-approval.component').then(
        (m) => m.CentralizedApprovalComponent
      ),
  },
];
