// utility-rate-settings.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeterGroup, UtilityRate, MeterType, Meter, getMeterTypeLabel } from '@core/models/meter.model';
import { MeterService } from '@core/services/meter.service';
import { MOCK_METERS } from '@core/data/meter.mock';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WarningModalComponent } from '@shared/components/warning-modal/warning-modal.component';

@Component({
  selector: 'app-utility-rate-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent, WarningModalComponent],
  templateUrl: './utility-rate-settings.component.html',
  styleUrl: './utility-rate-settings.component.css'
})
export class UtilityRateSettingsComponent implements OnInit {

  // Default rates
  defaultRates = signal<UtilityRate[]>([]);

  // Groups with rates
  groups = signal<MeterGroup[]>([]);
  allMeters = signal<Meter[]>([]);

  // Editing state for default rates
  editingRateId = signal<string | null>(null);
  editRateValue = signal<number>(0);

  // Group drawer state
  showGroupDrawer = signal<boolean>(false);
  editingGroup = signal<MeterGroup | null>(null);

  // Group form
  groupForm = signal<{
    name: string;
    meterType: MeterType;
    rate: number;
    currency: string;
    description: string;
  }>({
    name: '',
    meterType: 'electricity',
    rate: 0,
    currency: 'THB',
    description: ''
  });

  // Transfer list state
  searchUnassigned = signal<string>('');
  searchAssigned = signal<string>('');
  selectedUnassigned = signal<Set<string>>(new Set());
  selectedAssigned = signal<Set<string>>(new Set());
  assignedMeterIds = signal<Set<string>>(new Set());

  // Filter
  filterType = signal<string>('all');

  // Modal
  showConfirmModal = signal<boolean>(false);
  pendingDeleteGroup = signal<MeterGroup | null>(null);
  showMessageModal = signal<boolean>(false);
  messageTitle = signal<string>('');
  messageText = signal<string>('');

  // Computed: meters available for assignment (same type, not in this group)
  unassignedMeters = computed(() => {
    const assigned = this.assignedMeterIds();
    const formType = this.groupForm().meterType;
    const search = this.searchUnassigned().toLowerCase();
    return this.allMeters()
      .filter(m => m.meterType === formType)
      .filter(m => !assigned.has(m.id))
      .filter(m => !search || m.roomNumber.toLowerCase().includes(search) || m.meterNumber.toLowerCase().includes(search) || m.tenantName.toLowerCase().includes(search));
  });

  // Computed: meters assigned to this group
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

  // Meter types for dropdown
  meterTypes: { value: MeterType; label: string; icon: string; color: string }[] = [];

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

  private loadData(): void {
    this.meterService.getRates().subscribe(rates => this.defaultRates.set(rates));
    this.meterService.getGroups().subscribe(groups => this.groups.set(groups));
    this.allMeters.set(MOCK_METERS);
  }

  // ==================== DEFAULT RATES ====================

  startEditRate(rate: UtilityRate): void {
    this.editingRateId.set(rate.id);
    this.editRateValue.set(rate.rate);
  }

  cancelEditRate(): void {
    this.editingRateId.set(null);
  }

  saveEditRate(rate: UtilityRate): void {
    const newVal = this.editRateValue();
    if (newVal <= 0) return;
    this.meterService.updateRate(rate.id, newVal).subscribe(() => {
      this.defaultRates.update(rates =>
        rates.map(r => r.id === rate.id ? { ...r, rate: newVal } : r)
      );
      this.editingRateId.set(null);
      this.showMessage('บันทึกสำเร็จ', `อัพเดทอัตรา${this.getMeterTypeLabel(rate.meterType)} เป็น ${newVal} ${rate.currency}/${rate.unit}`);
    });
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

  // ==================== GROUP RATE MANAGEMENT ====================

  openCreateGroupDrawer(): void {
    this.editingGroup.set(null);
    this.groupForm.set({
      name: '',
      meterType: 'electricity',
      rate: 0,
      currency: 'THB',
      description: ''
    });
    this.assignedMeterIds.set(new Set());
    this.selectedUnassigned.set(new Set());
    this.selectedAssigned.set(new Set());
    this.searchUnassigned.set('');
    this.searchAssigned.set('');
    this.showGroupDrawer.set(true);
  }

  openEditGroupDrawer(group: MeterGroup): void {
    this.editingGroup.set(group);
    this.groupForm.set({
      name: group.name,
      meterType: group.meterType,
      rate: group.rate,
      currency: group.currency,
      description: group.description
    });
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
    const form = this.groupForm();
    const group: MeterGroup = {
      id: this.editingGroup()?.id || `GRP-${Date.now()}`,
      name: form.name,
      description: form.description,
      meterType: form.meterType,
      meterIds: Array.from(this.assignedMeterIds()),
      rate: form.rate,
      currency: form.currency,
      createdDate: this.editingGroup()?.createdDate || new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };

    this.meterService.saveGroup(group).subscribe(() => {
      const action = this.editingGroup() ? 'แก้ไข' : 'สร้าง';
      this.showMessage('บันทึกสำเร็จ', `${action}กลุ่ม "${group.name}" เรียบร้อยแล้ว (Rate: ${group.rate} ${group.currency})`);
      this.groups.set([...this.meterService.groups$()]);
      this.closeGroupDrawer();
    });
  }

  deleteGroup(group: MeterGroup): void {
    this.pendingDeleteGroup.set(group);
    this.showConfirmModal.set(true);
  }

  onConfirmDelete(): void {
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

  onCancelDelete(): void {
    this.showConfirmModal.set(false);
    this.pendingDeleteGroup.set(null);
  }

  // ==================== HELPERS ====================

  updateGroupFormField(field: string, value: any): void {
    this.groupForm.update(form => ({ ...form, [field]: value }));
    // When type changes, reset assigned meters that don't match the new type
    if (field === 'meterType') {
      const newType = value as MeterType;
      const assigned = this.assignedMeterIds();
      const validIds = new Set<string>();
      assigned.forEach(id => {
        const meter = this.allMeters().find(m => m.id === id);
        if (meter && meter.meterType === newType) validIds.add(id);
      });
      this.assignedMeterIds.set(validIds);
    }
  }

  getGroupMeterCount(group: MeterGroup): number {
    return group.meterIds.length;
  }

  showMessage(title: string, message: string): void {
    this.messageTitle.set(title);
    this.messageText.set(message);
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
  }

  isGroupFormValid(): boolean {
    const form = this.groupForm();
    return form.name.trim() !== '' && form.rate > 0;
  }
}
