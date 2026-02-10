// confirmation-modal.component.ts - Shared Confirmation Modal
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmationType = 'warning' | 'danger' | 'info' | 'success';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-content" [class]="type()" (click)="$event.stopPropagation()">
          <!-- Icon -->
          <div class="modal-icon" [class]="type()">
            @switch (type()) {
              @case ('danger') {
                <i class="pi pi-trash"></i>
              }
              @case ('warning') {
                <i class="pi pi-exclamation-triangle"></i>
              }
              @case ('success') {
                <i class="pi pi-check-circle"></i>
              }
              @default {
                <i class="pi pi-info-circle"></i>
              }
            }
          </div>

          <!-- Title -->
          <h3 class="modal-title">{{ title() }}</h3>

          <!-- Message -->
          <p class="modal-message">{{ message() }}</p>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="btn-cancel" (click)="onCancel()">
              <i class="pi pi-times"></i>
              <span>{{ cancelText() }}</span>
            </button>
            <button class="btn-confirm" (click)="onConfirm()">
              <i class="pi" [ngClass]="confirmIcon()"></i>
              <span>{{ confirmText() }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      @apply fixed inset-0 z-[100] flex items-center justify-center;
      background: rgba(0, 0, 0, 0.5);
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      @apply bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      animation: scaleIn 0.2s ease;
    }

    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-icon {
      @apply w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center;
    }

    .modal-icon i {
      @apply text-4xl;
    }

    .modal-icon.danger {
      @apply bg-red-100;
    }
    .modal-icon.danger i {
      @apply text-red-600;
    }

    .modal-icon.warning {
      @apply bg-amber-100;
    }
    .modal-icon.warning i {
      @apply text-amber-600;
    }

    .modal-icon.success {
      @apply bg-green-100;
    }
    .modal-icon.success i {
      @apply text-green-600;
    }

    .modal-icon.info {
      @apply bg-blue-100;
    }
    .modal-icon.info i {
      @apply text-blue-600;
    }

    .modal-title {
      @apply text-xl font-bold text-gray-900 mb-3;
    }

    .modal-message {
      @apply text-gray-600 mb-6 leading-relaxed whitespace-pre-line;
    }

    .modal-actions {
      @apply flex gap-3 justify-center;
    }

    .btn-cancel {
      @apply flex items-center justify-center gap-2 px-6 py-2.5;
      @apply bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg;
      @apply font-medium text-sm transition-all duration-200 border-none cursor-pointer;
    }

    .btn-confirm {
      @apply flex items-center justify-center gap-2 px-6 py-2.5;
      @apply bg-blue-600 hover:bg-blue-700 text-white rounded-lg;
      @apply font-medium text-sm transition-all duration-200 border-none cursor-pointer;
      @apply shadow-sm hover:shadow;
    }
  `]
})
export class ConfirmationModalComponent {
  isOpen = input<boolean>(false);
  type = input<ConfirmationType>('warning');
  title = input<string>('ยืนยันการดำเนินการ');
  message = input<string>('คุณต้องการดำเนินการต่อหรือไม่?');
  confirmText = input<string>('ยืนยัน');
  cancelText = input<string>('ยกเลิก');
  confirmIcon = input<string>('pi-check');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
