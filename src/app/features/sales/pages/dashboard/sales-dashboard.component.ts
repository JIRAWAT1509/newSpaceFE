// sales-dashboard-page.component.ts - FINAL VERSION

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiSummaryComponent } from './components/kpi-summary/kpi-summary.component';
import { PipelineOverviewComponent } from './components/pipeline-overview/pipeline-overview.component';
import { CustomerInsightsComponent } from './components/customer-insights/customer-insights.component';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { AtRiskCustomersAlertComponent } from './components/customer-insights/components/at-risk-customers-alert/at-risk-customers-alert.component';
import { DashboardDataService } from '@core/services/dashboard-data.service';
import { AtRiskCustomer } from '@core/models/dashboard.types';

@Component({
  selector: 'app-sales-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    KpiSummaryComponent,
    PipelineOverviewComponent,
    CustomerInsightsComponent,
    TeamPerformanceComponent,
    AtRiskCustomersAlertComponent
  ],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.css'
})
export class SalesDashboardComponent implements OnInit {

  atRiskCustomers = signal<AtRiskCustomer[]>([]);
  isLoadingAtRisk = signal<boolean>(false);

  constructor(private dashboardData: DashboardDataService) {}

  ngOnInit(): void {
    this.loadAtRiskCustomers();
  }

  loadAtRiskCustomers(): void {
    this.isLoadingAtRisk.set(true);

    this.dashboardData.getCustomerInsights().subscribe({
      next: (insights) => {
        this.atRiskCustomers.set(insights.atRiskCustomers);
        this.isLoadingAtRisk.set(false);
      },
      error: (err) => {
        console.error('Error loading at-risk customers:', err);
        this.isLoadingAtRisk.set(false);
      }
    });
  }
}
