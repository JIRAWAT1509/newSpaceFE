// team-performance.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamLeaderboardComponent } from './components/team-leaderboard/team-leaderboard.component';
import { RepPerformanceCardComponent } from './components/rep-performance-card/rep-performance-card.component';
import { RepDetailModalComponent } from './components/rep-detail-modal/rep-detail-modal.component';
import { DashboardDataService } from '@core/services/dashboard-data.service';
import { TeamPerformance, TeamMemberPerformance } from '@core/models/dashboard.types';

@Component({
  selector: 'app-team-performance',
  standalone: true,
  imports: [
    CommonModule,
    TeamLeaderboardComponent,
    RepPerformanceCardComponent,
    RepDetailModalComponent
  ],
  templateUrl: './team-performance.component.html',
  styleUrl: './team-performance.component.css'
})
export class TeamPerformanceComponent implements OnInit {

  teamData = signal<TeamPerformance | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedMember = signal<TeamMemberPerformance | null>(null);
  isModalVisible = signal<boolean>(false);

  constructor(private dashboardData: DashboardDataService) {}

  ngOnInit(): void {
    this.loadTeamPerformance();
  }

  loadTeamPerformance(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardData.getTeamPerformance().subscribe({
      next: (data) => {
        this.teamData.set(data);
        this.isLoading.set(false);
        console.log('✅ Team performance loaded:', data);
      },
      error: (err) => {
        this.error.set('Failed to load team performance');
        this.isLoading.set(false);
        console.error('❌ Error loading team performance:', err);
      }
    });
  }

  onMemberSelect(memberId: string): void {
    const member = this.teamData()?.leaderboard.find(m => m.id === memberId);
    if (member) {
      this.selectedMember.set(member);
      this.isModalVisible.set(true);
    }
  }

  onModalClose(): void {
    this.isModalVisible.set(false);
    this.selectedMember.set(null);
  }

  refresh(): void {
    this.loadTeamPerformance();
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
