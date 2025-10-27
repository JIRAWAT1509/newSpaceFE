import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warning-modal.component.html',
  styleUrl: './warning-modal.component.css'
})
export class WarningModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Warning';
  @Input() message: string = '';
  @Input() buttonText: string = 'OK';
  @Output() onClose = new EventEmitter<void>();

  close(): void {
    this.onClose.emit();
  }

  // Prevent click on backdrop from closing (only button closes)
  onBackdropClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
