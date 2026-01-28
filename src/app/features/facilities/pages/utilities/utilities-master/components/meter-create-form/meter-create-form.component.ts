// meter-create-form.component.ts
import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { MeterType, getMeterTypeLabel } from '@core/models/meter.model';
import { getFacilitiesUtilitiesConfig } from '@core/services/ui-settings';
import { interval, Subscription } from 'rxjs';

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
export class MeterCreateFormComponent implements OnInit, OnDestroy {
  meterForm!: FormGroup;
  selectedMeterType = signal<MeterType | null>(null);
  showSuccessMessage = signal<boolean>(false);

  private configCheckInterval?: Subscription;
  private configVersion = signal<number>(0);

  // Use computed signal instead of getter for reactivity
  meterTypeOptions = computed(() => {
    // Access configVersion to make this reactive
    this.configVersion();
    
    return [
      {
        type: 'electricity' as MeterType,
        label: getMeterTypeLabel('electricity').TH,
        icon: getMeterTypeLabel('electricity').icon,
        color: getMeterTypeLabel('electricity').color,
        unit: 'kWh'
      },
      {
        type: 'water' as MeterType,
        label: getMeterTypeLabel('water').TH,
        icon: getMeterTypeLabel('water').icon,
        color: getMeterTypeLabel('water').color,
        unit: 'm³'
      },
      {
        type: 'gas' as MeterType,
        label: getMeterTypeLabel('gas').TH,
        icon: getMeterTypeLabel('gas').icon,
        color: getMeterTypeLabel('gas').color,
        unit: 'm³'
      },
      {
        type: 'ac' as MeterType,
        label: getMeterTypeLabel('ac').TH,
        icon: getMeterTypeLabel('ac').icon,
        color: getMeterTypeLabel('ac').color,
        unit: 'kWh'
      }
    ];
  });

  ngOnInit(): void {
    // Track last config hash to detect changes
    let lastConfigHash = '';
    
    // Check for config changes every 1 second
    this.configCheckInterval = interval(1000).subscribe(() => {
      const config = getFacilitiesUtilitiesConfig();
      const configHash = JSON.stringify({
        colors: config.colors,
        labels: config.labels,
        labelsEn: config.labelsEn,
        icons: config.icons,
        iconTypes: config.iconTypes
      });
      
      if (configHash !== lastConfigHash) {
        lastConfigHash = configHash;
        this.configVersion.update(v => v + 1);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.configCheckInterval) {
      this.configCheckInterval.unsubscribe();
    }
  }

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
      const selectedOption = this.meterTypeOptions().find((opt: MeterTypeOption) => opt.type === type);

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
