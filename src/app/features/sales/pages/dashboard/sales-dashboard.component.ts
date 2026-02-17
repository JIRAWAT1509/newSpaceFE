// sales-dashboard-page.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiSummaryComponent } from './components/kpi-summary/kpi-summary.component';
import { PipelineOverviewComponent } from './components/pipeline-overview/pipeline-overview.component';
import { CustomerInsightsComponent } from './components/customer-insights/customer-insights.component';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiSummaryComponent,
    PipelineOverviewComponent,
    CustomerInsightsComponent,
    TeamPerformanceComponent
  ],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.css'
})
export class SalesDashboardComponent {}
