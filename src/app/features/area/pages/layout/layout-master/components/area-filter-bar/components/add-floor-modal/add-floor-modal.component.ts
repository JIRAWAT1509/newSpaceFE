import { Component, output, signal, effect, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Floor, FloorPlanVersion } from '@core/models/floor.model';
import { AreaDataService } from '@core/services/area/area-data.service';

export interface AddFloorResult {
  floor: Floor;
  shouldOpenEditModal: boolean;
}

@Component({
  selector: 'app-add-floor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
  templateUrl: './add-floor-modal.component.html',
  styleUrl: './add-floor-modal.component.css'
})
export class AddFloorModalComponent {
  visible = signal<boolean>(false);
  buildingId = signal<string>('');
  existingFloorNumbers = signal<number[]>([]);

  floorCreated = output<AddFloorResult>();
  closed = output<void>();

  floorForm: FormGroup;
  selectedFile = signal<File | null>(null);
  isSaving = signal<boolean>(false);

  // ✅ inject service + computed
  private areaDataService = inject(AreaDataService);
  buildingDisplay = computed(() => {
    const b = this.areaDataService.building();
    return b ? `${b.code} - ${b.nameTh}` : '-';
  });

  constructor(private fb: FormBuilder) {
    this.floorForm = this.fb.group({
      floorNumber: ['', [Validators.required]],
      floorName:   ['', Validators.required],
      floorNameTh: [''],
      floorNameEn: ['']
    });

    effect(() => {
      const existing = this.existingFloorNumbers();
      const control = this.floorForm.get('floorNumber');
      if (control) {
        control.setValidators([Validators.required, this.floorExistsValidator(existing)]);
        control.updateValueAndValidity({ emitEvent: false });
      }
    });

    this.floorForm.get('floorNumber')?.valueChanges.subscribe(value => {
      if (value && !this.floorForm.get('floorName')?.value) {
        this.floorForm.patchValue({
          floorName:   `Fl. ${value}`,
          floorNameTh: `ชั้น ${value}`,
          floorNameEn: `Floor ${value}`
        }, { emitEvent: false });
      }
    });
  }

  open(buildingId: string, existingFloorNumbers: number[]): void {
    this.buildingId.set(buildingId);
    this.existingFloorNumbers.set(existingFloorNumbers);
    this.floorForm.reset();
    this.selectedFile.set(null);
    this.visible.set(true);
  }

  private floorExistsValidator(existingFloors: number[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return existingFloors.includes(Number(value)) ? { floorExists: true } : null;
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.floorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) { alert('Only PNG and JPG images are allowed'); return; }
      this.selectedFile.set(file);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
  }

  onCancel(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  async onSave(): Promise<void> {
    if (this.floorForm.invalid) { this.floorForm.markAllAsTouched(); return; }
    this.isSaving.set(true);
    try {
      const formValue  = this.floorForm.value;
      const floorNumber = Number(formValue.floorNumber);
      const newFloorId  = `floor-${Date.now()}`;

      let planImageUrl = '';
      if (this.selectedFile()) {
        planImageUrl = URL.createObjectURL(this.selectedFile()!);
      }

      const initialVersion: FloorPlanVersion = {
        id: `fpv-${newFloorId}-001`,
        floorId: newFloorId,
        versionNumber: 1,
        planImage: planImageUrl,
        planImageWidth: 1920,
        planImageHeight: 1080,
        validFrom: new Date(),
        validUntil: null,
        renovationReason: 'Initial floor plan',
        renovationReasonTh: 'แผนพื้นเริ่มต้น',
        renovationReasonEn: 'Initial floor plan',
        renovationNotes: 'Floor created via Add Floor feature',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newFloor: Floor = {
        id: newFloorId,
        buildingId: this.buildingId(),
        floorNumber,
        floorName:   formValue.floorName   || `Fl. ${floorNumber}`,
        floorNameTh: formValue.floorNameTh || `ชั้น ${floorNumber}`,
        floorNameEn: formValue.floorNameEn || `Floor ${floorNumber}`,
        floorPlanVersions: [initialVersion],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.floorCreated.emit({ floor: newFloor, shouldOpenEditModal: true });
      this.visible.set(false);
    } catch (error) {
      console.error('Error creating floor:', error);
      alert('Failed to create floor. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  onModalHide(): void {
    if (!this.isSaving()) this.closed.emit();
  }
}
