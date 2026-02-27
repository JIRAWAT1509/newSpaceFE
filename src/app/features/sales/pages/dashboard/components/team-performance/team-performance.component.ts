// team-performance.component.ts - FINAL WITH COMPANY SELECTOR

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeamLeaderboardComponent } from './components/team-leaderboard/team-leaderboard.component';
import { AwardPodiumComponent } from './components/award-podium/award-podium.component';
import { RepDetailModalComponent } from './components/rep-detail-modal/rep-detail-modal.component';
import { DashboardDataService } from '@core/services/dashboard-data.service';
import { TeamPerformance, TeamMemberPerformance } from '@core/models/dashboard.types';

// Import new components - these should be in the same directory or subdirectories
// If they're in subdirectories, adjust paths accordingly
import { TeamLeaderboardSimpleComponent } from './components/team-leaderboard-simple/team-leaderboard-simple.component';
import { CompanySelectorTeamComponent } from './components/company-selector-team/company-selector-team.component';

// For now, define inline until components are generated
// Company interface
export interface Company {
  id: string;
  name: string;
  nameTh: string;
}

type ViewLevel = 'teams' | 'members';

interface TeamAggregatedPerformance extends TeamMemberPerformance {
  teamId: string;
  companyId: string;
  memberCount: number;
}

interface SalesTeam {
  id: string;
  name: string;
  nameTh: string;
  avatar?: string;
  companyId: string;
  leaderId: string;
  memberIds: string[];
}

