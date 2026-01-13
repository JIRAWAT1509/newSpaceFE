// meter-input-card.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Meter, METER_TYPE_LABELS } from '@core/models/meter.model';

@Component({
  selector: 'app-meter-input-card',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText],
  templateUrl: './meter-input-card.component.html',
  styleUrl: './meter-input-card.component.css'
})
export class MeterInputCardComponent {
  // Inputs
  meter = input.required<Meter>();

  // Outputs
  readingSaved = output<{ meterId: string; reading: number }>();

  // State
  currentReading = signal<number | null>(null);
  isSaving = signal<boolean>(false);
  showSuccess = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  getMeterIcon(): string {
    const type = this.meter().meterType;
    return METER_TYPE_LABELS[type]?.icon || 'pi-bolt';
  }

  getMeterColor(): string {
    const type = this.meter().meterType;
    return METER_TYPE_LABELS[type]?.color || '#667eea';
  }

  getMeterLabel(): string {
    const type = this.meter().meterType;
    return METER_TYPE_LABELS[type]?.TH || 'ไฟฟ้า';
  }

  getExpectedRange(): string {
    const meter = this.meter();
    return `${meter.expectedMin.toLocaleString()} - ${meter.expectedMax.toLocaleString()}`;
  }

  getConsumption(): number {
    const meter = this.meter();
    return meter.currentReading - meter.previousReading;
  }

  getDaysSinceUpdate(): number {
    const meter = this.meter();
    const lastUpdate = new Date(meter.lastUpdated);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isOutOfRange(): boolean {
    const reading = this.currentReading();
    if (!reading) return false;

    const meter = this.meter();
    return reading < meter.expectedMin || reading > meter.expectedMax;
  }

  validateReading(): boolean {
    const reading = this.currentReading();

    if (!reading || reading === 0) {
      this.hasError.set(true);
      this.errorMessage.set('Please enter a reading value');
      return false;
    }

    const meter = this.meter();
    if (reading < meter.currentReading) {
      this.hasError.set(true);
      this.errorMessage.set('Reading cannot be less than previous reading');
      return false;
    }

    if (this.isOutOfRange()) {
      this.hasError.set(true);
      this.errorMessage.set('Reading is outside expected range');
      return false;
    }

    this.hasError.set(false);
    this.errorMessage.set('');
    return true;
  }

  onSave(): void {
    if (!this.validateReading()) {
      return;
    }

    const reading = this.currentReading();
    if (!reading) return;

    this.isSaving.set(true);

    // Simulate API call
    setTimeout(() => {
      this.readingSaved.emit({
        meterId: this.meter().id,
        reading: reading
      });

      // Show success state
      this.showSuccess.set(true);
      this.isSaving.set(false);

      // Reset after 2 seconds
      setTimeout(() => {
        this.showSuccess.set(false);
        this.currentReading.set(null);
      }, 2000);
    }, 500);
  }

  onInputChange(): void {
    // Clear errors when user types
    this.hasError.set(false);
    this.errorMessage.set('');
  }
}
