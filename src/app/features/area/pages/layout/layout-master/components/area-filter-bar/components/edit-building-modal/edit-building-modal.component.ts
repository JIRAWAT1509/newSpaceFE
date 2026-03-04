/* /edit-building-modal.component.ts */

import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { Building } from '@core/models/building.model';
import { Branch } from '@core/models/branch.model';

export interface EditBuildingResult {
  building: Building;
}

@Component({
  selector: 'app-edit-building-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, SelectModule],
  templateUrl: './edit-building-modal.component.html',
  styleUrl: './edit-building-modal.component.css',
})
export class EditBuildingModalComponent {
  visible = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  buildingUpdated = output<EditBuildingResult>();
  closed = output<void>();

  buildingForm: FormGroup;
  editingBuildingId = signal<string>('');

  // Mock branches - in real app, should come from service
  branches = signal<any[]>([
    { id: 'branch-001', code: 'ST03', nameTh: 'สาขา 3' },
    { id: 'branch-002', code: 'ST04', nameTh: 'สาขา 4' },
    { id: 'branch-003', code: 'ST05', nameTh: 'สาขา 5' },
  ]);

  constructor(private fb: FormBuilder) {
    this.buildingForm = this.fb.group({
      branchId: ['', Validators.required],
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameTh: [''],
      addressTh: [''],
      addressEn: [''],
      contactPerson: [''],
      contactPhone: [''],
      optionalInfo: [''],
    });
  }

  open(building: Building): void {
    this.editingBuildingId.set(building.id);
    this.buildingForm.patchValue({
      branchId: building.branchId,
      code: building.code,
      name: building.name,
      nameTh: building.nameTh,
      addressTh: building.addressTh || '',
      addressEn: building.addressEn || '',
      contactPerson: (building as any).contactPerson || '',
      contactPhone: (building as any).contactPhone || '',
      optionalInfo: (building as any).optionalInfo || '',
    });
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
      const updatedBuilding: Building = {
        id: this.editingBuildingId(),
        branchId: formValue.branchId,
        code: formValue.code,
        name: formValue.name,
        nameTh: formValue.nameTh || formValue.name,
        nameEn: formValue.name,
        address: '',
        addressTh: formValue.addressTh || '',
        addressEn: formValue.addressEn || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // attach optional fields onto the object using type assertion so mocks persist
      (updatedBuilding as any).contactPerson = formValue.contactPerson || '';
      (updatedBuilding as any).contactPhone = formValue.contactPhone || '';
      (updatedBuilding as any).optionalInfo = formValue.optionalInfo || '';

      this.buildingUpdated.emit({ building: updatedBuilding });
      this.visible.set(false);
    } catch (error) {
      console.error('Error updating building:', error);
      alert('Failed to update building. Please try again.');
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
