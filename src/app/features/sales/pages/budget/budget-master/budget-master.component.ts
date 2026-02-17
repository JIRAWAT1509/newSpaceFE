// budget-master.component.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import {
  Company,
  Team,
  TeamMember,
  MonthlyBreakdown,
  ViewMode,
  calculateBudgetAllocation,
  generateMonthlyBreakdown,
  sumTeamBudgets,
  sumMemberBudgets
} from '@core/models/budget.model';

// Mock Data
import { MOCK_COMPANIES, AVAILABLE_USERS } from '@core/data/budget.mock';

// Components
import { CompanySelectorComponent } from '../components/company-selector/company-selector.component';
import { CompanyBudgetCardComponent } from '../components/company-budget-card/company-budget-card.component';
// import { TeamCardComponent } from '../components/team-card/team-card.component'; // OLD - COMMENTED
import { BudgetSummaryComponent } from '../components/budget-summary/budget-summary.component';

// NEW KANBAN COMPONENTS
import { BudgetKanbanBoardComponent } from '../components/budget-kanban-board/budget-kanban-board.component';
import { TeamSortBy, TeamViewConfig } from '../components/team-column/team-column.component';

// Modals
import { AddCompanyModalComponent, AddCompanyData } from '../components/add-company-modal/add-company-modal.component';
import { AddTeamModalComponent, AddTeamData, AvailableUser } from '../components/add-team-modal/add-team-modal.component';
import { AddMemberModalComponent, AddMemberData } from '../components/add-member-modal/add-member-modal.component';
import { EditBudgetModalComponent, EditBudgetData, EditBudgetType } from '../components/edit-budget-modal/edit-budget-modal.component';
import { MonthlyBreakdownModalComponent } from '../components/monthly-breakdown-modal/monthly-breakdown-modal.component';

@Component({
  selector: 'app-budget-master',
  standalone: true,
  imports: [
    CommonModule,
    CompanySelectorComponent,
    CompanyBudgetCardComponent,
    // TeamCardComponent, // OLD - COMMENTED
    BudgetSummaryComponent,
    BudgetKanbanBoardComponent, // NEW
    AddCompanyModalComponent,
    AddTeamModalComponent,
    AddMemberModalComponent,
    EditBudgetModalComponent,
    MonthlyBreakdownModalComponent
  ],
  templateUrl: './budget-master.component.html',
  styleUrl: './budget-master.component.css'
})
export class BudgetMasterComponent {
  // ==================== DATA STATE ====================
  companies = signal<Company[]>([...MOCK_COMPANIES]);
  selectedCompanyId = signal<string | null>(null);
  viewMode = signal<ViewMode>('yearly');
  // expandedTeamIds = signal<Set<string>>(new Set()); // OLD - COMMENTED

  // NEW: Team view configs for kanban board
  teamViewConfigs = signal<Map<string, TeamViewConfig>>(new Map());

  // ==================== MODAL STATE ====================
  isAddCompanyModalOpen = signal<boolean>(false);
  isAddTeamModalOpen = signal<boolean>(false);
  isAddMemberModalOpen = signal<boolean>(false);
  isEditBudgetModalOpen = signal<boolean>(false);
  isMonthlyBreakdownModalOpen = signal<boolean>(false);

  // Modal context
  currentTeamId = signal<string | null>(null);
  editBudgetContext = signal<{ type: EditBudgetType; id: string; teamId?: string } | null>(null);

  // ==================== COMPUTED ====================

  selectedCompany = computed(() => {
    const id = this.selectedCompanyId();
    if (!id) return null;
    return this.companies().find(c => c.id === id) || null;
  });

  availableUsers = computed(() => {
    return AVAILABLE_USERS;
  });

  // Get available users for adding to a specific team
  availableUsersForTeam = computed(() => {
    const teamId = this.currentTeamId();
    const company = this.selectedCompany();

    if (!teamId || !company) return AVAILABLE_USERS;

    const team = company.teams.find(t => t.id === teamId);
    if (!team) return AVAILABLE_USERS;

    // Filter out users already in the team
    const existingUserIds = team.members.map(m => m.userId);
    return AVAILABLE_USERS.filter(u => !existingUserIds.includes(u.id));
  });

  // Calculate remaining budget for team
  getRemainingTeamBudget = computed(() => {
    const teamId = this.currentTeamId();
    const company = this.selectedCompany();

    if (!teamId || !company) return 0;

    const team = company.teams.find(t => t.id === teamId);
    if (!team) return 0;

    const membersBudget = sumMemberBudgets(team.members).forecast;
    return team.budget.forecast - membersBudget;
  });

