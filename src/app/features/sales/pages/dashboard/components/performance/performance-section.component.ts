// performance-section.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

// Import mock data
import {
  SalesTeamMember,
  PipelineStage,
  SourceAttribution,
  MonteCarloSimulation,
  ExecutiveSummary,
  SalesActivity,
  MOCK_SALES_TEAM,
  MOCK_EXTENDED_SALES_TEAM,
  MOCK_PIPELINE_STAGES,
  MOCK_SOURCE_ATTRIBUTION,
  MOCK_MONTE_CARLO,
  MOCK_EXECUTIVE_SUMMARY,
  MOCK_TEAM_TOTALS,
  MOCK_TEAM_WEEKLY_SALES,
  MOCK_SALES_ACTIVITIES,
  calculateMonteCarloProbability
} from '@core/data/sales-performance.mock';

// Import child components (will be created)
import { TeamOverviewPanelComponent } from './components/team-overview-panel/team-overview-panel.component';
import { TeamMemberCardsComponent } from './components/team-member-cards/team-member-cards.component';
import { MemberDetailsComponent } from './components/member-details/member-details.component';
import { StageConversionTableComponent } from './components/stage-conversion-table/stage-conversion-table.component';
import { SourceAttributionChartComponent } from './components/source-attribution-chart/source-attribution-chart.component';
import { MonteCarloForecastComponent } from './components/monte-carlo-forecast/monte-carlo-forecast.component';
import { ReportsKpisSectionComponent } from './components/reports-kpis-section/reports-kpis-section.component';

@Component({
  selector: 'app-performance-section',
  standalone: true,
  imports: [
    CommonModule,
    TeamOverviewPanelComponent,
    TeamMemberCardsComponent,
    MemberDetailsComponent,
    StageConversionTableComponent,
    SourceAttributionChartComponent,
    MonteCarloForecastComponent,
    ReportsKpisSectionComponent
  ],
  templateUrl: './performance-section.component.html',
  styleUrl: './performance-section.component.css'
})
export class PerformanceSectionComponent implements OnInit {

  // ==================== SIGNALS ====================

  // Data
  salesTeam = signal<SalesTeamMember[]>([]);
  extendedSalesTeam = signal<SalesTeamMember[]>([]);
  pipelineStages = signal<PipelineStage[]>([]);
  sourceAttribution = signal<SourceAttribution[]>([]);
  monteCarloData = signal<MonteCarloSimulation | null>(null);
  executiveSummary = signal<ExecutiveSummary | null>(null);
  salesActivities = signal<SalesActivity[]>([]);

  // Team totals
  teamTotals = signal({
    thisYear: 0,
    thisWeek: 0,
    lastWeek: 0,
    weekChange: 0
  });

  teamWeeklySales = signal<Array<{ week: string; sales: number }>>([]);

  // UI State
  isLoading = signal<boolean>(false);
  selectedMemberId = signal<string | null>(null);
  isMonteCarloRunning = signal<boolean>(false);

  // ==================== COMPUTED ====================

  // Selected member details
  selectedMember = computed(() => {
    const id = this.selectedMemberId();
    if (!id) return null;
    return this.extendedSalesTeam().find(m => m.id === id) || null;
  });

  // Selected member activities (assignments only, no personal tasks)
  selectedMemberActivities = computed(() => {
    const memberId = this.selectedMemberId();
    if (!memberId) return [];

    return this.salesActivities().filter(activity =>
      activity.assignedTo === memberId
    );
  });

  // Leaderboard (sorted by sales this year)
  leaderboard = computed(() => {
    return [...this.extendedSalesTeam()].sort((a, b) =>
      b.salesThisYear - a.salesThisYear
    );
  });

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadPerformanceData();
  }

  // ==================== DATA LOADING ====================

  loadPerformanceData(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.salesTeam.set([...MOCK_SALES_TEAM]);
      this.extendedSalesTeam.set([...MOCK_EXTENDED_SALES_TEAM]);
      this.pipelineStages.set([...MOCK_PIPELINE_STAGES]);
      this.sourceAttribution.set([...MOCK_SOURCE_ATTRIBUTION]);
      this.monteCarloData.set({ ...MOCK_MONTE_CARLO });
      this.executiveSummary.set({ ...MOCK_EXECUTIVE_SUMMARY });
      this.teamTotals.set({ ...MOCK_TEAM_TOTALS });
      this.teamWeeklySales.set([...MOCK_TEAM_WEEKLY_SALES]);
      this.salesActivities.set([...MOCK_SALES_ACTIVITIES]);

      this.isLoading.set(false);
      console.log('Performance data loaded');
    }, 800);
  }

  // ==================== MEMBER SELECTION ====================

  onMemberSelect(memberId: string): void {
    if (this.selectedMemberId() === memberId) {
      // Deselect if clicking same member
      this.selectedMemberId.set(null);
    } else {
      this.selectedMemberId.set(memberId);

      // Scroll to member details section smoothly
      setTimeout(() => {
        const detailsSection = document.querySelector('.member-details-section');
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  onMemberDeselect(): void {
    this.selectedMemberId.set(null);
  }

  // ==================== MONTE CARLO SIMULATION ====================

  runMonteCarloSimulation(): void {
    this.isMonteCarloRunning.set(true);

    // Simulate running 1000 simulations (takes 2-3 seconds)
    setTimeout(() => {
      const currentData = this.monteCarloData();
      if (!currentData) return;

      // Recalculate probability with some randomness
      const avgWinRate = this.executiveSummary()?.winRate || 31;
      const newProbability = calculateMonteCarloProbability(
        currentData.currentPipeline,
        currentData.target,
        avgWinRate / 100
      );

      // Add some variance to make it realistic
      const variance = Math.random() * 10 - 5; // ±5%
      const finalProbability = Math.max(0, Math.min(100, newProbability + variance));

      this.monteCarloData.set({
        ...currentData,
        probability: Math.round(finalProbability),
        simulations: 1000
      });

      this.isMonteCarloRunning.set(false);
      console.log('Monte Carlo simulation completed');
    }, 2500);
  }

  // ==================== UTILITY ====================

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  formatPercentage(value: number): string {
    return `${value}%`;
  }
}
