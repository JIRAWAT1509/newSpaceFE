// pipeline-master.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Deal,
  PipelineStage,
  StageMetrics,
  PipelineMetrics,
  HotFilter,
  StageSortBy,
  StageViewConfig,
  calculateWeightedValue,
  calculateDaysInStage,
  calculateDaysUntilDue,
  getDueStatus,
  calculateAverageWinRate
} from '@core/models/pipeline.model';
import { MOCK_DEALS, MOCK_STAGES } from '@core/data/pipeline.mock';
import { PipelineMetricsComponent } from '../components/pipeline-metrics/pipeline-metrics.component';
import { PipelineFiltersComponent, FilterState } from '../components/pipeline-filters/pipeline-filters.component';
import { KanbanBoardComponent } from '../components/kanban-board/kanban-board.component';

@Component({
  selector: 'app-pipeline-master',
  standalone: true,
  imports: [
    CommonModule,
    PipelineMetricsComponent,
    PipelineFiltersComponent,
    KanbanBoardComponent
  ],
  templateUrl: './pipeline-master.component.html',
  styleUrl: './pipeline-master.component.css'
})
export class PipelineMasterComponent implements OnInit {
  // ==================== STATE ====================

  // Core data
  deals = signal<Deal[]>([...MOCK_DEALS]);
  stages = signal<PipelineStage[]>([...MOCK_STAGES]);

