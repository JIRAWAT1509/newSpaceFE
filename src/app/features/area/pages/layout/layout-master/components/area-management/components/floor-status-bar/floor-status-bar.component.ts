import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusDistribution } from '@core/services/area/area-data.service';

@Component({
  selector: 'app-floor-status-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-status-bar.component.html',
  styleUrl: './floor-status-bar.component.css'
})
export class FloorStatusBarComponent {
  statusDistribution = input.required<StatusDistribution[]>();

  // Only show statuses with count > 0
  visibleStatuses = computed(() => {
    return this.statusDistribution().filter(s => s.count > 0);
  });

  getBarWidth(status: StatusDistribution): number {
    return status.percentage;
  }

  formatPercentage(percentage: number): string {
    return `${percentage.toFixed(0)}%`;
  }
}
