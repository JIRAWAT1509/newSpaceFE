import { NavigationItem } from '../models/navigation.model';

export const NAVIGATION_CONTENT: NavigationItem[] = [
  {
    primary_content: "area",
    secondary_content: [
      {
        name: "area_management",
        icon: "assets/icons/briefcase-outline.svg",

        sub: [
          { name: "view_all_areas", route: "/dashboard" },
          { name: "add_new_area", route: "/dashboard" },
          { name: "area_statistics", route: "/dashboard" },
          { name: "area_reports", route: "/dashboard" },
          { name: "area_settings", route: "/dashboard" }
        ]
      },
      {
        name: "area_allocation",

        icon: "assets/icons/business-outline.svg",
        sub: [
          { name: "allocate_space", route: "/dashboard" },
          { name: "view_allocations", route: "/dashboard" },
          { name: "allocation_history", route: "/dashboard" },
          { name: "allocation_analytics", route: "/dashboard" },
          { name: "allocation_settings", route: "/dashboard" }
        ]
      },
      {
        name: "area_maintenance",

        icon: "assets/icons/clipboard-outline.svg",
        sub: [
          { name: "maintenance_schedule", route: "/dashboard" },
          { name: "maintenance_requests", route: "/dashboard" },
          { name: "maintenance_history", route: "/dashboard" },
          { name: "maintenance_reports", route: "/dashboard" },
          { name: "maintenance_settings", route: "/dashboard" }
        ]
      },
      {
        name: "area_inspection",

        icon: "assets/icons/cube-outline.svg",
        sub: [
          { name: "schedule_inspection", route: "/dashboard" },
          { name: "inspection_reports", route: "/dashboard" },
          { name: "inspection_history", route: "/dashboard" },
          { name: "inspection_checklist", route: "/dashboard" },
          { name: "inspection_settings", route: "/dashboard" }
        ]
      },
      {
        name: "area_availability",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "check_availability", route: "/dashboard" },
          { name: "availability_calendar", route: "/dashboard" },
          { name: "availability_reports", route: "/dashboard" },
          { name: "availability_alerts", route: "/dashboard" },
          { name: "availability_settings", route: "/dashboard" }
        ]
      },
      {
        name: "area_documentation",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "view_documents", route: "/dashboard" },
          { name: "upload_documents", route: "/dashboard" },
          { name: "document_categories", route: "/dashboard" },
          { name: "document_search", route: "/dashboard" },
          { name: "document_archive", route: "/dashboard" }
        ]
      }
    ]
  },
  {
    primary_content: "contract",
    secondary_content: [
      {
        name: "contract_management",

                icon: "assets/icons/briefcase-outline.svg",

        sub: [
          { name: "view_all_contracts", route: "/dashboard" },
          { name: "create_new_contract", route: "/dashboard" },
          { name: "contract_templates", route: "/dashboard" },
          { name: "contract_reports", route: "/dashboard" },
          { name: "contract_settings", route: "/dashboard" }
        ]
      },
      {
        name: "contract_renewal",

        icon: "assets/icons/business-outline.svg",
        sub: [
          { name: "renewal_requests", route: "/dashboard" },
          { name: "renewal_schedule", route: "/dashboard" },
          { name: "renewal_history", route: "/dashboard" },
          { name: "renewal_analytics", route: "/dashboard" },
          { name: "renewal_settings", route: "/dashboard" }
        ]
      },
      {
        name: "contract_termination",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "termination_requests", route: "/dashboard" },
          { name: "termination_process", route: "/dashboard" },
          { name: "termination_history", route: "/dashboard" },
          { name: "termination_reports", route: "/dashboard" },
          { name: "termination_settings", route: "/dashboard" }
        ]
      },
      {
        name: "contract_documents",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "view_documents", route: "/dashboard" },
          { name: "upload_documents", route: "/dashboard" },
          { name: "document_signing", route: "/dashboard" },
          { name: "document_archive", route: "/dashboard" },
          { name: "document_settings", route: "/dashboard" }
        ]
      },
      {
        name: "contract_compliance",

        icon: "assets/icons/clipboard-outline.svg",
        sub: [
          { name: "compliance_check", route: "/dashboard" },
          { name: "compliance_reports", route: "/dashboard" },
          { name: "compliance_alerts", route: "/dashboard" },
          { name: "compliance_history", route: "/dashboard" },
          { name: "compliance_settings", route: "/dashboard" }
        ]
      },
      {
        name: "contract_analytics",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "contract_metrics", route: "/dashboard" },
          { name: "performance_analysis", route: "/dashboard" },
          { name: "contract_trends", route: "/dashboard" },
          { name: "custom_reports", route: "/dashboard" },
          { name: "analytics_settings", route: "/dashboard" }
        ]
      }
    ]
  },
  {
    primary_content: "service",
    secondary_content: [
      {
        name: "service_requests",

                icon: "assets/icons/briefcase-outline.svg",

        sub: [
          { name: "view_all_requests", route: "/dashboard" },
          { name: "create_new_request", route: "/dashboard" },
          { name: "request_status", route: "/dashboard" },
          { name: "request_history", route: "/dashboard" },
          { name: "request_settings", route: "/dashboard" }
        ]
      },
      {
        name: "service_providers",

        icon: "assets/icons/business-outline.svg",
        sub: [
          { name: "view_providers", route: "/dashboard" },
          { name: "add_new_provider", route: "/dashboard" },
          { name: "provider_ratings", route: "/dashboard" },
          { name: "provider_contracts", route: "/dashboard" },
          { name: "provider_settings", route: "/dashboard" }
        ]
      },
      {
        name: "service_scheduling",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "view_schedule", route: "/dashboard" },
          { name: "create_schedule", route: "/dashboard" },
          { name: "schedule_calendar", route: "/dashboard" },
          { name: "schedule_conflicts", route: "/dashboard" },
          { name: "schedule_settings", route: "/dashboard" }
        ]
      },
      {
        name: "service_quality",

        icon: "assets/icons/clipboard-outline.svg",
        sub: [
          { name: "quality_metrics", route: "/dashboard" },
          { name: "quality_reports", route: "/dashboard" },
          { name: "quality_feedback", route: "/dashboard" },
          { name: "quality_improvements", route: "/dashboard" },
          { name: "quality_settings", route: "/dashboard" }
        ]
      },
      {
        name: "service_billing",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "view_invoices", route: "/dashboard" },
          { name: "create_invoice", route: "/dashboard" },
          { name: "payment_history", route: "/dashboard" },
          { name: "billing_reports", route: "/dashboard" },
          { name: "billing_settings", route: "/dashboard" }
        ]
      },
      {
        name: "service_analytics",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "service_metrics", route: "/dashboard" },
          { name: "performance_analysis", route: "/dashboard" },
          { name: "service_trends", route: "/dashboard" },
          { name: "custom_reports", route: "/dashboard" },
          { name: "analytics_settings", route: "/dashboard" }
        ]
      }
    ]
  },
  {
    primary_content: "finance",
    secondary_content: [
      {
        name: "revenue_management",

                icon: "assets/icons/briefcase-outline.svg",

        sub: [
          { name: "view_revenue", route: "/dashboard" },
          { name: "revenue_reports", route: "/dashboard" },
          { name: "revenue_forecast", route: "/dashboard" },
          { name: "revenue_analytics", route: "/dashboard" },
          { name: "revenue_settings", route: "/dashboard" }
        ]
      },
      {
        name: "expense_tracking",

        icon: "assets/icons/business-outline.svg",
        sub: [
          { name: "view_expenses", route: "/dashboard" },
          { name: "add_new_expense", route: "/dashboard" },
          { name: "expense_reports", route: "/dashboard" },
          { name: "expense_categories", route: "/dashboard" },
          { name: "expense_settings", route: "/dashboard" }
        ]
      },
      {
        name: "payment_processing",

        icon: "assets/icons/clipboard-outline.svg",
        sub: [
          { name: "process_payments", route: "/dashboard" },
          { name: "payment_history", route: "/dashboard" },
          { name: "payment_methods", route: "/dashboard" },
          { name: "payment_reports", route: "/dashboard" },
          { name: "payment_settings", route: "/dashboard" }
        ]
      },
      {
        name: "invoicing",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "create_invoice", route: "/dashboard" },
          { name: "view_invoices", route: "/dashboard" },
          { name: "invoice_templates", route: "/dashboard" },
          { name: "invoice_reports", route: "/dashboard" },
          { name: "invoice_settings", route: "/dashboard" }
        ]
      },
      {
        name: "financial_reports",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "profit_loss", route: "/dashboard" },
          { name: "balance_sheet", route: "/dashboard" },
          { name: "cash_flow", route: "/dashboard" },
          { name: "tax_reports", route: "/dashboard" },
          { name: "report_settings", route: "/dashboard" }
        ]
      },
      {
        name: "budget_planning",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "create_budget", route: "/dashboard" },
          { name: "view_budgets", route: "/dashboard" },
          { name: "budget_analysis", route: "/dashboard" },
          { name: "budget_alerts", route: "/dashboard" },
          { name: "budget_settings", route: "/dashboard" }
        ]
      }
    ]
  },
  {
    primary_content: "dashboard",
    secondary_content: [
      {
        name: "overview",

                icon: "assets/icons/briefcase-outline.svg",

        route: "/dashboard"
      },
      {
        name: "analytics",

        icon: "assets/icons/business-outline.svg",
        sub: [
          { name: "performance_metrics", route: "/dashboard" },
          { name: "trend_analysis", route: "/dashboard" },
          { name: "comparative_reports", route: "/dashboard" },
          { name: "custom_analytics", route: "/dashboard" },
          { name: "analytics_settings", route: "/dashboard" }
        ]
      },
      {
        name: "reports",

        icon: "assets/icons/clipboard-outline.svg",
        route: "/dashboard"
      },
      {
        name: "alerts",

        icon: "assets/icons/clipboard-outline.svg",
        sub: [
          { name: "view_alerts", route: "/dashboard" },
          { name: "alert_rules", route: "/dashboard" },
          { name: "alert_history", route: "/dashboard" },
          { name: "alert_notifications", route: "/dashboard" },
          { name: "alert_settings", route: "/dashboard" }
        ]
      },
      {
        name: "widgets",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "available_widgets", route: "/dashboard" },
          { name: "widget_layout", route: "/dashboard" },
          { name: "widget_settings", route: "/dashboard" },
          { name: "custom_widgets", route: "/dashboard" },
          { name: "widget_library", route: "/dashboard" }
        ]
      },
      {
        name: "customization",

        icon: "assets/icons/briefcase-outline.svg",
        sub: [
          { name: "layout_options", route: "/dashboard" },
          { name: "theme_settings", route: "/dashboard" },
          { name: "display_preferences", route: "/dashboard" },
          { name: "data_sources", route: "/dashboard" },
          { name: "reset_dashboard", route: "/dashboard" }
        ]
      }
    ]
  }
];
