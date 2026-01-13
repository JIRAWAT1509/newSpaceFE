// meter-group-create-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeterGroup, Meter } from '@core/models/meter.model';
import { MOCK_METERS } from '@core/data/meter.mock';
import { MeterCreateFormComponent } from '../meter-create-form/meter-create-form.component';

@Component({
  selector: 'app-meter-group-create-form',
  standalone: true,
  imports: [CommonModule, MeterCreateFormComponent],
  templateUrl: './meter-group-create-form.component.html',
  styleUrl: './meter-group-create-form.component.css'
})
export class MeterGroupCreateFormComponent implements OnInit {
  groups = signal<MeterGroup[]>([]);
  allMeters = signal<Meter[]>([]);
  showCreateMeterDrawer = signal<boolean>(false);
  showGroupDrawer = signal<boolean>(false);
  editingGroup = signal<MeterGroup | null>(null);

  // Group form state
  groupName = signal<string>('');
  groupDescription = signal<string>('');
  selectedMeterIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadGroups();
    this.loadMeters();
  }

  loadGroups(): void {
    // Mock groups data
    const mockGroups: MeterGroup[] = [
      {
        id: 'GRP-001',
        name: 'Building A - Floor 1 Electric',
        description: 'All electricity meters on Building A, Floor 1',
        meterIds: ['MTR-001', 'MTR-002', 'MTR-008'],
        createdDate: '2025-01-01',
        updatedDate: '2025-01-10'
      },
      {
        id: 'GRP-002',
        name: 'Building B - Water System',
        description: 'Water meters across all floors in Building B',
        meterIds: ['MTR-004', 'MTR-005'],
        createdDate: '2025-01-05',
        updatedDate: '2025-01-12'
      },
      {
        id: 'GRP-003',
        name: 'Zone C - AC Units',
        description: 'Air conditioning units in Zone C',
        meterIds: ['MTR-007'],
        createdDate: '2025-01-08',
        updatedDate: '2025-01-13'
      }
    ];

    this.groups.set(mockGroups);
  }

  loadMeters(): void {
    this.allMeters.set(MOCK_METERS);
  }

  // Group Management
  openCreateGroupDrawer(): void {
    this.editingGroup.set(null);
    this.groupName.set('');
    this.groupDescription.set('');
    this.selectedMeterIds.set(new Set());
    this.showGroupDrawer.set(true);
  }

  openEditGroupDrawer(group: MeterGroup): void {
    this.editingGroup.set(group);
    this.groupName.set(group.name);
    this.groupDescription.set(group.description);
    this.selectedMeterIds.set(new Set(group.meterIds));
    this.showGroupDrawer.set(true);
  }

  closeGroupDrawer(): void {
    this.showGroupDrawer.set(false);
    this.editingGroup.set(null);
  }

  toggleMeterSelection(meterId: string): void {
    const selected = new Set(this.selectedMeterIds());
    if (selected.has(meterId)) {
      selected.delete(meterId);
    } else {
      selected.add(meterId);
    }
    this.selectedMeterIds.set(selected);
  }

  isMeterSelected(meterId: string): boolean {
    return this.selectedMeterIds().has(meterId);
  }

  saveGroup(): void {
    const groupData = {
      id: this.editingGroup()?.id || `GRP-${Date.now()}`,
      name: this.groupName(),
      description: this.groupDescription(),
      meterIds: Array.from(this.selectedMeterIds()),
      createdDate: this.editingGroup()?.createdDate || new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    console.log('Saving group:', groupData);
    alert(`Mock: ${this.editingGroup() ? 'Updated' : 'Created'} group "${groupData.name}"`);

    // TODO: Call API
    this.closeGroupDrawer();
    this.loadGroups(); // Reload
  }

  deleteGroup(group: MeterGroup): void {
    if (confirm(`Delete group "${group.name}"?`)) {
      console.log('Deleting group:', group);
      alert(`Mock: Deleted group "${group.name}"`);
      // TODO: Call API
      this.loadGroups();
    }
  }

  // Meter Management
  openCreateMeterDrawer(): void {
    this.showCreateMeterDrawer.set(true);
  }

  closeCreateMeterDrawer(): void {
    this.showCreateMeterDrawer.set(false);
  }

  getMetersInGroup(group: MeterGroup): Meter[] {
    return this.allMeters().filter(m => group.meterIds.includes(m.id));
  }

  getMeterCount(group: MeterGroup): number {
    return group.meterIds.length;
  }
}
