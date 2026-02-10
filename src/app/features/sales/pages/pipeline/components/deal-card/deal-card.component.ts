// deal-card.component.ts (FIXED CLICK AND DROP)
import { Component, input, output, signal, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deal } from '@core/models/pipeline.model';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deal-card.component.html',
  styleUrl: './deal-card.component.css'
})
export class DealCardComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  deal = input.required<Deal>();

  // Outputs
  cardClick = output<string>();
  menuClick = output<string>();
  dragStart = output<{ dealId: string; event: MouseEvent }>();
  dragging = output<MouseEvent>();
  dragEnd = output<MouseEvent>();

  // State
  isHolding = signal(false);
  isDragging = signal(false);

  private pressTimer: any = null;
  private canDrag = false;
  private dragGhost: HTMLElement | null = null;
  private mouseDownX = 0;
  private mouseDownY = 0;
  private mouseDownTime = 0;

  // Handle card mouse down
  onCardMouseDown(event: MouseEvent): void {
    // Ignore if clicking menu button
    const target = event.target as HTMLElement;
    if (target.closest('.card-menu-btn')) {
      return;
    }

    // Prevent text selection
    event.preventDefault();

    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
    this.mouseDownTime = Date.now();
    this.canDrag = false;
    this.isHolding.set(true);

    ////console.log('⏱️ Hold started - 500ms timer');

    // Start 500ms timer
    this.pressTimer = setTimeout(() => {
      this.canDrag = true;
      this.isHolding.set(false);
      ////console.log('✅ Can drag now!');
    }, 500);

    // Add global listeners
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  // Handle document mouse move
  private onDocumentMouseMove = (event: MouseEvent): void => {
    const deltaX = Math.abs(event.clientX - this.mouseDownX);
    const deltaY = Math.abs(event.clientY - this.mouseDownY);

    // If still holding (before 500ms)
    if (this.isHolding()) {
      // Cancel if moved way too far
      if (deltaX > 30 || deltaY > 30) {
        ////console.log('❌ Moved too far during hold - canceling');
        this.cancelPress();
      }
      return;
    }

    // After 500ms, can drag
    if (this.canDrag && (deltaX > 5 || deltaY > 5)) {
      if (!this.isDragging()) {
        // Start dragging
        this.isDragging.set(true);
        this.createDragGhost(event);
        this.dragStart.emit({
          dealId: this.deal().id,
          event
        });
        ////console.log('🎯 Dragging started:', this.deal().id);
      } else {
        // Update ghost position
        this.updateDragGhost(event);
        this.dragging.emit(event);
      }
    }
  };

  // Create drag ghost
  private createDragGhost(event: MouseEvent): void {
    const card = this.elementRef.nativeElement.querySelector('.deal-card');
    if (!card) return;

    // Clone the card
    this.dragGhost = card.cloneNode(true) as HTMLElement;
    this.dragGhost.classList.add('drag-ghost');
    this.dragGhost.style.position = 'fixed';
    this.dragGhost.style.width = card.clientWidth + 'px';
    this.dragGhost.style.pointerEvents = 'none';
    this.dragGhost.style.zIndex = '10000';

    // Position at mouse
    this.updateDragGhost(event);

    document.body.appendChild(this.dragGhost);
    ////console.log('👻 Drag ghost created');
  }

  // Update drag ghost position
  private updateDragGhost(event: MouseEvent): void {
    if (this.dragGhost) {
      this.dragGhost.style.left = (event.clientX + 10) + 'px';
      this.dragGhost.style.top = (event.clientY + 10) + 'px';
    }
  }

  // Remove drag ghost
  private removeDragGhost(): void {
    if (this.dragGhost && this.dragGhost.parentNode) {
      this.dragGhost.parentNode.removeChild(this.dragGhost);
      this.dragGhost = null;
      ////console.log('👻 Drag ghost removed');
    }
  }

  // Handle document mouse up
  private onDocumentMouseUp = (event: MouseEvent): void => {
    const duration = Date.now() - this.mouseDownTime;
    const wasDragging = this.isDragging();
    const deltaX = Math.abs(event.clientX - this.mouseDownX);
    const deltaY = Math.abs(event.clientY - this.mouseDownY);

    ////console.log('🖱️ Mouse up - Duration:', duration + 'ms', 'Dragging:', wasDragging, 'Moved:', deltaX + 'px');

    if (wasDragging) {
      // Was dragging - end drag
      this.dragEnd.emit(event);
      this.removeDragGhost();
      ////console.log('🎯 Drag ended');
    } else {
      // Not dragging - check if it's a click
      // Accept as click if: duration < 500ms OR (duration >= 500ms but didn't move much)
      if (deltaX < 10 && deltaY < 10) {
        this.onCardClick();
        ////console.log('👆 Click - opening modal');
      } else {
        ////console.log('❌ Moved too much - not a click');
      }
    }

    // Cleanup
    this.cancelPress();
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  };

  // Cancel press
  private cancelPress(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    this.isHolding.set(false);
    this.isDragging.set(false);
    this.canDrag = false;
    this.removeDragGhost();
  }

  // Handle card click
  onCardClick(): void {
    this.cardClick.emit(this.deal().id);
  }

  // Handle menu click
  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClick.emit(this.deal().id);
  }

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }

  // Format due date
  formatDueDate(): string {
    const daysUntilDue = this.deal().daysUntilDue;

    if (daysUntilDue < 0) {
      return `${Math.abs(daysUntilDue)}d overdue`;
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntilDue}d`;
    }
  }

  // Get due date class
  getDueDateClass(): string {
    const daysUntilDue = this.deal().daysUntilDue;

    if (daysUntilDue < 0) {
      return 'overdue';
    } else if (daysUntilDue <= 2) {
      return 'warning';
    } else {
      return 'normal';
    }
  }

  // Cleanup
  ngOnDestroy(): void {
    this.cancelPress();
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }
}
