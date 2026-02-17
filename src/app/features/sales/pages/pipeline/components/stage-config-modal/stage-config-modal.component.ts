// stage-config-modal.component.ts (UPDATED - LOCK DELETE IF STAGE HAS DEALS)
import { Component, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ColorPicker } from 'primeng/colorpicker';
import { Button } from 'primeng/button';
import { PipelineStage } from '@core/models/pipeline.model';

export interface StageConfigData {
  stages: PipelineStage[];
}

@Component({
  selector: 'app-stage-config-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    InputNumber,
    ColorPicker,
    Button
  ],
  templateUrl: './stage-config-modal.component.html',
  styleUrl: './stage-config-modal.component.css'
})
export class StageConfigModalComponent {
  // State
  visible = signal(false);
  stages = signal<PipelineStage[]>([]);
  dealsByStage = signal<Map<string, number>>(new Map()); // stageId -> deal count
  draggedStageIndex = signal<number | null>(null);

  // Outputs
  close = output<void>();
  save = output<StageConfigData>();

  // Computed: Can add more stages (max 7)
  canAddStage = computed(() => this.stages().length < 7);

  // Computed: Can delete stages (min 5)
  canDeleteStage = computed(() => this.stages().length > 5);

  // Validation
  isFormValid = computed(() => {
    const stages = this.stages();
    if (stages.length < 5 || stages.length > 7) return false;

    // Check all stages have name and valid values
    return stages.every(s =>
      s.name.trim().length > 0 &&
      s.forecastWinRate >= 0 &&
      s.forecastWinRate <= 100 &&
      s.defaultDueDays > 0
    );
  });

  // Check if specific stage can be deleted (has no deals)
  canDeleteSpecificStage(stageId: string): boolean {
    if (!this.canDeleteStage()) return false;

    const dealCount = this.dealsByStage().get(stageId) || 0;
    return dealCount === 0;
  }

  // Get deal count for a stage
  getDealCount(stageId: string): number {
    return this.dealsByStage().get(stageId) || 0;
  }

  // Open modal
  open(currentStages: PipelineStage[], dealsByStageMap?: Map<string, number>): void {
    // Clone stages to avoid mutating original
    this.stages.set(currentStages.map(s => ({ ...s })));

    // Set deal counts
    if (dealsByStageMap) {
      this.dealsByStage.set(new Map(dealsByStageMap));
    }

    this.visible.set(true);
  }

  // Update stage field
  updateStage(index: number, field: keyof PipelineStage, value: any): void {
    this.stages.update(stages => {
      const updated = [...stages];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // Add new stage
  addStage(): void {
    if (!this.canAddStage()) return;

    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      color: '#9ca3af',
      forecastWinRate: 50,
      defaultDueDays: 7,
      order: this.stages().length
    };

    this.stages.update(stages => [...stages, newStage]);
  }

  // Delete stage
  deleteStage(index: number): void {
    if (!this.canDeleteStage()) return;

    const stage = this.stages()[index];

    // Check if stage has deals
    if (!this.canDeleteSpecificStage(stage.id)) {
      const dealCount = this.getDealCount(stage.id);
      alert(`Cannot delete "${stage.name}" - it has ${dealCount} deal${dealCount > 1 ? 's' : ''} in it. Move or delete the deals first.`);
      return;
    }

    if (!confirm(`Delete stage "${stage.name}"? This action cannot be undone.`)) {
      return;
    }

    this.stages.update(stages => {
      const updated = stages.filter((_, i) => i !== index);
      // Re-order
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  }

  // Drag & drop handlers
  onDragStart(index: number): void {
    this.draggedStageIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(dropIndex: number): void {
    const dragIndex = this.draggedStageIndex();
    if (dragIndex === null || dragIndex === dropIndex) return;

    this.stages.update(stages => {
      const updated = [...stages];
      const [draggedStage] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, draggedStage);
      // Re-order
      return updated.map((s, i) => ({ ...s, order: i }));
    });

    this.draggedStageIndex.set(null);
  }

  onDragEnd(): void {
    this.draggedStageIndex.set(null);
  }

  // Move stage up/down
  moveStageUp(index: number): void {
    if (index === 0) return;

    this.stages.update(stages => {
      const updated = [...stages];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      // Re-order
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  }

  moveStageDown(index: number): void {
    if (index === this.stages().length - 1) return;

    this.stages.update(stages => {
      const updated = [...stages];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      // Re-order
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  }

  // Handle save
  onSave(): void {
    if (!this.isFormValid()) return;

    this.save.emit({ stages: this.stages() });
    this.onClose();
  }

  // Handle close
  onClose(): void {
    this.visible.set(false);
    this.close.emit();
  }
}