  // Calculate remaining budget for company
  getRemainingCompanyBudget = computed(() => {
    const company = this.selectedCompany();
    if (!company) return 0;

    const teamsBudget = sumTeamBudgets(company.teams).forecast;
    return company.budget.forecast - teamsBudget;
  });

  // ==================== INITIALIZATION ====================

  ngOnInit(): void {
    // Select first company by default
    if (this.companies().length > 0) {
      this.selectedCompanyId.set(this.companies()[0].id);
      this.initializeTeamViewConfigs();
    }
  }

  // Initialize team view configs for kanban board
  private initializeTeamViewConfigs(): void {
    const company = this.selectedCompany();
    if (!company) return;

    const configs = new Map<string, TeamViewConfig>();
    company.teams.forEach(team => {
      configs.set(team.id, {
        teamId: team.id,
        sortBy: 'name',
        currentPage: 1,
        cardsPerPage: 8
      });
    });
    this.teamViewConfigs.set(configs);
  }

  // ==================== COMPANY ACTIONS ====================

  onCompanyChange(companyId: string): void {
    this.selectedCompanyId.set(companyId);
    // this.expandedTeamIds.set(new Set()); // OLD - COMMENTED
    this.initializeTeamViewConfigs(); // NEW
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  openAddCompanyModal(): void {
    this.isAddCompanyModalOpen.set(true);
  }

  closeAddCompanyModal(): void {
    this.isAddCompanyModalOpen.set(false);
  }

  onAddCompany(data: AddCompanyData): void {
    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name: data.name,
      year: data.year,
      budget: calculateBudgetAllocation(0, data.budget),
      monthlyBreakdown: generateMonthlyBreakdown(data.budget),
      teams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.companies.update(companies => [...companies, newCompany]);
    this.selectedCompanyId.set(newCompany.id);
    this.closeAddCompanyModal();
  }

  onEditCompany(companyId: string): void {
    const company = this.companies().find(c => c.id === companyId);
    if (!company) return;

    this.editBudgetContext.set({ type: 'company', id: companyId });
    this.isEditBudgetModalOpen.set(true);
  }

  onViewMonthlyBreakdown(companyId: string): void {
    this.isMonthlyBreakdownModalOpen.set(true);
  }

  // ==================== TEAM ACTIONS (NEW KANBAN) ====================

  onTeamSortChange(event: { teamId: string; sortBy: TeamSortBy }): void {
    this.teamViewConfigs.update(configs => {
      const newConfigs = new Map(configs);
      const config = newConfigs.get(event.teamId);
      if (config) {
        newConfigs.set(event.teamId, { ...config, sortBy: event.sortBy });
      }
      return newConfigs;
    });
  }

  onTeamPageChange(event: { teamId: string; page: number }): void {
    this.teamViewConfigs.update(configs => {
      const newConfigs = new Map(configs);
      const config = newConfigs.get(event.teamId);
      if (config) {
        newConfigs.set(event.teamId, { ...config, currentPage: event.page });
      }
      return newConfigs;
    });
  }

  onTeamCardsPerPageChange(event: { teamId: string; cardsPerPage: number }): void {
    this.teamViewConfigs.update(configs => {
      const newConfigs = new Map(configs);
      const config = newConfigs.get(event.teamId);
      if (config) {
        newConfigs.set(event.teamId, { ...config, cardsPerPage: event.cardsPerPage, currentPage: 1 });
      }
      return newConfigs;
    });
  }

  openAddTeamModal(): void {
    this.isAddTeamModalOpen.set(true);
  }

  closeAddTeamModal(): void {
    this.isAddTeamModalOpen.set(false);
  }

  onAddTeam(data: AddTeamData): void {
    const company = this.selectedCompany();
    if (!company) return;

    const leader = AVAILABLE_USERS.find(u => u.id === data.leaderId);
    if (!leader) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: data.name,
      leaderId: data.leaderId,
      leaderName: leader.name,
      budget: calculateBudgetAllocation(0, data.budget),
      members: [
        {
          id: `member-${Date.now()}`,
          userId: data.leaderId,
          name: leader.name,
          role: 'leader',
          budget: calculateBudgetAllocation(0, 0)
        }
      ],
      monthlyBreakdown: []
    };

    this.companies.update(companies =>
      companies.map(c =>
        c.id === company.id
          ? { ...c, teams: [...c.teams, newTeam], updatedAt: new Date().toISOString() }
          : c
      )
    );

    // Add view config for new team
    this.teamViewConfigs.update(configs => {
      const newConfigs = new Map(configs);
      newConfigs.set(newTeam.id, {
        teamId: newTeam.id,
        sortBy: 'name',
        currentPage: 1,
        cardsPerPage: 8
      });
      return newConfigs;
    });

    this.closeAddTeamModal();
  }

