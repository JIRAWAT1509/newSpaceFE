// content.ts - Navigation content for 3-layer structure
import { NavigationItem } from '../models/navigation.model';

/**
 * NAVIGATION STRUCTURE - 3 LAYERS
 *
 * Layer 1 (Header): Main Categories
 * Layer 2 (Sidebar): Sub-modules / Function Groups
 * Layer 3 (Sidebar Items): Specific Functions / Pages
 *
 * NOTE: Items marked with hasDeeper: true contain 4+ levels in the full structure.
 * These will be implemented in future phases with drill-down functionality.
 */

export const NAVIGATION_CONTENT: NavigationItem[] = [
  // ============================================
  // 1. SALES (New Module - Empty for now)
  // ============================================
  {
    primary_content: 'sales',
    secondary_content: [
{
        name: 'sales_dashboard',
        icon: 'assets/icons/business-outline.svg',
        route: '/sales/dashboard',
        // sub: [
        //   {
        //     name: 'contract_preparation_data',
        //     route: '/setting/system/contract',
        //     hasDeeper: true,
        //     deeperNote: 'Contains: Profit center, Business types, Categories, Sales type, Contract types, Product groups, Signatories, Cost center'
        //   }
        // ]
      },

    ]
  },

  // ============================================
  // 2. AREA
  // ============================================
  {
    primary_content: 'area',
    secondary_content: [
      {
        name: 'area_layout_management',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'master_data', route: '/area/layout/master', hasDeeper: true, deeperNote: 'Contains: Building, Floor, Zone, Layout, Price List, etc.' },
          { name: 'inquiry', route: '/area/layout/inquiry', hasDeeper: true, deeperNote: 'Contains: Check status, Availability, Inspection' },
          { name: 'reports', route: '/area/layout/reports', hasDeeper: true, deeperNote: 'Contains: Layout reports, Current area reports' }
        ]
      },
      {
        name: 'area_maintenance_closure',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/area/maintenance/daily', hasDeeper: true, deeperNote: 'Contains: Closure forms, Approvals' },
          { name: 'processing', route: '/area/maintenance/processing', hasDeeper: true, deeperNote: 'Contains: Close area, Open area' },
          { name: 'reports', route: '/area/maintenance/reports' }
        ]
      },
      {
        name: 'area_measurement',
        icon: 'assets/icons/cube-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/area/measurement/daily' },
          { name: 'reports', route: '/area/measurement/reports' }
        ]
      }
    ]
  },

  // ============================================
  // 3. CONTRACT
  // ============================================
  {
    primary_content: 'contract',
    secondary_content: [
      {
        name: 'quotation_management',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/contract/quotation/daily', hasDeeper: true, deeperNote: 'Contains: Create, Copy quotations' },
          { name: 'processing', route: '/contract/quotation/processing' },
          { name: 'reports', route: '/contract/quotation/reports', hasDeeper: true, deeperNote: 'Contains: Customer data, Quotation details' }
        ]
      },
      {
        name: 'quotation_to_booking',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'processing', route: '/contract/q2b/processing' },
          { name: 'reports', route: '/contract/q2b/reports' }
        ]
      },
      {
        name: 'booking_contract',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/contract/booking/daily' },
          { name: 'processing', route: '/contract/booking/processing' },
          { name: 'reports', route: '/contract/booking/reports', hasDeeper: true, deeperNote: 'Contains: Customer data, Booking details, Certificate' }
        ]
      },
      {
        name: 'booking_to_lease',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'processing', route: '/contract/b2l/processing' },
          { name: 'reports', route: '/contract/b2l/reports' }
        ]
      },
      {
        name: 'lease_contract',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/contract/lease/daily', hasDeeper: true, deeperNote: 'Contains: Lease, Copy, Addendum, etc.' },
          { name: 'processing', route: '/contract/lease/processing', hasDeeper: true, deeperNote: 'Contains: Renewal, Discount, Approvals' },
          { name: 'inquiry', route: '/contract/lease/inquiry' },
          { name: 'reports', route: '/contract/lease/reports', hasDeeper: true, deeperNote: 'Contains: Details, Age check, Print forms, Data exports' }
        ]
      },
      {
        name: 'contract_documents',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/contract/documents/daily' },
          { name: 'processing', route: '/contract/documents/processing', hasDeeper: true, deeperNote: 'Contains: Approval, Signing' }
        ]
      },
      {
        name: 'contract_termination',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'processing', route: '/contract/termination/processing' },
          { name: 'reports', route: '/contract/termination/reports' }
        ]
      },
      {
        name: 'promotion_work_order',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/contract/promotion/daily', hasDeeper: true, deeperNote: 'Contains: Work order, Promotion job' },
          { name: 'processing', route: '/contract/promotion/processing' },
          { name: 'inquiry', route: '/contract/promotion/inquiry' },
          { name: 'reports', route: '/contract/promotion/reports', hasDeeper: true, deeperNote: 'Contains: Summary, Print forms' }
        ]
      },
      {
        name: 'fit_out_contract',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/contract/fitout/daily' }
        ]
      }
    ]
  },

  // ============================================
  // 4. COLLECTION AND FINANCE
  // ============================================
  {
    primary_content: 'collection_finance',
    secondary_content: [
      // --- COLLECTION SECTION ---
      {
        name: 'collection_sales_recording',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/collection/sales/daily', hasDeeper: true, deeperNote: 'Contains: Sales for finance, Sales for accounting' },
          { name: 'reports', route: '/collection/sales/reports', hasDeeper: true, deeperNote: 'Contains: Comparison, Daily sales, Monthly sales, Calculation forms' }
        ]
      },
      {
        name: 'collection_invoicing',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/collection/invoice/daily', hasDeeper: true, deeperNote: 'Contains: Invoice, Cancel, Guarantee, Date edit, Other income, Monthly billing' },
          { name: 'processing', route: '/collection/invoice/processing', hasDeeper: true, deeperNote: 'Contains: Auto-create, Tax invoice, Delete, Change VAT, Split, Import' },
          { name: 'reports', route: '/collection/invoice/reports', hasDeeper: true, deeperNote: 'Contains: 26 different invoice reports' }
        ]
      },
      {
        name: 'collection_credit_note',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/collection/credit/daily', hasDeeper: true, deeperNote: 'Contains: Credit note, Guarantee return, Discount list' },
          { name: 'reports', route: '/collection/credit/reports', hasDeeper: true, deeperNote: 'Contains: Print, Guarantee check, Summaries' }
        ]
      },
      {
        name: 'collection_reminders',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/collection/reminder/daily' },
          { name: 'processing', route: '/collection/reminder/processing' },
          { name: 'reports', route: '/collection/reminder/reports', hasDeeper: true, deeperNote: 'Contains: Print, Outstanding summaries, Daily/Monthly reports, Bounced check tracking' }
        ]
      },

      // --- FINANCE SECTION ---
      {
        name: 'finance_receipts',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/finance/receipt/daily', hasDeeper: true, deeperNote: 'Contains: Receipt by invoice, by revenue, temporary, bank deposit, bill payments, batch' },
          { name: 'reports', route: '/finance/receipt/reports', hasDeeper: true, deeperNote: 'Contains: 20 different receipt reports' }
        ]
      },
      {
        name: 'finance_credit_note',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/finance/credit/daily', hasDeeper: true, deeperNote: 'Contains: By receipt, By revenue' },
          { name: 'reports', route: '/finance/credit/reports', hasDeeper: true, deeperNote: 'Contains: Details, Print/Confirm' }
        ]
      }
    ]
  },

  // ============================================
  // 5. FACILITIES MANAGEMENT
  // ============================================
  {
    primary_content: 'facilities',
    secondary_content: [
      // --- UTILITIES SECTION ---
      {
        name: 'utilities_meter_management',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'master_data', route: '/facilities/utilities/master', hasDeeper: true, deeperNote: 'Contains: Meter groups, Meters, Phone, Rates' },
          { name: 'daily_transactions', route: '/facilities/utilities/daily', hasDeeper: true, deeperNote: 'Contains: Latest reading, Charges, Last used, Other income' },
          { name: 'processing', route: '/facilities/utilities/processing' },
          { name: 'reports', route: '/facilities/utilities/reports', hasDeeper: true, deeperNote: 'Contains: Usage summaries by customer, Usage tables' }
        ]
      },
      {
        name: 'utilities_overtime_ac',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'master_data', route: '/facilities/overtime-ac/master', hasDeeper: true, deeperNote: 'Contains: AHU, Holiday rates, Customer rates' },
          { name: 'daily_transactions', route: '/facilities/overtime-ac/daily' },
          { name: 'reports', route: '/facilities/overtime-ac/reports' }
        ]
      },

      // --- WORK ORDER SECTION ---
      {
        name: 'work_order_management',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'daily_transactions', route: '/facilities/workorder/daily', hasDeeper: true, deeperNote: 'Contains: Work order, Lease line, Direct line, Parking, Smart card' },
          { name: 'reports', route: '/facilities/workorder/reports' }
        ]
      }
    ]
  },

  // ============================================
  // 6. REPORT AND DASHBOARD
  // ============================================
  {
    primary_content: 'report_dashboard',
    secondary_content: [
      // --- REPORTS SECTION ---
      {
        name: 'budget_reports',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'revenue_details_main', route: '/reports/budget/revenue-main' },
          { name: 'revenue_details_discount', route: '/reports/budget/revenue-discount' },
          { name: 'revenue_details_other', route: '/reports/budget/revenue-other' },
          { name: 'salable_area_report', route: '/reports/budget/salable-area' },
          { name: 'revenue_vs_budget_actual', route: '/reports/budget/vs-budget-actual' },
          { name: 'revenue_vs_budget_income', route: '/reports/budget/vs-budget-income' }
        ]
      },
      {
        name: 'interface_reports',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'monthly_billing_summary', route: '/reports/interface/monthly-billing' },
          { name: 'interface_logs', route: '/reports/interface/logs' }
        ]
      },

      // --- DASHBOARD SECTION ---
      {
        name: 'dashboard_executive',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'receive_tracking', route: '/dashboard/executive/receive-tracking' },
          { name: 'receive_tracking_exhibition', route: '/dashboard/executive/exhibition' },
          { name: 'guarantee_info', route: '/dashboard/executive/guarantee' },
          { name: 'expire_list', route: '/dashboard/executive/expire' },
          { name: 'pending_contracts', route: '/dashboard/executive/pending' }
        ]
      },
      {
        name: 'dashboard_sales',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          { name: 'sales_and_traffic', route: '/dashboard/sales/traffic' },
          { name: 'data_projection', route: '/dashboard/sales/projection' }
        ]
      },
      {
        name: 'dashboard_finance',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          { name: 'receive_tracking_order', route: '/dashboard/finance/receive-order' },
          { name: 'receive_tracking_group', route: '/dashboard/finance/receive-group' },
          { name: 'invoice_delivery_summary', route: '/dashboard/finance/invoice-delivery' }
        ]
      },
      {
        name: 'dashboard_operation',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          { name: 'export_query_to_file', route: '/dashboard/operation/export-query' },
          { name: 'operational_tools', route: '/dashboard/operation/tools' }
        ]
      }
    ]
  },

