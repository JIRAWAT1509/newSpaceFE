/* edit-floor-modal.component.ts */

import { Component, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Floor } from '@core/models/floor.model';

export interface EditFloorResult {
  floor: Floor;
}

@Component({
  selector: 'app-edit-floor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
  templateUrl: './edit-floor-modal.component.html',
  styleUrl: './edit-floor-modal.component.css',
})
export class EditFloorModalComponent implements OnInit {
  visible = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  floorUpdated = output<EditFloorResult>();
  closed = output<void>();

  floorForm: FormGroup;
  editingFloor = signal<Floor | null>(null);
  buildingName = computed(() => {
    const floor = this.editingFloor();
    return floor ? `Building ${floor.buildingId}` : '-';
  });

  constructor(private fb: FormBuilder) {
    this.floorForm = this.fb.group({
      floorNumber: ['', Validators.required],
      floorName: ['', Validators.required],
      floorNameTh: [''],
      floorNameEn: [''],
    });
  }

  ngOnInit(): void {}

  open(floor: Floor): void {
    this.editingFloor.set(floor);
    this.floorForm.patchValue({
      floorNumber: floor.floorNumber,
      floorName: floor.floorName,
      floorNameTh: floor.floorNameTh,
      floorNameEn: floor.floorNameEn,
    });
    this.visible.set(true);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.floorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onCancel(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  async onSave(): Promise<void> {
    if (this.floorForm.invalid) {
      this.floorForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    try {
      const floor = this.editingFloor();
      if (!floor) return;

      const formValue = this.floorForm.value;
      const updatedFloor: Floor = {
        ...floor,
        floorNumber: formValue.floorNumber,
        floorName: formValue.floorName || `Fl. ${formValue.floorNumber}`,
        floorNameTh: formValue.floorNameTh || `ชั้น ${formValue.floorNumber}`,
        floorNameEn: formValue.floorNameEn || `Floor ${formValue.floorNumber}`,
        updatedAt: new Date(),
      };

      this.floorUpdated.emit({ floor: updatedFloor });
      this.visible.set(false);
    } catch (error) {
      console.error('Error updating floor:', error);
      alert('Failed to update floor. Please try again.');
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
