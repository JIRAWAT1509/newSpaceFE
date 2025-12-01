// reports-kpis-section.component.ts
import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutiveSummary, SalesTeamMember } from '@core/data/sales-performance.mock';

type SortField = 'name' | 'pipeline' | 'coverage' | 'winRate' | 'deals';
type SortDirection = 'asc' | 'desc';

interface ManagerPerformance {
  id: string;
  name: string;
  nameTh: string;
  region: string;
  regionTh: string;
  avatar: string;
  pipelineValue: number;
  coverage: number; // percentage
  winRate: number; // percentage
  dealCount: number;
  coachingHours: number;
  salesThisYear: number;
  rank: number;
}

@Component({
  selector: 'app-reports-kpis-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-kpis-section.component.html',
  styleUrl: './reports-kpis-section.component.css'
})
export class ReportsKpisSectionComponent implements OnInit {

  // ==================== INPUTS ====================
  @Input() executiveSummary: ExecutiveSummary | null = null;
  @Input() managers: SalesTeamMember[] = [];

  // ==================== SIGNALS ====================

  // Data signals
  summaryData = signal<ExecutiveSummary | null>(null);
  managersData = signal<ManagerPerformance[]>([]);

  // Sorting state
  sortField = signal<SortField>('pipeline');
  sortDirection = signal<SortDirection>('desc');

