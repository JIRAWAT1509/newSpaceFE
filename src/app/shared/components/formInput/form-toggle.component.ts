// form-toggle.component.ts - Toggle switch for Active/Inactive status
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group w-full mb-4">
      <label *ngIf="label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <div class="flex items-center gap-4">
        <!-- Active Option -->
        <label class="flex items-center cursor-pointer" [class.opacity-50]="disabled">
          <input
            type="radio"
            [value]="activeValue"
            [checked]="value === activeValue"
            (change)="onValueChange(activeValue)"
            [disabled]="disabled"
            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <span class="ml-2 text-sm text-gray-700">{{ activeLabel }}</span>
        </label>

        <!-- Inactive Option -->
        <label class="flex items-center cursor-pointer" [class.opacity-50]="disabled">
          <input
            type="radio"
            [value]="inactiveValue"
            [checked]="value === inactiveValue"
            (change)="onValueChange(inactiveValue)"
            [disabled]="disabled"
            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <span class="ml-2 text-sm text-gray-700">{{ inactiveLabel }}</span>
        </label>
      </div>

      <p *ngIf="hint && !error" class="text-gray-500 text-xs mt-1">
        {{ hint }}
      </p>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormToggleComponent),
      multi: true
    }
  ]
})
export class FormToggleComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() activeLabel: string = 'Active';
  @Input() inactiveLabel: string = 'Inactive';
  @Input() activeValue: any = 'active';
  @Input() inactiveValue: any = 'inactive';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Input() hint: string = '';

  @Output() valueChange = new EventEmitter<any>();

  value: any = this.activeValue;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value !== undefined ? value : this.activeValue;
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

  onValueChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }
}
