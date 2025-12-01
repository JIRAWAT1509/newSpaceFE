import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zoom-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zoom-controls.component.html',
  styleUrl: './zoom-controls.component.css'
})
export class ZoomControlsComponent {
  currentZoom = input.required<number>();

  zoomChanged = output<number>();
  resetZoom = output<void>();

  onZoomIn(): void {
    const newZoom = Math.min(this.currentZoom() + 0.1, 3.0);
    this.zoomChanged.emit(newZoom);
  }

  onZoomOut(): void {
    const newZoom = Math.max(this.currentZoom() - 0.1, 0.5);
    this.zoomChanged.emit(newZoom);
  }

  onResetZoom(): void {
    this.resetZoom.emit();
  }

  getZoomPercentage(): string {
    return Math.round(this.currentZoom() * 100) + '%';
  }
}
