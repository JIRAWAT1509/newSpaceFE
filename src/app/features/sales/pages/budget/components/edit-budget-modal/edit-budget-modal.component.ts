// edit-budget-modal.component.ts
import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';

export type EditBudgetType = 'company' | 'team' | 'member';

export interface EditBudgetData {
  actual: number;
  forecast: number;
}

@Component({
  selector: 'app-edit-budget-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumber],
  templateUrl: './edit-budget-modal.component.html',
  styleUrl: './edit-budget-modal.component.css'
})
export class EditBudgetModalComponent {
  // Inputs
  type = input.required<EditBudgetType>();
  name = input.required<string>();
  currentActual = input.required<number>();
  currentForecast = input.required<number>();
  maxBudget = input<number>(0); // For validation (optional)

  // Outputs
  close = output<void>();
  save = output<EditBudgetData>();

  // Form properties
  actual = 0;
  forecast = 0;

  // Validation trigger
  private validationTrigger = signal(0);

  ngOnInit(): void {
    // Initialize with current values
    this.actual = this.currentActual();
    this.forecast = this.currentForecast();
  }

  // Computed validation
  isValid = computed(() => {
    this.validationTrigger();

    const maxBudget = this.maxBudget();
    const forecastValid = maxBudget > 0 ? this.forecast <= maxBudget : true;

    return (
      this.actual >= 0 &&
      this.forecast > 0 &&
      forecastValid
    );
  });

  // Get type display name
  getTypeDisplayName(): string {
    switch (this.type()) {
      case 'company': return 'Company';
      case 'team': return 'Team';
      case 'member': return 'Member';
      default: return '';
    }
  }

  // Update handlers
  updateActual(value: number): void {
    this.actual = value || 0;
    this.validationTrigger.update(v => v + 1);
  }

  updateForecast(value: number): void {
    this.forecast = value || 0;
    this.validationTrigger.update(v => v + 1);
  }

  // Handle save
  onSave(): void {
    if (this.isValid()) {
      this.save.emit({
        actual: this.actual,
        forecast: this.forecast
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

  // Math for template
  Math = Math;
}
