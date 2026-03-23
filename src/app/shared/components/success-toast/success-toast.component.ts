// success-toast.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-backdrop" [class.visible]="visible" (click)="onClose()">
      <div class="toast-card" [class.visible]="visible" (click)="$event.stopPropagation()">
        <div class="toast-icon-wrap">
          <svg class="checkmark" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <div class="toast-body">
          <div class="toast-title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>
        <button class="toast-close" (click)="onClose()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="toast-progress" [style.animation-duration]="duration + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 24px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .toast-backdrop.visible {
      opacity: 1;
      pointer-events: all;
    }

    .toast-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.07),
        0 20px 60px -10px rgba(0,0,0,0.18),
        0 0 0 1px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px 22px 20px;
      min-width: 340px;
      max-width: 480px;
      position: relative;
      overflow: hidden;
      transform: translateY(-12px) scale(0.97);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
      opacity: 0;
    }
    .toast-card.visible {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    /* Subtle green left border accent */
    .toast-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #22c55e, #16a34a);
      border-radius: 16px 0 0 16px;
    }

    /* Animated checkmark */
    .toast-icon-wrap {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
    }
    .checkmark {
      width: 44px;
      height: 44px;
    }
    .checkmark-circle {
      stroke: #22c55e;
      stroke-width: 2;
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      animation: stroke 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.1s forwards;
    }
    .checkmark-check {
      stroke: #22c55e;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.35s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
    }
    @keyframes stroke {
      100% { stroke-dashoffset: 0; }
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }
    .toast-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.01em;
      margin-bottom: 2px;
    }
    .toast-message {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.5;
    }

    .toast-close {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border: none;
      background: #f3f4f6;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      transition: background 0.15s, color 0.15s;
      align-self: flex-start;
    }
    .toast-close:hover {
      background: #e5e7eb;
      color: #374151;
    }
    .toast-close svg {
      width: 14px;
      height: 14px;
    }

    /* Auto-dismiss progress bar */
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: linear-gradient(90deg, #22c55e, #86efac);
      border-radius: 0 0 16px 16px;
      transform-origin: left;
      animation: progress linear forwards;
    }
    @keyframes progress {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
  `]
})
export class SuccessToastComponent implements OnInit, OnDestroy {
  @Input() title = 'สำเร็จ';
  @Input() message = '';
  @Input() duration = 3500;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  visible = false;
  private timer?: ReturnType<typeof setTimeout>;
  private showTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (this.isOpen) this.show();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.show();
    }
  }

  show(): void {
    this.showTimer = setTimeout(() => {
      this.visible = true;
    }, 10);
    this.timer = setTimeout(() => this.onClose(), this.duration);
  }

  onClose(): void {
    this.visible = false;
    clearTimeout(this.timer);
    setTimeout(() => this.closed.emit(), 250);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    clearTimeout(this.showTimer);
  }
}
