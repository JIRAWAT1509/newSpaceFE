// form-file-upload.component.ts - Avatar upload with circular preview
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group w-full mb-4">
      <label *ngIf="label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <div class="flex items-center gap-6">
        <!-- Avatar Preview (Circular) -->
        <div class="relative">
          <div class="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
            <!-- Image Preview -->
            <img
              *ngIf="previewUrl"
              [src]="previewUrl"
              alt="Avatar preview"
              class="w-full h-full object-cover"
            />
            <!-- Placeholder Icon -->
            <svg
              *ngIf="!previewUrl"
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <!-- Delete Button (only if image exists) -->
          <button
            *ngIf="previewUrl && !disabled"
            type="button"
            (click)="removeFile()"
            class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            title="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Upload Controls -->
        <div class="flex-1">
          <!-- Hidden File Input -->
          <input
            #fileInput
            type="file"
            [accept]="accept"
            (change)="onFileSelected($event)"
            [disabled]="disabled"
            class="hidden"
          />

          <!-- Upload/Replace Button -->
          <button
            type="button"
            (click)="fileInput.click()"
            [disabled]="disabled"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ previewUrl ? 'Replace Image' : 'Choose File' }}
          </button>

          <!-- File Info -->
          <p *ngIf="fileName" class="text-sm text-gray-600 mt-2">
            {{ fileName }}
          </p>

          <!-- Hint Text -->
          <p *ngIf="hint && !error" class="text-gray-500 text-xs mt-1">
            {{ hint }}
          </p>

          <!-- Error Message -->
          <p *ngIf="error && errorMessage" class="text-red-500 text-xs mt-1">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFileUploadComponent),
      multi: true
    }
  ]
})
export class FormFileUploadComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() accept: string = 'image/*';
  @Input() maxSizeMB: number = 5;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Input() errorMessage: string = '';
  @Input() hint: string = 'Max size: 5MB. Supported formats: JPG, PNG, GIF';

  @Output() fileChange = new EventEmitter<File | null>();

  file: File | null = null;
  fileName: string = '';
  previewUrl: string | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (value instanceof File) {
      this.file = value;
      this.fileName = value.name;
      this.generatePreview(value);
    } else if (typeof value === 'string' && value) {
      // If a URL string is provided (for existing images)
      this.previewUrl = value;
      this.fileName = 'Existing image';
    } else {
      this.clearFile();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > this.maxSizeMB) {
        this.error = true;
        this.errorMessage = `File size exceeds ${this.maxSizeMB}MB`;
        return;
      }

      this.file = file;
      this.fileName = file.name;
      this.error = false;
      this.errorMessage = '';

      this.generatePreview(file);
      this.onChange(file);
      this.onTouched();
      this.fileChange.emit(file);
    }
  }

  generatePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.clearFile();
    this.onChange(null);
    this.onTouched();
    this.fileChange.emit(null);
  }

  private clearFile(): void {
    this.file = null;
    this.fileName = '';
    this.previewUrl = null;
    this.error = false;
    this.errorMessage = '';
  }
}
