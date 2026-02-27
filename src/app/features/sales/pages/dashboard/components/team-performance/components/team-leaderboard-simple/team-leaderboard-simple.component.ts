// team-leaderboard-simple.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMemberPerformance } from '@core/models/dashboard.types';

@Component({
  selector: 'app-team-leaderboard-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-leaderboard-simple.component.html',
  styleUrl: './team-leaderboard-simple.component.css'
})
export class TeamLeaderboardSimpleComponent {
  @Input() members: TeamMemberPerformance[] = [];
  @Input() isLoading: boolean = false;
  @Output() memberSelect = new EventEmitter<string>();

  Math = Math; // Expose Math to template

  onRowClick(memberId: string): void {
    this.memberSelect.emit(memberId);
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  formatAttainment(value: number): string {
    // Handle NaN, Infinity, and invalid numbers
    if (!isFinite(value) || isNaN(value)) {
      return '0';
    }
    // Round to whole number for cleaner display
    return Math.round(value).toString();
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  }

  getAttainmentClass(attainment: number): string {
    if (attainment >= 100) return 'excellent';
    if (attainment >= 80) return 'good';
    if (attainment >= 60) return 'fair';
    return 'low';
  }

  getTrendClass(trend: number): string {
    if (trend > 5) return 'trend-positive';
    if (trend < -5) return 'trend-negative';
    return 'trend-neutral';
  }

  getTrendIcon(trend: number): string {
    if (trend > 5) return 'pi pi-arrow-up';
    if (trend < -5) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }
}
