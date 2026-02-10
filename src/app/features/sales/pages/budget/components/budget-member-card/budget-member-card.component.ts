// budget-member-card.component.ts
import { Component, input, output, signal, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from '@core/models/budget.model';
import { BudgetBarComponent } from '../budget-bar/budget-bar.component';

@Component({
  selector: 'app-budget-member-card',
  standalone: true,
  imports: [CommonModule, BudgetBarComponent],
  templateUrl: './budget-member-card.component.html',
  styleUrl: './budget-member-card.component.css'
})
export class BudgetMemberCardComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  member = input.required<TeamMember>();

  // Outputs
  cardClick = output<string>();
  menuClick = output<string>();
  dragStart = output<{ memberId: string; event: MouseEvent }>();
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
    // Ignore if clicking menu/action buttons
    const target = event.target as HTMLElement;
    if (target.closest('.card-menu-btn') || target.closest('.member-actions')) {
      return;
    }

    // Prevent text selection
    event.preventDefault();

    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
    this.mouseDownTime = Date.now();
    this.canDrag = false;
    this.isHolding.set(true);

    // Start 500ms timer
    this.pressTimer = setTimeout(() => {
      this.canDrag = false; // set this to true when need to allow drag
      this.isHolding.set(false);
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
      // Cancel if moved too far
      if (deltaX > 30 || deltaY > 30) {
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
          memberId: this.member().id,
          event
        });
      } else {
        // Update ghost position
        this.updateDragGhost(event);
        this.dragging.emit(event);
      }
    }
  };

  // Create drag ghost
  private createDragGhost(event: MouseEvent): void {
    const card = this.elementRef.nativeElement.querySelector('.member-card');
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
    }
  }

  // Handle document mouse up
  private onDocumentMouseUp = (event: MouseEvent): void => {
    const duration = Date.now() - this.mouseDownTime;
    const wasDragging = this.isDragging();
    const deltaX = Math.abs(event.clientX - this.mouseDownX);
    const deltaY = Math.abs(event.clientY - this.mouseDownY);

    if (wasDragging) {
      // Was dragging - end drag
      this.dragEnd.emit(event);
      this.removeDragGhost();
    } else {
      // Not dragging - check if it's a click
      if (deltaX < 10 && deltaY < 10) {
        this.onCardClick();
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
    this.cardClick.emit(this.member().id);
  }

  // Handle menu click
  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClick.emit(this.member().id);
  }

  // Handle edit
  onEdit(event: Event): void {
    event.stopPropagation();
    this.cardClick.emit(this.member().id);
  }

  // Get avatar initials
  getInitials(): string {
    const name = this.member().name;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Get avatar color based on role
  getAvatarColor(): string {
    return this.member().role === 'leader'
      ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
      : 'linear-gradient(135deg, #3b82f6, #60a5fa)';
  }

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }

  // Cleanup
  ngOnDestroy(): void {
    this.cancelPress();
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }
}
