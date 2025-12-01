import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-area-floor-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-floor-data.component.html',
  styleUrl: './area-floor-data.component.css'
})
export class AreaFloorDataComponent {
  selectedAreaId = input<string | null>(null);

  backToGeneral = output<void>();

  onBackToGeneral(): void {
    this.backToGeneral.emit();
  }
}
