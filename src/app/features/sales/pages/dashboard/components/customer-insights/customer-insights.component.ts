// customer-insights.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueBreakdownChartComponent } from './components/revenue-breakdown-chart/revenue-breakdown-chart.component';
import { CustomerClassificationChartComponent } from './components/customer-classification-chart/customer-classification-chart.component';
import { TopCustomersTableComponent } from './components/top-customers-table/top-customers-table.component';
import { AtRiskCustomersAlertComponent } from './components/at-risk-customers-alert/at-risk-customers-alert.component';
import { DashboardDataService } from '@core/services/dashboard-data.service';
import { CustomerInsights } from '@core/models/dashboard.types';

@Component({
  selector: 'app-customer-insights',
  standalone: true,
  imports: [
    CommonModule,
    RevenueBreakdownChartComponent,
    CustomerClassificationChartComponent,
    TopCustomersTableComponent,
    AtRiskCustomersAlertComponent
  ],
  templateUrl: './customer-insights.component.html',
  styleUrl: './customer-insights.component.css'
})
export class CustomerInsightsComponent implements OnInit {

  insights = signal<CustomerInsights | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private dashboardData: DashboardDataService) {}

  ngOnInit(): void {
    this.loadCustomerInsights();
  }

  loadCustomerInsights(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardData.getCustomerInsights().subscribe({
      next: (data) => {
        this.insights.set(data);
        this.isLoading.set(false);
        console.log('✅ Customer insights loaded:', data);
      },
      error: (err) => {
        this.error.set('Failed to load customer insights');
        this.isLoading.set(false);
        console.error('❌ Error loading customer insights:', err);
      }
    });
  }

  refresh(): void {
    this.loadCustomerInsights();
  }
}
