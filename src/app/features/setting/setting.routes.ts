// setting.routes.ts
import { Routes } from '@angular/router';

export const SETTING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'user-accounts/data',
    pathMatch: 'full'
  },

  // ============================================
  // USER SETTING
  // ============================================

  // User Accounts - Data Management
  // NOTE: This page should show listing/cards for: User setup, User groups, Display preferences
  {
    path: 'user-accounts/data',
    loadComponent: () => import('./pages/user-accounts/user-accounts-data/user-accounts-data.component').then(m => m.UserAccountsDataComponent)
  },

  // User Accounts - Roles & Permissions
  // NOTE: This page should show listing/cards for: Permissions, Email recipients, Positions, Access scope, Approval period
  {
    path: 'user-accounts/roles',
    loadComponent: () => import('./pages/user-accounts/user-accounts-roles/role-permission.component').then(m => m.RolePermissionComponent)
  },

  // ============================================
  // COMPANY SETTING
  // ============================================

  // Company Data
  // NOTE: This page should show listing/cards for: Company, Legal entity, Branches, Structure, Partners, New branch
  {
    path: 'company/data',
    loadComponent: () => import('./pages/company/company-data/company-data.component').then(m => m.CompanyDataComponent)
  },

  // Bank Info
  // NOTE: This page should show listing/cards for: Banks, Bank branches, Deposit codes
  {
    path: 'company/bank',
    loadComponent: () => import('./pages/company/company-bank/company-bank.component').then(m => m.CompanyBankComponent)
  },

  // Finance Revenue
  // NOTE: This page should show listing/cards for: Revenue, Types, Mapping, Groups, Guarantee
  {
    path: 'company/finance-revenue',
    loadComponent: () => import('./pages/company/company-finance-revenue/company-finance-revenue.component').then(m => m.CompanyFinanceRevenueComponent)
  },

  // Customer Info
  {
    path: 'company/customer',
    loadComponent: () => import('./pages/company/company-customer/company-customer.component').then(m => m.CompanyCustomerComponent)
  },

  // ============================================
  // SYSTEM SETTING
  // ============================================

  // Contract Preparation Data
  // NOTE: This page should show listing/cards for: Profit center, Business types, Categories,
  // Sales type, Contract types, Product groups, Signatories, Cost center (10 items)
  {
    path: 'system/contract',
    loadComponent: () => import('./pages/system/system-contract/system-contract.component').then(m => m.SystemContractComponent)
  },

  // Finance System Data (Except Revenue)
  // NOTE: This page should show listing/cards for: Basic data, Branch data, Document types,
  // Numbering, Payment types, Debt reasons, Credit terms, VAT, WHT, Currency,
  // Period control, Account numbers (13 items)
  {
    path: 'system/finance',
    loadComponent: () => import('./pages/system/system-finance/system-finance.component').then(m => m.SystemFinanceComponent)
  },
{
  path: 'system/finance/basic',
  loadComponent: () => import('./pages/finance/basic/basic.component')
    .then(m => m.BasicComponent)
},
{
  path: 'system/finance/revenue',
  loadComponent: () => import('./pages/finance/revenue/revenue.component')
    .then(m => m.RevenueComponent)
},
{
  path: 'system/finance/tax',
  loadComponent: () => import('./pages/finance/tax/tax.component')
    .then(m => m.TaxComponent)
},
{
  path: 'system/finance/document-type',
  loadComponent: () => import('./pages/finance/document-type/document-type.component')
    .then(m => m.DocumentTypeComponent)
},

  // Budget Management
  // NOTE: This page should show listing/cards for: Budget revenue, Budget area, Close period,
  // Collect data, New budget collection (5 items)
  // {
  //   path: 'system/budget',
  //   loadComponent: () => import('./pages/system/system-budget/system-budget.component').then(m => m.SystemBudgetComponent)
  // },

  // Interface Configuration
  // NOTE: This page should show listing/cards for: Receipt VAT, Credit receipt, Invoice,
  // Customer, RPA, FTP, etc. (13 items)
  {
    path: 'system/interface',
    loadComponent: () => import('./pages/system/system-interface/system-interface.component').then(m => m.SystemInterfaceComponent)
  }
];
