// meter-create-form.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { MeterType, METER_TYPE_LABELS } from '@core/models/meter.model';

interface MeterTypeOption {
  type: MeterType;
  label: string;
  icon: string;
  color: string;
  unit: string;
}

@Component({
  selector: 'app-meter-create-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    DatePicker
  ],
  templateUrl: './meter-create-form.component.html',
  styleUrl: './meter-create-form.component.css'
})
export class MeterCreateFormComponent {
  meterForm!: FormGroup;
  selectedMeterType = signal<MeterType | null>(null);
  showSuccessMessage = signal<boolean>(false);

  meterTypeOptions: MeterTypeOption[] = [
    {
      type: 'electricity',
      label: METER_TYPE_LABELS.electricity.TH,
      icon: METER_TYPE_LABELS.electricity.icon,
      color: METER_TYPE_LABELS.electricity.color,
      unit: 'kWh'
    },
    {
      type: 'water',
      label: METER_TYPE_LABELS.water.TH,
      icon: METER_TYPE_LABELS.water.icon,
      color: METER_TYPE_LABELS.water.color,
      unit: 'm³'
    },
    {
      type: 'gas',
      label: METER_TYPE_LABELS.gas.TH,
      icon: METER_TYPE_LABELS.gas.icon,
      color: METER_TYPE_LABELS.gas.color,
      unit: 'm³'
    },
    {
      type: 'ac',
      label: METER_TYPE_LABELS.ac.TH,
      icon: METER_TYPE_LABELS.ac.icon,
      color: METER_TYPE_LABELS.ac.color,
      unit: 'kWh'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  initForm(): void {
    this.meterForm = this.fb.group({
      roomNumber: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z-]+$/)]],
      tenantName: ['', [Validators.required, Validators.minLength(2)]],
      meterType: ['', Validators.required],
      meterNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      installationDate: [null, Validators.required],
      initialReading: [0, [Validators.required, Validators.min(0)]],
      unit: ['']
    });
  }

  selectMeterType(type: MeterType): void {
    this.selectedMeterType.set(type);
    const selectedOption = this.meterTypeOptions.find(opt => opt.type === type);

    this.meterForm.patchValue({
      meterType: type,
      unit: selectedOption?.unit || ''
    });
  }

  isTypeSelected(type: MeterType): boolean {
    return this.selectedMeterType() === type;
  }

  onSubmit(): void {
    if (this.meterForm.invalid) {
      Object.keys(this.meterForm.controls).forEach(key => {
        this.meterForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.meterForm.value;
    console.log('Creating new meter:', formData);

    // TODO: Call API to save meter
    // this.meterService.createMeter(formData).subscribe(...)

    // Show success message
    this.showSuccessMessage.set(true);

    // Hide after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage.set(false);
    }, 3000);

    // Reset form
    this.resetForm();
  }

  resetForm(): void {
    this.meterForm.reset({
      initialReading: 0
    });
    this.selectedMeterType.set(null);
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.meterForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.meterForm.get(fieldName);

    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['pattern']) return 'Invalid format';
    if (field.errors['minLength']) return 'Too short';
    if (field.errors['min']) return 'Value must be 0 or greater';

    return 'Invalid input';
  }
}