@Component({
  selector: 'app-team-performance',
  standalone: true,
  imports: [
    CommonModule,
    TeamLeaderboardComponent,
    AwardPodiumComponent,
    RepDetailModalComponent,
    TeamLeaderboardSimpleComponent,
    CompanySelectorTeamComponent
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

  viewLevel = signal<ViewLevel>('teams');
  selectedTeamId = signal<string | null>(null);

  // Company selection state
  selectedCompanyIds = signal<string[]>([]); // Empty = All companies

  // ==================== MOCK COMPANIES ====================
  companies: Company[] = [
    { id: 'comp-001', name: 'Tech Solutions Inc.', nameTh: 'เทค โซลูชั่นส์' },
    { id: 'comp-002', name: 'Digital Marketing Co.', nameTh: 'ดิจิทัล มาร์เก็ตติ้ง' },
    { id: 'comp-003', name: 'Cloud Services Ltd.', nameTh: 'คลาวด์ เซอร์วิสเซส' },
    { id: 'comp-004', name: 'Enterprise Systems', nameTh: 'เอ็นเตอร์ไพรส์ ซิสเต็มส์' }
  ];

  // ==================== TEAM DEFINITIONS ====================
  private salesTeams: SalesTeam[] = [
    // Company 1 teams
    { id: 'team-001', name: 'Enterprise Sales Team', nameTh: 'ทีมขายองค์กรใหญ่', avatar: '🔵', companyId: 'comp-001', leaderId: 'rep-001', memberIds: ['rep-001', 'rep-002', 'rep-003'] },
    { id: 'team-002', name: 'SMB Sales Team', nameTh: 'ทีมขาย SMB', avatar: '🟢', companyId: 'comp-001', leaderId: 'rep-004', memberIds: ['rep-004', 'rep-005', 'rep-006'] },
    // Company 2 teams
    { id: 'team-003', name: 'Regional Sales Team', nameTh: 'ทีมขายภูมิภาค', avatar: '🟡', companyId: 'comp-002', leaderId: 'rep-007', memberIds: ['rep-007', 'rep-008', 'rep-009'] },
    { id: 'team-004', name: 'Channel Partners Team', nameTh: 'ทีมพันธมิตรทางการค้า', avatar: '🟣', companyId: 'comp-002', leaderId: 'rep-010', memberIds: ['rep-010', 'rep-011', 'rep-012'] },
    // Company 3 teams
    { id: 'team-005', name: 'Inside Sales Team', nameTh: 'ทีมขายภายใน', avatar: '🔴', companyId: 'comp-003', leaderId: 'rep-013', memberIds: ['rep-013', 'rep-014', 'rep-015'] },
    // Company 4 teams
    { id: 'team-006', name: 'Key Accounts Team', nameTh: 'ทีมลูกค้าสำคัญ', avatar: '🟠', companyId: 'comp-004', leaderId: 'rep-016', memberIds: ['rep-016', 'rep-017', 'rep-018'] }
  ];

  // ==================== COMPUTED PROPERTIES ====================

  // Filter teams by selected companies
  filteredTeams = computed(() => {
    const selected = this.selectedCompanyIds();

    // Empty array = all companies
    if (selected.length === 0) {
      return this.salesTeams;
    }

    return this.salesTeams.filter(team => selected.includes(team.companyId));
  });

  // Aggregate team performance from members
  aggregatedTeams = computed(() => {
    const data = this.teamData();
    if (!data || !data.leaderboard) return [];

    const teams: TeamAggregatedPerformance[] = [];
    const membersWithTeams = data.leaderboard.map((member, index) => ({
      ...member,
      teamId: this.salesTeams[Math.floor(index / 3)]?.id || 'team-001',
      companyId: this.salesTeams[Math.floor(index / 3)]?.companyId || 'comp-001'
    }));

    this.filteredTeams().forEach((team, teamIndex) => {
      const teamMembers = membersWithTeams.filter(m => m.teamId === team.id);
      if (teamMembers.length === 0) return;

      const totalYTD = teamMembers.reduce((sum, m) => sum + m.ytdSales, 0);
      const totalTarget = teamMembers.reduce((sum, m) => sum + m.ytdTarget, 0);
      const totalPipeline = teamMembers.reduce((sum, m) => sum + m.pipelineValue, 0);
      const totalDeals = teamMembers.reduce((sum, m) => sum + m.pipelineDeals, 0);
      const totalWon = teamMembers.reduce((sum, m) => sum + m.dealsWon, 0);
      const totalLost = teamMembers.reduce((sum, m) => sum + m.dealsLost, 0);
      const totalThisMonth = teamMembers.reduce((sum, m) => sum + m.thisMonthSales, 0);
      const totalThisWeek = teamMembers.reduce((sum, m) => sum + m.thisWeekSales, 0);
      const totalActivities = teamMembers.reduce((sum, m) => sum + m.activitiesThisWeek, 0);

      const avgWinRate = teamMembers.reduce((sum, m) => sum + m.winRate, 0) / teamMembers.length;
      const avgTrend = teamMembers.reduce((sum, m) => sum + m.trend, 0) / teamMembers.length;
      const avgDaysToClose = teamMembers.reduce((sum, m) => sum + m.avgDaysToClose, 0) / teamMembers.length;
      const avgDealSize = totalPipeline / (totalDeals || 1);

      // FIX: Handle division by zero for attainment
      const teamAttainment = totalTarget > 0 ? (totalYTD / totalTarget) * 100 : 0;

      teams.push({
        id: team.id,
        teamId: team.id,
        companyId: team.companyId,
        name: team.name,
        nameTh: team.nameTh,
        rank: 0, // Will be set after sorting
        avatar: team.avatar,
        role: 'Team',
        ytdSales: totalYTD,
        ytdTarget: totalTarget,
        attainment: teamAttainment,
        thisMonthSales: totalThisMonth,
        thisWeekSales: totalThisWeek,
        pipelineValue: totalPipeline,
        pipelineDeals: totalDeals,
        winRate: Math.round(avgWinRate),
        dealsWon: totalWon,
        dealsLost: totalLost,
        avgDealSize: avgDealSize,
        avgDaysToClose: Math.round(avgDaysToClose),
        activitiesThisWeek: totalActivities,
        lastActivityDate: teamMembers[0]?.lastActivityDate,
        trend: Math.round(avgTrend),
        memberCount: teamMembers.length
      });
    });

    teams.sort((a, b) => b.attainment - a.attainment);
    teams.forEach((team, index) => { team.rank = index + 1; });

    return teams;
  });

  teamMembers = computed(() => {
    const teamId = this.selectedTeamId();
    const data = this.teamData();
    if (!teamId || !data || !data.leaderboard) return [];

    const team = this.salesTeams.find(t => t.id === teamId);
    if (!team) return [];

    const membersWithTeams = data.leaderboard.map((member, index) => ({
      ...member,
      teamId: this.salesTeams[Math.floor(index / 3)]?.id || 'team-001'
    }));

    const members = membersWithTeams.filter(m => m.teamId === teamId);
    members.sort((a, b) => b.attainment - a.attainment);
    members.forEach((member, index) => { member.rank = index + 1; });

    return members;
  });

  displayData = computed(() => {
    return this.viewLevel() === 'teams' ? this.aggregatedTeams() : this.teamMembers();
  });

  topThree = computed(() => this.displayData().slice(0, 3));
  remainingMembers = computed(() => this.displayData().slice(3));

  selectedTeamName = computed(() => {
    const teamId = this.selectedTeamId();
    if (!teamId) return '';
    const team = this.aggregatedTeams().find(t => (t as TeamAggregatedPerformance).teamId === teamId);
    return team?.name || '';
  });

  showProfileCircle = computed(() => this.viewLevel() === 'members');

  constructor(
    private dashboardData: DashboardDataService,
    private router: Router
  ) {}

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
        console.log('✅ Team performance loaded');
      },
      error: (err) => {
        this.error.set('Failed to load team performance');
        this.isLoading.set(false);
        console.error('❌ Error:', err);
      }
    });
  }

  onCompanySelectionChange(companyIds: string[]): void {
    console.log('📊 Company selection changed:', companyIds);
    this.selectedCompanyIds.set(companyIds);
    // Reset to teams view when changing companies
    if (this.viewLevel() === 'members') {
      this.viewLevel.set('teams');
      this.selectedTeamId.set(null);
    }
  }

  onMemberSelect(id: string): void {
    if (this.viewLevel() === 'teams') {
      console.log('🔽 Drilling down to team:', id);
      this.selectedTeamId.set(id);
      this.viewLevel.set('members');
    } else {
      console.log('👤 Opening member detail:', id);
      const member = this.displayData().find(m => m.id === id);
      if (member) {
        this.selectedMember.set(member);
        this.isModalVisible.set(true);
      }
    }
  }

  onBackToTeams(): void {
    console.log('⬆️ Returning to teams view');
    this.viewLevel.set('teams');
    this.selectedTeamId.set(null);
  }

  onModalClose(): void {
    this.isModalVisible.set(false);
    this.selectedMember.set(null);
  }

  refresh(): void {
    this.loadTeamPerformance();
  }

  navigateToTeamManagement(): void {
    this.router.navigate(['/sales/budget']);
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
