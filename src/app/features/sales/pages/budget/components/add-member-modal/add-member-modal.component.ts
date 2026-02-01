// add-member-modal.component.ts
import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';

export interface AvailableUser {
  id: string;
  name: string;
  role: string;
}

export interface AddMemberData {
  userId: string;
  budget: number;
}

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumber, Select],
  templateUrl: './add-member-modal.component.html',
  styleUrl: './add-member-modal.component.css'
})
export class AddMemberModalComponent {
  // Inputs
  teamName = input.required<string>();
  availableUsers = input.required<AvailableUser[]>();
  maxBudget = input.required<number>(); // Team remaining budget

  // Outputs
  close = output<void>();
  save = output<AddMemberData>();

  // Form properties
  userId = '';
  budget = 0;

  // Validation trigger
  private validationTrigger = signal(0);

  // Computed validation
  isValid = computed(() => {
    this.validationTrigger();

    return (
      this.userId.trim().length > 0 &&
      this.budget > 0 &&
      this.budget <= this.maxBudget()
    );
  });

  // Get selected user
  getSelectedUser(): AvailableUser | null {
    return this.availableUsers().find(u => u.id === this.userId) || null;
  }

  // Update handlers
  updateUser(value: string): void {
    this.userId = value;
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
        userId: this.userId,
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
