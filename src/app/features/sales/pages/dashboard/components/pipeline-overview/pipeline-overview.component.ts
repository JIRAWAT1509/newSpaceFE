// pipeline-overview.component.ts - FULL IMPLEMENTATION WITH NAVIGATION
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Import sub-components
import { PipelineFunnelChartComponent } from './components/pipeline-funnel-chart/pipeline-funnel-chart.component';
import { StageAnalysisTableComponent } from './components/stage-analysis-table/stage-analysis-table.component';
import { DealVelocityCardComponent } from './components/deal-velocity-card/deal-velocity-card.component';

// Import service and types
import { DashboardDataService } from '@core/services/dashboard-data.service';
import { PipelineOverview, DealVelocity } from '@core/models/dashboard.types';

@Component({
  selector: 'app-pipeline-overview',
  standalone: true,
  imports: [
    CommonModule,
    PipelineFunnelChartComponent,
    StageAnalysisTableComponent,
    DealVelocityCardComponent
  ],
  templateUrl: './pipeline-overview.component.html',
  styleUrl: './pipeline-overview.component.css'
})
export class PipelineOverviewComponent implements OnInit {

  // ==================== SIGNALS ====================

  pipelineData = signal<PipelineOverview | null>(null);
  velocityData = signal<DealVelocity | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // ==================== CONSTRUCTOR ====================

  constructor(
    private dashboardData: DashboardDataService,
    private router: Router
  ) {}

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadPipelineData();
  }

  // ==================== DATA LOADING ====================

  loadPipelineData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Load pipeline overview
    this.dashboardData.getPipelineOverview().subscribe({
      next: (data) => {
        this.pipelineData.set(data);
        console.log('✅ Pipeline overview loaded:', data);
      },
      error: (err) => {
        this.error.set('Failed to load pipeline data');
        console.error('❌ Error loading pipeline:', err);
      }
    });

    // Load deal velocity
    this.dashboardData.getDealVelocity().subscribe({
      next: (data) => {
        this.velocityData.set(data);
        this.isLoading.set(false);
        console.log('✅ Deal velocity loaded:', data);
      },
      error: (err) => {
        this.error.set('Failed to load velocity data');
        this.isLoading.set(false);
        console.error('❌ Error loading velocity:', err);
      }
    });
  }

  // ==================== NAVIGATION ====================

  navigateToPipeline(): void {
    this.router.navigate(['/sales/pipeline']);
  }

  // ==================== UTILITY ====================

  refresh(): void {
    this.loadPipelineData();
  }
}