  // UI State
  selectedManagerId = signal<string | null>(null);
  isExporting = signal<boolean>(false);

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.initializeData();
  }

  // Initialize data from inputs
  initializeData(): void {
    // Set executive summary
    if (this.executiveSummary) {
      this.summaryData.set({ ...this.executiveSummary });
      console.log('Executive Summary Initialized:', this.executiveSummary);
    }

    // Transform managers data and calculate metrics
    if (this.managers && this.managers.length > 0) {
      const managersPerformance = this.managers.map((manager, index) => {
        // Calculate deal count (mock calculation based on pipeline)
        const dealCount = Math.round(manager.pipelineValue / 50000);

        return {
          id: manager.id,
          name: manager.name,
          nameTh: manager.nameTh,
          region: manager.region,
          regionTh: manager.regionTh,
          avatar: manager.avatar || '👤',
          pipelineValue: manager.pipelineValue,
          coverage: manager.coverage,
          winRate: manager.winRate,
          dealCount,
          coachingHours: manager.coachingHours,
          salesThisYear: manager.salesThisYear,
          rank: index + 1
        } as ManagerPerformance;
      });

      this.managersData.set(managersPerformance);
      console.log('Managers Performance Initialized:', managersPerformance);
    }
  }

  // ==================== COMPUTED ====================

  // Sorted managers list
  sortedManagers = computed(() => {
    const managers = [...this.managersData()];
    const field = this.sortField();
    const direction = this.sortDirection();

    managers.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'pipeline':
          aValue = a.pipelineValue;
          bValue = b.pipelineValue;
          break;
        case 'coverage':
          aValue = a.coverage;
          bValue = b.coverage;
          break;
        case 'winRate':
          aValue = a.winRate;
          bValue = b.winRate;
          break;
        case 'deals':
          aValue = a.dealCount;
          bValue = b.dealCount;
          break;
        default:
          aValue = a.pipelineValue;
          bValue = b.pipelineValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return direction === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return managers;
  });

  // Average metrics across all managers
  avgMetrics = computed(() => {
    const managers = this.managersData();
    if (managers.length === 0) {
      return {
        avgPipeline: 0,
        avgCoverage: 0,
        avgWinRate: 0,
        avgDeals: 0,
        totalPipeline: 0
      };
    }

    const totalPipeline = managers.reduce((sum, m) => sum + m.pipelineValue, 0);
    const totalCoverage = managers.reduce((sum, m) => sum + m.coverage, 0);
    const totalWinRate = managers.reduce((sum, m) => sum + m.winRate, 0);
    const totalDeals = managers.reduce((sum, m) => sum + m.dealCount, 0);

    return {
      avgPipeline: Math.round(totalPipeline / managers.length),
      avgCoverage: Math.round(totalCoverage / managers.length),
      avgWinRate: Math.round(totalWinRate / managers.length),
      avgDeals: Math.round(totalDeals / managers.length),
      totalPipeline
    };
  });

  // Top performer
  topPerformer = computed(() => {
    const managers = this.managersData();
    if (managers.length === 0) return null;

    return [...managers].sort((a, b) => b.pipelineValue - a.pipelineValue)[0];
  });

  // Performance status
  performanceStatus = computed((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const summary = this.summaryData();
    if (!summary) return 'fair';

    const attainment = summary.attainment;
    if (attainment >= 90) return 'excellent';
    if (attainment >= 75) return 'good';
    if (attainment >= 60) return 'fair';
    return 'poor';
  });

  // ==================== SORTING ====================

  // Toggle sort
  onSort(field: SortField): void {
    const currentField = this.sortField();
    const currentDirection = this.sortDirection();

    if (currentField === field) {
      // Toggle direction
      this.sortDirection.set(currentDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }

    console.log(`Sorted by ${field} ${this.sortDirection()}`);
  }

  // Check if field is currently sorted
  isSorted(field: SortField): boolean {
    return this.sortField() === field;
  }

  // Get sort icon
  getSortIcon(field: SortField): string {
    if (!this.isSorted(field)) return 'pi-sort';
    return this.sortDirection() === 'asc' ? 'pi-sort-up' : 'pi-sort-down';
  }

  // ==================== SELECTION ====================

  // Select/deselect manager
  onManagerSelect(managerId: string): void {
    if (this.selectedManagerId() === managerId) {
      this.selectedManagerId.set(null);
    } else {
      this.selectedManagerId.set(managerId);
    }

    const manager = this.managersData().find(m => m.id === managerId);
    console.log('Selected manager:', manager);
  }

  // Check if manager is selected
  isSelected(managerId: string): boolean {
    return this.selectedManagerId() === managerId;
  }

  // ==================== FORMATTING ====================

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  // Format percentage
  formatPercentage(value: number): string {
    return `${value}%`;
  }

  // Get coverage color class
  getCoverageColorClass(coverage: number): string {
    if (coverage >= 100) return 'excellent';
    if (coverage >= 80) return 'good';
    if (coverage >= 60) return 'fair';
    return 'poor';
  }

  // Get win rate color class
  getWinRateColorClass(winRate: number): string {
    if (winRate >= 35) return 'excellent';
    if (winRate >= 30) return 'good';
    if (winRate >= 25) return 'fair';
    return 'poor';
  }

  // Get attainment status label
  getAttainmentLabel(): string {
    const status = this.performanceStatus();
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Needs Improvement'
    };
    return labels[status];
  }

  // Get attainment status label (Thai)
  getAttainmentLabelTh(): string {
    const status = this.performanceStatus();
    const labels = {
      excellent: 'ดีเยี่ยม',
      good: 'ดี',
      fair: 'พอใช้',
      poor: 'ต้องปรับปรุง'
    };
    return labels[status];
  }

  // ==================== EXPORT ====================

  // Export summary data
  exportSummary(): void {
    this.isExporting.set(true);

    const summary = this.summaryData();
    if (!summary) return;

    const exportData = {
      executiveSummary: summary,
      performanceStatus: this.performanceStatus(),
      attainmentLabel: this.getAttainmentLabel(),
      timestamp: new Date().toISOString()
    };

    console.log('Exported Executive Summary:', exportData);

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `executive-summary-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setTimeout(() => {
      this.isExporting.set(false);
    }, 500);
  }

  // Export managers performance
  exportManagersPerformance(): void {
    this.isExporting.set(true);

    const exportData = {
      managers: this.sortedManagers(),
      averageMetrics: this.avgMetrics(),
      topPerformer: this.topPerformer(),
      sortedBy: {
        field: this.sortField(),
        direction: this.sortDirection()
      },
      timestamp: new Date().toISOString()
    };

    console.log('Exported Managers Performance:', exportData);

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `managers-performance-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setTimeout(() => {
      this.isExporting.set(false);
    }, 500);
  }

  // Export all data
  exportAllData(): void {
    this.isExporting.set(true);

    const exportData = {
      executiveSummary: this.summaryData(),
      managers: this.sortedManagers(),
      averageMetrics: this.avgMetrics(),
      topPerformer: this.topPerformer(),
      performanceStatus: this.performanceStatus(),
      timestamp: new Date().toISOString()
    };

    console.log('Exported All Reports & KPIs Data:', exportData);

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `reports-kpis-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setTimeout(() => {
      this.isExporting.set(false);
    }, 500);
  }

  // Refresh data
  refreshData(): void {
    console.log('Refreshing Reports & KPIs data...');
    this.initializeData();
  }
}
