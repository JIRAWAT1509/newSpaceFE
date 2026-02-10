// team-column.component.ts
import { Component, input, output, computed, signal, ElementRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Team, TeamMember } from '@core/models/budget.model';
import { StagePaginationComponent } from '../stage-pagination/stage-pagination.component';
import { BudgetMemberCardComponent } from '../budget-member-card/budget-member-card.component';
import { BudgetBarComponent } from '../budget-bar/budget-bar.component';

export type TeamSortBy = 'name' | 'budgetDesc' | 'budgetAsc' | 'roleLeaderFirst' | 'roleMemberFirst';

export interface TeamViewConfig {
  teamId: string;
  sortBy: TeamSortBy;
  currentPage: number;
  cardsPerPage: number;
}

interface SortOption {
  label: string;
  value: TeamSortBy;
}

@Component({
  selector: 'app-team-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    StagePaginationComponent,
    BudgetMemberCardComponent,
    BudgetBarComponent
  ],
  templateUrl: './team-column.component.html',
  styleUrl: './team-column.component.css'
})
export class TeamColumnComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  team = input.required<Team>();
  viewConfig = input.required<TeamViewConfig>();
  isDraggingGlobal = input<boolean>(false);
  globalMousePosition = input<{ x: number; y: number } | null>(null);
  currentDragMemberId = input<string | null>(null);

  // Outputs
  sortChange = output<TeamSortBy>();
  pageChange = output<number>();
  cardsPerPageChange = output<number>();
  editTeam = output<void>();
  deleteTeam = output<void>();
  addMember = output<void>();
  memberClick = output<string>();
  memberMenuClick = output<string>();
  memberDragStart = output<string>();
  memberDragEnd = output<void>();
  memberDrop = output<{ memberId: string; targetTeamId: string }>();

  // Drag state
  isDragOver = signal(false);
  private wasOver = false;

  constructor() {
    // Watch global mouse position and check if over this column's members-list
    effect(() => {
      const mousePos = this.globalMousePosition();
      const isDragging = this.isDraggingGlobal();
      const dragMemberId = this.currentDragMemberId();

      // If drag just ended and we were over this column, emit drop
      if (!isDragging && this.wasOver && dragMemberId) {
        this.memberDrop.emit({
          memberId: dragMemberId,
          targetTeamId: this.team().id
        });
        this.wasOver = false;
        this.isDragOver.set(false);
        return;
      }

      // Reset if not dragging
      if (!isDragging || !mousePos) {
        this.isDragOver.set(false);
        this.wasOver = false;
        return;
      }

      // Get members-list element for this column
      const membersListElement = this.elementRef.nativeElement.querySelector('.members-list');
      if (!membersListElement) {
        this.isDragOver.set(false);
        this.wasOver = false;
        return;
      }

      const rect = membersListElement.getBoundingClientRect();
      const isOver = (
        mousePos.x >= rect.left &&
        mousePos.x <= rect.right &&
        mousePos.y >= rect.top &&
        mousePos.y <= rect.bottom
      );

      this.wasOver = isOver;
      this.isDragOver.set(isOver);
    });
  }

  // Sort options
  sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Budget (High-Low)', value: 'budgetDesc' },
    { label: 'Budget (Low-High)', value: 'budgetAsc' },
    { label: 'Role (Leader First)', value: 'roleLeaderFirst' },
    { label: 'Role (Member First)', value: 'roleMemberFirst' }
  ];

  // Computed: Sorted members (ALWAYS LEADER FIRST)
  sortedMembers = computed(() => {
    const members = [...this.team().members];
    const sortBy = this.viewConfig().sortBy;

    // Separate leader and members
    const leader = members.find(m => m.role === 'leader');
    const regularMembers = members.filter(m => m.role !== 'leader');

    // Sort regular members
    let sortedRegularMembers: TeamMember[] = [];
    switch (sortBy) {
      case 'name':
        sortedRegularMembers = regularMembers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'budgetDesc':
        sortedRegularMembers = regularMembers.sort((a, b) => b.budget.forecast - a.budget.forecast);
        break;
      case 'budgetAsc':
        sortedRegularMembers = regularMembers.sort((a, b) => a.budget.forecast - b.budget.forecast);
        break;
      case 'roleLeaderFirst':
      case 'roleMemberFirst':
        sortedRegularMembers = regularMembers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sortedRegularMembers = regularMembers;
    }

    // Always return leader first, then sorted members
    return leader ? [leader, ...sortedRegularMembers] : sortedRegularMembers;
  });

  // Computed: Paginated members
  paginatedMembers = computed(() => {
    const members = this.sortedMembers();
    const config = this.viewConfig();
    const startIndex = (config.currentPage - 1) * config.cardsPerPage;
    const endIndex = startIndex + config.cardsPerPage;
    return members.slice(startIndex, endIndex);
  });

  // Computed: Total pages
  totalPages = computed(() => {
    const totalMembers = this.team().members.length;
    const cardsPerPage = this.viewConfig().cardsPerPage;
    return Math.ceil(totalMembers / cardsPerPage);
  });

  // Computed: Unallocated budget
  unallocatedBudget = computed(() => {
    const teamBudget = this.team().budget.forecast;
    const allocatedBudget = this.team().members.reduce((sum, member) => sum + member.budget.forecast, 0);
    return teamBudget - allocatedBudget;
  });

  // Computed: Check if has unallocated budget
  hasUnallocatedBudget = computed(() => {
    return this.unallocatedBudget() > 0;
  });

  // Handle sort change
  onSortChange(sortBy: TeamSortBy): void {
    this.sortChange.emit(sortBy);
  }

  // Handle page change
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  // Handle cards per page change
  onCardsPerPageChange(cardsPerPage: number): void {
    this.cardsPerPageChange.emit(cardsPerPage);
  }

  // Handle team edit
  onEditTeam(): void {
    this.editTeam.emit();
  }

  // Handle team delete
  onDeleteTeam(): void {
    if (confirm(`Are you sure you want to delete team "${this.team().name}"?`)) {
      this.deleteTeam.emit();
    }
  }

  // Handle add member
  onAddMember(): void {
    this.addMember.emit();
  }

  // Handle member click
  onMemberClick(memberId: string): void {
    this.memberClick.emit(memberId);
  }

  // Handle member menu
  onMemberMenu(memberId: string): void {
    this.memberMenuClick.emit(memberId);
  }

  // Handle member drag start
  onMemberDragStart(event: { memberId: string; event: MouseEvent }): void {
    this.memberDragStart.emit(event.memberId);
  }

  // Handle member drag end
  onMemberDragEnd(event: MouseEvent): void {
    this.memberDragEnd.emit();
  }

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }
}
