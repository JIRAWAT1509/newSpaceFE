// rep-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMemberPerformance } from '@core/models/dashboard.types';

@Component({
  selector: 'app-rep-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rep-detail-modal.component.html',
  styleUrl: './rep-detail-modal.component.css'
})
export class RepDetailModalComponent implements OnChanges {

  @Input() member: TeamMemberPerformance | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      document.body.style.overflow = 'hidden';
    } else if (changes['isVisible'] && !this.isVisible) {
      document.body.style.overflow = '';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  formatAttainment(value: number): string {
    // Handle NaN, Infinity, and invalid numbers
    if (!isFinite(value) || isNaN(value)) {
      return '0';
    }
    // Round to whole number for cleaner display
    return Math.round(value).toString();
  }

  getAttainmentClass(attainment: number): string {
    if (attainment >= 100) return 'excellent';
    if (attainment >= 80) return 'good';
    if (attainment >= 60) return 'fair';
    return 'low';
  }
}
