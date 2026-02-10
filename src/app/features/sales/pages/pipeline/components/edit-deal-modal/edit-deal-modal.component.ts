// edit-deal-modal.component.ts
import { Component, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { MultiSelect } from 'primeng/multiselect';
import { Slider } from 'primeng/slider';
import { Deal, PipelineStage } from '@core/models/pipeline.model';
import { MOCK_CUSTOMERS } from '@core/data/customer.mock';

interface CustomerOption {
  label: string;
  value: string;
  customerId: string;
}

interface StageOption {
  label: string;
  value: string;
  color: string;
  forecastWinRate: number;
  defaultDueDays: number;
}

interface AreaOption {
  label: string;
  value: string;
  areaId: string;
  buildingName: string;
  floorNumber?: number; // Optional
}

interface PriorityOption {
  label: string;
  value: 'high' | 'medium' | 'low';
  icon: string;
}

interface TagOption {
  label: string;
  value: string;
}

export interface EditDealData {
  dealId: string;
  customerId: string;
  customerName: string;
  companyName?: string;
  stageId: string;
  stageName: string;
  title: string;
  value: number;
  actualWinRate: number; // Can be manually edited!
  areaId?: string;
  areaName?: string;
  buildingId?: string;
  buildingName?: string;
  floorNumber?: number;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  notes: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  stageChanged: boolean; // Flag if stage was changed
  originalStageId: string;
}

@Component({
  selector: 'app-edit-deal-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select,
    InputNumber,
    Textarea,
    MultiSelect,
    Slider
  ],
  templateUrl: './edit-deal-modal.component.html',
  styleUrl: './edit-deal-modal.component.css'
})
export class EditDealModalComponent implements OnInit {
  // Inputs (passed via method call)
  visible = signal(false);
  stages = signal<PipelineStage[]>([]);
  currentDeal = signal<Deal | null>(null);

  // Outputs
  close = output<void>();
  save = output<EditDealData>();

  // Form state
  selectedCustomerId = signal<string | null>(null);
  selectedStageId = signal<string | null>(null);
  originalStageId = signal<string | null>(null); // Track original stage
  dealTitle = signal('');
  dealValue = signal<number>(0);
  actualWinRate = signal<number>(50); // Can be edited manually!
  selectedAreaId = signal<string | null>(null);
  selectedTags = signal<string[]>([]);
  selectedPriority = signal<'high' | 'medium' | 'low'>('medium');
  notes = signal('');
  contactPerson = signal('');
  contactPhone = signal('');
  contactEmail = signal('');
  stageWinRate = signal<number>(0);

  // Customer options
  customerOptions = signal<CustomerOption[]>([]);

  // Stage options
  stageOptions = computed<StageOption[]>(() => {
    return this.stages().map(stage => ({
      label: `${stage.name} (${stage.forecastWinRate}% win rate)`,
      value: stage.id,
      color: stage.color,
      forecastWinRate: stage.forecastWinRate,
      defaultDueDays: stage.defaultDueDays
    }));
  });

  // Area options (from customer's interested areas)
  areaOptions = computed<AreaOption[]>(() => {
    const customerId = this.selectedCustomerId();
    if (!customerId) return [];

    const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
    if (!customer || !customer.interestedAreas) return [];

    return customer.interestedAreas.map(area => ({
      label: `${area.areaName} - ${area.buildingName} (Fl.${area.floorNumber})`,
      value: area.areaId,
      areaId: area.areaId,
      buildingName: area.buildingName,
      floorNumber: area.floorNumber
    }));
  });

  // Priority options
  priorityOptions: PriorityOption[] = [
    { label: '🔴 High Priority', value: 'high', icon: '🔴' },
    { label: '🟡 Medium Priority', value: 'medium', icon: '🟡' },
    { label: '⚪ Low Priority', value: 'low', icon: '⚪' }
  ];

