// deal-detail-modal.component.ts (UPDATED WITH STAGE NAVIGATION)
import { Component, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';
import { Deal, PipelineStage } from '@core/models/pipeline.model';
import { DateTime } from 'luxon';

export interface DealDetailAction {
  type: 'edit' | 'delete' | 'won' | 'lost' | 'add-note' | 'change-stage';
  dealId: string;
  data?: any;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

@Component({
  selector: 'app-deal-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    Textarea,
    InputText
  ],
  templateUrl: './deal-detail-modal.component.html',
  styleUrl: './deal-detail-modal.component.css'
})
export class DealDetailModalComponent {
  // State
  visible = signal(false);
  deal = signal<Deal | null>(null);
  stages = signal<PipelineStage[]>([]);
  activeTab = signal(0);

  // New note state
  newNote = signal('');

  // Outputs
  close = output<void>();
  action = output<DealDetailAction>();

  // Computed
  currentStage = computed(() => {
    const deal = this.deal();
    const stages = this.stages();
    if (!deal) return null;
    return stages.find(s => s.id === deal.stageId) || null;
  });

  currentStageIndex = computed(() => {
    const deal = this.deal();
    const stages = this.stages();
    if (!deal) return -1;
    return stages.findIndex(s => s.id === deal.stageId);
  });

  canMoveToPreviousStage = computed(() => {
    return this.currentStageIndex() > 0;
  });

  canMoveToNextStage = computed(() => {
    const index = this.currentStageIndex();
    const stages = this.stages();
    return index >= 0 && index < stages.length - 1;
  });

  previousStage = computed(() => {
    const index = this.currentStageIndex();
    const stages = this.stages();
    if (index > 0) {
      return stages[index - 1];
    }
    return null;
  });

  nextStage = computed(() => {
    const index = this.currentStageIndex();
    const stages = this.stages();
    if (index >= 0 && index < stages.length - 1) {
      return stages[index + 1];
    }
    return null;
  });

  // Mock activities
  activities = computed<ActivityItem[]>(() => {
    const deal = this.deal();
    if (!deal) return [];

    return [
      {
        id: '1',
        type: 'stage_change',
        description: `Moved to ${deal.stageName}`,
        timestamp: deal.movedToStageAt,
        user: deal.ownerName
      },
      {
        id: '2',
        type: 'note',
        description: deal.notes || 'Initial contact established',
        timestamp: deal.createdAt,
        user: deal.ownerName
      },
      {
        id: '3',
        type: 'created',
        description: 'Deal created',
        timestamp: deal.createdAt,
        user: deal.ownerName
      }
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  // Open modal
  open(deal: Deal, stages: PipelineStage[]): void {
    this.deal.set(deal);
    this.stages.set(stages);
    this.activeTab.set(0);
    this.newNote.set('');
    this.visible.set(true);
  }

  // Handle edit
  onEdit(): void {
    const deal = this.deal();
    if (!deal) return;

    this.action.emit({ type: 'edit', dealId: deal.id });
    this.onClose();
  }

  // Handle delete
  onDelete(): void {
    const deal = this.deal();
    if (!deal) return;

    if (confirm(`Delete deal "${deal.title}"? This cannot be undone.`)) {
      this.action.emit({ type: 'delete', dealId: deal.id });
      this.onClose();
    }
  }

  // Handle move to previous stage
  onMoveToPreviousStage(): void {
    const deal = this.deal();
    const prevStage = this.previousStage();
    if (!deal || !prevStage) return;

    if (confirm(`Move "${deal.title}" to ${prevStage.name}?`)) {
      this.action.emit({
        type: 'change-stage',
        dealId: deal.id,
        data: { toStageId: prevStage.id }
      });
      this.onClose();
    }
  }

  // Handle move to next stage
  onMoveToNextStage(): void {
    const deal = this.deal();
    const nextStage = this.nextStage();
    if (!deal || !nextStage) return;

    if (confirm(`Move "${deal.title}" to ${nextStage.name}?`)) {
      this.action.emit({
        type: 'change-stage',
        dealId: deal.id,
        data: { toStageId: nextStage.id }
      });
      this.onClose();
    }
  }

  // Handle mark as won
  onMarkWon(): void {
    const deal = this.deal();
    if (!deal) return;

    if (confirm(`Mark deal "${deal.title}" as WON?`)) {
      this.action.emit({ type: 'won', dealId: deal.id });
      this.onClose();
    }
  }

  // Handle mark as lost
  onMarkLost(): void {
    const deal = this.deal();
    if (!deal) return;

    if (confirm(`Mark deal "${deal.title}" as LOST?`)) {
      this.action.emit({ type: 'lost', dealId: deal.id });
      this.onClose();
    }
  }

  // Handle add note
  onAddNote(): void {
    const deal = this.deal();
    const note = this.newNote().trim();
    if (!deal || !note) return;

    this.action.emit({
      type: 'add-note',
      dealId: deal.id,
      data: { note }
    });

    this.newNote.set('');
  }

  // Handle close
  onClose(): void {
    this.visible.set(false);
    this.deal.set(null);
    this.close.emit();
  }

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${value.toLocaleString()}`;
  }

  // Format date
  formatDate(isoDate: string): string {
    return DateTime.fromISO(isoDate).toFormat('dd MMM yyyy');
  }

  // Format time ago
  formatTimeAgo(isoDate: string): string {
    const date = DateTime.fromISO(isoDate);
    const now = DateTime.now();
    const diff = now.diff(date, ['days', 'hours', 'minutes']);

    if (diff.days >= 1) {
      return `${Math.floor(diff.days)} days ago`;
    } else if (diff.hours >= 1) {
      return `${Math.floor(diff.hours)} hours ago`;
    } else {
      return `${Math.floor(diff.minutes)} minutes ago`;
    }
  }

  // Get activity icon
  getActivityIcon(type: string): string {
    switch (type) {
      case 'created': return '✨';
      case 'stage_change': return '🔄';
      case 'note': return '📝';
      case 'email': return '📧';
      case 'call': return '📞';
      case 'meeting': return '🤝';
      default: return '📌';
    }
  }

  // Get priority badge
  getPriorityBadge(priority: string): string {
    switch (priority) {
      case 'high': return '🔴 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '⚪ Low';
      default: return priority;
    }
  }

  // Get due status
  getDueStatus(daysUntilDue: number): { label: string; class: string } {
    if (daysUntilDue < 0) {
      return { label: `${Math.abs(daysUntilDue)} days overdue`, class: 'overdue' };
    } else if (daysUntilDue === 0) {
      return { label: 'Due today', class: 'warning' };
    } else if (daysUntilDue <= 2) {
      return { label: `Due in ${daysUntilDue} days`, class: 'warning' };
    } else {
      return { label: `Due in ${daysUntilDue} days`, class: 'normal' };
    }
  }
}
