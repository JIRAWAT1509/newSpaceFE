// meter-group-create-form.component.ts - UPDATED with rate & transfer list
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeterGroup, Meter, MeterType, getMeterTypeLabel } from '@core/models/meter.model';
import { MeterService } from '@core/services/meter.service';
import { MOCK_METERS } from '@core/data/meter.mock';
import { MeterCreateFormComponent } from '../meter-create-form/meter-create-form.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';

@Component({
  selector: 'app-meter-group-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MeterCreateFormComponent, ConfirmationModalComponent, WarningModalComponent],
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
  groupMeterType = signal<MeterType>('electricity');
  groupRate = signal<number>(0);
  groupCurrency = signal<string>('THB');

  // Transfer list state
  assignedMeterIds = signal<Set<string>>(new Set());
  selectedUnassigned = signal<Set<string>>(new Set());
  selectedAssigned = signal<Set<string>>(new Set());
  searchUnassigned = signal<string>('');
  searchAssigned = signal<string>('');

  // Filter
  filterType = signal<string>('all');

  // Modal state
  showConfirmModal = signal<boolean>(false);
  pendingDeleteGroup = signal<MeterGroup | null>(null);
  showMessageModal = signal<boolean>(false);
  messageTitle = signal<string>('');
  messageText = signal<string>('');

  // Meter types
  meterTypes: { value: MeterType; label: string; icon: string; color: string }[] = [];

  // Computed: unassigned meters (same type, not in current group)
  unassignedMeters = computed(() => {
    const assigned = this.assignedMeterIds();
    const meterType = this.groupMeterType();
    const search = this.searchUnassigned().toLowerCase();
    return this.allMeters()
      .filter(m => m.meterType === meterType)
      .filter(m => !assigned.has(m.id))
      .filter(m => !search || m.roomNumber.toLowerCase().includes(search) || m.meterNumber.toLowerCase().includes(search) || m.tenantName.toLowerCase().includes(search));
  });

  // Computed: assigned meters
  assignedMeters = computed(() => {
    const assigned = this.assignedMeterIds();
    const search = this.searchAssigned().toLowerCase();
    return this.allMeters()
      .filter(m => assigned.has(m.id))
      .filter(m => !search || m.roomNumber.toLowerCase().includes(search) || m.meterNumber.toLowerCase().includes(search) || m.tenantName.toLowerCase().includes(search));
  });

  // Computed: filtered groups
  filteredGroups = computed(() => {
    const type = this.filterType();
    const groups = this.groups();
    if (type === 'all') return groups;
    return groups.filter(g => g.meterType === type);
  });

  constructor(private meterService: MeterService) {}

  ngOnInit(): void {
    this.loadData();
    this.initMeterTypes();
  }

  private initMeterTypes(): void {
    const types: MeterType[] = ['electricity', 'water', 'gas', 'ac'];
    this.meterTypes = types.map(t => {
      const info = getMeterTypeLabel(t);
      return { value: t, label: info.TH, icon: info.icon, color: info.color };
    });
  }

  loadData(): void {
    this.meterService.getGroups().subscribe(groups => this.groups.set(groups));
    this.allMeters.set(MOCK_METERS);
  }

  // ==================== GROUP MANAGEMENT ====================

  openCreateGroupDrawer(): void {
    this.editingGroup.set(null);
    this.groupName.set('');
    this.groupDescription.set('');
    this.groupMeterType.set('electricity');
    this.groupRate.set(0);
    this.groupCurrency.set('THB');
    this.assignedMeterIds.set(new Set());
    this.selectedUnassigned.set(new Set());
    this.selectedAssigned.set(new Set());
    this.searchUnassigned.set('');
    this.searchAssigned.set('');
    this.showGroupDrawer.set(true);
  }

  openEditGroupDrawer(group: MeterGroup): void {
    this.editingGroup.set(group);
    this.groupName.set(group.name);
    this.groupDescription.set(group.description);
    this.groupMeterType.set(group.meterType);
    this.groupRate.set(group.rate);
    this.groupCurrency.set(group.currency);
    this.assignedMeterIds.set(new Set(group.meterIds));
    this.selectedUnassigned.set(new Set());
    this.selectedAssigned.set(new Set());
    this.searchUnassigned.set('');
    this.searchAssigned.set('');
    this.showGroupDrawer.set(true);
  }

  closeGroupDrawer(): void {
    this.showGroupDrawer.set(false);
    this.editingGroup.set(null);
  }

  onMeterTypeChange(type: MeterType): void {
    this.groupMeterType.set(type);
    // Reset assigned meters that don't match the new type
    const assigned = this.assignedMeterIds();
    const validIds = new Set<string>();
    assigned.forEach(id => {
      const meter = this.allMeters().find(m => m.id === id);
      if (meter && meter.meterType === type) validIds.add(id);
    });
    this.assignedMeterIds.set(validIds);
  }

  // Transfer list actions
  toggleUnassigned(meterId: string): void {
    const selected = new Set(this.selectedUnassigned());
    if (selected.has(meterId)) selected.delete(meterId);
    else selected.add(meterId);
    this.selectedUnassigned.set(selected);
  }

  toggleAssigned(meterId: string): void {
    const selected = new Set(this.selectedAssigned());
    if (selected.has(meterId)) selected.delete(meterId);
    else selected.add(meterId);
    this.selectedAssigned.set(selected);
  }

  isUnassignedSelected(meterId: string): boolean {
    return this.selectedUnassigned().has(meterId);
  }

  isAssignedSelected(meterId: string): boolean {
    return this.selectedAssigned().has(meterId);
  }

  assignSelected(): void {
    const toAssign = this.selectedUnassigned();
    if (toAssign.size === 0) return;
    const assigned = new Set(this.assignedMeterIds());
    toAssign.forEach(id => assigned.add(id));
    this.assignedMeterIds.set(assigned);
    this.selectedUnassigned.set(new Set());
  }

  unassignSelected(): void {
    const toUnassign = this.selectedAssigned();
    if (toUnassign.size === 0) return;
    const assigned = new Set(this.assignedMeterIds());
    toUnassign.forEach(id => assigned.delete(id));
    this.assignedMeterIds.set(assigned);
    this.selectedAssigned.set(new Set());
  }

  saveGroup(): void {
    const groupData: MeterGroup = {
      id: this.editingGroup()?.id || `GRP-${Date.now()}`,
      name: this.groupName(),
      description: this.groupDescription(),
      meterType: this.groupMeterType(),
      meterIds: Array.from(this.assignedMeterIds()),
      rate: this.groupRate(),
      currency: this.groupCurrency(),
      createdDate: this.editingGroup()?.createdDate || new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };

    this.meterService.saveGroup(groupData).subscribe(() => {
      const action = this.editingGroup() ? 'แก้ไข' : 'สร้าง';
      this.showMessage('บันทึกสำเร็จ', `${action}กลุ่ม "${groupData.name}" เรียบร้อยแล้ว (Rate: ${groupData.rate} ${groupData.currency})`);
      this.groups.set([...this.meterService.groups$()]);
      this.closeGroupDrawer();
    });
  }

  deleteGroup(group: MeterGroup): void {
    this.pendingDeleteGroup.set(group);
    this.showConfirmModal.set(true);
  }

  onConfirmDeleteGroup(): void {
    const group = this.pendingDeleteGroup();
    if (group) {
      this.meterService.deleteGroup(group.id).subscribe(() => {
        this.groups.set([...this.meterService.groups$()]);
        this.showMessage('ลบสำเร็จ', `กลุ่ม "${group.name}" ถูกลบแล้ว`);
      });
    }
    this.showConfirmModal.set(false);
    this.pendingDeleteGroup.set(null);
  }

  onCancelDeleteGroup(): void {
    this.showConfirmModal.set(false);
    this.pendingDeleteGroup.set(null);
  }

  showMessage(title: string, message: string): void {
    this.messageTitle.set(title);
    this.messageText.set(message);
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
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

  getMeterTypeLabel(type: MeterType): string {
    return getMeterTypeLabel(type).TH;
  }

  getMeterTypeIcon(type: MeterType): string {
    return getMeterTypeLabel(type).icon;
  }

  getMeterTypeColor(type: MeterType): string {
    return getMeterTypeLabel(type).color;
  }

  isGroupFormValid(): boolean {
    return this.groupName().trim() !== '' && this.groupRate() > 0;
  }
}
