// rep-performance-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMemberPerformance } from '@core/models/dashboard.types';

@Component({
  selector: 'app-rep-performance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rep-performance-card.component.html',
  styleUrl: './rep-performance-card.component.css'
})
export class RepPerformanceCardComponent {

  @Input() member!: TeamMemberPerformance;
  @Output() cardClick = new EventEmitter<string>();

  onCardClick(): void {
    this.cardClick.emit(this.member.id);
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  getAttainmentClass(): string {
    const attainment = this.member.attainment;
    if (attainment >= 100) return 'excellent';
    if (attainment >= 80) return 'good';
    if (attainment >= 60) return 'fair';
    return 'low';
  }

  getTrendIcon(): string {
    if (this.member.trend > 5) return 'pi pi-arrow-up';
    if (this.member.trend < -5) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  getTrendClass(): string {
    if (this.member.trend > 5) return 'trend-positive';
    if (this.member.trend < -5) return 'trend-negative';
    return 'trend-neutral';
  }
}
