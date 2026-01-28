// meter-input-card.component.ts - FINAL CORRECTED
import { Component, input, output, signal, computed, effect, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Meter, getMeterTypeLabel } from '@core/models/meter.model';
import { getFacilitiesUtilitiesConfig } from '@core/services/ui-settings';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-meter-input-card',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText],
  templateUrl: './meter-input-card.component.html',
  styleUrl: './meter-input-card.component.css'
})
export class MeterInputCardComponent implements OnInit, OnDestroy {
  // Inputs
  meter = input.required<Meter>();
  isExpanded = input<boolean>(false); // Controlled by parent
  isCompleted = input<boolean>(false); // For meter list view

  // Outputs
  readingSaved = output<{ meterId: string; reading: number; photos: string[] }>();
  cardClicked = output<string>(); // Emit meter ID when card clicked
  backgroundClicked = output<string>(); // Emit when clicking background to collapse

  // State
  currentReading = signal<number | null>(null);
  attachedPhotos = signal<string[]>([]);
  isSaving = signal<boolean>(false);
  showSuccess = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  isEditing = signal<boolean>(false);

  // Config tracking
  private configCheckInterval?: Subscription;
  private configVersion = signal<number>(0);

  // Computed
  canAttachMorePhotos = computed(() => this.attachedPhotos().length < 3);

  // Computed meter type info (reactive to config changes)
  meterTypeInfo = computed(() => {
    this.configVersion(); // Access to make reactive
    const type = this.meter().meterType;
    return getMeterTypeLabel(type);
  });

  constructor(private cdr: ChangeDetectorRef) {}

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
      
      // If config changed, update version to trigger recomputation
      if (configHash !== lastConfigHash) {
        lastConfigHash = configHash;
        this.configVersion.update(v => v + 1);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.configCheckInterval) {
      this.configCheckInterval.unsubscribe();
    }
  }

  getMeterIcon(): string {
    return this.meterTypeInfo()?.icon || 'pi-bolt';
  }

  getMeterColor(): string {
    return this.meterTypeInfo()?.color || '#667eea';
  }

  getMeterLabel(): string {
    return this.meterTypeInfo()?.EN || 'Electricity';
  }

  getExpectedRange(): string {
    const meter = this.meter();
    return `${meter.expectedMin.toLocaleString()} - ${meter.expectedMax.toLocaleString()}`;
  }

  getConsumption(): number {
    const meter = this.meter();
    return meter.currentReading - meter.previousReading;
  }

  isOutOfRange(): boolean {
    const reading = this.currentReading();
    if (!reading) return false;

    const meter = this.meter();
    return reading < meter.expectedMin || reading > meter.expectedMax;
  }

  // Card Click Handlers
  onCardClick(event: Event): void {
    // Only toggle if clicking the card background, not inputs/buttons
    const target = event.target as HTMLElement;

    if (target.closest('input') ||
        target.closest('button') ||
        target.closest('.input-section')) {
      return;
    }

    if (!this.isExpanded()) {
      this.cardClicked.emit(this.meter().id);
    } else {
      this.backgroundClicked.emit(this.meter().id);
    }
  }

  // Photo Handlers
  onTakePhoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => this.handlePhotoUpload(e);
    input.click();
  }

  onUploadPhoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => this.handlePhotoUpload(e);
    input.click();
  }

  handlePhotoUpload(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentPhotos = this.attachedPhotos();
    const availableSlots = 3 - currentPhotos.length;

    for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.attachedPhotos.update(photos => [...photos, e.target.result]);
      };

      reader.readAsDataURL(file);
    }
  }

  removePhoto(index: number, event: Event): void {
    event.stopPropagation();
    this.attachedPhotos.update(photos => photos.filter((_, i) => i !== index));
  }

  // Validation
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

  onSave(event: Event): void {
    event.stopPropagation();

    if (!this.validateReading()) {
      return;
    }

    const reading = this.currentReading();
    if (!reading) return;

    this.isSaving.set(true);

    setTimeout(() => {
      this.readingSaved.emit({
        meterId: this.meter().id,
        reading: reading,
        photos: this.attachedPhotos()
      });

      this.showSuccess.set(true);
      this.isSaving.set(false);

      setTimeout(() => {
        this.showSuccess.set(false);
        this.currentReading.set(null);
        this.attachedPhotos.set([]);
      }, 1000);
    }, 500);
  }

  onInputChange(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
  }

  // Edit mode for meter list
  onEdit(event: Event): void {
    event.stopPropagation();
    this.isEditing.set(true);
  }

  onCancelEdit(event: Event): void {
    event.stopPropagation();
    this.isEditing.set(false);
    this.currentReading.set(null);
  }

  onSaveEdit(event: Event): void {
    event.stopPropagation();

    if (!this.validateReading()) {
      return;
    }

    const reading = this.currentReading();
    if (!reading) return;

    this.readingSaved.emit({
      meterId: this.meter().id,
      reading: reading,
      photos: this.attachedPhotos()
    });

    this.isEditing.set(false);
    alert('Reading updated successfully!');
  }
}
