// conditions-tab.component.ts
import { Component, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

interface Section {
  id: string;
  name: string;
}

interface ContractCondition {
  itemNumber: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-conditions-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    DatePicker,
    InputText,
    Textarea,
    ConfirmationModalComponent
  ],
  templateUrl: './conditions-tab.component.html',
  styleUrl: './conditions-tab.component.css'
})
export class ConditionsTabComponent implements OnInit {
  form = input<FormGroup>();
  conditionForm!: FormGroup;

  sections: Section[] = [
    { id: 'duration', name: 'ระยะเวลา & การต่อสัญญา' },
    { id: 'financial', name: 'เงื่อนไขทางการเงิน' },
    { id: 'special', name: 'เงื่อนไขพิเศษ' },
    { id: 'addendum', name: 'บันทึกแนบท้ายสัญญา' },
    { id: 'additional', name: 'เงื่อนไขเพิ่มเติม' }
  ];

  // State
  showConditionDrawer = signal<boolean>(false);
  editingIndex = signal<number | null>(null);
  conditionList = signal<ContractCondition[]>([]);

  // Confirmation modal state
  showConfirmModal = signal<boolean>(false);
  pendingDeleteIndex = signal<number | null>(null);

  // Dropdown options
  yesNoOptions = [
    { label: 'YES', value: true },
    { label: 'NO', value: false }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initConditionForm();
  }

  initConditionForm(): void {
    this.conditionForm = this.fb.group({
      itemNumber: [1, [Validators.required, Validators.min(1)]],
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  // ==================== SECTION PROGRESS ====================
  isSectionCompleted(sectionId: string): boolean {
    if (!this.form()) return false;
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    return requiredFields.every(field => {
      const control = this.form()!.get(field);
      return control && control.valid && control.value;
    });
  }

  getSectionProgress(sectionId: string): number {
    if (!this.form()) return 0;
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    if (requiredFields.length === 0) {
      // For additional conditions section, check if any conditions exist
      if (sectionId === 'additional') {
        return this.conditionList().length > 0 ? 100 : 0;
      }
      return 100;
    }

    const completedFields = requiredFields.filter(field => {
      const control = this.form()!.get(field);
      return control && control.valid && control.value;
    }).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  getRequiredFieldsBySection(sectionId: string): string[] {
    switch (sectionId) {
      case 'duration':
        return ['durationYears', 'contractStartDate', 'contractEndDate'];
      case 'financial':
        return ['rentRate', 'creditTermRent', 'creditTermUtility'];
      case 'special':
        return [];
      case 'addendum':
        return [];
      case 'additional':
        return []; // Handled separately by checking conditionList
      default:
        return [];
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ==================== CONDITION MANAGEMENT ====================
  openConditionDrawer(): void {
    this.editingIndex.set(null);

    // Auto-increment item number
    const nextItemNumber = this.conditionList().length > 0
      ? Math.max(...this.conditionList().map(c => c.itemNumber)) + 1
      : 1;

    this.conditionForm.reset({
      itemNumber: nextItemNumber,
      title: '',
      content: ''
    });

    this.showConditionDrawer.set(true);
  }

  editCondition(index: number): void {
    this.editingIndex.set(index);
    const condition = this.conditionList()[index];

    this.conditionForm.patchValue({
      itemNumber: condition.itemNumber,
      title: condition.title,
      content: condition.content
    });

    this.showConditionDrawer.set(true);
  }

  saveCondition(): void {
    if (this.conditionForm.invalid) {
      Object.keys(this.conditionForm.controls).forEach(key => {
        this.conditionForm.get(key)?.markAsTouched();
      });
      return;
    }

    const newCondition: ContractCondition = this.conditionForm.value;

    if (this.editingIndex() !== null) {
      // Update existing
      this.conditionList.update(list => {
        const updated = [...list];
        updated[this.editingIndex()!] = newCondition;
        return updated;
      });
    } else {
      // Add new
      this.conditionList.update(list => [...list, newCondition]);
    }

    this.closeDrawer();
  }

  removeCondition(index: number): void {
    this.pendingDeleteIndex.set(index);
    this.showConfirmModal.set(true);
  }

  onConfirmDelete(): void {
    const index = this.pendingDeleteIndex();
    if (index !== null) {
      this.conditionList.update(list => list.filter((_, i) => i !== index));
    }
    this.showConfirmModal.set(false);
    this.pendingDeleteIndex.set(null);
  }

  onCancelDelete(): void {
    this.showConfirmModal.set(false);
    this.pendingDeleteIndex.set(null);
  }

  closeDrawer(): void {
    this.showConditionDrawer.set(false);
    this.editingIndex.set(null);
  }
}
