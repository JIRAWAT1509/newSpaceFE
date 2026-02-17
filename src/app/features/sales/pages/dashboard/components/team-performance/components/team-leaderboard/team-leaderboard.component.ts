// team-leaderboard.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMemberPerformance } from '@core/models/dashboard.types';

@Component({
  selector: 'app-team-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-leaderboard.component.html',
  styleUrl: './team-leaderboard.component.css'
})
export class TeamLeaderboardComponent {

  @Input() members: TeamMemberPerformance[] = [];
  @Input() isLoading: boolean = false;
  @Output() memberSelect = new EventEmitter<string>();

  sortColumn: string = 'rank';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = column === 'rank' ? 'asc' : 'desc';
    }

    this.members.sort((a, b) => {
      let aVal: any = a[column as keyof TeamMemberPerformance];
      let bVal: any = b[column as keyof TeamMemberPerformance];

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'pi pi-sort-alt';
    return this.sortDirection === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down';
  }

  onMemberClick(memberId: string): void {
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

  getAttainmentClass(attainment: number): string {
    if (attainment >= 100) return 'attainment-excellent';
    if (attainment >= 80) return 'attainment-good';
    if (attainment >= 60) return 'attainment-fair';
    return 'attainment-low';
  }

  getTrendClass(trend: number): string {
    if (trend > 5) return 'trend-up';
    if (trend < -5) return 'trend-down';
    return 'trend-neutral';
  }

  getTrendIcon(trend: number): string {
    if (trend > 5) return 'pi pi-arrow-up';
    if (trend < -5) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  }
}
