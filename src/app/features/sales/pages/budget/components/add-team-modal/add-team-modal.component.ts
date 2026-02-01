// add-team-modal.component.ts
import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';

export interface AvailableUser {
  id: string;
  name: string;
  role: string;
}

export interface AddTeamData {
  name: string;
  leaderId: string;
  budget: number;
}

@Component({
  selector: 'app-add-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, InputNumber, Select],
  templateUrl: './add-team-modal.component.html',
  styleUrl: './add-team-modal.component.css'
})
export class AddTeamModalComponent {
  // Inputs
  availableUsers = input.required<AvailableUser[]>();
  maxBudget = input.required<number>(); // Company remaining budget

  // Outputs
  close = output<void>();
  save = output<AddTeamData>();

  // Form properties
  teamName = '';
  leaderId = '';
  budget = 0;

  // Validation trigger
  private validationTrigger = signal(0);

  // Computed validation
  isValid = computed(() => {
    this.validationTrigger();

    return (
      this.teamName.trim().length > 0 &&
      this.leaderId.trim().length > 0 &&
      this.budget > 0 &&
      this.budget <= this.maxBudget()
    );
  });

  // Get selected leader name
  getSelectedLeaderName(): string {
    const leader = this.availableUsers().find(u => u.id === this.leaderId);
    return leader ? leader.name : '';
  }

  // Update handlers
  updateTeamName(value: string): void {
    this.teamName = value;
    this.validationTrigger.update(v => v + 1);
  }

  updateLeader(value: string): void {
    this.leaderId = value;
    this.validationTrigger.update(v => v + 1);
  }

  updateBudget(value: number): void {
    this.budget = value || 0;
    this.validationTrigger.update(v => v + 1);
  }

  // Handle save
  onSave(): void {
    if (this.isValid()) {
      this.save.emit({
        name: this.teamName,
        leaderId: this.leaderId,
        budget: this.budget
      });
    }
  }

  // Handle close
  onClose(): void {
    this.close.emit();
  }

  // Prevent closing when clicking inside modal
  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  // Format currency
  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString()}`;
  }
}