  // Tag options
  tagOptions: TagOption[] = [
    { label: 'Cafe', value: 'cafe' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Retail', value: 'retail' },
    { label: 'Fashion', value: 'fashion' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Bookstore', value: 'bookstore' },
    { label: 'Fitness', value: 'fitness' },
    { label: 'Coworking', value: 'coworking' },
    { label: 'Luxury', value: 'luxury' },
    { label: 'Kids', value: 'kids' },
    { label: 'Grocery', value: 'grocery' },
    { label: 'Organic', value: 'organic' },
    { label: 'Health', value: 'health' },
    { label: 'Education', value: 'education' },
    { label: 'Entertainment', value: 'entertainment' }
  ];

  // Validation
  isFormValid = computed(() => {
    return !!(
      this.selectedCustomerId() &&
      this.selectedStageId() &&
      this.dealTitle().trim() &&
      this.dealValue() > 0 &&
      this.actualWinRate() >= 0 &&
      this.actualWinRate() <= 100
    );
  });

  // Check if stage changed
  stageChanged = computed(() => {
    return this.selectedStageId() !== this.originalStageId();
  });

  // Get selected customer
  selectedCustomer = computed(() => {
    const customerId = this.selectedCustomerId();
    if (!customerId) return null;
    return MOCK_CUSTOMERS.find(c => c.id === customerId) || null;
  });

  // Get selected stage
  selectedStage = computed(() => {
    const stageId = this.selectedStageId();
    if (!stageId) return null;
    return this.stages().find(s => s.id === stageId) || null;
  });

  // Get selected area details
  selectedAreaDetails = computed(() => {
    const areaId = this.selectedAreaId();
    if (!areaId) return null;

    const customer = this.selectedCustomer();
    if (!customer || !customer.interestedAreas) return null;

    return customer.interestedAreas.find(a => a.areaId === areaId) || null;
  });

  // Calculate weighted value
  calculatedWeightedValue = computed(() => {
    return (this.dealValue() * this.actualWinRate()) / 100;
  });

  ngOnInit(): void {
    this.loadCustomerOptions();
  }

  // Load customer options
  private loadCustomerOptions(): void {
    const options = MOCK_CUSTOMERS.map(customer => ({
      label: customer.companyName || `${customer.firstName} ${customer.lastName}`,
      value: customer.id,
      customerId: customer.id
    }));
    this.customerOptions.set(options);
  }

  // Open modal with deal data
  open(deal: Deal, stages: PipelineStage[]): void {
    this.stages.set(stages);
    this.currentDeal.set(deal);
    this.loadDealData(deal);
    this.visible.set(true);
  }

  // Load deal data into form
  private loadDealData(deal: Deal): void {
    this.selectedCustomerId.set(deal.customerId);
    this.selectedStageId.set(deal.stageId);
    this.originalStageId.set(deal.stageId); // Save original
    this.dealTitle.set(deal.title);
    this.dealValue.set(deal.value);
    this.actualWinRate.set(deal.actualWinRate);
    this.selectedAreaId.set(deal.areaId || null);
    this.selectedTags.set(deal.tags);
    this.selectedPriority.set(deal.priority);
    this.notes.set(deal.notes);
    this.contactPerson.set(deal.contactPerson);
    this.contactPhone.set(deal.contactPhone);
    this.contactEmail.set(deal.contactEmail);
  }

  // Handle customer change
  onCustomerChange(customerId: string): void {
    this.selectedCustomerId.set(customerId);
    this.selectedAreaId.set(null); // Reset area when customer changes
  }

  // Handle stage change
  onStageChange(stageId: string): void {
    this.selectedStageId.set(stageId);

    // If stage changed, optionally update win rate to new stage's forecast
    // (commented out - user can decide)
    // const stage = this.stages().find(s => s.id === stageId);
    // if (stage) {
    //   this.actualWinRate.set(stage.forecastWinRate);
    // }
  }

  // Handle actual win rate change
  onActualWinRateChange(value: number): void {
    this.actualWinRate.set(Math.min(100, Math.max(0, value)));
  }

  // Handle save
  onSave(): void {
    if (!this.isFormValid()) return;

    const deal = this.currentDeal();
    const customer = this.selectedCustomer();
    const stage = this.selectedStage();
    const areaDetails = this.selectedAreaDetails();

    if (!deal || !customer || !stage) return;

    const editData: EditDealData = {
      dealId: deal.id,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      companyName: customer.companyName,
      stageId: stage.id,
      stageName: stage.name,
      title: this.dealTitle(),
      value: this.dealValue(),
      actualWinRate: this.actualWinRate(),
      areaId: areaDetails?.areaId,
      areaName: areaDetails?.areaName,
      buildingId: areaDetails?.buildingId,
      buildingName: areaDetails?.buildingName,
      floorNumber: areaDetails?.floorNumber,
      tags: this.selectedTags(),
      priority: this.selectedPriority(),
      notes: this.notes(),
      contactPerson: this.contactPerson(),
      contactPhone: this.contactPhone(),
      contactEmail: this.contactEmail(),
      stageChanged: this.stageChanged(),
      originalStageId: this.originalStageId()!
    };

    this.save.emit(editData);
    this.onClose();
  }

  // Handle close
  onClose(): void {
    this.visible.set(false);
    this.currentDeal.set(null);
    this.close.emit();
  }

  // Format currency preview
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }
}
