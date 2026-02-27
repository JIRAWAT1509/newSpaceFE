// company-selector-team.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Company {
  id: string;
  name: string;
  nameTh: string;
}

@Component({
  selector: 'app-company-selector-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-selector-team.component.html',
  styleUrl: './company-selector-team.component.css'
})
export class CompanySelectorTeamComponent {
  @Input() companies: Company[] = [];
  @Input() selectedCompanyIds: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();

  isAllSelected(): boolean {
    return this.selectedCompanyIds.length === 0 ||
           this.selectedCompanyIds.length === this.companies.length;
  }

  isSelected(companyId: string): boolean {
    return this.isAllSelected() || this.selectedCompanyIds.includes(companyId);
  }

  onToggleAll(): void {
    // Toggle between all and none
    if (this.isAllSelected()) {
      // If all selected, select just first one
      this.selectionChange.emit([this.companies[0]?.id].filter(Boolean));
    } else {
      // Select all (empty array means all)
      this.selectionChange.emit([]);
    }
  }

  onToggleCompany(companyId: string): void {
    if (this.isAllSelected()) return; // Can't toggle when all is selected

    const currentSelection = [...this.selectedCompanyIds];
    const index = currentSelection.indexOf(companyId);

    if (index > -1) {
      // Remove from selection
      currentSelection.splice(index, 1);
      // If empty, select all
      if (currentSelection.length === 0) {
        this.selectionChange.emit([]);
      } else {
        this.selectionChange.emit(currentSelection);
      }
    } else {
      // Add to selection
      currentSelection.push(companyId);
      this.selectionChange.emit(currentSelection);
    }
  }
}
