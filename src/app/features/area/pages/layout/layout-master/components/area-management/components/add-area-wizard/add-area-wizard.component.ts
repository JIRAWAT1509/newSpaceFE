/* add-area-wizard.component.ts */

import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Area, AreaType } from '@core/models/area.model';

interface PictureFile {
  file: File;
  preview: string;
}

interface FormData {
  roomNumber:    string;
  type:          AreaType;
  size:          number;
  monthlyRent:   number | null;
  effectiveDate: string;       // ✅ วันที่มีผลบังคับ
  subcategory:   string;       // ✅ subcategory
  notes:         string;       // ✅ หมายเหตุ
  pictures:      PictureFile[];
}

interface ValidationErrors {
  roomNumber?: string;
  size?: string;
  effectiveDate?: string;
}

const SUBCATEGORY_OPTIONS = [
  { label: 'อาหารและเครื่องดื่ม', value: 'food_beverage' },
  { label: 'แฟชั่นและเครื่องแต่งกาย', value: 'fashion' },
  { label: 'อิเล็กทรอนิกส์', value: 'electronics' },
  { label: 'สุขภาพและความงาม', value: 'health_beauty' },
  { label: 'บริการ', value: 'service' },
  { label: 'ค้าปลีกทั่วไป', value: 'general_retail' },
  { label: 'อื่นๆ', value: 'other' }
];

@Component({
  selector: 'app-add-area-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './add-area-wizard.component.html',
  styleUrl: './add-area-wizard.component.css'
})
export class AddAreaWizardComponent {
  visible = input.required<boolean>();
  floorId = input.required<string>();

  closed = output<Area | undefined>();

  currentStep    = signal<number>(1);
  showCloseWarning = false;

  subcategoryOptions = SUBCATEGORY_OPTIONS;

  steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Size & Rent' },
    { number: 3, label: 'Pictures' },
    { number: 4, label: 'Confirm' }
  ];

  formData: FormData = {
    roomNumber:    '',
    type:          'log',
    size:          0,
    monthlyRent:   null,
    effectiveDate: new Date().toISOString().split('T')[0], // default today
    subcategory:   '',
    notes:         '',
    pictures:      []
  };

  errors: ValidationErrors = {};

  // ✅ คำนวณ rate ต่อ ตร.ม.
  ratePerSqm = computed(() => {
    const rent = this.formData.monthlyRent ?? 0;
    const size = this.formData.size ?? 0;
    if (rent > 0 && size > 0) {
      return (rent / size).toFixed(2);
    }
    return null;
  });

  validateStep(step: number): boolean {
    this.errors = {};

    if (step === 1) {
      if (!this.formData.roomNumber.trim()) {
        this.errors.roomNumber = 'Room number is required';
        return false;
      }
      if (!/^[A-Za-z0-9\-_]+$/.test(this.formData.roomNumber)) {
        this.errors.roomNumber = 'Invalid format (use letters, numbers, dash, or underscore)';
        return false;
      }
    }

    if (step === 2) {
      if (!this.formData.size || this.formData.size <= 0) {
        this.errors.size = 'Size must be greater than 0';
        return false;
      }
      if (this.formData.size > 10000) {
        this.errors.size = 'Size seems too large (max 10,000 sqm)';
        return false;
      }
      if (!this.formData.effectiveDate) {
        this.errors.effectiveDate = 'Effective date is required';
        return false;
      }
    }

    return true;
  }

  nextStep(): void {
    if (this.validateStep(this.currentStep())) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) this.currentStep.set(this.currentStep() - 1);
  }

  onPicturesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const remainingSlots = 5 - this.formData.pictures.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} is too large (max 5MB)`); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.pictures.push({ file, preview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removePicture(index: number): void {
    this.formData.pictures.splice(index, 1);
  }

  onSave(): void {
    const newArea: Area = {
      id:                `area-${Date.now()}`,
      floorId:           this.floorId(),
      roomNumber:        this.formData.roomNumber,
      type:              this.formData.type,
      status:            'unallocated',
      position:          { x: 50, y: 50 },
      floorPlanVersionId: '',
      size:              this.formData.size,
      monthlyRent:       this.formData.monthlyRent || undefined,
      isActive:          false,
      isDeleted:         false,
      createdAt:         new Date(this.formData.effectiveDate),
      updatedAt:         new Date()
    };

    this.closed.emit(newArea);
    this.resetForm();
  }

  onCancel(): void {
    if (this.hasFormData()) {
      this.showCloseWarning = true;
    } else {
      this.confirmCancel();
    }
  }

  confirmCancel(): void {
    this.showCloseWarning = false;
    this.closed.emit(undefined);
    this.resetForm();
  }

  onModalHide(): void {
    if (!this.showCloseWarning) this.onCancel();
  }

  hasFormData(): boolean {
    return !!(
      this.formData.roomNumber ||
      this.formData.size ||
      this.formData.monthlyRent ||
      this.formData.pictures.length > 0
    );
  }

  resetForm(): void {
    this.formData = {
      roomNumber:    '',
      type:          'log',
      size:          0,
      monthlyRent:   null,
      effectiveDate: new Date().toISOString().split('T')[0],
      subcategory:   '',
      notes:         '',
      pictures:      []
    };
    this.currentStep.set(1);
    this.errors = {};
  }

  getTypeLabel(type: AreaType): string {
    const labels: Record<string, string> = { 'log': 'Log', 'kiosk': 'Kiosk', 'open-plan': 'Open Plan' };
    return labels[type] || type;
  }

  getSubcategoryLabel(value: string): string {
    return this.subcategoryOptions.find(o => o.value === value)?.label || value || 'ไม่ระบุ';
  }
}
