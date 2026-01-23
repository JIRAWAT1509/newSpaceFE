// activities-master.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitiesSectionComponent } from './components/activities/activities-section.component';

@Component({
  selector: 'app-activities-master',
  standalone: true,
  imports: [CommonModule, ActivitiesSectionComponent],
  templateUrl: './activities-master.component.html',
  styleUrl: './activities-master.component.css'
})
export class ActivitiesMasterComponent {
  // This component is just a wrapper for the activities section
  // All logic is handled in ActivitiesSectionComponent
}
