// conditions-tab.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

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
    InputText,
    Textarea
  ],
  templateUrl: './conditions-tab.component.html',
  styleUrl: './conditions-tab.component.css'
})
export class ConditionsTabComponent implements OnInit {
  form!: FormGroup;
  conditionForm!: FormGroup;

  sections: Section[] = [
    { id: 'subject', name: 'เรื่อง' },
    { id: 'contract-conditions', name: 'เงื่อนไขตามสัญญา' },
    { id: 'internal-notes', name: 'บันทึกภายใน' }
  ];

  // State
  showConditionDrawer = signal<boolean>(false);
  editingIndex = signal<number | null>(null);
  conditionList = signal<ContractCondition[]>([]);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.initConditionForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      subject: [''],
      internalNotes: ['']
    });
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
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    return requiredFields.every(field => {
      const control = this.form.get(field);
      return control && control.valid && control.value;
    });
  }

  getSectionProgress(sectionId: string): number {
    const requiredFields = this.getRequiredFieldsBySection(sectionId);
    if (requiredFields.length === 0) {
      // For conditions section, check if any conditions exist
      if (sectionId === 'contract-conditions') {
        return this.conditionList().length > 0 ? 100 : 0;
      }
      return 100;
    }

    const completedFields = requiredFields.filter(field => {
      const control = this.form.get(field);
      return control && control.valid && control.value;
    }).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  getRequiredFieldsBySection(sectionId: string): string[] {
    switch (sectionId) {
      case 'subject':
        return ['subject'];
      case 'contract-conditions':
        return []; // Handled separately by checking list
      case 'internal-notes':
        return [];
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
    if (confirm('คุณต้องการลบเงื่อนไขนี้หรือไม่?')) {
      this.conditionList.update(list => list.filter((_, i) => i !== index));
    }
  }

  closeDrawer(): void {
    this.showConditionDrawer.set(false);
    this.editingIndex.set(null);
  }
}
