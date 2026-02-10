// meter-list.component.ts - TABLE VERSION
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Meter, MeterType, MeterGroup, getMeterTypeLabel } from '@core/models/meter.model';
import { MOCK_METERS, MOCK_METER_GROUPS } from '@core/data/meter.mock';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

/** Extended meter with building info + computed fields for the table */
interface MeterTableRow {
  id: string;
  meterName: string;       // ชื่อ meter
  meterNumber: string;
  groupName: string;       // กลุ่ม meter
  meterType: MeterType;    // ประเภท meter
  meterTypeLabel: string;
  meterTypeColor: string;
  meterTypeIcon: string;
  building: string;        // อาคาร
  room: string;            // ห้อง
  status: 'complete' | 'pending' | 'new'; // สถานะ
  lastRecordedDate: string;  // วันที่จดบันทึก meter ล่าสุด
  currentReading: number;    // ค่ามิเตอร์ปัจจุบัน
  previousReading: number;
  averageConsumption: number; // average consumption
  currentCost: number;       // ค่าใช้จ่ายปัจจุบัน
  unit: string;
  expectedMin: number;
  expectedMax: number;
  // Editing state
  editReading: number | null;
  isEditing: boolean;
}

@Component({
  selector: 'app-meter-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, ConfirmationModalComponent],
  templateUrl: './meter-list.component.html',
  styleUrl: './meter-list.component.css'
})
export class MeterListComponent implements OnInit {
  // State
  meters = signal<MeterTableRow[]>([]);
  groups = signal<MeterGroup[]>([]);
  selectedType = signal<string>('all');
  selectedGroup = signal<string | null>(null);
  searchText = signal<string>('');

  // Confirmation popup for out-of-range values
  showConfirmModal = signal<boolean>(false);
  confirmTitle = signal<string>('');
  confirmMessage = signal<string>('');
  pendingConfirmMeterId = signal<string | null>(null);
  pendingConfirmReading = signal<number>(0);

  // Rate per unit (mock: baht per unit)
  private readonly COST_RATES: Record<MeterType, number> = {
    electricity: 4.5,
    water: 18.0,
    gas: 25.0,
    ac: 4.5
  };

  // Building mapping (mock - in reality from API)
  private readonly ROOM_BUILDING_MAP: Record<string, string> = {
    '101': 'อาคาร A',
    '102': 'อาคาร A',
    '103': 'อาคาร A',
    '104': 'อาคาร B',
    '105': 'อาคาร B',
    '201': 'อาคาร C',
    '202': 'อาคาร C',
    '203': 'อาคาร A',
    '301': 'อาคาร A',
    '302': 'อาคาร B'
  };

  // Filter options for meter type
  meterTypeOptions = computed(() => {
    const elec = getMeterTypeLabel('electricity');
    const water = getMeterTypeLabel('water');
    const gas = getMeterTypeLabel('gas');
    const ac = getMeterTypeLabel('ac');
    return [
      { label: 'ทั้งหมด', value: 'all' },
      { label: elec.EN, value: 'electricity' },
      { label: water.EN, value: 'water' },
      { label: gas.EN, value: 'gas' },
      { label: ac.EN, value: 'ac' }
    ];
  });

  // Group dropdown options
  groupDropdownOptions = computed(() => {
    return [
      { label: 'ทุกกลุ่ม', value: null },
      ...this.groups().map(g => ({ label: g.name, value: g.id }))
    ];
  });

  // Filtered meters
  filteredMeters = computed(() => {
    let rows = this.meters();
    const type = this.selectedType();
    const group = this.selectedGroup();
    const search = this.searchText().toLowerCase();

    if (type !== 'all') {
      rows = rows.filter(m => m.meterType === type);
    }
    if (group) {
      const grp = this.groups().find(g => g.id === group);
      if (grp) {
        rows = rows.filter(m => grp.meterIds.includes(m.id));
      }
    }
    if (search) {
      rows = rows.filter(m =>
        m.meterName.toLowerCase().includes(search) ||
        m.meterNumber.toLowerCase().includes(search) ||
        m.room.toLowerCase().includes(search) ||
        m.building.toLowerCase().includes(search) ||
        m.groupName.toLowerCase().includes(search)
      );
    }
    return rows;
  });

  // Stats
  totalMeters = computed(() => this.meters().length);
  pendingCount = computed(() => this.meters().filter(m => m.status === 'pending').length);
  completeCount = computed(() => this.meters().filter(m => m.status === 'complete').length);

  ngOnInit(): void {
    this.loadGroups();
    this.loadMeters();
  }

  loadGroups(): void {
    this.groups.set(MOCK_METER_GROUPS);
  }

