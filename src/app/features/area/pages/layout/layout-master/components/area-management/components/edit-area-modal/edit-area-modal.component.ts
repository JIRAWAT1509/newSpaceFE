// edit-area-modal.component.ts
// edit-area-modal.component.ts
import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Area, AreaType, AreaStatus } from '@core/models/area.model';

@Component({
  selector: 'app-edit-area-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DialogModule],
  templateUrl: './edit-area-modal.component.html',
  styleUrl: './edit-area-modal.component.css'
})
export class EditAreaModalComponent {
  visible     = signal(false);
  isSaving    = signal(false);
  currentArea = signal<Area | null>(null);
  currentStep = signal<number>(1);
  showCloseWarning = false;

  areaSaved = output<Area>();
  closed    = output<void>();

  steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Size & Rent' },
    { number: 3, label: 'Tenant' },
    { number: 4, label: 'Inactive' },
    { number: 5, label: 'Confirm' },
  ];

  areaTypes: { label: string; value: AreaType }[] = [
    { label: 'Log',       value: 'log'       },
    { label: 'Kiosk',     value: 'kiosk'     },
    { label: 'Open Plan', value: 'open-plan' }
  ];

  areaStatuses: { label: string; value: AreaStatus }[] = [
    { label: 'ว่าง (Vacant)',             value: 'vacant'      },
    { label: 'เช่า (Leased)',             value: 'leased'      },
    { label: 'ใบเสนอราคา (Quotation)',    value: 'quotation'   },
    { label: 'ยังไม่พร้อม (Unallocated)', value: 'unallocated' }
  ];

  areaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.areaForm = this.fb.group({
      // Step 1
      roomNumber: ['', Validators.required],
      type:       ['log',    Validators.required],
      status:     ['vacant', Validators.required],

      // Step 2
      size:        [0, [Validators.required, Validators.min(0.1)]],
      monthlyRent: [null],
      notes:       [''],

      // Step 3 — nested FormGroup จริงๆ
      tenant: this.fb.group({
        nameTh:       [''],
        nameEn:       [''],
        contactPhone: [''],
        contactEmail: [''],
        leaseStart:   [''],
        leaseEnd:     [''],
        monthlyRent:  [null],
      }),

      // Step 4 — nested FormGroup จริงๆ
      inactivePeriod: this.fb.group({
        reasonTh:  [''],
        reasonEn:  [''],
        startDate: [''],
        endDate:   [''],
        notes:     [''],
      }),
    });
  }

  open(area: Area): void {
    this.currentArea.set(area);
    this.currentStep.set(1);

    const t  = area.currentTenant;
    const ip = area.inactivePeriod;

    this.areaForm.patchValue({
      roomNumber:  area.roomNumber,
      type:        area.type,
      status:      area.status,
      size:        area.size,
      monthlyRent: area.monthlyRent ?? null,
      notes:       '',

      tenant: {
        nameTh:       t?.nameTh        ?? '',
        nameEn:       t?.nameEn        ?? '',
        contactPhone: t?.contactPhone  ?? '',
        contactEmail: t?.contactEmail  ?? '',
        leaseStart:   t?.leaseStart ? this.toDateInput(t.leaseStart) : '',
        leaseEnd:     t?.leaseEnd   ? this.toDateInput(t.leaseEnd)   : '',
        monthlyRent:  t?.monthlyRent   ?? null,
      },

      inactivePeriod: {
        reasonTh:  ip?.reasonTh  ?? '',
        reasonEn:  ip?.reasonEn  ?? '',
        startDate: ip?.startDate ? this.toDateInput(ip.startDate) : '',
        endDate:   ip?.endDate   ? this.toDateInput(ip.endDate)   : '',
        notes:     ip?.notes     ?? '',
      },
    });

    this.visible.set(true);
  }

  // ── Computed previews ─────────────────────────────────────────────────────

  get ratePerSqm(): string | null {
    const rent = this.areaForm.get('monthlyRent')?.value;
    const size = this.areaForm.get('size')?.value;
    if (rent > 0 && size > 0) return (rent / size).toFixed(2);
    return null;
  }

  get leaseExpiryDays(): number | null {
    const end = this.areaForm.get('tenant.leaseEnd')?.value;
    if (!end) return null;
    const diff = new Date(end).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get inactivePeriodActive(): boolean | null {
    const start = this.areaForm.get('inactivePeriod.startDate')?.value;
    const end   = this.areaForm.get('inactivePeriod.endDate')?.value;
    if (!start || !end) return null;
    const now = Date.now();
    return new Date(start).getTime() <= now && now <= new Date(end).getTime();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private toDateInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getTypeLabel(type: string): string {
    return this.areaTypes.find(t => t.value === type)?.label ?? type;
  }

  getStatusLabel(status: string): string {
    return this.areaStatuses.find(s => s.value === status)?.label ?? status;
  }

  isFieldInvalid(field: string): boolean {
    const c = this.areaForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Validation ────────────────────────────────────────────────────────────

  validateStep(step: number): boolean {
    if (step === 1) {
      const rn = this.areaForm.get('roomNumber');
      const ty = this.areaForm.get('type');
      const st = this.areaForm.get('status');
      rn?.markAsTouched(); ty?.markAsTouched(); st?.markAsTouched();
      return !!(rn?.valid && ty?.valid && st?.valid);
    }
    if (step === 2) {
      const sz = this.areaForm.get('size');
      sz?.markAsTouched();
      return !!sz?.valid;
    }
    return true; // step 3, 4 optional
  }

  nextStep(): void {
    if (this.validateStep(this.currentStep())) this.currentStep.update(s => s + 1);
  }

  previousStep(): void {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  onSave(): void {
    if (this.areaForm.invalid) { this.areaForm.markAllAsTouched(); return; }

    this.isSaving.set(true);
    try {
      const f  = this.areaForm.value;
      const t  = f.tenant;
      const ip = f.inactivePeriod;

      // Tenant — preserve ถ้ามีอยู่แล้ว แม้ไม่ได้แก้ชื่อ
      const existingTenant = this.currentArea()?.currentTenant;
      const hasTenant = t.nameTh || t.nameEn || existingTenant;
      const currentTenant = hasTenant ? {
        name:            t.nameEn || t.nameTh || existingTenant?.name || '',
        nameTh:          t.nameTh       || existingTenant?.nameTh       || '',
        nameEn:          t.nameEn       || existingTenant?.nameEn       || '',
        contactPhone:    t.contactPhone || existingTenant?.contactPhone || undefined,
        contactEmail:    t.contactEmail || existingTenant?.contactEmail || undefined,
        leaseStart:      t.leaseStart   ? new Date(t.leaseStart) : existingTenant?.leaseStart ?? new Date(),
        leaseEnd:        t.leaseEnd     ? new Date(t.leaseEnd)   : existingTenant?.leaseEnd   ?? new Date(),
        monthlyRent:     t.monthlyRent  ? Number(t.monthlyRent)  : existingTenant?.monthlyRent ?? 0,
        hasWarning:      this.leaseExpiryDays !== null && this.leaseExpiryDays <= 90,
        daysUntilExpiry: this.leaseExpiryDays ?? existingTenant?.daysUntilExpiry ?? 0,
      } : undefined;

      // Inactive Period
      const hasInactive = ip.reasonTh || ip.reasonEn;
      const inactivePeriod = hasInactive ? {
        reasonTh:         ip.reasonTh,
        reasonEn:         ip.reasonEn,
        reason:           ip.reasonTh,
        startDate:        new Date(ip.startDate),
        endDate:          new Date(ip.endDate),
        notes:            ip.notes || undefined,
        isCurrentlyActive: this.inactivePeriodActive ?? false,
      } : undefined;

      const updatedArea: Area = {
        ...this.currentArea()!,
        roomNumber:    f.roomNumber,
        type:          f.type,
        status:        f.status,
        size:          Number(f.size),
        monthlyRent:   f.monthlyRent ? Number(f.monthlyRent) : undefined,
        currentTenant,
        inactivePeriod,
        updatedAt:     new Date(),
      };

      this.areaSaved.emit(updatedArea);
      this.visible.set(false);
      this.closed.emit();
    } finally {
      this.isSaving.set(false);
    }
  }

  // ── Cancel / Close ────────────────────────────────────────────────────────

  onCancel(): void { this.showCloseWarning = true; }

  confirmCancel(): void {
    this.showCloseWarning = false;
    this.visible.set(false);
    this.closed.emit();
  }

  onModalHide(): void {
    if (!this.isSaving() && !this.showCloseWarning) this.closed.emit();
  }
}
