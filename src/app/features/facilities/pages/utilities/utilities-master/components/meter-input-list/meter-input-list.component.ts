// meter-input-list.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeterInputCardComponent } from './components/meter-input-card/meter-input-card.component';
import { Meter, MeterType } from '@core/models/meter.model';
import { MOCK_METERS } from '@core/data/meter.mock';

@Component({
  selector: 'app-meter-input-list',
  standalone: true,
  imports: [CommonModule, MeterInputCardComponent],
  templateUrl: './meter-input-list.component.html',
  styleUrl: './meter-input-list.component.css'
})
export class MeterInputListComponent implements OnInit {
  // State
  meters = signal<Meter[]>([]);
  selectedType = signal<MeterType | 'all'>('all');
  savedCount = signal<number>(0);

  // Filter options
  filterOptions = [
    { type: 'all' as const, label: 'All Meters', icon: 'pi-th-large', color: '#667eea' },
    { type: 'electricity' as const, label: 'Electricity', icon: 'pi-bolt', color: '#FFD700' },
    { type: 'water' as const, label: 'Water', icon: 'pi-droplet', color: '#4CA3FF' },
    { type: 'gas' as const, label: 'Gas', icon: 'pi-fire', color: '#FF6384' },
    { type: 'ac' as const, label: 'Air Con', icon: 'pi-sun', color: '#80E08E' }
  ];

  // Computed filtered meters
  filteredMeters = computed(() => {
    const meters = this.meters();
    const type = this.selectedType();

    if (type === 'all') {
      return meters;
    }

    return meters.filter(m => m.meterType === type);
  });

  // Computed stats
  totalMeters = computed(() => this.meters().length);
  pendingMeters = computed(() => this.meters().filter(m => m.status === 'pending').length);

  // Computed meter counts by type
  electricityCount = computed(() => this.meters().filter(m => m.meterType === 'electricity').length);
  waterCount = computed(() => this.meters().filter(m => m.meterType === 'water').length);
  gasCount = computed(() => this.meters().filter(m => m.meterType === 'gas').length);
  acCount = computed(() => this.meters().filter(m => m.meterType === 'ac').length);

  // Computed section title
  sectionTitle = computed(() => {
    const type = this.selectedType();
    if (type === 'all') return 'All Meters';
    const option = this.filterOptions.find(o => o.type === type);
    return option ? `${option.label} Meters` : 'Meters';
  });

  ngOnInit(): void {
    this.loadMeters();
  }

  loadMeters(): void {
    // Load from mock data
    this.meters.set(MOCK_METERS);
  }

  selectFilter(type: MeterType | 'all'): void {
    this.selectedType.set(type);
  }

  isFilterSelected(type: MeterType | 'all'): boolean {
    return this.selectedType() === type;
  }

  getMeterCountByType(type: MeterType): number {
    switch (type) {
      case 'electricity': return this.electricityCount();
      case 'water': return this.waterCount();
      case 'gas': return this.gasCount();
      case 'ac': return this.acCount();
      default: return 0;
    }
  }

  onReadingSaved(data: { meterId: string; reading: number }): void {
    console.log('Reading saved:', data);

    // Update saved count
    this.savedCount.update(count => count + 1);

    // TODO: Call API to save reading
    // this.meterService.saveReading(data).subscribe(...)

    // Update meter in list
    this.meters.update(meters =>
      meters.map(m =>
        m.id === data.meterId
          ? { ...m, currentReading: data.reading, status: 'active' as const }
          : m
      )
    );
  }

  onImportCSV(): void {
    console.log('Import CSV clicked');
    alert('CSV Import functionality will be implemented in production');
  }

  onExportData(): void {
    console.log('Export Data clicked');
    alert('Export functionality will be implemented in production');
  }

  onSendNotifications(): void {
    console.log('Send Notifications clicked');
    alert('Notification functionality will be implemented in production');
  }
}
