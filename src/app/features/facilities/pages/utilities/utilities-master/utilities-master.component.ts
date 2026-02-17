// utilities-master.component.ts - with Rate Settings tab
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsOverviewComponent } from './components/stats-overview/stats-overview.component';
import { MeterGroupCreateFormComponent } from './components/meter-group-create-form/meter-group-create-form.component';
import { MeterInputListComponent } from './components/meter-input-list/meter-input-list.component';
import { MeterListComponent } from './components/meter-list/meter-list.component';
import { AnalyticsChartsComponent } from './components/analytics-charts/analytics-charts.component';
import { UtilityRateSettingsComponent } from './components/utility-rate-settings/utility-rate-settings.component';

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
    MeterGroupCreateFormComponent,
    MeterInputListComponent,
    MeterListComponent,
    AnalyticsChartsComponent,
    UtilityRateSettingsComponent
  ],
  templateUrl: './utilities-master.component.html',
  styleUrl: './utilities-master.component.css'
})
export class UtilitiesMasterComponent {
  activeTab = signal<string>('dashboard');

  tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'pi-chart-bar' },
    { id: 'groups', label: 'กลุ่มมิเตอร์', icon: 'pi-sitemap' },
    { id: 'rates', label: 'อัตราค่าบริการ', icon: 'pi-money-bill' },
    { id: 'fill', label: 'ใส่ค่ามิเตอร์', icon: 'pi-pencil' },
    { id: 'list', label: 'Meter List', icon: 'pi-list' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  isActiveTab(tabId: string): boolean {
    return this.activeTab() === tabId;
  }
}