  loadMeters(): void {
    const groups = this.groups();
    const rows: MeterTableRow[] = MOCK_METERS.map(m => {
      const typeInfo = getMeterTypeLabel(m.meterType);
      const consumption = m.currentReading - m.previousReading;
      const cost = consumption * (this.COST_RATES[m.meterType] || 0);
      const groupNames = m.groupIds
        .map(gId => groups.find(g => g.id === gId)?.name || '')
        .filter(Boolean)
        .join(', ') || '-';

      let status: 'complete' | 'pending' | 'new' = 'new';
      if (m.status === 'active') status = 'complete';
      else if (m.status === 'pending') status = 'pending';

      return {
        id: m.id,
        meterName: m.tenantName ? `${m.meterNumber}` : m.meterNumber,
        meterNumber: m.meterNumber,
        groupName: groupNames,
        meterType: m.meterType,
        meterTypeLabel: typeInfo.EN,
        meterTypeColor: typeInfo.color,
        meterTypeIcon: typeInfo.icon,
        building: this.ROOM_BUILDING_MAP[m.roomNumber] || 'อาคาร A',
        room: m.roomNumber,
        status,
        lastRecordedDate: m.lastUpdated,
        currentReading: m.currentReading,
        previousReading: m.previousReading,
        averageConsumption: m.averageConsumption,
        currentCost: Math.round(cost * 100) / 100,
        unit: m.unit,
        expectedMin: m.expectedMin,
        expectedMax: m.expectedMax,
        editReading: null,
        isEditing: false
      };
    });
    this.meters.set(rows);
  }

  // ==================== FILTERS ====================

  onTypeChange(event: any): void {
    this.selectedType.set(event.value || 'all');
  }

  onGroupChange(event: any): void {
    this.selectedGroup.set(event.value);
  }

  // ==================== INLINE EDITING ====================

  startEdit(row: MeterTableRow): void {
    // Close any other editing row
    this.meters.update(meters =>
      meters.map(m => ({
        ...m,
        isEditing: m.id === row.id ? true : false,
        editReading: m.id === row.id ? m.currentReading : null
      }))
    );
  }

  cancelEdit(row: MeterTableRow): void {
    this.meters.update(meters =>
      meters.map(m => m.id === row.id ? { ...m, isEditing: false, editReading: null } : m)
    );
  }

  saveReading(row: MeterTableRow): void {
    if (row.editReading === null || row.editReading === undefined) return;
    const reading = Number(row.editReading);

    // Check if reading is outside expected range → show confirmation popup
    if (reading < row.expectedMin || reading > row.expectedMax) {
      this.pendingConfirmMeterId.set(row.id);
      this.pendingConfirmReading.set(reading);
      this.confirmTitle.set('ค่ามิเตอร์เกิน Expected Range');
      this.confirmMessage.set(
        `ค่าที่กรอก: ${reading.toLocaleString()} ${row.unit}\n` +
        `Expected range: ${row.expectedMin.toLocaleString()} - ${row.expectedMax.toLocaleString()} ${row.unit}\n\n` +
        `คุณต้องการบันทึกค่านี้หรือไม่?`
      );
      this.showConfirmModal.set(true);
      return;
    }

    // Within range → save directly
    this.applyReading(row.id, reading);
  }

  onConfirmSave(): void {
    const meterId = this.pendingConfirmMeterId();
    const reading = this.pendingConfirmReading();
    this.showConfirmModal.set(false);
    if (meterId) {
      this.applyReading(meterId, reading);
    }
    this.pendingConfirmMeterId.set(null);
  }

  onCancelSave(): void {
    this.showConfirmModal.set(false);
    this.pendingConfirmMeterId.set(null);
  }

  private applyReading(meterId: string, reading: number): void {
    this.meters.update(meters =>
      meters.map(m => {
        if (m.id !== meterId) return m;
        const consumption = reading - m.previousReading;
        const cost = consumption * (this.COST_RATES[m.meterType] || 0);
        return {
          ...m,
          currentReading: reading,
          averageConsumption: consumption,
          currentCost: Math.round(cost * 100) / 100,
          status: 'complete' as const,
          lastRecordedDate: new Date().toISOString().split('T')[0],
          isEditing: false,
          editReading: null
        };
      })
    );
  }

  // ==================== HELPERS ====================

  getStatusLabel(status: string): string {
    switch (status) {
      case 'complete': return 'Complete';
      case 'pending': return 'Pending';
      case 'new': return 'New';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'complete': return 'status-complete';
      case 'pending': return 'status-pending';
      case 'new': return 'status-new';
      default: return '';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  formatCost(num: number): string {
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onExportData(): void {
    alert('Export functionality will be implemented in production');
  }
}
