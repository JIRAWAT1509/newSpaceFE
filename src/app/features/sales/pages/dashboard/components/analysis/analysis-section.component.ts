// analysis-section.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analysis-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis-section.component.html',
  styleUrl: './analysis-section.component.css'
})
export class AnalysisSectionComponent implements OnInit {
  // Data signals
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAnalysisData();
  }

  loadAnalysisData(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Analysis data loaded');
    }, 500);
  }
}
