// add-company-modal.component.ts
import { Component, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';

export interface AddCompanyData {
  name: string;
  year: number;
  budget: number;
}

@Component({
  selector: 'app-add-company-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, InputNumber],
  templateUrl: './add-company-modal.component.html',
  styleUrl: './add-company-modal.component.css'
})
export class AddCompanyModalComponent {
  // Outputs
  close = output<void>();
  save = output<AddCompanyData>();

  // Form properties (plain for ngModel)
  name = '';
  year = new Date().getFullYear();
  budget = 0;

  // Track validation
  private validationTrigger = signal(0);

  // Computed validation
  isValid = computed(() => {
    // Trigger recomputation
    this.validationTrigger();

    return (
      this.name.trim().length > 0 &&
      this.year >= 2000 &&
      this.year <= 2100 &&
      this.budget > 0
    );
  });

  // Trigger validation on changes
  updateName(value: string): void {
    this.name = value;
    this.validationTrigger.update(v => v + 1);
  }

  updateYear(value: number): void {
    this.year = value || new Date().getFullYear();
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
        name: this.name,
        year: this.year,
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
}
