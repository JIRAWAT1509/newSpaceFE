// source-attribution-chart.component.ts
import { Component, Input, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceAttribution } from '@core/data/sales-performance.mock';

interface DonutSegment {
  path: string;
  color: string;
  source: string;
  sourceTh: string;
  percentage: number;
  count: number;
  value: number;
  midAngle: number;
}

@Component({
  selector: 'app-source-attribution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-attribution-chart.component.html',
  styleUrl: './source-attribution-chart.component.css'
})
export class SourceAttributionChartComponent implements OnInit {

  // ==================== INPUTS ====================
  @Input() attribution: SourceAttribution[] = [];

  // ==================== SIGNALS ====================

  // Data signal - initialized from input
  attributionData = signal<SourceAttribution[]>([]);

  // UI State
  hoveredSource = signal<string | null>(null);
  selectedSource = signal<string | null>(null);

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    // Initialize data from input
    this.initializeData();
  }

  // Initialize data and calculate percentages if needed
  initializeData(): void {
    if (!this.attribution || this.attribution.length === 0) {
      console.warn('No attribution data provided');
      this.attributionData.set([]);
      return;
    }

    // Calculate percentages if not provided or recalculate based on actual counts
    const totalCount = this.attribution.reduce((sum, item) => sum + item.count, 0);

    const processedData = this.attribution.map(item => ({
      ...item,
      percentage: totalCount > 0
        ? Math.round((item.count / totalCount) * 100)
        : item.percentage
    }));

    this.attributionData.set(processedData);
    console.log('Source Attribution Data Initialized:', processedData);
  }

  // ==================== COMPUTED ====================

  // Total values calculated from actual data
  totalCount = computed(() =>
    this.attributionData().reduce((sum, item) => sum + item.count, 0)
  );

  totalValue = computed(() =>
    this.attributionData().reduce((sum, item) => sum + item.value, 0)
  );

  // Average deal value
  avgDealValue = computed(() => {
    const total = this.totalCount();
    const value = this.totalValue();
    return total > 0 ? Math.round(value / total) : 0;
  });

  // Top performing source
  topSource = computed(() => {
    const data = this.attributionData();
    if (data.length === 0) return null;

    return [...data].sort((a, b) => b.percentage - a.percentage)[0];
  });

  // Generate donut chart segments with SVG path
  donutSegments = computed((): DonutSegment[] => {
    const data = this.attributionData();
    if (data.length === 0) return [];

    let currentAngle = -90; // Start from top (12 o'clock)
    const radius = 70;
    const innerRadius = 45;
    const centerX = 90;
    const centerY = 90;

    return data.map((item) => {
      const percentage = item.percentage;
      const sweepAngle = (percentage / 100) * 360;

      // Calculate start and end points for outer arc
      const startAngleRad = (currentAngle * Math.PI) / 180;
      const endAngleRad = ((currentAngle + sweepAngle) * Math.PI) / 180;

      const outerStartX = centerX + radius * Math.cos(startAngleRad);
      const outerStartY = centerY + radius * Math.sin(startAngleRad);
      const outerEndX = centerX + radius * Math.cos(endAngleRad);
      const outerEndY = centerY + radius * Math.sin(endAngleRad);

      const innerStartX = centerX + innerRadius * Math.cos(endAngleRad);
      const innerStartY = centerY + innerRadius * Math.sin(endAngleRad);
      const innerEndX = centerX + innerRadius * Math.cos(startAngleRad);
      const innerEndY = centerY + innerRadius * Math.sin(startAngleRad);

      const largeArcFlag = sweepAngle > 180 ? 1 : 0;

      // Create SVG path for donut segment
      const path = `
        M ${outerStartX} ${outerStartY}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
        L ${innerStartX} ${innerStartY}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}
        Z
      `;

      const color = this.getSourceColor(item.source);
      const midAngle = currentAngle + sweepAngle / 2;

      currentAngle += sweepAngle;

      return {
        path,
        color,
        source: item.source,
        sourceTh: item.sourceTh,
        percentage: item.percentage,
        count: item.count,
        value: item.value,
        midAngle
      };
    });
  });

  // ==================== EVENT HANDLERS ====================

  // Handle segment click
  onSegmentClick(source: string): void {
    if (this.selectedSource() === source) {
      this.selectedSource.set(null);
      console.log('Deselected source:', source);
    } else {
      this.selectedSource.set(source);
      console.log('Selected source:', source, this.getSourceData(source));
    }
  }

  // Handle legend item click
  onLegendClick(source: string): void {
    this.onSegmentClick(source);
  }

  // Set hovered source
  setHovered(source: string | null): void {
    this.hoveredSource.set(source);
  }

  // ==================== DATA RETRIEVAL ====================

  // Get specific source data
  getSourceData(source: string): SourceAttribution | undefined {
    return this.attributionData().find(item => item.source === source);
  }

  // Get sources sorted by percentage (descending)
  getSortedSources(): SourceAttribution[] {
    return [...this.attributionData()].sort((a, b) => b.percentage - a.percentage);
  }

  // ==================== UTILITY METHODS ====================

  // Get color for each source
  getSourceColor(source: string): string {
    const colors: { [key: string]: string } = {
      'Inbound': '#3b82f6',   // Blue
      'Outbound': '#10b981',  // Green
      'Partner': '#8b5cf6'    // Purple
    };
    return colors[source] || '#6b7280';
  }

  // Get icon for each source
  getSourceIcon(source: string): string {
    const icons: { [key: string]: string } = {
      'Inbound': 'pi-arrow-down-left',
      'Outbound': 'pi-arrow-up-right',
      'Partner': 'pi-users'
    };
    return icons[source] || 'pi-circle';
  }

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

  // Check if source is hovered
  isHovered(source: string): boolean {
    return this.hoveredSource() === source;
  }

  // Check if source is selected
  isSelected(source: string): boolean {
    return this.selectedSource() === source;
  }

  // ==================== EXPORT / INTERACTION ====================

  // Export data as JSON (for demo purposes)
  exportData(): void {
    const data = {
      attribution: this.attributionData(),
      totals: {
        count: this.totalCount(),
        value: this.totalValue(),
        avgDealValue: this.avgDealValue()
      },
      topSource: this.topSource()
    };

    console.log('Exported Source Attribution Data:', data);

    // In production, this could download as JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `source-attribution-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Refresh data (simulate data refresh from backend)
  refreshData(): void {
    console.log('Refreshing source attribution data...');
    this.initializeData();
  }
}
