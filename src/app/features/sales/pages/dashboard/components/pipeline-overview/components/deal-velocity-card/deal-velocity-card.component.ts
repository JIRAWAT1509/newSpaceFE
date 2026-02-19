// deal-velocity-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealVelocity } from '@core/models/dashboard.types';

@Component({
  selector: 'app-deal-velocity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deal-velocity-card.component.html',
  styleUrl: './deal-velocity-card.component.css'
})
export class DealVelocityCardComponent {

  @Input() velocity: DealVelocity | null = null;
  @Input() isLoading: boolean = false;

  // ==================== UTILITY ====================

  getTrendClass(): string {
    if (!this.velocity) return '';
    if (this.velocity.velocityTrend < 0) return 'trend-positive'; // Negative = faster = good
    if (this.velocity.velocityTrend > 0) return 'trend-negative'; // Positive = slower = bad
    return 'trend-neutral';
  }

  getTrendIcon(): string {
    if (!this.velocity) return '';
    if (this.velocity.velocityTrend < 0) return 'pi pi-arrow-down';
    if (this.velocity.velocityTrend > 0) return 'pi pi-arrow-up';
    return 'pi pi-minus';
  }

  getTrendLabel(): string {
    if (!this.velocity) return '';
    const abs = Math.abs(this.velocity.velocityTrend);
    if (this.velocity.velocityTrend < 0) {
      return `${abs}% faster`;
    } else if (this.velocity.velocityTrend > 0) {
      return `${abs}% slower`;
    }
    return 'No change';
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }
}
