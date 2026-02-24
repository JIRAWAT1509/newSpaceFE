// edit-area-modal.component.ts
import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Area, AreaType, AreaStatus } from '@core/models/area.model';

@Component({
  selector: 'app-edit-area-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
  templateUrl: './edit-area-modal.component.html',
  styleUrl: './edit-area-modal.component.css'
})
export class EditAreaModalComponent {
  // ✅ ใช้ signal ธรรมดา ไม่ใช่ input
  visible      = signal(false);
  isSaving     = signal(false);
  currentArea  = signal<Area | null>(null);

  areaSaved = output<Area>();
  closed    = output<void>();

  areaForm: FormGroup;

  areaTypes: { label: string; value: AreaType }[] = [
    { label: 'Log',       value: 'log'       },
    { label: 'Kiosk',     value: 'kiosk'     },
    { label: 'Open Plan', value: 'open-plan' }
  ];

  areaStatuses: { label: string; value: AreaStatus }[] = [
    { label: 'ว่าง (Vacant)',              value: 'vacant'      },
    { label: 'เช่า (Leased)',              value: 'leased'      },
    { label: 'ใบเสนอราคา (Quotation)',     value: 'quotation'   },
    { label: 'ยังไม่พร้อม (Unallocated)',  value: 'unallocated' }
  ];

  constructor(private fb: FormBuilder) {
    this.areaForm = this.fb.group({
      roomNumber:  ['', Validators.required],
      type:        ['log',     Validators.required],
      status:      ['vacant',  Validators.required],
      size:        [0, [Validators.required, Validators.min(0.1)]],
      monthlyRent: [null],
      notes:       ['']
    });
  }

  open(area: Area): void {
    this.currentArea.set(area);
    this.areaForm.patchValue({
      roomNumber:  area.roomNumber,
      type:        area.type,
      status:      area.status,
      size:        area.size,
      monthlyRent: area.monthlyRent ?? null,
      notes:       ''
    });
    this.visible.set(true);
  }

  // ✅ คำนวณ rate ต่อ ตร.ม.
  get ratePerSqm(): string | null {
    const rent = this.areaForm.get('monthlyRent')?.value;
    const size = this.areaForm.get('size')?.value;
    if (rent > 0 && size > 0) {
      return (rent / size).toFixed(2);
    }
    return null;
  }

  isFieldInvalid(field: string): boolean {
    const c = this.areaForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSave(): void {
    if (this.areaForm.invalid) {
      this.areaForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    try {
      const form     = this.areaForm.value;
      const original = this.currentArea()!;

      const updatedArea: Area = {
        ...original,
        roomNumber:  form.roomNumber,
        type:        form.type,
        status:      form.status,
        size:        Number(form.size),
        monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
        updatedAt:   new Date()
      };

      this.areaSaved.emit(updatedArea);
      this.visible.set(false);
    } finally {
      this.isSaving.set(false);
    }
  }

  onCancel(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  onModalHide(): void {
    if (!this.isSaving()) this.closed.emit();
  }
}