  // OLD EXPAND/COLLAPSE - COMMENTED
  /*
  onToggleTeamExpand(teamId: string): void {
    this.expandedTeamIds.update(expanded => {
      const newSet = new Set(expanded);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  }
  */

  onEditTeam(teamId: string): void {
    const company = this.selectedCompany();
    if (!company) return;

    const team = company.teams.find(t => t.id === teamId);
    if (!team) return;

    this.editBudgetContext.set({ type: 'team', id: teamId });
    this.isEditBudgetModalOpen.set(true);
  }

  onDeleteTeam(teamId: string): void {
    const company = this.selectedCompany();
    if (!company) return;

    this.companies.update(companies =>
      companies.map(c =>
        c.id === company.id
          ? { ...c, teams: c.teams.filter(t => t.id !== teamId), updatedAt: new Date().toISOString() }
          : c
      )
    );

    // Remove view config for deleted team
    this.teamViewConfigs.update(configs => {
      const newConfigs = new Map(configs);
      newConfigs.delete(teamId);
      return newConfigs;
    });
  }

  // OLD MOVE UP/DOWN - COMMENTED (Not needed in kanban view)
  /*
  onMoveTeamUp(teamId: string): void {
    const company = this.selectedCompany();
    if (!company) return;

    const index = company.teams.findIndex(t => t.id === teamId);
    if (index <= 0) return;

    this.companies.update(companies =>
      companies.map(c => {
        if (c.id !== company.id) return c;
        const teams = [...c.teams];
        [teams[index - 1], teams[index]] = [teams[index], teams[index - 1]];
        return { ...c, teams, updatedAt: new Date().toISOString() };
      })
    );
  }

  onMoveTeamDown(teamId: string): void {
    const company = this.selectedCompany();
    if (!company) return;

    const index = company.teams.findIndex(t => t.id === teamId);
    if (index < 0 || index >= company.teams.length - 1) return;

    this.companies.update(companies =>
      companies.map(c => {
        if (c.id !== company.id) return c;
        const teams = [...c.teams];
        [teams[index], teams[index + 1]] = [teams[index + 1], teams[index]];
        return { ...c, teams, updatedAt: new Date().toISOString() };
      })
    );
  }
  */

  // ==================== MEMBER ACTIONS ====================

  onAddMember(teamId: string): void {
    this.currentTeamId.set(teamId);
    this.isAddMemberModalOpen.set(true);
  }

  closeAddMemberModal(): void {
    this.isAddMemberModalOpen.set(false);
    this.currentTeamId.set(null);
  }

  onAddMemberSubmit(data: AddMemberData): void {
    const company = this.selectedCompany();
    const teamId = this.currentTeamId();

    if (!company || !teamId) return;

    const user = AVAILABLE_USERS.find(u => u.id === data.userId);
    if (!user) return;

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      userId: data.userId,
      name: user.name,
      role: 'member',
      budget: calculateBudgetAllocation(0, data.budget)
    };

    this.companies.update(companies =>
      companies.map(c => {
        if (c.id !== company.id) return c;
        return {
          ...c,
          teams: c.teams.map(t =>
            t.id === teamId
              ? { ...t, members: [...t.members, newMember] }
              : t
          ),
          updatedAt: new Date().toISOString()
        };
      })
    );

