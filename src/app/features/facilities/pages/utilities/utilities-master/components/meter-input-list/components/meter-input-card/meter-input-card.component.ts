// meter-input-card.component.ts - FINAL CORRECTED
import { Component, input, output, signal, computed, effect, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Meter, getMeterTypeLabel } from '@core/models/meter.model';
import {
  computeExpectedRange,
  formatMinForDisplay,
  formatRangeForDisplay,
  ExpectedRangeResult
} from '@core/utils/meter-range.util';
import { getFacilitiesUtilitiesConfig } from '@core/services/ui-settings';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-meter-input-card',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, ConfirmationModalComponent],
  templateUrl: './meter-input-card.component.html',
  styleUrl: './meter-input-card.component.css'
})
export class MeterInputCardComponent implements OnInit, OnDestroy {
  // Inputs
  meter = input.required<Meter>();
  isExpanded = input<boolean>(false); // Controlled by parent
  isCompleted = input<boolean>(false); // For meter list view
  /** เมื่อ true แสดงเป็นแถวเดียว มีช่องกรอกและปุ่มบันทึกให้กรอกได้เลยโดยไม่ต้องขยาย */
  inlineMode = input<boolean>(false);

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
  isWarning = signal<boolean>(false);
  warningMessage = signal<string>('');
  isEditing = signal<boolean>(false);
  /** สำหรับโหมด inline ของ completed meters - คลิกแก้ไขเพื่อเปิดฟอร์ม */
  isInlineEditing = signal<boolean>(false);

  // Confirmation modal state (for out-of-range readings)
  showConfirmModal = signal<boolean>(false);
  confirmTitle = signal<string>('');
  confirmMessage = signal<string>('');
  private pendingSaveMode = signal<'normal' | 'edit' | 'inline'>('normal');
  private pendingSaveEvent = signal<Event | null>(null);

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

  /** Cached result for current meter; used by display and validation. */
  getExpectedRangeInfo(): ExpectedRangeResult {
    return computeExpectedRange(this.meter());
  }

  /** For display: "X - Y" only when we have a real range (X < Y). */
  getExpectedRangeDisplay(): string | null {
    const info = this.getExpectedRangeInfo();
    if (!info.hasRange || info.max == null) return null;
    return formatRangeForDisplay(info.min, info.max);
  }

  /** For display when only minimum rule: "Minimum allowed: X unit" or min value. */
  getMinimumAllowedDisplay(): string {
    const info = this.getExpectedRangeInfo();
    const minStr = formatMinForDisplay(info.min);
    const unit = this.meter().unit ?? 'kWh';
    return `Minimum allowed: ${minStr} ${unit}`;
  }

  /** True when we show "Expected range: X - Y" (real range). */
  hasExpectedRange(): boolean {
    return this.getExpectedRangeInfo().hasRange;
  }

  getConsumption(): number {
    const meter = this.meter();
    return meter.currentReading - meter.previousReading;
  }

  isOutOfRange(): boolean {
    const reading = this.currentReading();
    if (reading === null || reading === undefined) return false;

    const info = this.getExpectedRangeInfo();
    if (reading < info.min) return true;
    if (info.hasRange && info.max != null && reading > info.max) return true;
    return false;
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
      this.isWarning.set(false);
      this.warningMessage.set('');
      return false;
    }

    const info = this.getExpectedRangeInfo();
    if (reading < info.min) {
      this.hasError.set(true);
      this.errorMessage.set('Reading must be greater than last reading');
      this.isWarning.set(false);
      this.warningMessage.set('');
      return false;
    }

    if (this.isOutOfRange()) {
      // อนุญาตให้บันทึกได้ แต่แสดงคำเตือน
      this.hasError.set(false);
      this.errorMessage.set('');
      this.isWarning.set(true);
      this.warningMessage.set('Warning: reading is outside expected range');
      return true;
    }

