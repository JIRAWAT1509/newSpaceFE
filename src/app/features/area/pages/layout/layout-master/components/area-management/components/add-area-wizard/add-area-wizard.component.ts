import { Component, input, output, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Area, AreaType } from '@core/models/area.model';

interface PictureFile {
  file: File;
  preview: string;
}

interface FormData {
  roomNumber: string;
  type: AreaType;
  size: number;
  monthlyRent: number | null;
  pictures: PictureFile[];
}

interface ValidationErrors {
  roomNumber?: string;
  size?: string;
}

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

  @ViewChild('pictureInput') pictureInput?: ElementRef<HTMLInputElement>;

  currentStep = signal<number>(1);
  showCloseWarning = false;

  steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Size & Rent' },
    { number: 3, label: 'Pictures' },
    { number: 4, label: 'Confirm' }
  ];

  formData: FormData = {
    roomNumber: '',
    type: 'log',
    size: 0,
    monthlyRent: null,
    pictures: []
  };

  errors: ValidationErrors = {};

  validateStep(step: number): boolean {
    this.errors = {};

    if (step === 1) {
      if (!this.formData.roomNumber.trim()) {
        this.errors.roomNumber = 'Room number is required';
        return false;
      }
      // Validate format (alphanumeric with optional dash/underscore)
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
    }

    return true;
  }

  nextStep(): void {
    if (this.validateStep(this.currentStep())) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  onPicturesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    // Limit to 5 pictures total
    const remainingSlots = 5 - this.formData.pictures.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.pictures.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    input.value = '';
  }

  removePicture(index: number): void {
    this.formData.pictures.splice(index, 1);
  }

  onSave(): void {
    const newArea: Area = {
      id: `area-${Date.now()}`, // Temporary ID
      floorId: this.floorId(),
      roomNumber: this.formData.roomNumber,
      type: this.formData.type,
      status: 'unallocated', // Default status for new inactive areas
      position: { x: 50, y: 50 }, // Default center position
      floorPlanVersionId: '', // Will be set by parent
      size: this.formData.size,
      monthlyRent: this.formData.monthlyRent || undefined,
      isActive: false, // Starts as inactive
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
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
    if (!this.showCloseWarning) {
      this.onCancel();
    }
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
      roomNumber: '',
      type: 'log',
      size: 0,
      monthlyRent: null,
      pictures: []
    };
    this.currentStep.set(1);
    this.errors = {};
  }

  getTypeLabel(type: AreaType): string {
    const labels: { [key: string]: string } = {
      'log': 'Log',
      'kiosk': 'Kiosk',
      'open-plan': 'Open Plan'
    };
    return labels[type] || type;
  }
}
