// contract.routes.ts
import { Routes } from '@angular/router';

export const CONTRACT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'quotation/daily',
    pathMatch: 'full'
  },

  // Quotation Management
  {
    path: 'quotation/daily',
    loadComponent: () => import('./pages/quotation/quotation-daily/quotation-daily.component').then(m => m.QuotationDailyComponent)
  },
  {
    path: 'quotation/processing',
    loadComponent: () => import('./pages/quotation/quotation-processing/quotation-processing.component').then(m => m.QuotationProcessingComponent)
  },
  {
    path: 'quotation/reports',
    loadComponent: () => import('./pages/quotation/quotation-reports/quotation-reports.component').then(m => m.QuotationReportsComponent)
  },

  // Quotation to Booking
  {
    path: 'q2b/processing',
    loadComponent: () => import('./pages/q2b/q2b-processing/q2b-processing.component').then(m => m.Q2bProcessingComponent)
  },
  {
    path: 'q2b/reports',
    loadComponent: () => import('./pages/q2b/q2b-reports/q2b-reports.component').then(m => m.Q2bReportsComponent)
  },

  // Booking Contract
  {
    path: 'booking/daily',
    loadComponent: () => import('./pages/booking/booking-daily/booking-daily.component').then(m => m.BookingDailyComponent)
  },
  {
    path: 'booking/processing',
    loadComponent: () => import('./pages/booking/booking-processing/booking-processing.component').then(m => m.BookingProcessingComponent)
  },
  {
    path: 'booking/reports',
    loadComponent: () => import('./pages/booking/booking-reports/booking-reports.component').then(m => m.BookingReportsComponent)
  },

  // Booking to Lease
  {
    path: 'b2l/processing',
    loadComponent: () => import('./pages/b2l/b2l-processing/b2l-processing.component').then(m => m.B2lProcessingComponent)
  },
  {
    path: 'b2l/reports',
    loadComponent: () => import('./pages/b2l/b2l-reports/b2l-reports.component').then(m => m.B2lReportsComponent)
  },

  // Lease Contract
  {
    path: 'lease/daily',
    loadComponent: () => import('./pages/lease/lease-daily/lease-daily.component').then(m => m.LeaseDailyComponent)
  },
  {
    path: 'lease/processing',
    loadComponent: () => import('./pages/lease/lease-processing/lease-processing.component').then(m => m.LeaseProcessingComponent)
  },
  {
    path: 'lease/inquiry',
    loadComponent: () => import('./pages/lease/lease-inquiry/lease-inquiry.component').then(m => m.LeaseInquiryComponent)
  },
  {
    path: 'lease/reports',
    loadComponent: () => import('./pages/lease/lease-reports/lease-reports.component').then(m => m.LeaseReportsComponent)
  },

  // Contract Documents
  {
    path: 'documents/daily',
    loadComponent: () => import('./pages/documents/documents-daily/documents-daily.component').then(m => m.DocumentsDailyComponent)
  },
  {
    path: 'documents/processing',
    loadComponent: () => import('./pages/documents/documents-processing/documents-processing.component').then(m => m.DocumentsProcessingComponent)
  },

  // Termination
  {
    path: 'termination/processing',
    loadComponent: () => import('./pages/termination/termination-processing/termination-processing.component').then(m => m.TerminationProcessingComponent)
  },
  {
    path: 'termination/reports',
    loadComponent: () => import('./pages/termination/termination-reports/termination-reports.component').then(m => m.TerminationReportsComponent)
  },

  // Promotion
  {
    path: 'promotion/daily',
    loadComponent: () => import('./pages/promotion/promotion-daily/promotion-daily.component').then(m => m.PromotionDailyComponent)
  },
  {
    path: 'promotion/processing',
    loadComponent: () => import('./pages/promotion/promotion-processing/promotion-processing.component').then(m => m.PromotionProcessingComponent)
  },
  {
    path: 'promotion/inquiry',
    loadComponent: () => import('./pages/promotion/promotion-inquiry/promotion-inquiry.component').then(m => m.PromotionInquiryComponent)
  },
  {
    path: 'promotion/reports',
    loadComponent: () => import('./pages/promotion/promotion-reports/promotion-reports.component').then(m => m.PromotionReportsComponent)
  },

  // Fit-out
  {
    path: 'fitout/daily',
    loadComponent: () => import('./pages/fitout/fitout-daily/fitout-daily.component').then(m => m.FitoutDailyComponent)
  }
];
