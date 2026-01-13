// utilities-master.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsOverviewComponent } from './components/stats-overview/stats-overview.component';
import { MeterCreateFormComponent } from './components/meter-create-form/meter-create-form.component';
import { MeterInputListComponent } from './components/meter-input-list/meter-input-list.component';
import { AnalyticsChartsComponent } from './components/analytics-charts/analytics-charts.component';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-utilities-master',
  standalone: true,
  imports: [
    CommonModule,
    StatsOverviewComponent,
    MeterCreateFormComponent,
    MeterInputListComponent,
    AnalyticsChartsComponent
  ],
  templateUrl: './utilities-master.component.html',
  styleUrl: './utilities-master.component.css'
})
export class UtilitiesMasterComponent {
  activeTab = signal<string>('dashboard');

  tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'pi-chart-bar' },
    { id: 'create', label: 'Create Meter', icon: 'pi-plus-circle' },
    { id: 'fill', label: 'Fill Readings', icon: 'pi-pencil' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  isActiveTab(tabId: string): boolean {
    return this.activeTab() === tabId;
  }
}
