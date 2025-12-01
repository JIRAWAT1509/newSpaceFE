import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

export type ViewMode = 'normal' | 'pre-rent';

export interface ModeChangeEvent {
  mode: ViewMode;
  targetDate: Date;
}

@Component({
  selector: 'app-mode-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './mode-toggle.component.html',
  styleUrl: './mode-toggle.component.css'
})
export class ModeToggleComponent {
  currentMode: ViewMode = 'normal';
  targetDate: Date = new Date();
  modeChanged = output<ModeChangeEvent>();

  setMode(mode: ViewMode): void {
    this.currentMode = mode;
    this.emitModeChange();
  }

  onDateChange(): void {
    if (this.currentMode === 'pre-rent') {
      this.emitModeChange();
    }
  }

  private emitModeChange(): void {
    this.modeChanged.emit({
      mode: this.currentMode,
      targetDate: this.targetDate
    });
  }

  isActive(mode: ViewMode): boolean {
    return this.currentMode === mode;
  }
}