    this.hasError.set(false);
    this.errorMessage.set('');
    this.isWarning.set(false);
    this.warningMessage.set('');
    return true;
  }

  onSave(event: Event): void {
    event.stopPropagation();

    if (!this.validateReading()) {
      return;
    }

    const reading = this.currentReading();
    if (!reading) return;

    // ถ้าเกิน expected range → แสดง confirm popup
    if (this.isOutOfRange()) {
      this.showRangeConfirmation('normal', event);
      return;
    }

    this.doSave();
  }

  /** บันทึกจริง (หลังผ่าน validation/confirmation แล้ว) */
  private doSave(): void {
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
    // รีเซ็ตคำเตือนเมื่อแก้ไขค่า
    this.isWarning.set(false);
    this.warningMessage.set('');
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

    // ถ้าเกิน expected range → แสดง confirm popup
    if (this.isOutOfRange()) {
      this.showRangeConfirmation('edit', event);
      return;
    }

    this.doSaveEdit();
  }

  /** บันทึกแก้ไขจริง */
  private doSaveEdit(): void {
    const reading = this.currentReading();
    if (!reading) return;

    this.readingSaved.emit({
      meterId: this.meter().id,
      reading: reading,
      photos: this.attachedPhotos()
    });

    this.isEditing.set(false);
  }

  // ==================== INLINE EDIT MODE (for completed meters) ====================

  /** เปิดโหมดแก้ไขในการ์ด inline */
  onInlineEdit(event: Event): void {
    event.stopPropagation();
    this.isInlineEditing.set(true);
    // ตั้งค่าเริ่มต้นเป็นค่าปัจจุบัน
    this.currentReading.set(this.meter().currentReading);
  }

  /** ยกเลิกแก้ไขในโหมด inline */
  onCancelInlineEdit(event: Event): void {
    event.stopPropagation();
    this.isInlineEditing.set(false);
    this.currentReading.set(null);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.isWarning.set(false);
    this.warningMessage.set('');
  }

  /** บันทึกการแก้ไขในโหมด inline */
  onSaveInlineEdit(event: Event): void {
    event.stopPropagation();

    if (!this.validateReading()) {
      return;
    }

    const reading = this.currentReading();
    if (!reading) return;

    // ถ้าเกิน expected range → แสดง confirm popup
    if (this.isOutOfRange()) {
      this.showRangeConfirmation('inline', event);
      return;
    }

    this.doSaveInlineEdit();
  }

  /** บันทึก inline จริง */
  private doSaveInlineEdit(): void {
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
        this.isInlineEditing.set(false);
        this.currentReading.set(null);
      }, 1000);
    }, 500);
  }

  // ==================== CONFIRMATION MODAL ====================

  /** แสดง popup ยืนยันเมื่อค่าเกิน expected range */
  private showRangeConfirmation(mode: 'normal' | 'edit' | 'inline', event: Event): void {
    const reading = this.currentReading()!;
    const info = this.getExpectedRangeInfo();
    const unit = this.meter().unit || '';

    this.pendingSaveMode.set(mode);
    this.pendingSaveEvent.set(event);
    this.confirmTitle.set('ค่ามิเตอร์เกิน Expected Range');
    this.confirmMessage.set(
      `ค่าที่กรอก: ${reading.toLocaleString()} ${unit}\n` +
      `Expected range: ${info.min.toLocaleString()} - ${(info.max ?? 0).toLocaleString()} ${unit}\n\n` +
      `คุณต้องการบันทึกค่านี้หรือไม่?`
    );
    this.showConfirmModal.set(true);
  }

  /** ยืนยันบันทึก (กดตกลงใน popup) */
  onConfirmSave(): void {
    this.showConfirmModal.set(false);
    const mode = this.pendingSaveMode();

    if (mode === 'normal') {
      this.doSave();
    } else if (mode === 'edit') {
      this.doSaveEdit();
    } else if (mode === 'inline') {
      this.doSaveInlineEdit();
    }
  }

  /** ยกเลิก (กดยกเลิกใน popup) */
  onCancelConfirm(): void {
    this.showConfirmModal.set(false);
  }
}
