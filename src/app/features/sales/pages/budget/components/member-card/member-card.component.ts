// member-card.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from '@core/models/budget.model';
import { BudgetBarComponent } from '../budget-bar/budget-bar.component';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, BudgetBarComponent],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.css'
})
export class MemberCardComponent {
  // Inputs
  member = input.required<TeamMember>();

  // Outputs
  edit = output<string>();
  remove = output<string>();

  // Handle edit
  onEdit(): void {
    this.edit.emit(this.member().id);
  }

  // Handle remove
  onRemove(): void {
    this.remove.emit(this.member().id);
  }

  // Get avatar initials
  getInitials(): string {
    const name = this.member().name;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Get avatar color based on role
  getAvatarColor(): string {
    return this.member().role === 'leader'
      ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
      : 'linear-gradient(135deg, #3b82f6, #60a5fa)';
  }
}