    this.closeAddMemberModal();
  }

  onEditMember({ teamId, memberId }: { teamId: string; memberId: string }): void {
    this.editBudgetContext.set({ type: 'member', id: memberId, teamId });
    this.isEditBudgetModalOpen.set(true);
  }

  // OLD REMOVE MEMBER - COMMENTED (Replaced by drag-drop)
  /*
  onRemoveMember({ teamId, memberId }: { teamId: string; memberId: string }): void {
    const company = this.selectedCompany();
    if (!company) return;

    this.companies.update(companies =>
      companies.map(c => {
        if (c.id !== company.id) return c;
        return {
          ...c,
          teams: c.teams.map(t =>
            t.id === teamId
              ? { ...t, members: t.members.filter(m => m.id !== memberId) }
              : t
          ),
          updatedAt: new Date().toISOString()
        };
      })
    );
  }
  */

  // NEW: Handle member moved between teams via drag-drop
  onMemberMoved(event: { memberId: string; fromTeamId: string; toTeamId: string }): void {
    const company = this.selectedCompany();
    if (!company) return;

    console.log('📋 BUDGET-MASTER: Processing member move');
    console.log('   - Member ID:', event.memberId);
    console.log('   - From Team:', event.fromTeamId);
    console.log('   - To Team:', event.toTeamId);

    // Find the member in the source team
    const fromTeam = company.teams.find(t => t.id === event.fromTeamId);
    const member = fromTeam?.members.find(m => m.id === event.memberId);

    if (!member) {
      console.error('❌ BUDGET-MASTER: Member not found!');
      return;
    }

    // Don't move team leaders
    if (member.role === 'leader') {
      alert('Cannot move team leader to another team!');
      console.log('⚠️ BUDGET-MASTER: Attempted to move team leader - blocked');
      return;
    }

    console.log('✅ BUDGET-MASTER: Moving member:', member.name);

    // Update companies: remove from source, add to target
    this.companies.update(companies =>
      companies.map(c => {
        if (c.id !== company.id) return c;
        return {
          ...c,
          teams: c.teams.map(t => {
            // Remove from source team
            if (t.id === event.fromTeamId) {
              return { ...t, members: t.members.filter(m => m.id !== event.memberId) };
            }
            // Add to target team
            if (t.id === event.toTeamId) {
              return { ...t, members: [...t.members, member] };
            }
            return t;
          }),
          updatedAt: new Date().toISOString()
        };
      })
    );

    console.log('✅ BUDGET-MASTER: Member moved successfully!');
  }

  // ==================== EDIT BUDGET ====================

  closeEditBudgetModal(): void {
    this.isEditBudgetModalOpen.set(false);
    this.editBudgetContext.set(null);
  }

  getEditBudgetData() {
    const context = this.editBudgetContext();
    const company = this.selectedCompany();

    if (!context || !company) return null;

    if (context.type === 'company') {
      return {
        type: context.type as EditBudgetType,
        name: company.name,
        actual: company.budget.actual,
        forecast: company.budget.forecast,
        maxBudget: 0
      };
    }

    if (context.type === 'team') {
      const team = company.teams.find(t => t.id === context.id);
      if (!team) return null;

      return {
        type: context.type as EditBudgetType,
        name: team.name,
        actual: team.budget.actual,
        forecast: team.budget.forecast,
        maxBudget: company.budget.forecast
      };
    }

    if (context.type === 'member' && context.teamId) {
      const team = company.teams.find(t => t.id === context.teamId);
      const member = team?.members.find(m => m.id === context.id);
      if (!team || !member) return null;

      return {
        type: context.type as EditBudgetType,
        name: member.name,
        actual: member.budget.actual,
        forecast: member.budget.forecast,
        maxBudget: team.budget.forecast
      };
    }

    return null;
  }

  onSaveEditBudget(data: EditBudgetData): void {
    const context = this.editBudgetContext();
    const company = this.selectedCompany();

    if (!context || !company) return;

    this.companies.update(companies =>
      companies.map(c => {
        if (c.id !== company.id) return c;

        if (context.type === 'company') {
          return {
            ...c,
            budget: calculateBudgetAllocation(data.actual, data.forecast),
            updatedAt: new Date().toISOString()
          };
        }

        if (context.type === 'team') {
          return {
            ...c,
            teams: c.teams.map(t =>
              t.id === context.id
                ? { ...t, budget: calculateBudgetAllocation(data.actual, data.forecast) }
                : t
            ),
            updatedAt: new Date().toISOString()
          };
        }

        if (context.type === 'member' && context.teamId) {
          return {
            ...c,
            teams: c.teams.map(t =>
              t.id === context.teamId
                ? {
                    ...t,
                    members: t.members.map(m =>
                      m.id === context.id
                        ? { ...m, budget: calculateBudgetAllocation(data.actual, data.forecast) }
                        : m
                    )
                  }
                : t
            ),
            updatedAt: new Date().toISOString()
          };
        }

        return c;
      })
    );

    this.closeEditBudgetModal();
  }

  // ==================== MONTHLY BREAKDOWN ====================

  closeMonthlyBreakdownModal(): void {
    this.isMonthlyBreakdownModalOpen.set(false);
  }

  onSaveMonthlyBreakdown(breakdown: MonthlyBreakdown[]): void {
    const company = this.selectedCompany();
    if (!company) return;

    this.companies.update(companies =>
      companies.map(c =>
        c.id === company.id
          ? { ...c, monthlyBreakdown: breakdown, updatedAt: new Date().toISOString() }
          : c
      )
    );

    this.closeMonthlyBreakdownModal();
  }

  // ==================== HELPERS ====================

  // OLD - COMMENTED
  /*
  isTeamExpanded(teamId: string): boolean {
    return this.expandedTeamIds().has(teamId);
  }
  */

  getCurrentTeamName(): string {
    const company = this.selectedCompany();
    const teamId = this.currentTeamId();

    if (!company || !teamId) return '';

    const team = company.teams.find(t => t.id === teamId);
    return team?.name || '';
  }
}
