// team-member-cards.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesTeamMember } from '@core/data/sales-performance.mock';

@Component({
  selector: 'app-team-member-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-member-cards.component.html',
  styleUrl: './team-member-cards.component.css'
})
export class TeamMemberCardsComponent {

  // ==================== INPUTS ====================
  @Input() members: SalesTeamMember[] = [];
  @Input() selectedMemberId: string | null = null;

  // ==================== OUTPUTS ====================
  @Output() memberSelect = new EventEmitter<string>();

  // ==================== EXPOSE MATH TO TEMPLATE ====================
  Math = Math;

  // ==================== EVENT HANDLERS ====================

  onCardClick(memberId: string): void {
    this.memberSelect.emit(memberId);
  }

  isSelected(memberId: string): boolean {
    return this.selectedMemberId === memberId;
  }

  // ==================== FORMATTING ====================

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  formatNumber(value: number): string {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  // Calculate week-over-week change
  calculateWeekChange(member: SalesTeamMember): { value: number; isPositive: boolean } {
    const change = member.salesThisWeek - member.salesLastWeek;
    const percentChange = member.salesLastWeek > 0
      ? (change / member.salesLastWeek) * 100
      : 0;

    return {
      value: Math.round(percentChange),
      isPositive: percentChange >= 0
    };
  }

  // ==================== SPARKLINE CHART ====================

  generateSparklinePoints(member: SalesTeamMember): string {
    if (!member.weeklySalesHistory || member.weeklySalesHistory.length === 0) {
      return '';
    }

    const data = member.weeklySalesHistory;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Avoid division by zero

    const width = 120;
    const height = 40;
    const padding = 2;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const normalizedValue = (value - min) / range;
      const y = height - padding - (normalizedValue * (height - padding * 2));
      return `${x},${y}`;
    });

    return points.join(' ');
  }

  // Determine sparkline color based on trend
  getSparklineColor(member: SalesTeamMember): string {
    if (!member.weeklySalesHistory || member.weeklySalesHistory.length < 2) {
      return '#3b82f6'; // Default blue
    }

    const lastWeek = member.weeklySalesHistory[member.weeklySalesHistory.length - 1];
    const prevWeek = member.weeklySalesHistory[member.weeklySalesHistory.length - 2];

    if (lastWeek > prevWeek) {
      return '#10b981'; // Green for upward trend
    } else if (lastWeek < prevWeek) {
      return '#ef4444'; // Red for downward trend
    }

    return '#3b82f6'; // Blue for stable
  }

  // Get gradient ID for each member (unique per card)
  getGradientId(memberId: string): string {
    return `sparklineGradient-${memberId}`;
  }

  // Get sparkline gradient stops based on trend
  getGradientStops(member: SalesTeamMember): { offset: string; color: string; opacity: number }[] {
    const color = this.getSparklineColor(member);

    return [
      { offset: '0%', color, opacity: 0.2 },
      { offset: '100%', color, opacity: 0 }
    ];
  }
}
