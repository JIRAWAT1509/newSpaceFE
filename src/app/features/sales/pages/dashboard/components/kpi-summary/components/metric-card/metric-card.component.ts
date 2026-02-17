// metric-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPIMetric } from '@core/models/dashboard.types';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css'
})
export class MetricCardComponent {
  @Input() metric!: KPIMetric;
  @Input() isLoading: boolean = false;

  // ==================== FORMATTING ====================

  getFormattedValue(): string {
    if (!this.metric) return '—';

    const value = this.metric.value;

    switch (this.metric.format) {
      case 'currency':
        return this.formatCurrency(value);
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'number':
        return this.formatNumber(value);
      default:
        return value.toString();
    }
  }

  getFormattedTrend(): string {
    if (!this.metric) return '';

    const trend = this.metric.trend;
    const sign = trend > 0 ? '+' : '';

    return `${sign}${trend.toFixed(1)}%`;
  }

  getTrendClass(): string {
    if (!this.metric) return '';

    if (this.metric.trend > 0) return 'trend-up';
    if (this.metric.trend < 0) return 'trend-down';
    return 'trend-neutral';
  }

  getTrendIcon(): string {
    if (!this.metric) return '';

    if (this.metric.trend > 0) return 'pi pi-arrow-up';
    if (this.metric.trend < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  // ==================== UTILITY ====================

  private formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  private formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
}