  // Filters
  activeHotFilter = signal<HotFilter>('all');
  searchQuery = signal('');
  selectedOwner = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);

  // Stage view configs (pagination & sorting per stage)
  stageViewConfigs = signal<Map<string, StageViewConfig>>(new Map());

  // ==================== COMPUTED PROPERTIES ====================

  // Filtered deals based on hot filter + search + dropdowns
  filteredDeals = computed(() => {
    let deals = this.deals();
    const hotFilter = this.activeHotFilter();
    const search = this.searchQuery().toLowerCase();
    const owner = this.selectedOwner();
    const priority = this.selectedPriority();

    // Apply hot filter
    if (hotFilter === 'overdue') {
      deals = deals.filter(d => d.daysUntilDue < 0);
    } else if (hotFilter === 'near-due') {
      deals = deals.filter(d => d.daysUntilDue >= 0 && d.daysUntilDue <= 2);
    } else if (hotFilter === 'high-priority') {
      deals = deals.filter(d => d.priority === 'high');
    } else if (hotFilter === 'medium-priority') {
      deals = deals.filter(d => d.priority === 'medium');
    } else if (hotFilter === 'low-priority') {
      deals = deals.filter(d => d.priority === 'low');
    }

    // Apply search
    if (search) {
      deals = deals.filter(d =>
        d.title.toLowerCase().includes(search) ||
        d.customerName.toLowerCase().includes(search) ||
        (d.companyName && d.companyName.toLowerCase().includes(search)) ||
        (d.areaName && d.areaName.toLowerCase().includes(search))
      );
    }

    // Apply owner filter
    if (owner) {
      deals = deals.filter(d => d.ownerName === owner);
    }

    // Apply priority filter
    if (priority) {
      deals = deals.filter(d => d.priority === priority);
    }

    return deals;
  });

  // Deals grouped by stage
  dealsByStage = computed(() => {
    const map = new Map<string, Deal[]>();
    const stages = this.stages();
    const deals = this.filteredDeals();

    stages.forEach(stage => {
      const stageDeals = deals.filter(d => d.stageId === stage.id);
      map.set(stage.id, stageDeals);
    });

    return map;
  });

  // Stage metrics
  stageMetrics = computed(() => {
    const map = new Map<string, StageMetrics>();
    const stages = this.stages();
    const dealsByStage = this.dealsByStage();

    stages.forEach(stage => {
      const deals = dealsByStage.get(stage.id) || [];
      const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
      const totalWeightedValue = deals.reduce((sum, d) => sum + d.weightedValue, 0);
      const actualWinRate = calculateAverageWinRate(deals);
      const averageDaysInStage = deals.length > 0
        ? deals.reduce((sum, d) => sum + d.daysInStage, 0) / deals.length
        : 0;

      map.set(stage.id, {
        stageId: stage.id,
        stageName: stage.name,
        totalDeals: deals.length,
        totalValue,
        totalWeightedValue,
        averageDealValue: deals.length > 0 ? totalValue / deals.length : 0,
        forecastWinRate: stage.forecastWinRate,
        actualWinRate,
        averageDaysInStage: Math.round(averageDaysInStage)
      });
    });

    return map;
  });

  // Pipeline metrics
  pipelineMetrics = computed(() => {
    const allDeals = this.deals();
    const filteredDeals = this.filteredDeals();

    const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);
    const totalWeightedValue = filteredDeals.reduce((sum, d) => sum + d.weightedValue, 0);
    const overdueDealCount = filteredDeals.filter(d => d.daysUntilDue < 0).length;
    const nearDueDealCount = filteredDeals.filter(d => d.daysUntilDue >= 0 && d.daysUntilDue <= 2).length;

    // Calculate deals added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dealsAddedThisWeek = allDeals.filter(d => new Date(d.createdAt) >= oneWeekAgo).length;

    // Calculate deals added this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const dealsAddedThisMonth = allDeals.filter(d => new Date(d.createdAt) >= oneMonthAgo).length;

    // Calculate average deal age
    const totalDaysInStage = filteredDeals.reduce((sum, d) => sum + d.daysInStage, 0);
    const averageDealAge = filteredDeals.length > 0 ? Math.round(totalDaysInStage / filteredDeals.length) : 0;

    const metrics: PipelineMetrics = {
      totalDeals: filteredDeals.length,
      totalValue,
      totalWeightedValue,
      averageDealValue: filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0,
      averageDealAge,
      overdueDealCount,
      nearDueDealCount,
      dealsAddedThisWeek,
      dealsAddedThisMonth,
      dealsWonThisMonth: 0, // TODO: Track closed deals
      dealsLostThisMonth: 0,
      winRate: 42, // Mock value - should be calculated from historical data
      averageTimeToClose: 45, // Mock value
      stageMetrics: []
    };

    return metrics;
  });

  // Get unique owners for filter
  uniqueOwners = computed(() => {
    const owners = new Set<string>();
    this.deals().forEach(d => owners.add(d.ownerName));
    return Array.from(owners).sort();
  });

  // Get unique tags for filter
  uniqueTags = computed(() => {
    const tags = new Set<string>();
    this.deals().forEach(d => d.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  });

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.initializeStageViewConfigs();
    this.updateAllDealsCalculations();
  }

  // Initialize stage view configs with defaults
  private initializeStageViewConfigs(): void {
    const configs = new Map<string, StageViewConfig>();

    this.stages().forEach(stage => {
      configs.set(stage.id, {
        stageId: stage.id,
        sortBy: 'due-date',
        sortOrder: 'asc',
        currentPage: 1,
        cardsPerPage: 8
      });
    });

    this.stageViewConfigs.set(configs);
  }

  // Update all deal calculations (days in stage, days until due, etc.)
  private updateAllDealsCalculations(): void {
    this.deals.update(deals =>
      deals.map(deal => ({
        ...deal,
        daysInStage: calculateDaysInStage(deal.movedToStageAt),
        daysUntilDue: calculateDaysUntilDue(deal.dueDate),
        weightedValue: calculateWeightedValue(deal.value, deal.actualWinRate)
      }))
    );
  }

  // ==================== EVENT HANDLERS ====================

  // Hot filter change
  onHotFilterChange(filter: HotFilter): void {
    this.activeHotFilter.set(filter);
  }

  // Filter change from filters component
  onFilterChange(filterState: FilterState): void {
    this.searchQuery.set(filterState.search);
    this.selectedOwner.set(filterState.owner);
    this.selectedPriority.set(filterState.priority);
  }

  // Stage sort change
  onStageSortChange(event: { stageId: string; sortBy: StageSortBy }): void {
    const configs = new Map(this.stageViewConfigs());
    const config = configs.get(event.stageId);

    if (config) {
      configs.set(event.stageId, {
        ...config,
        sortBy: event.sortBy,
        currentPage: 1 // Reset to page 1 when sorting changes
      });
      this.stageViewConfigs.set(configs);
    }
  }

  // Stage page change
  onStagePageChange(event: { stageId: string; page: number }): void {
    const configs = new Map(this.stageViewConfigs());
    const config = configs.get(event.stageId);

    if (config) {
      configs.set(event.stageId, {
        ...config,
        currentPage: event.page
      });
      this.stageViewConfigs.set(configs);
    }
  }

  // Stage cards per page change
  onStageCardsPerPageChange(event: { stageId: string; cardsPerPage: number }): void {
    const configs = new Map(this.stageViewConfigs());
    const config = configs.get(event.stageId);

    if (config) {
      configs.set(event.stageId, {
        ...config,
        cardsPerPage: event.cardsPerPage,
        currentPage: 1 // Reset to page 1 when cards per page changes
      });
      this.stageViewConfigs.set(configs);
    }
  }

  // Stage settings clicked
  onStageSettings(stageId: string): void {
    console.log('Stage settings clicked:', stageId);
    // TODO: Open stage config modal
  }

  // Deal clicked
  onDealClicked(dealId: string): void {
    console.log('Deal clicked:', dealId);
    // TODO: Open deal detail modal
  }

  // Deal menu clicked
  onDealMenuClicked(dealId: string): void {
    console.log('Deal menu clicked:', dealId);
    // TODO: Open context menu or quick actions
  }

  // Deal moved between stages
  onDealMoved(event: { dealId: string; fromStageId: string; toStageId: string }): void {
    const { dealId, fromStageId, toStageId } = event;

    if (fromStageId === toStageId) return;

    const toStage = this.stages().find(s => s.id === toStageId);
    if (!toStage) return;

    // Update deal's stage and related fields
    this.deals.update(deals =>
      deals.map(deal => {
        if (deal.id === dealId) {
          const now = new Date().toISOString();
          const newDueDate = new Date();
          newDueDate.setDate(newDueDate.getDate() + toStage.defaultDueDays);

          return {
            ...deal,
            stageId: toStageId,
            stageName: toStage.name,
            movedToStageAt: now,
            dueDate: newDueDate.toISOString(),
            actualWinRate: toStage.forecastWinRate, // Update to stage's forecast
            weightedValue: calculateWeightedValue(deal.value, toStage.forecastWinRate),
            daysInStage: 0,
            daysUntilDue: toStage.defaultDueDays,
            lastActivityAt: now
          };
        }
        return deal;
      })
    );

    console.log(`Deal ${dealId} moved from ${fromStageId} to ${toStageId}`);
  }

  // Add deal (for future modal integration)
  onAddDeal(): void {
    console.log('Add deal clicked');
    // TODO: Open add deal modal
  }

  // Configure stages (for future modal integration)
  onConfigureStages(): void {
    console.log('Configure stages clicked');
    // TODO: Open stage config modal
  }
}