// ============================================
  // 7. SETTING
  // ============================================
  {
    primary_content: 'setting',
    secondary_content: [
      // --- USER SETTING ---
      {
        name: 'user_accounts',
        icon: 'assets/icons/briefcase-outline.svg',
        sub: [
          {
            name: 'user_data_management',
            route: '/setting/user-accounts/data',
            hasDeeper: true,
            deeperNote: 'Contains: User setup, User groups, Display preferences'
          },
          {
            name: 'roles_permissions',
            route: '/setting/user-accounts/roles',
            hasDeeper: true,
            deeperNote: 'Contains: Permissions, Email recipients, Positions, Access scope, Approval period'
          }
        ]
      },

      // --- COMPANY SETTING ---
      {
        name: 'company_info',
        icon: 'assets/icons/clipboard-outline.svg',
        sub: [
          {
            name: 'company_data',
            route: '/setting/company/data',
            hasDeeper: true,
            deeperNote: 'Contains: Company, Legal entity, Branches, Structure, Partners, New branch'
          },
          {
            name: 'bank_info',
            route: '/setting/company/bank',
            hasDeeper: true,
            deeperNote: 'Contains: Banks, Bank branches, Deposit codes'
          },
          // ⛔ finance_revenue ถูกลบตามที่ขอ
          {
            name: 'customer_info',
            route: '/setting/company/customer'
          }
        ]
      },

      // --- SYSTEM SETTING ---
      {
        name: 'contract_data',
        icon: 'assets/icons/business-outline.svg',
        // ✅ ให้คลิกที่ชั้นนี้ได้เลย
        route: '/setting/system/contract',
        sub: [
          {
            name: 'contract_preparation_data',
            route: '/setting/system/contract',
            hasDeeper: true,
            deeperNote: 'Contains: Profit center, Business types, Categories, Sales type, Contract types, Product groups, Signatories, Cost center'
          }
        ]
      },
      {
  name: 'finance_system_data',
  icon: 'assets/icons/clipboard-outline.svg',

  sub: [
    {
      name: 'finance_basic_data',           // ข้อมูลพื้นฐาน
      route: '/setting/system/finance/basic',
      hasDeeper: true,
      deeperNote: 'ข้อมูลพื้นฐานทางการเงิน เช่น รหัสสาขา, เลขที่เอกสารพื้นฐาน, ค่า default ต่าง ๆ'
    },
    {
      name: 'finance_revenue_data',        // รายได้
      route: '/setting/system/finance/revenue',
      hasDeeper: true,
      deeperNote: 'โครงสร้างรายได้, กลุ่มรายได้, mapping รายได้'
    },
    {
      name: 'finance_tax_data',            // ภาษี
      route: '/setting/system/finance/tax',
      hasDeeper: true,
      deeperNote: 'ตั้งค่า VAT, WHT, ประเภทภาษี, อัตราภาษี'
    },
    {
      name: 'finance_document_type',       // ประเภทเอกสาร
      route: '/setting/system/finance/document-type',
      hasDeeper: true,
      deeperNote: 'ประเภทเอกสารทางการเงิน เช่น ใบแจ้งหนี้, ใบเสร็จ, ใบลดหนี้'
    }
  ]
},

      {
        name: 'interface_configuration',
        icon: 'assets/icons/business-outline.svg',
        sub: [
          {
            name: 'interface_settings',
            route: '/setting/system/interface',
            hasDeeper: true,
            deeperNote: 'Contains: 13 interface configuration items (Receipt VAT, Credit receipt, Invoice, Customer, RPA, FTP, etc.)'
          }
        ]
      }
    ]
  }
];

