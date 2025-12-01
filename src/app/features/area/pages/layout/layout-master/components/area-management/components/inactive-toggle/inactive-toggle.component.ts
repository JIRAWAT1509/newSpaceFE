import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inactive-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inactive-toggle.component.html',
  styleUrl: './inactive-toggle.component.css'
})
export class InactiveToggleComponent {
  showInactive = input.required<boolean>();
  inactiveCount = input<number>(0);

  toggled = output<boolean>();

  onToggle(): void {
    this.toggled.emit(!this.showInactive());
  }
}
