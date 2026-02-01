// team-card.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '@core/models/budget.model';
import { BudgetBarComponent } from '../budget-bar/budget-bar.component';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule, BudgetBarComponent, MemberCardComponent],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.css'
})
export class TeamCardComponent {
  // Inputs
  team = input.required<Team>();
  isExpanded = input<boolean>(false);

  // Outputs
  toggleExpand = output<string>();
  editTeam = output<string>();
  deleteTeam = output<string>();
  moveUp = output<string>();
  moveDown = output<string>();
  addMember = output<string>();
  editMember = output<{ teamId: string; memberId: string }>();
  removeMember = output<{ teamId: string; memberId: string }>();

  // Local expanded state
  expanded = signal<boolean>(false);

  ngOnInit(): void {
    this.expanded.set(this.isExpanded());
  }

  ngOnChanges(): void {
    this.expanded.set(this.isExpanded());
  }

  // Toggle expand/collapse
  onToggleExpand(): void {
    this.expanded.set(!this.expanded());
    this.toggleExpand.emit(this.team().id);
  }

  // Handle team actions
  onEdit(): void {
    this.editTeam.emit(this.team().id);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete team "${this.team().name}"?`)) {
      this.deleteTeam.emit(this.team().id);
    }
  }

  onMoveUp(): void {
    this.moveUp.emit(this.team().id);
  }

  onMoveDown(): void {
    this.moveDown.emit(this.team().id);
  }

  onAddMember(): void {
    this.addMember.emit(this.team().id);
  }

  // Handle member actions
  onEditMember(memberId: string): void {
    this.editMember.emit({ teamId: this.team().id, memberId });
  }

  onRemoveMember(memberId: string): void {
    this.removeMember.emit({ teamId: this.team().id, memberId });
  }

  // Get members count
  getMembersCount(): number {
    return this.team().members.length;
  }
}
