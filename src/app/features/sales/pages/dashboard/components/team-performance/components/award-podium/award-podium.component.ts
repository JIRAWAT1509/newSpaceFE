// award-podium.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMemberPerformance } from '@core/models/dashboard.types';

@Component({
  selector: 'app-award-podium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './award-podium.component.html',
  styleUrl: './award-podium.component.css'
})
export class AwardPodiumComponent {

  @Input() topThree: TeamMemberPerformance[] = [];
  @Input() isLoading: boolean = false;
  @Input() showProfileCircle: boolean = true; // NEW: Toggle profile pictures
  @Output() memberClick = new EventEmitter<string>();

  get firstPlace(): TeamMemberPerformance | null {
    return this.topThree[0] || null;
  }

  get secondPlace(): TeamMemberPerformance | null {
    return this.topThree[1] || null;
  }

  get thirdPlace(): TeamMemberPerformance | null {
    return this.topThree[2] || null;
  }

  onPodiumClick(memberId: string): void {
    this.memberClick.emit(memberId);
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

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getProfileImage(member: TeamMemberPerformance): string | null {
    // Return avatar emoji if exists, otherwise null for placeholder
    return member.avatar || null;
  }
}