/**
 * ITEMS WITH DEEPER NESTING (4+ levels)
 * These items are marked with hasDeeper: true and will need drill-down UI in future phases
 *
 * Implementation Strategy:
 * Phase 1 (Current): 3-layer navigation - clicking navigates to listing/summary page
 * Phase 2 (Future): Add drill-down/breadcrumb navigation for deeper levels
 * Phase 3 (Future): Add dynamic sub-routing for 4th and 5th levels
 */
export const DEEP_NAVIGATION_NOTES = [
  { path: 'area.layout.master', levels: 4, items: ['Building', 'Floor', 'Zone', 'Layout', 'Price List', 'Review'] },
  { path: 'area.layout.inquiry', levels: 4, items: ['Status check', 'Availability', 'Inspection'] },
  { path: 'area.layout.reports', levels: 4, items: ['Area check', 'Current layout'] },
  { path: 'collection.invoice.daily', levels: 5, items: ['Invoice', 'Cancel', 'Guarantee', 'Edit date', 'Other income', 'One-time', 'Monthly billing'] },
  { path: 'collection.invoice.processing', levels: 5, items: ['Auto-create', 'Tax invoice', 'Delete', 'Change VAT', 'Import', 'Split', 'Other income processing'] },
  { path: 'collection.invoice.reports', levels: 5, items: ['26 different report types'] },
  { path: 'finance.receipt.daily', levels: 5, items: ['By invoice', 'By revenue', 'Temporary', 'Bank deposit', 'Bill payments', 'Batch'] },
  { path: 'finance.receipt.reports', levels: 5, items: ['20 different report types'] },
  // ... more items documented for future phases
];
