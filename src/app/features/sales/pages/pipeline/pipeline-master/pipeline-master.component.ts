// pipeline-master.component.ts (UPDATED WITH DETAILED LOGGING)
import { Component, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
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
  calculateAverageWinRate
} from '@core/models/pipeline.model';
import { MOCK_DEALS, MOCK_STAGES } from '@core/data/pipeline.mock';
import { PipelineMetricsComponent } from '../components/pipeline-metrics/pipeline-metrics.component';
import { PipelineFiltersComponent, FilterState } from '../components/pipeline-filters/pipeline-filters.component';
import { KanbanBoardComponent } from '../components/kanban-board/kanban-board.component';
import { AddDealModalComponent, AddDealData } from '../components/add-deal-modal/add-deal-modal.component';
import { EditDealModalComponent, EditDealData } from '../components/edit-deal-modal/edit-deal-modal.component';
import { StageConfigModalComponent, StageConfigData } from '../components/stage-config-modal/stage-config-modal.component';
import { DealDetailModalComponent, DealDetailAction } from '../components/deal-detail-modal/deal-detail-modal.component';

@Component({
  selector: 'app-pipeline-master',
  standalone: true,
  imports: [
    CommonModule,
    PipelineMetricsComponent,
    PipelineFiltersComponent,
    KanbanBoardComponent,
    AddDealModalComponent,
    EditDealModalComponent,
    StageConfigModalComponent,
    DealDetailModalComponent
  ],
  templateUrl: './pipeline-master.component.html',
  styleUrl: './pipeline-master.component.css'
})
export class PipelineMasterComponent implements OnInit {

  // View children
  @ViewChild(AddDealModalComponent) addDealModal!: AddDealModalComponent;
  @ViewChild(EditDealModalComponent) editDealModal!: EditDealModalComponent;
  @ViewChild(StageConfigModalComponent) stageConfigModal!: StageConfigModalComponent;
  @ViewChild('dealDetailModal') dealDetailModal!: DealDetailModalComponent;

  // Core data
  deals = signal<Deal[]>([...MOCK_DEALS]);
  stages = signal<PipelineStage[]>([...MOCK_STAGES]);

