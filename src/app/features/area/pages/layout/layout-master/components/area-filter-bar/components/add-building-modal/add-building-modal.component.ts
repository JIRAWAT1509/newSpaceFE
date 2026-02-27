/* add - building - modal.component.ts; */

import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Building } from '@core/models/building.model';

export interface AddBuildingResult {
  building: Building;
}

@Component({
  selector: 'app-add-building-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
  templateUrl: './add-building-modal.component.html',
  styleUrl: './add-building-modal.component.css',
})
export class AddBuildingModalComponent {
  visible = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  buildingCreated = output<AddBuildingResult>();
  closed = output<void>();

  buildingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.buildingForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameTh: [''],
      nameEn: [''],
      address: [''],
      addressTh: [''],
      addressEn: [''],
    });
  }

  open(): void {
    this.buildingForm.reset();
    this.visible.set(true);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.buildingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onCancel(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  async onSave(): Promise<void> {
    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    try {
      const formValue = this.buildingForm.value;
      const newBuilding: Building = {
        id: `bld-${Date.now()}`,
        code: formValue.code,
        name: formValue.name,
        nameTh: formValue.nameTh || formValue.name,
        nameEn: formValue.nameEn || formValue.name,
        address: formValue.address || '',
        addressTh: formValue.addressTh || '',
        addressEn: formValue.addressEn || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.buildingCreated.emit({ building: newBuilding });
      this.visible.set(false);
    } catch (error) {
      console.error('Error creating building:', error);
      alert('Failed to create building. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  onModalHide(): void {
    if (!this.isSaving()) {
      this.closed.emit();
    }
  }
}
