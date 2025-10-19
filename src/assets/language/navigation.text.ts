export interface NavigationTexts {
  [key: string]: string;
}

export const NAVIGATION_TEXTS: { [lang: string]: NavigationTexts } = {
  en: {
    // Primary navigation
    area: "Area",
    contract: "Contract",
    service: "Service",
    finance: "Finance",
    dashboard: "Dashboard",

    // Area - Secondary
    area_management: "Area Management",
    area_allocation: "Area Allocation",
    area_maintenance: "Area Maintenance",
    area_inspection: "Area Inspection",
    area_availability: "Area Availability",
    area_documentation: "Area Documentation",

    // Area Management - Sub
    view_all_areas: "View All Areas",
    add_new_area: "Add New Area",
    area_statistics: "Area Statistics",
    area_reports: "Area Reports",
    area_settings: "Area Settings",

    // Area Allocation - Sub
    allocate_space: "Allocate Space",
    view_allocations: "View Allocations",
    allocation_history: "Allocation History",
    allocation_analytics: "Allocation Analytics",
    allocation_settings: "Allocation Settings",

    // Area Maintenance - Sub
    maintenance_schedule: "Maintenance Schedule",
    maintenance_requests: "Maintenance Requests",
    maintenance_history: "Maintenance History",
    maintenance_reports: "Maintenance Reports",
    maintenance_settings: "Maintenance Settings",

    // Area Inspection - Sub
    schedule_inspection: "Schedule Inspection",
    inspection_reports: "Inspection Reports",
    inspection_history: "Inspection History",
    inspection_checklist: "Inspection Checklist",
    inspection_settings: "Inspection Settings",

    // Area Availability - Sub
    check_availability: "Check Availability",
    availability_calendar: "Availability Calendar",
    availability_reports: "Availability Reports",
    availability_alerts: "Availability Alerts",
    availability_settings: "Availability Settings",

    // Area Documentation - Sub
    view_documents: "View Documents",
    upload_documents: "Upload Documents",
    document_categories: "Document Categories",
    document_search: "Document Search",
    document_archive: "Document Archive",

    // Contract - Secondary
    contract_management: "Contract Management",
    contract_renewal: "Contract Renewal",
    contract_termination: "Contract Termination",
    contract_documents: "Contract Documents",
    contract_compliance: "Contract Compliance",
    contract_analytics: "Contract Analytics",

    // Contract Management - Sub
    view_all_contracts: "View All Contracts",
    create_new_contract: "Create New Contract",
    contract_templates: "Contract Templates",
    contract_reports: "Contract Reports",
    contract_settings: "Contract Settings",

    // Contract Renewal - Sub
    renewal_requests: "Renewal Requests",
    renewal_schedule: "Renewal Schedule",
    renewal_history: "Renewal History",
    renewal_analytics: "Renewal Analytics",
    renewal_settings: "Renewal Settings",

    // Contract Termination - Sub
    termination_requests: "Termination Requests",
    termination_process: "Termination Process",
    termination_history: "Termination History",
    termination_reports: "Termination Reports",
    termination_settings: "Termination Settings",

    // Contract Documents - Sub
    document_signing: "Document Signing",

    // Contract Compliance - Sub
    compliance_check: "Compliance Check",
    compliance_reports: "Compliance Reports",
    compliance_alerts: "Compliance Alerts",
    compliance_history: "Compliance History",
    compliance_settings: "Compliance Settings",

    // Contract Analytics - Sub
    contract_metrics: "Contract Metrics",
    performance_analysis: "Performance Analysis",
    contract_trends: "Contract Trends",
    custom_reports: "Custom Reports",
    analytics_settings: "Analytics Settings",

    // Service - Secondary
    service_requests: "Service Requests",
    service_providers: "Service Providers",
    service_scheduling: "Service Scheduling",
    service_quality: "Service Quality",
    service_billing: "Service Billing",
    service_analytics: "Service Analytics",

    // Service Requests - Sub
    view_all_requests: "View All Requests",
    create_new_request: "Create New Request",
    request_status: "Request Status",
    request_history: "Request History",
    request_settings: "Request Settings",

    // Service Providers - Sub
    view_providers: "View Providers",
    add_new_provider: "Add New Provider",
    provider_ratings: "Provider Ratings",
    provider_contracts: "Provider Contracts",
    provider_settings: "Provider Settings",

    // Service Scheduling - Sub
    view_schedule: "View Schedule",
    create_schedule: "Create Schedule",
    schedule_calendar: "Schedule Calendar",
    schedule_conflicts: "Schedule Conflicts",
    schedule_settings: "Schedule Settings",

    // Service Quality - Sub
    quality_metrics: "Quality Metrics",
    quality_reports: "Quality Reports",
    quality_feedback: "Quality Feedback",
    quality_improvements: "Quality Improvements",
    quality_settings: "Quality Settings",

    // Service Billing - Sub
    view_invoices: "View Invoices",
    create_invoice: "Create Invoice",
    payment_history: "Payment History",
    billing_reports: "Billing Reports",
    billing_settings: "Billing Settings",

    // Service Analytics - Sub
    service_metrics: "Service Metrics",
    service_trends: "Service Trends",

    // Finance - Secondary
    revenue_management: "Revenue Management",
    expense_tracking: "Expense Tracking",
    payment_processing: "Payment Processing",
    invoicing: "Invoicing",
    financial_reports: "Financial Reports",
    budget_planning: "Budget Planning",

    // Revenue Management - Sub
    view_revenue: "View Revenue",
    revenue_reports: "Revenue Reports",
    revenue_forecast: "Revenue Forecast",
    revenue_analytics: "Revenue Analytics",
    revenue_settings: "Revenue Settings",

    // Expense Tracking - Sub
    view_expenses: "View Expenses",
    add_new_expense: "Add New Expense",
    expense_reports: "Expense Reports",
    expense_categories: "Expense Categories",
    expense_settings: "Expense Settings",

    // Payment Processing - Sub
    process_payments: "Process Payments",
    payment_methods: "Payment Methods",
    payment_reports: "Payment Reports",
    payment_settings: "Payment Settings",

    // Invoicing - Sub
    invoice_templates: "Invoice Templates",
    invoice_reports: "Invoice Reports",
    invoice_settings: "Invoice Settings",

    // Financial Reports - Sub
    profit_loss: "Profit & Loss",
    balance_sheet: "Balance Sheet",
    cash_flow: "Cash Flow",
    tax_reports: "Tax Reports",
    report_settings: "Report Settings",

    // Budget Planning - Sub
    create_budget: "Create Budget",
    view_budgets: "View Budgets",
    budget_analysis: "Budget Analysis",
    budget_alerts: "Budget Alerts",
    budget_settings: "Budget Settings",

    // Dashboard - Secondary
    overview: "Overview",
    analytics: "Analytics",
    reports: "Reports",
    alerts: "Alerts",
    widgets: "Widgets",
    customization: "Customization",

    // Overview - Sub
    main_dashboard: "Main Dashboard",
    quick_stats: "Quick Stats",
    recent_activity: "Recent Activity",
    notifications: "Notifications",
    dashboard_settings: "Dashboard Settings",

    // Analytics - Sub
    performance_metrics: "Performance Metrics",
    trend_analysis: "Trend Analysis",
    comparative_reports: "Comparative Reports",
    custom_analytics: "Custom Analytics",

    // Reports - Sub
    generate_report: "Generate Report",
    scheduled_reports: "Scheduled Reports",
    report_templates: "Report Templates",
    report_archive: "Report Archive",

    // Alerts - Sub
    view_alerts: "View Alerts",
    alert_rules: "Alert Rules",
    alert_history: "Alert History",
    alert_notifications: "Alert Notifications",
    alert_settings: "Alert Settings",

    // Widgets - Sub
    available_widgets: "Available Widgets",
    widget_layout: "Widget Layout",
    widget_settings: "Widget Settings",
    custom_widgets: "Custom Widgets",
    widget_library: "Widget Library",

    // Customization - Sub
    layout_options: "Layout Options",
    theme_settings: "Theme Settings",
    display_preferences: "Display Preferences",
    data_sources: "Data Sources",
    reset_dashboard: "Reset Dashboard",
  },

  th: {
    // Primary navigation
    area: "พื้นที่",
    contract: "สัญญา",
    service: "บริการ",
    finance: "การเงิน",
    dashboard: "แดชบอร์ด",

    // Area - Secondary
    area_management: "การจัดการพื้นที่",
    area_allocation: "การจัดสรรพื้นที่",
    area_maintenance: "การบำรุงรักษาพื้นที่",
    area_inspection: "การตรวจสอบพื้นที่",
    area_availability: "ความพร้อมใช้งานพื้นที่",
    area_documentation: "เอกสารพื้นที่",

    // Area Management - Sub
    view_all_areas: "ดูพื้นที่ทั้งหมด",
    add_new_area: "เพิ่มพื้นที่ใหม่",
    area_statistics: "สถิติพื้นที่",
    area_reports: "รายงานพื้นที่",
    area_settings: "ตั้งค่าพื้นที่",

    // Area Allocation - Sub
    allocate_space: "จัดสรรพื้นที่",
    view_allocations: "ดูการจัดสรร",
    allocation_history: "ประวัติการจัดสรร",
    allocation_analytics: "วิเคราะห์การจัดสรร",
    allocation_settings: "ตั้งค่าการจัดสรร",

    // Area Maintenance - Sub
    maintenance_schedule: "ตารางการบำรุงรักษา",
    maintenance_requests: "คำขอบำรุงรักษา",
    maintenance_history: "ประวัติการบำรุงรักษา",
    maintenance_reports: "รายงานการบำรุงรักษา",
    maintenance_settings: "ตั้งค่าการบำรุงรักษา",

    // Area Inspection - Sub
    schedule_inspection: "กำหนดการตรวจสอบ",
    inspection_reports: "รายงานการตรวจสอบ",
    inspection_history: "ประวัติการตรวจสอบ",
    inspection_checklist: "รายการตรวจสอบ",
    inspection_settings: "ตั้งค่าการตรวจสอบ",

    // Area Availability - Sub
    check_availability: "ตรวจสอบความพร้อม",
    availability_calendar: "ปฏิทินความพร้อม",
    availability_reports: "รายงานความพร้อม",
    availability_alerts: "แจ้งเตือนความพร้อม",
    availability_settings: "ตั้งค่าความพร้อม",

    // Area Documentation - Sub
    view_documents: "ดูเอกสาร",
    upload_documents: "อัปโหลดเอกสาร",
    document_categories: "หมวดหมู่เอกสาร",
    document_search: "ค้นหาเอกสาร",
    document_archive: "เอกสารเก็บถาวร",

    // Contract - Secondary
    contract_management: "การจัดการสัญญา",
    contract_renewal: "การต่ออายุสัญญา",
    contract_termination: "การยกเลิกสัญญา",
    contract_documents: "เอกสารสัญญา",
    contract_compliance: "การปฏิบัติตามสัญญา",
    contract_analytics: "วิเคราะห์สัญญา",

    // Contract Management - Sub
    view_all_contracts: "ดูสัญญาทั้งหมด",
    create_new_contract: "สร้างสัญญาใหม่",
    contract_templates: "แม่แบบสัญญา",
    contract_reports: "รายงานสัญญา",
    contract_settings: "ตั้งค่าสัญญา",

    // Contract Renewal - Sub
    renewal_requests: "คำขอต่ออายุ",
    renewal_schedule: "ตารางการต่ออายุ",
    renewal_history: "ประวัติการต่ออายุ",
    renewal_analytics: "วิเคราะห์การต่ออายุ",
    renewal_settings: "ตั้งค่าการต่ออายุ",

    // Contract Termination - Sub
    termination_requests: "คำขอยกเลิก",
    termination_process: "กระบวนการยกเลิก",
    termination_history: "ประวัติการยกเลิก",
    termination_reports: "รายงานการยกเลิก",
    termination_settings: "ตั้งค่าการยกเลิก",

    // Contract Documents - Sub
    document_signing: "ลงนามเอกสาร",

    // Contract Compliance - Sub
    compliance_check: "ตรวจสอบการปฏิบัติตาม",
    compliance_reports: "รายงานการปฏิบัติตาม",
    compliance_alerts: "แจ้งเตือนการปฏิบัติตาม",
    compliance_history: "ประวัติการปฏิบัติตาม",
    compliance_settings: "ตั้งค่าการปฏิบัติตาม",

    // Contract Analytics - Sub
    contract_metrics: "ตัวชี้วัดสัญญา",
    performance_analysis: "วิเคราะห์ผลการดำเนินงาน",
    contract_trends: "แนวโน้มสัญญา",
    custom_reports: "รายงานแบบกำหนดเอง",
    analytics_settings: "ตั้งค่าการวิเคราะห์",

    // Service - Secondary
    service_requests: "คำขอบริการ",
    service_providers: "ผู้ให้บริการ",
    service_scheduling: "การกำหนดตารางบริการ",
    service_quality: "คุณภาพบริการ",
    service_billing: "การเรียกเก็บเงินบริการ",
    service_analytics: "วิเคราะห์บริการ",

    // Service Requests - Sub
    view_all_requests: "ดูคำขอทั้งหมด",
    create_new_request: "สร้างคำขอใหม่",
    request_status: "สถานะคำขอ",
    request_history: "ประวัติคำขอ",
    request_settings: "ตั้งค่าคำขอ",

    // Service Providers - Sub
    view_providers: "ดูผู้ให้บริการ",
    add_new_provider: "เพิ่มผู้ให้บริการใหม่",
    provider_ratings: "การให้คะแนนผู้ให้บริการ",
    provider_contracts: "สัญญาผู้ให้บริการ",
    provider_settings: "ตั้งค่าผู้ให้บริการ",

    // Service Scheduling - Sub
    view_schedule: "ดูตาราง",
    create_schedule: "สร้างตาราง",
    schedule_calendar: "ปฏิทินตาราง",
    schedule_conflicts: "ความขัดแย้งของตาราง",
    schedule_settings: "ตั้งค่าตาราง",

    // Service Quality - Sub
    quality_metrics: "ตัวชี้วัดคุณภาพ",
    quality_reports: "รายงานคุณภาพ",
    quality_feedback: "ข้อเสนอแนะคุณภาพ",
    quality_improvements: "การปรับปรุงคุณภาพ",
    quality_settings: "ตั้งค่าคุณภาพ",

    // Service Billing - Sub
    view_invoices: "ดูใบแจ้งหนี้",
    create_invoice: "สร้างใบแจ้งหนี้",
    payment_history: "ประวัติการชำระเงิน",
    billing_reports: "รายงานการเรียกเก็บเงิน",
    billing_settings: "ตั้งค่าการเรียกเก็บเงิน",

    // Service Analytics - Sub
    service_metrics: "ตัวชี้วัดบริการ",
    service_trends: "แนวโน้มบริการ",

    // Finance - Secondary
    revenue_management: "การจัดการรายได้",
    expense_tracking: "การติดตามค่าใช้จ่าย",
    payment_processing: "การประมวลผลการชำระเงิน",
    invoicing: "การออกใบแจ้งหนี้",
    financial_reports: "รายงานทางการเงิน",
    budget_planning: "การวางแผนงบประมาณ",

    // Revenue Management - Sub
    view_revenue: "ดูรายได้",
    revenue_reports: "รายงานรายได้",
    revenue_forecast: "พยากรณ์รายได้",
    revenue_analytics: "วิเคราะห์รายได้",
    revenue_settings: "ตั้งค่ารายได้",

    // Expense Tracking - Sub
    view_expenses: "ดูค่าใช้จ่าย",
    add_new_expense: "เพิ่มค่าใช้จ่ายใหม่",
    expense_reports: "รายงานค่าใช้จ่าย",
    expense_categories: "หมวดหมู่ค่าใช้จ่าย",
    expense_settings: "ตั้งค่าค่าใช้จ่าย",

    // Payment Processing - Sub
    process_payments: "ประมวลผลการชำระเงิน",
    payment_methods: "วิธีการชำระเงิน",
    payment_reports: "รายงานการชำระเงิน",
    payment_settings: "ตั้งค่าการชำระเงิน",

    // Invoicing - Sub
    invoice_templates: "แม่แบบใบแจ้งหนี้",
    invoice_reports: "รายงานใบแจ้งหนี้",
    invoice_settings: "ตั้งค่าใบแจ้งหนี้",

    // Financial Reports - Sub
    profit_loss: "กำไรขาดทุน",
    balance_sheet: "งบดุล",
    cash_flow: "กระแสเงินสด",
    tax_reports: "รายงานภาษี",
    report_settings: "ตั้งค่ารายงาน",

    // Budget Planning - Sub
    create_budget: "สร้างงบประมาณ",
    view_budgets: "ดูงบประมาณ",
    budget_analysis: "วิเคราะห์งบประมาณ",
    budget_alerts: "แจ้งเตือนงบประมาณ",
    budget_settings: "ตั้งค่างบประมาณ",

    // Dashboard - Secondary
    overview: "ภาพรวม",
    analytics: "การวิเคราะห์",
    reports: "รายงาน",
    alerts: "การแจ้งเตือน",
    widgets: "วิดเจ็ต",
    customization: "การปรับแต่ง",

    // Overview - Sub
    main_dashboard: "แดชบอร์ดหลัก",
    quick_stats: "สถิติด่วน",
    recent_activity: "กิจกรรมล่าสุด",
    notifications: "การแจ้งเตือน",
    dashboard_settings: "ตั้งค่าแดชบอร์ด",

    // Analytics - Sub
    performance_metrics: "ตัวชี้วัดประสิทธิภาพ",
    trend_analysis: "การวิเคราะห์แนวโน้ม",
    comparative_reports: "รายงานเปรียบเทียบ",
    custom_analytics: "การวิเคราะห์แบบกำหนดเอง",

    // Reports - Sub
    generate_report: "สร้างรายงาน",
    scheduled_reports: "รายงานตามกำหนดเวลา",
    report_templates: "แม่แบบรายงาน",
    report_archive: "เอกสารรายงานเก็บถาวร",

    // Alerts - Sub
    view_alerts: "ดูการแจ้งเตือน",
    alert_rules: "กฎการแจ้งเตือน",
    alert_history: "ประวัติการแจ้งเตือน",
    alert_notifications: "การแจ้งเตือน",
    alert_settings: "ตั้งค่าการแจ้งเตือน",

    // Widgets - Sub
    available_widgets: "วิดเจ็ตที่พร้อมใช้งาน",
    widget_layout: "เค้าโครงวิดเจ็ต",
    widget_settings: "ตั้งค่าวิดเจ็ต",
    custom_widgets: "วิดเจ็ตแบบกำหนดเอง",
    widget_library: "คลังวิดเจ็ต",

    // Customization - Sub
    layout_options: "ตัวเลือกเค้าโครง",
    theme_settings: "ตั้งค่าธีม",
    display_preferences: "การตั้งค่าการแสดงผล",
    data_sources: "แหล่งข้อมูล",
    reset_dashboard: "รีเซ็ตแดชบอร์ด",
  },

  zh: {
    // Primary navigation
    area: "区域",
    contract: "合同",
    service: "服务",
    finance: "财务",
    dashboard: "仪表板",

    // Area - Secondary
    area_management: "区域管理",
    area_allocation: "区域分配",
    area_maintenance: "区域维护",
    area_inspection: "区域检查",
    area_availability: "区域可用性",
    area_documentation: "区域文档",

    // Area Management - Sub
    view_all_areas: "查看所有区域",
    add_new_area: "添加新区域",
    area_statistics: "区域统计",
    area_reports: "区域报告",
    area_settings: "区域设置",

    // Area Allocation - Sub
    allocate_space: "分配空间",
    view_allocations: "查看分配",
    allocation_history: "分配历史",
    allocation_analytics: "分配分析",
    allocation_settings: "分配设置",

    // Area Maintenance - Sub
    maintenance_schedule: "维护计划",
    maintenance_requests: "维护请求",
    maintenance_history: "维护历史",
    maintenance_reports: "维护报告",
    maintenance_settings: "维护设置",

    // Area Inspection - Sub
    schedule_inspection: "安排检查",
    inspection_reports: "检查报告",
    inspection_history: "检查历史",
    inspection_checklist: "检查清单",
    inspection_settings: "检查设置",

    // Area Availability - Sub
    check_availability: "检查可用性",
    availability_calendar: "可用性日历",
    availability_reports: "可用性报告",
    availability_alerts: "可用性警报",
    availability_settings: "可用性设置",

    // Area Documentation - Sub
    view_documents: "查看文档",
    upload_documents: "上传文档",
    document_categories: "文档类别",
    document_search: "搜索文档",
    document_archive: "文档存档",

    // Contract - Secondary
    contract_management: "合同管理",
    contract_renewal: "合同续签",
    contract_termination: "合同终止",
    contract_documents: "合同文档",
    contract_compliance: "合同合规",
    contract_analytics: "合同分析",

    // Contract Management - Sub
    view_all_contracts: "查看所有合同",
    create_new_contract: "创建新合同",
    contract_templates: "合同模板",
    contract_reports: "合同报告",
    contract_settings: "合同设置",

    // Contract Renewal - Sub
    renewal_requests: "续签请求",
    renewal_schedule: "续签计划",
    renewal_history: "续签历史",
    renewal_analytics: "续签分析",
    renewal_settings: "续签设置",

    // Contract Termination - Sub
    termination_requests: "终止请求",
    termination_process: "终止流程",
    termination_history: "终止历史",
    termination_reports: "终止报告",
    termination_settings: "终止设置",

    // Contract Documents - Sub
    document_signing: "文档签署",

    // Contract Compliance - Sub
    compliance_check: "合规检查",
    compliance_reports: "合规报告",
    compliance_alerts: "合规警报",
    compliance_history: "合规历史",
    compliance_settings: "合规设置",

    // Contract Analytics - Sub
    contract_metrics: "合同指标",
    performance_analysis: "绩效分析",
    contract_trends: "合同趋势",
    custom_reports: "自定义报告",
    analytics_settings: "分析设置",

    // Service - Secondary
    service_requests: "服务请求",
    service_providers: "服务提供商",
    service_scheduling: "服务调度",
    service_quality: "服务质量",
    service_billing: "服务账单",
    service_analytics: "服务分析",

    // Service Requests - Sub
    view_all_requests: "查看所有请求",
    create_new_request: "创建新请求",
    request_status: "请求状态",
    request_history: "请求历史",
    request_settings: "请求设置",

    // Service Providers - Sub
    view_providers: "查看提供商",
    add_new_provider: "添加新提供商",
    provider_ratings: "提供商评级",
    provider_contracts: "提供商合同",
    provider_settings: "提供商设置",

    // Service Scheduling - Sub
    view_schedule: "查看日程",
    create_schedule: "创建日程",
    schedule_calendar: "日程日历",
    schedule_conflicts: "日程冲突",
    schedule_settings: "日程设置",

    // Service Quality - Sub
    quality_metrics: "质量指标",
    quality_reports: "质量报告",
    quality_feedback: "质量反馈",
    quality_improvements: "质量改进",
    quality_settings: "质量设置",

    // Service Billing - Sub
    view_invoices: "查看发票",
    create_invoice: "创建发票",
    payment_history: "付款历史",
    billing_reports: "账单报告",
    billing_settings: "账单设置",

    // Service Analytics - Sub
    service_metrics: "服务指标",
    service_trends: "服务趋势",

    // Finance - Secondary
    revenue_management: "收入管理",
    expense_tracking: "费用跟踪",
    payment_processing: "付款处理",
    invoicing: "开票",
    financial_reports: "财务报告",
    budget_planning: "预算规划",

    // Revenue Management - Sub
    view_revenue: "查看收入",
    revenue_reports: "收入报告",
    revenue_forecast: "收入预测",
    revenue_analytics: "收入分析",
    revenue_settings: "收入设置",

    // Expense Tracking - Sub
    view_expenses: "查看费用",
    add_new_expense: "添加新费用",
    expense_reports: "费用报告",
    expense_categories: "费用类别",
    expense_settings: "费用设置",

    // Payment Processing - Sub
    process_payments: "处理付款",
    payment_methods: "付款方式",
    payment_reports: "付款报告",
    payment_settings: "付款设置",

    // Invoicing - Sub
    invoice_templates: "发票模板",
    invoice_reports: "发票报告",
    invoice_settings: "发票设置",

    // Financial Reports - Sub
    profit_loss: "损益表",
    balance_sheet: "资产负债表",
    cash_flow: "现金流",
    tax_reports: "税务报告",
    report_settings: "报告设置",

    // Budget Planning - Sub
    create_budget: "创建预算",
    view_budgets: "查看预算",
    budget_analysis: "预算分析",
    budget_alerts: "预算警报",
    budget_settings: "预算设置",

    // Dashboard - Secondary
    overview: "概览",
    analytics: "分析",
    reports: "报告",
    alerts: "警报",
    widgets: "小部件",
    customization: "自定义",

    // Overview - Sub
    main_dashboard: "主仪表板",
    quick_stats: "快速统计",
    recent_activity: "最近活动",
    notifications: "通知",
    dashboard_settings: "仪表板设置",

    // Analytics - Sub
    performance_metrics: "性能指标",
    trend_analysis: "趋势分析",
    comparative_reports: "对比报告",
    custom_analytics: "自定义分析",

    // Reports - Sub
    generate_report: "生成报告",
    scheduled_reports: "计划报告",
    report_templates: "报告模板",
    report_archive: "报告存档",

    // Alerts - Sub
    view_alerts: "查看警报",
    alert_rules: "警报规则",
    alert_history: "警报历史",
    alert_notifications: "警报通知",
    alert_settings: "警报设置",

    // Widgets - Sub
    available_widgets: "可用小部件",
    widget_layout: "小部件布局",
    widget_settings: "小部件设置",
    custom_widgets: "自定义小部件",
    widget_library: "小部件库",

    // Customization - Sub
    layout_options: "布局选项",
    theme_settings: "主题设置",
    display_preferences: "显示首选项",
    data_sources: "数据源",
    reset_dashboard: "重置仪表板",
  }
};
