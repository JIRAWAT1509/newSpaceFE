// file-location-input.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-location-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="file-location-input">
      @if (label) {
        <label class="form-label" [class.required]="required">
          {{ label }}
        </label>
      }
      <div class="input-group">
        <input
          type="text"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange()"
          [placeholder]="placeholder"
          class="form-input flex-1"
        />
        <button type="button" class="btn-icon" (click)="onBrowse()" title="Browse">
          <i class="pi pi-folder-open"></i>
        </button>
        @if (value) {
          <button
            type="button"
            class="btn-icon btn-clear"
            (click)="onClear()"
            title="Clear"
          >
            <i class="pi pi-times"></i>
          </button>
        }
      </div>
      @if (hint) {
        <p class="hint-text">{{ hint }}</p>
      }
    </div>
  `,
  styles: [`
    .file-location-input {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-label.required::after {
      content: ' *';
      color: #ef4444;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .form-input {
      flex: 1;
      padding: 0.625rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      background-color: #ffffff;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .btn-icon {
      padding: 0.625rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .btn-icon i {
      font-size: 1rem;
    }

    .btn-clear {
      color: #ef4444;
    }

    .btn-clear:hover {
      background: #fef2f2;
      border-color: #ef4444;
    }

    .hint-text {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
      margin-bottom: 0;
    }
  `]
})
export class FileLocationInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() hint: string = '';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  onValueChange(): void {
    this.valueChange.emit(this.value);
  }

  onBrowse(): void {
    // TODO: Implement file browser dialog
    // This could open a file picker or a custom directory browser modal
    console.log('Browse file location');

    // Example: You might want to integrate with Electron's dialog or a custom file browser
    // For now, this is just a placeholder
  }

  onClear(): void {
    this.value = '';
    this.valueChange.emit(this.value);
  }
}
