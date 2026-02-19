// kpi-summary.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardComponent } from './components/metric-card/metric-card.component';
import { DashboardDataService } from '@core/services/dashboard-data.service';
import { KPIMetrics } from '@core/models/dashboard.types';

@Component({
  selector: 'app-kpi-summary',
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  templateUrl: './kpi-summary.component.html',
  styleUrl: './kpi-summary.component.css'
})
export class KpiSummaryComponent implements OnInit {

  // ==================== SIGNALS ====================

  kpiMetrics = signal<KPIMetrics | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // ==================== CONSTRUCTOR ====================

  constructor(private dashboardData: DashboardDataService) {}

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadKPIMetrics();
  }

  // ==================== DATA LOADING ====================

  loadKPIMetrics(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardData.getKPIMetrics().subscribe({
      next: (metrics) => {
        this.kpiMetrics.set(metrics);
        this.isLoading.set(false);
        console.log('✅ KPI Metrics loaded:', metrics);
      },
      error: (err) => {
        this.error.set('Failed to load KPI metrics');
        this.isLoading.set(false);
        console.error('❌ Error loading KPI metrics:', err);
      }
    });
  }

  // ==================== UTILITY ====================

  refresh(): void {
    this.loadKPIMetrics();
  }
}