  // Filters
  activeHotFilter = signal<HotFilter>('all');
  searchQuery = signal('');
  selectedOwner = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);

  // Stage view configs
  stageViewConfigs = signal<Map<string, StageViewConfig>>(new Map());

  // Deal ID counter
  private nextDealId = signal(11);

  // Filtered deals
  filteredDeals = computed(() => {
    let deals = this.deals();
    const hotFilter = this.activeHotFilter();
    const search = this.searchQuery().toLowerCase();
    const owner = this.selectedOwner();
    const priority = this.selectedPriority();

    // Hot filter - COMBINED URGENT FILTER
    if (hotFilter === 'urgent') {
      deals = deals.filter(d => d.daysUntilDue <= 2); // overdue OR near-due
    } else if (hotFilter === 'high-priority') {
      deals = deals.filter(d => d.priority === 'high');
    } else if (hotFilter === 'medium-priority') {
      deals = deals.filter(d => d.priority === 'medium');
    } else if (hotFilter === 'low-priority') {
      deals = deals.filter(d => d.priority === 'low');
    }

    if (search) {
      deals = deals.filter(d =>
        d.title.toLowerCase().includes(search) ||
        d.customerName.toLowerCase().includes(search) ||
        (d.companyName && d.companyName.toLowerCase().includes(search)) ||
        (d.areaName && d.areaName.toLowerCase().includes(search))
      );
    }

    if (owner) deals = deals.filter(d => d.ownerName === owner);
    if (priority) deals = deals.filter(d => d.priority === priority);

    return deals;
  });

  // Deals grouped by stage
  dealsByStage = computed(() => {
    const map = new Map<string, Deal[]>();
    this.stages().forEach(stage => {
      map.set(stage.id, this.filteredDeals().filter(d => d.stageId === stage.id));
    });
    return map;
  });

  // Stage metrics
  stageMetrics = computed(() => {
    const map = new Map<string, StageMetrics>();
    this.stages().forEach(stage => {
      const deals = this.dealsByStage().get(stage.id) || [];
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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dealsAddedThisWeek = allDeals.filter(d => new Date(d.createdAt) >= oneWeekAgo).length;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const dealsAddedThisMonth = allDeals.filter(d => new Date(d.createdAt) >= oneMonthAgo).length;

    const totalDaysInStage = filteredDeals.reduce((sum, d) => sum + d.daysInStage, 0);
    const averageDealAge = filteredDeals.length > 0 ? Math.round(totalDaysInStage / filteredDeals.length) : 0;

    return {
      totalDeals: filteredDeals.length,
      totalValue,
      totalWeightedValue,
      averageDealValue: filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0,
      averageDealAge,
      overdueDealCount,
      nearDueDealCount,
      dealsAddedThisWeek,
      dealsAddedThisMonth,
      dealsWonThisMonth: 0,
      dealsLostThisMonth: 0,
      winRate: 42,
      averageTimeToClose: 45,
      stageMetrics: []
    } as PipelineMetrics;
  });

  // Unique owners & tags
  uniqueOwners = computed(() => {
    const owners = new Set<string>();
    this.deals().forEach(d => owners.add(d.ownerName));
    return Array.from(owners).sort();
  });

  uniqueTags = computed(() => {
    const tags = new Set<string>();
    this.deals().forEach(d => d.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  });

  ngOnInit(): void {
    this.initializeStageViewConfigs();
    this.updateAllDealsCalculations();
  }

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

  // Event handlers
  onHotFilterChange(filter: HotFilter): void {
    this.activeHotFilter.set(filter);
  }

  onFilterChange(filterState: FilterState): void {
    this.searchQuery.set(filterState.search);
    this.selectedOwner.set(filterState.owner);
    this.selectedPriority.set(filterState.priority);
  }

  onStageSortChange(event: { stageId: string; sortBy: StageSortBy }): void {
    const configs = new Map(this.stageViewConfigs());
    const config = configs.get(event.stageId);
    if (config) {
      configs.set(event.stageId, { ...config, sortBy: event.sortBy, currentPage: 1 });
      this.stageViewConfigs.set(configs);
    }
  }

  onStagePageChange(event: { stageId: string; page: number }): void {
    const configs = new Map(this.stageViewConfigs());
    const config = configs.get(event.stageId);
    if (config) {
      configs.set(event.stageId, { ...config, currentPage: event.page });
      this.stageViewConfigs.set(configs);
    }
  }

  onStageSettings(stageId: string): void {
    // Create a map of stage ID to deal count
    const dealCounts = new Map<string, number>();
    for (const [stageId, deals] of this.dealsByStage().entries()) {
      dealCounts.set(stageId, deals.length);
    }

    this.stageConfigModal.open(this.stages(), dealCounts);
  }

  onDealClicked(dealId: string): void {
    const deal = this.deals().find(d => d.id === dealId);
    if (deal && this.dealDetailModal) {
      this.dealDetailModal.open(deal, this.stages());
    }
  }

  onDealMenuClicked(dealId: string): void {
    const deal = this.deals().find(d => d.id === dealId);
    if (deal) this.dealDetailModal.open(deal, this.stages());
  }

  onDealMoved(event: { dealId: string; fromStageId: string; toStageId: string }): void {
    console.log('');
    console.log('🎯 PIPELINE-MASTER: onDealMoved called');
    console.log('   - Deal ID:', event.dealId);
    console.log('   - From Stage ID:', event.fromStageId);
    console.log('   - To Stage ID:', event.toStageId);

    const { dealId, fromStageId, toStageId } = event;

    if (fromStageId === toStageId) {
      console.log('⚠️ PIPELINE-MASTER: Same stage - no change needed');
      return;
    }

    const fromStage = this.stages().find(s => s.id === fromStageId);
    const toStage = this.stages().find(s => s.id === toStageId);

    if (!toStage) {
      console.error('❌ PIPELINE-MASTER: Target stage not found!', toStageId);
      return;
    }

    const dealBefore = this.deals().find(d => d.id === dealId);

    if (!dealBefore) {
      console.error('❌ PIPELINE-MASTER: Deal not found!', dealId);
      return;
    }

    console.log('✅ PIPELINE-MASTER: Deal found:', dealBefore.title);
    console.log('   - Current Stage:', dealBefore.stageName);
    console.log('   - Target Stage:', toStage.name);
    console.log('   - Updating deal...');

    this.deals.update(deals =>
      deals.map(deal => {
        if (deal.id === dealId) {
          const now = DateTime.now().toISO();
          const newDueDate = DateTime.now().plus({ days: toStage.defaultDueDays });

          const updatedDeal = {
            ...deal,
            stageId: toStageId,
            stageName: toStage.name,
            movedToStageAt: now,
            dueDate: newDueDate.toISO(),
            actualWinRate: toStage.forecastWinRate,
            weightedValue: calculateWeightedValue(deal.value, toStage.forecastWinRate),
            daysInStage: 0,
            daysUntilDue: toStage.defaultDueDays,
            lastActivityAt: now,
            lastActivityType: 'stage_change'
          };

          console.log('✅ PIPELINE-MASTER: Deal updated successfully');
          console.log('   - New Stage:', updatedDeal.stageName);
          console.log('   - New Win Rate:', updatedDeal.actualWinRate + '%');

          return updatedDeal;
        }
        return deal;
      })
    );

    console.log('✅ PIPELINE-MASTER: deals signal updated');
    console.log('');
  }

  // Modal handlers
  onAddDeal(): void {
    this.addDealModal.open(this.stages());
  }

  onAddDealSave(dealData: AddDealData): void {
    const now = DateTime.now();
    const dueDate = now.plus({ days: dealData.defaultDueDays });

    const newDeal: Deal = {
      id: `deal-${String(this.nextDealId()).padStart(3, '0')}`,
      title: dealData.title,
      customerId: dealData.customerId,
      customerName: dealData.customerName,
      companyName: dealData.companyName,
      stageId: dealData.stageId,
      stageName: dealData.stageName,
      value: dealData.value,
      actualWinRate: dealData.actualWinRate,
      weightedValue: calculateWeightedValue(dealData.value, dealData.actualWinRate),
      createdAt: now.toISO(),
      movedToStageAt: now.toISO(),
      dueDate: dueDate.toISO(),
      areaId: dealData.areaId,
      areaName: dealData.areaName,
      buildingId: dealData.buildingId,
      buildingName: dealData.buildingName,
      floorNumber: dealData.floorNumber,
      contactPerson: dealData.contactPerson,
      contactPhone: dealData.contactPhone,
      contactEmail: dealData.contactEmail,
      tags: dealData.tags,
      priority: dealData.priority,
      notes: dealData.notes,
      ownerId: 'user-current',
      ownerName: 'Current User',
      lastActivityAt: now.toISO(),
      lastActivityType: 'note',
      daysInStage: 0,
      daysUntilDue: dealData.defaultDueDays,
      attachmentCount: 0,
      activityCount: 1
    };

    this.deals.update(deals => [...deals, newDeal]);
    this.nextDealId.update(id => id + 1);
    console.log('New deal added:', newDeal);
  }

  onEditDealSave(dealData: EditDealData): void {
    const now = DateTime.now();

    this.deals.update(deals =>
      deals.map(deal => {
        if (deal.id === dealData.dealId) {
          const stageChanged = dealData.stageChanged;

          return {
            ...deal,
            customerId: dealData.customerId,
            customerName: dealData.customerName,
            companyName: dealData.companyName,
            stageId: dealData.stageId,
            stageName: dealData.stageName,
            title: dealData.title,
            value: dealData.value,
            actualWinRate: dealData.actualWinRate,
            weightedValue: calculateWeightedValue(dealData.value, dealData.actualWinRate),
            areaId: dealData.areaId,
            areaName: dealData.areaName,
            buildingId: dealData.buildingId,
            buildingName: dealData.buildingName,
            floorNumber: dealData.floorNumber,
            tags: dealData.tags,
            priority: dealData.priority,
            notes: dealData.notes,
            contactPerson: dealData.contactPerson,
            contactPhone: dealData.contactPhone,
            contactEmail: dealData.contactEmail,
            movedToStageAt: stageChanged ? now.toISO() : deal.movedToStageAt,
            daysInStage: stageChanged ? 0 : calculateDaysInStage(deal.movedToStageAt),
            lastActivityAt: now.toISO(),
            lastActivityType: stageChanged ? 'stage_change' : 'note'
          };
        }
        return deal;
      })
    );

    console.log('Deal updated:', dealData.dealId);
  }

  onConfigureStages(): void {
    // Create a map of stage ID to deal count
    const dealCounts = new Map<string, number>();
    for (const [stageId, deals] of this.dealsByStage().entries()) {
      dealCounts.set(stageId, deals.length);
    }

    this.stageConfigModal.open(this.stages(), dealCounts);
  }

  onStageConfigSave(configData: StageConfigData): void {
    this.stages.set(configData.stages);

    this.deals.update(deals =>
      deals.map(deal => {
        const stage = configData.stages.find(s => s.id === deal.stageId);
        if (stage) {
          return { ...deal, stageName: stage.name };
        }
        return deal;
      })
    );

    this.initializeStageViewConfigs();
    console.log('Stages configuration updated:', configData.stages);
  }

  onDealDetailAction(action: DealDetailAction): void {
    if (action.type === 'edit') {
      const deal = this.deals().find(d => d.id === action.dealId);
      if (deal) this.editDealModal.open(deal, this.stages());
    } else if (action.type === 'delete') {
      this.deals.update(deals => deals.filter(d => d.id !== action.dealId));
      console.log('Deal deleted:', action.dealId);
    } else if (action.type === 'change-stage') {
      // Handle stage change from detail modal
      const toStageId = action.data?.toStageId;
      if (toStageId) {
        const deal = this.deals().find(d => d.id === action.dealId);
        if (deal) {
          this.onDealMoved({
            dealId: action.dealId,
            fromStageId: deal.stageId,
            toStageId: toStageId
          });
        }
      }
    } else if (action.type === 'won' || action.type === 'lost') {
      console.log(`Deal marked as ${action.type}:`, action.dealId);
    } else if (action.type === 'add-note') {
      console.log('Note added:', action.data);
    }
  }
}
