// budget-kanban-board.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team, TeamMember } from '@core/models/budget.model';
import { TeamColumnComponent, TeamSortBy, TeamViewConfig } from '../team-column/team-column.component';

@Component({
  selector: 'app-budget-kanban-board',
  standalone: true,
  imports: [CommonModule, TeamColumnComponent],
  templateUrl: './budget-kanban-board.component.html',
  styleUrl: './budget-kanban-board.component.css'
})
export class BudgetKanbanBoardComponent {
  // Inputs
  teams = input.required<Team[]>();
  teamViewConfigs = input.required<Map<string, TeamViewConfig>>();

  // Outputs
  teamSortChange = output<{ teamId: string; sortBy: TeamSortBy }>();
  teamPageChange = output<{ teamId: string; page: number }>();
  teamCardsPerPageChange = output<{ teamId: string; cardsPerPage: number }>();
  editTeam = output<string>();
  deleteTeam = output<string>();
  addMember = output<string>();
  editMember = output<{ teamId: string; memberId: string }>();
  memberMoved = output<{ memberId: string; fromTeamId: string; toTeamId: string }>();

  // Current drag state
  protected currentDragMemberId: string | null = null;
  private currentDragFromTeamId: string | null = null;
  isDragging = signal(false);
  currentMousePosition = signal<{ x: number; y: number } | null>(null);

  // Track global mouse position during drag
  private globalMouseMoveHandler = (event: MouseEvent) => {
    if (this.isDragging()) {
      this.currentMousePosition.set({ x: event.clientX, y: event.clientY });
    }
  };

  constructor() {
    // Add global mouse listener
    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', this.globalMouseMoveHandler);
    }
  }

  ngOnDestroy() {
    // Clean up global listener
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', this.globalMouseMoveHandler);
    }
  }

  // Handle sort change from team column
  onSortChange(teamId: string, sortBy: TeamSortBy): void {
    this.teamSortChange.emit({ teamId, sortBy });
  }

  // Handle page change from team column
  onPageChange(teamId: string, page: number): void {
    this.teamPageChange.emit({ teamId, page });
  }

  // Handle cards per page change from team column
  onCardsPerPageChange(teamId: string, cardsPerPage: number): void {
    this.teamCardsPerPageChange.emit({ teamId, cardsPerPage });
  }

  // Handle edit team
  onEditTeam(teamId: string): void {
    this.editTeam.emit(teamId);
  }

  // Handle delete team
  onDeleteTeam(teamId: string): void {
    this.deleteTeam.emit(teamId);
  }

  // Handle add member
  onAddMember(teamId: string): void {
    this.addMember.emit(teamId);
  }

  // Handle member click
  onMemberClick(teamId: string, memberId: string): void {
    this.editMember.emit({ teamId, memberId });
  }

  // Handle member menu
  onMemberMenu(teamId: string, memberId: string): void {
    this.editMember.emit({ teamId, memberId });
  }

  // Handle drag start - remember which member and team
  onMemberDragStart(teamId: string, memberId: string): void {
    this.currentDragMemberId = memberId;
    this.currentDragFromTeamId = teamId;
    this.isDragging.set(true);

    const team = this.teams().find(t => t.id === teamId);
    const member = team?.members.find(m => m.id === memberId);

    console.log('🎯 KANBAN-BOARD: Drag started');
    console.log('   - Member:', member?.name);
    console.log('   - From Team:', team?.name);
  }

  // Handle drag end - called when mouse is released
  onMemberDragEnd(teamId: string): void {
    console.log('🎯 KANBAN-BOARD: Drag ended, waiting for columns to check...');

    // Delay clearing drag state to allow effects to fire and detect drops
    setTimeout(() => {
      console.log('🎯 KANBAN-BOARD: Clearing drag state');
      this.isDragging.set(false);
      this.currentMousePosition.set(null);
    }, 50);
  }

  // Handle drop - team-column already detected which team
  onMemberDrop(event: { memberId: string; targetTeamId: string }): void {
    console.log('🔥 KANBAN-BOARD: Drop event received');
    console.log('   - Member ID:', event.memberId);
    console.log('   - Target Team ID:', event.targetTeamId);
    console.log('   - Source Team ID:', this.currentDragFromTeamId);

    if (!this.currentDragFromTeamId) {
      console.error('❌ KANBAN-BOARD: Drop without knowing source team!');
      return;
    }

    const fromTeamId = this.currentDragFromTeamId;
    const toTeamId = event.targetTeamId;

    // Don't move if same team
    if (fromTeamId === toTeamId) {
      console.log('ℹ️ KANBAN-BOARD: Same team, ignoring drop');
      this.currentDragMemberId = null;
      this.currentDragFromTeamId = null;
      this.isDragging.set(false);
      this.currentMousePosition.set(null);
      return;
    }

    const fromTeam = this.teams().find(t => t.id === fromTeamId);
    const toTeam = this.teams().find(t => t.id === toTeamId);
    const member = fromTeam?.members.find(m => m.id === event.memberId);

    console.log('✅ KANBAN-BOARD: Emitting memberMoved event');
    console.log('   - Member:', member?.name);
    console.log('   - From:', fromTeam?.name);
    console.log('   - To:', toTeam?.name);

    // Emit to budget-master
    this.memberMoved.emit({
      memberId: event.memberId,
      fromTeamId: fromTeamId,
      toTeamId: toTeamId
    });

    console.log('✅ KANBAN-BOARD: memberMoved event emitted successfully');

    // Reset drag state
    this.currentDragMemberId = null;
    this.currentDragFromTeamId = null;
    this.isDragging.set(false);
    this.currentMousePosition.set(null);
  }

  // Get view config for a team
  getTeamConfig(teamId: string): TeamViewConfig {
    return this.teamViewConfigs().get(teamId) || {
      teamId: teamId,
      sortBy: 'name',
      currentPage: 1,
      cardsPerPage: 8
    };
  }
}
