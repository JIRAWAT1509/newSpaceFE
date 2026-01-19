// customer-drawer.component.ts
import { Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import {
  Customer,
  CustomerChannel,
  CustomerStatus,
  CustomerSegment,
  InterestedArea,
  CUSTOMER_SEGMENTS,
  CHANNEL_LABELS,
  STATUS_LABELS
} from '@core/models/customer.model';
import { MOCK_BUILDING } from '@core/data/building.mock';
import { MOCK_FLOOR } from '@core/data/floor.mock';
import { MOCK_AREAS } from '@core/data/areas.mock';

@Component({
  selector: 'app-customer-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select,
    DatePicker,
    Textarea
  ],
  templateUrl: './customer-drawer.component.html',
  styleUrl: './customer-drawer.component.css'
})
export class CustomerDrawerComponent implements OnInit {
  // Inputs
  mode = input.required<'create' | 'edit'>();
  customer = input<Customer | null>(null);
  availableSegments = input.required<CustomerSegment[]>();

  // Outputs
  save = output<Partial<Customer>>();
  cancel = output<void>();

  // Form fields
  firstName = signal<string>('');
  lastName = signal<string>('');
  companyName = signal<string>('');
  businessType = signal<string>('');
  channel = signal<CustomerChannel>('website');
  status = signal<CustomerStatus>('prospect');
  email = signal<string>('');
  phone = signal<string>('');
  budget = signal<number | undefined>(undefined);
  expectedClosingDate = signal<Date | undefined>(undefined);
  remark = signal<string>('');

  // System fields (for edit mode)
  owner = signal<string>('');
  arr = signal<number>(0);
  csat = signal<number>(3.0);

  // Segment with "Add New" functionality
  selectedSegment = signal<CustomerSegment>('Enterprise');
  isAddingNewSegment = signal<boolean>(false);
  newSegmentName = signal<string>('');

  // Interested Areas (max 5)
  interestedAreas = signal<InterestedArea[]>([]);
  selectedBuildingForNewArea = signal<string>('');
  selectedAreaForNewArea = signal<string>('');

  // Available options
  channelOptions = Object.entries(CHANNEL_LABELS).map(([key, value]) => ({
    label: `${value.th} (${value.en})`,
    value: key as CustomerChannel
  }));

  statusOptions = Object.entries(STATUS_LABELS).map(([key, value]) => ({
    label: `${value.th} (${value.en})`,
    value: key as CustomerStatus
  }));

  // Computed segment options with "Add New" button
  segmentOptions = computed(() => {
    return this.availableSegments();
  });

  // Building & Area options
  buildingOptions = [
    { label: MOCK_BUILDING.nameTh, value: MOCK_BUILDING.id }
  ];

  availableAreaOptions = computed(() => {
    return MOCK_AREAS
      .filter(area => area.isActive && !area.isDeleted)
      .map(area => ({
        label: `${area.roomNumber} - Floor ${area.floorId.replace('floor-', '')}`,
        value: area.id,
        areaName: area.roomNumber,
        floorNumber: parseInt(area.floorId.replace('floor-', ''))
      }));
  });

  // Validation
  isValid = computed(() => {
    return this.firstName().trim().length > 0 &&
           this.channel() !== null &&
           this.status() !== null;
  });   //        this.lastName().trim().length > 0 &&


  ngOnInit(): void {
    // Pre-fill form in edit mode
    if (this.mode() === 'edit' && this.customer()) {
      const c = this.customer()!;
      this.firstName.set(c.firstName);
      this.lastName.set(c.lastName || '');
      this.companyName.set(c.companyName || '');
      this.businessType.set(c.businessType || '');
      this.channel.set(c.channel);
      this.status.set(c.status);
      this.email.set(c.email || '');
      this.phone.set(c.phone || '');
      this.budget.set(c.budget);
      this.expectedClosingDate.set(c.expectedClosingDate ? new Date(c.expectedClosingDate) : undefined);
      this.remark.set(c.remark || '');
      this.selectedSegment.set(c.segment);
      this.interestedAreas.set([...c.interestedAreas]);
      this.owner.set(c.owner);
      this.arr.set(c.arr);
      this.csat.set(c.csat);
    }
  }

  // Segment management
  onSegmentChange(event: any): void {
    this.selectedSegment.set(event.value);
  }

  openAddSegment(): void {
    this.isAddingNewSegment.set(true);
  }

  saveNewSegment(): void {
    const newSegment = this.newSegmentName().trim();
    if (newSegment) {
      this.selectedSegment.set(newSegment);
      this.newSegmentName.set('');
      this.isAddingNewSegment.set(false);
    }
  }

  cancelAddSegment(): void {
    this.newSegmentName.set('');
    this.isAddingNewSegment.set(false);
  }

  // Interested Areas management
  canAddMoreAreas(): boolean {
    return this.interestedAreas().length < 5;
  }

  addInterestedArea(): void {
    const buildingId = this.selectedBuildingForNewArea();
    const areaId = this.selectedAreaForNewArea();

    if (!buildingId || !areaId) return;

    // Check if already added
    if (this.interestedAreas().some(a => a.areaId === areaId)) {
      alert('This area is already added!');
      return;
    }

    const area = MOCK_AREAS.find(a => a.id === areaId);
    if (!area) return;

    const newArea: InterestedArea = {
      buildingId: buildingId,
      buildingName: MOCK_BUILDING.nameTh,
      areaId: areaId,
      areaName: area.roomNumber,
      floorNumber: parseInt(area.floorId.replace('floor-', ''))
    };

    this.interestedAreas.update(areas => [...areas, newArea]);
    this.selectedAreaForNewArea.set('');
  }

  removeInterestedArea(index: number): void {
    this.interestedAreas.update(areas => areas.filter((_, i) => i !== index));
  }

  // Form submission
  onSave(): void {
    if (!this.isValid()) return;

    const formData: Partial<Customer> = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim() || '',
      companyName: this.companyName().trim() || undefined,
      businessType: this.businessType().trim() || undefined,
      channel: this.channel(),
      status: this.status(),
      email: this.email().trim() || undefined,
      phone: this.phone().trim() || undefined,
      interestedAreas: this.interestedAreas(),
      budget: this.budget(),
      expectedClosingDate: this.expectedClosingDate()?.toISOString(),
      remark: this.remark().trim() || undefined,
      segment: this.selectedSegment(),
      owner: this.owner() || this.firstName(),
      ownerId: 'user-' + Date.now(),
      arr: this.arr(),
      csat: this.csat(),
      overduePayments: 0,
      activeContracts: 0,
      totalRevenue: 0
    };

    this.save.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
