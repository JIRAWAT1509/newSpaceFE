// area-floor-data.component.ts
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { FloorOverviewTabComponent } from './components/floor-overview-tab/floor-overview-tab.component';
import { AreaGeneralDataTabComponent } from './components/area-general-data-tab/area-general-data-tab.component';
import { AreaRentalHistoryTabComponent } from './components/area-rental-history-tab/area-rental-history-tab.component';
import { AreaContractListTabComponent } from './components/area-contract-list-tab/area-contract-list-tab.component';
import { AreaDataService } from '@core/services/area/area-data.service';
import { Area } from '@core/models/area.model';

@Component({
  selector: 'app-area-floor-data',
  standalone: true,
  imports: [
    CommonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    FloorOverviewTabComponent,
    AreaGeneralDataTabComponent,
    AreaRentalHistoryTabComponent,
    AreaContractListTabComponent
  ],
  templateUrl: './area-floor-data.component.html',
  styleUrl: './area-floor-data.component.css'
})
export class AreaFloorDataComponent {
  floorId = input<string>('floor-2m'); // Optional with default
  selectedAreaId = input<string | null>(null);
  backToGeneral = output<void>();

  activeTabIndex = signal<string>('0'); // Changed to string for PrimeNG v20

  constructor(
    private areaDataService: AreaDataService,
    private router: Router
  ) {}

  onBackToGeneral(): void {
    this.activeTabIndex.set('0'); // Reset to floor overview tab
    this.backToGeneral.emit();
  }

  switchToAreaTab(): void {
    this.activeTabIndex.set('1'); // Switch to Area Details tab
  }

  onGoToContract(): void {
    const areaId = this.selectedAreaId();
    if (areaId) {
      // Navigate to contract processing page with area context
      this.router.navigate(['/contract/management'], {
        queryParams: {
          areaId: areaId,
          roomNumber: this.getAreaRoomNumber()
        }
      });
    }
  }

  getSelectedArea(): Area | null {
    const areaId = this.selectedAreaId();
    if (!areaId) return null;

    const floor = this.areaDataService.getCurrentFloor();
    if (!floor) return null;

    return floor.areas.find(a => a.id === areaId) || null;
  }

  getAreaRoomNumber(): string {
    const area = this.getSelectedArea();
    return area?.roomNumber || '';
  }
}
