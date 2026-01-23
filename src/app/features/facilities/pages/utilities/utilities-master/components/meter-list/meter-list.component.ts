// meter-list.component.ts - FINAL CORRECTED
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { MeterInputCardComponent } from '../meter-input-list/components/meter-input-card/meter-input-card.component';
import { Meter, MeterType, MeterGroup } from '@core/models/meter.model';
import { MOCK_METER_GROUPS } from '@core/data/meter.mock';

interface CompletedMeter extends Meter {
  completedDate: string;
  completedReading: number;
  attachedPhotos: string[];
}

@Component({
  selector: 'app-meter-list',
  standalone: true,
  imports: [CommonModule, Select, MeterInputCardComponent],
  templateUrl: './meter-list.component.html',
  styleUrl: './meter-list.component.css'
})
export class MeterListComponent implements OnInit {
  // State
  completedMeters = signal<CompletedMeter[]>([]);
  groups = signal<MeterGroup[]>([]);
  selectedType = signal<MeterType | 'all'>('all');
  selectedGroup = signal<string | null>(null); // null = not selected
  expandedMeterId = signal<string | null>(null); // Only ONE expanded at a time

  // Filter options
  filterOptions = [
    { type: 'all' as const, label: 'All Meters', icon: 'pi-th-large', color: '#667eea' },
    { type: 'electricity' as const, label: 'Electricity', icon: 'pi-bolt', color: '#FFD700' },
    { type: 'water' as const, label: 'Water', icon: 'pi-droplet', color: '#4CA3FF' },
    { type: 'gas' as const, label: 'Gas', icon: 'pi-fire', color: '#FF6384' },
    { type: 'ac' as const, label: 'Air Con', icon: 'pi-sun', color: '#80E08E' }
  ];

  // Computed group dropdown options
  groupDropdownOptions = computed(() => {
    const groups = this.groups();
    return groups.map(g => ({ label: g.name, value: g.id }));
  });

  // Computed filtered meters
  filteredMeters = computed(() => {
    let meters = this.completedMeters();
    const type = this.selectedType();
    const group = this.selectedGroup();

    // Filter by type
    if (type !== 'all') {
      meters = meters.filter(m => m.meterType === type);
    }

    // Filter by group
    if (group) {
      meters = meters.filter(m => m.groupIds.includes(group));
    }

    return meters;
  });

  // Computed stats
  totalCompleted = computed(() => this.completedMeters().length);
  thisMonthCompleted = computed(() => {
    const now = new Date();
    return this.completedMeters().filter(m => {
      const completed = new Date(m.completedDate);
      return completed.getMonth() === now.getMonth() &&
             completed.getFullYear() === now.getFullYear();
    }).length;
  });

  // Computed meter counts by type
  electricityCount = computed(() => this.completedMeters().filter(m => m.meterType === 'electricity').length);
  waterCount = computed(() => this.completedMeters().filter(m => m.meterType === 'water').length);
  gasCount = computed(() => this.completedMeters().filter(m => m.meterType === 'gas').length);
  acCount = computed(() => this.completedMeters().filter(m => m.meterType === 'ac').length);

  // Computed section title
  sectionTitle = computed(() => {
    const type = this.selectedType();
    const group = this.selectedGroup();

    let title = 'Completed Meters';

    if (group) {
      const selectedGroup = this.groups().find(g => g.id === group);
      title = `${title} - ${selectedGroup?.name || 'Group'}`;
    }

    if (type !== 'all') {
      const option = this.filterOptions.find(o => o.type === type);
      title = `${title} - ${option?.label || ''}`;
    }

    return title;
  });

  ngOnInit(): void {
    this.loadCompletedMeters();
    this.loadGroups();
  }

  loadCompletedMeters(): void {
    // Mock completed meters with photos
    const mockCompleted: CompletedMeter[] = [
      {
        id: 'MTR-009',
        roomNumber: '301',
        tenantName: 'Alice Johnson',
        meterType: 'electricity',
        meterNumber: 'ELEC-2024-009',
        installationDate: '2024-03-01',
        currentReading: 1789,
        previousReading: 1654,
        averageConsumption: 145,
        expectedMin: 1750,
        expectedMax: 1800,
        lastUpdated: '2025-01-13',
        status: 'active',
        unit: 'kWh',
        groupIds: ['GRP-001'],
        completedDate: '2025-01-13T10:30:00',
        completedReading: 1789,
        attachedPhotos: [] // Will be populated when user saves
      },
      {
        id: 'MTR-010',
        roomNumber: '302',
        tenantName: 'Bob Smith',
        meterType: 'water',
        meterNumber: 'WATER-2024-010',
        installationDate: '2024-03-05',
        currentReading: 156,
        previousReading: 138,
        averageConsumption: 20,
        expectedMin: 155,
        expectedMax: 165,
        lastUpdated: '2025-01-13',
        status: 'active',
        unit: 'm³',
        groupIds: ['GRP-002'],
        completedDate: '2025-01-13T11:15:00',
        completedReading: 156,
        attachedPhotos: []
      }
    ];

    this.completedMeters.set(mockCompleted);
  }

  loadGroups(): void {
    this.groups.set(MOCK_METER_GROUPS);
  }

  selectFilter(type: MeterType | 'all'): void {
    this.selectedType.set(type);
    this.expandedMeterId.set(null); // Reset expanded
  }

  isFilterSelected(type: MeterType | 'all'): boolean {
    return this.selectedType() === type;
  }

  onGroupChange(event: any): void {
    this.selectedGroup.set(event.value);
    this.expandedMeterId.set(null); // Reset expanded when group changes
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

  // Card click handler - expand ONE card at a time
  onCardClicked(meterId: string): void {
    this.expandedMeterId.set(meterId);
  }

  // Background click handler - collapse card
  onCardBackgroundClicked(meterId: string): void {
    if (this.expandedMeterId() === meterId) {
      this.expandedMeterId.set(null);
    }
  }

  // Check if card is expanded
  isCardExpanded(meterId: string): boolean {
    return this.expandedMeterId() === meterId;
  }

  onReadingSaved(data: { meterId: string; reading: number; photos: string[] }): void {
    console.log('Reading updated:', data);

    // Update meter in list
    this.completedMeters.update(meters =>
      meters.map(m =>
        m.id === data.meterId
          ? { ...m, completedReading: data.reading, attachedPhotos: data.photos, currentReading: data.reading }
          : m
      )
    );

    // Collapse after save
    this.expandedMeterId.set(null);
  }

  onExportData(): void {
    console.log('Export completed meters');
    alert('Export functionality will be implemented in production');
  }
}
