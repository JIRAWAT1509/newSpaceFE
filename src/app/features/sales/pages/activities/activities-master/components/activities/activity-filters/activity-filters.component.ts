// activity-filters.component.ts
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity, ActivityStatus } from '@core/data/activities.mock';
import { User } from '@core/data/users.mock';

export interface ActivityFilters {
  types: string[];      // 'assignment', 'personal', 'assigned-by-me'
  statuses: string[];   // 'pending', 'in-progress', 'finished', 'returned', 'canceled', 'overdue'
}

interface FilterCount {
  all: number;
  assignment: number;
  personal: number;
  assignedByMe: number;
  pending: number;
  inProgress: number;
  finished: number;
  returned: number;
  canceled: number;
  overdue: number;
}

@Component({
  selector: 'app-activity-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-filters.component.html',
  styleUrl: './activity-filters.component.css'
})
export class ActivityFiltersComponent {

  // ==================== INPUTS ====================
  @Input() activities: Activity[] = [];
  @Input() currentUser!: User;

  // ==================== OUTPUTS ====================
  @Output() filtersChange = new EventEmitter<ActivityFilters>();

  // ==================== SIGNALS ====================
  selectedTypes = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  showTypeDropdown = signal<boolean>(false);
  showStatusDropdown = signal<boolean>(false);

  // ==================== COMPUTED ====================

  // Calculate counts for each filter
  filterCounts = computed(() => {
    const counts: FilterCount = {
      all: this.activities.length,
      assignment: 0,
      personal: 0,
      assignedByMe: 0,
      pending: 0,
      inProgress: 0,
      finished: 0,
      returned: 0,
      canceled: 0,
      overdue: 0
    };

    const now = new Date().toISOString();

    this.activities.forEach(activity => {
      // Type counts
      if (activity.type === 'assignment') {
        counts.assignment++;

        // Check if assigned by current user
        if (activity.createdBy === this.currentUser?.id) {
          counts.assignedByMe++;
        }
      } else {
        counts.personal++;
      }

      // Status counts
      switch (activity.status) {
        case 'pending':
          counts.pending++;
          break;
        case 'in-progress':
          counts.inProgress++;
          break;
        case 'finished':
          counts.finished++;
          break;
        case 'returned':
          counts.returned++;
          break;
        case 'canceled':
          counts.canceled++;
          break;
      }

      // Overdue count (not finished/canceled and past end date)
      if (activity.status !== 'finished' && activity.status !== 'canceled') {
        if (activity.endDate < now) {
          counts.overdue++;
        }
      }
    });

    return counts;
  });

  // Active filter display text
  activeFiltersText = computed(() => {
    const types = this.selectedTypes();
    const statuses = this.selectedStatuses();

    if (types.length === 0 && statuses.length === 0) {
      return `ทั้งหมด (${this.filterCounts().all})`;
    }

    const parts: string[] = [];

    if (types.length > 0) {
      const typeNames = types.map(t => this.getTypeDisplayName(t));
      parts.push(typeNames.join(', '));
    }

    if (statuses.length > 0) {
      const statusNames = statuses.map(s => this.getStatusDisplayName(s));
      parts.push(statusNames.join(', '));
    }

    return parts.join(' • ');
  });

  // ==================== EVENT HANDLERS ====================

  toggleTypeFilter(type: string): void {
    const current = this.selectedTypes();

    if (current.includes(type)) {
      this.selectedTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedTypes.set([...current, type]);
    }

    this.emitFilters();
  }

  toggleStatusFilter(status: string): void {
    const current = this.selectedStatuses();

    if (current.includes(status)) {
      this.selectedStatuses.set(current.filter(s => s !== status));
    } else {
      this.selectedStatuses.set([...current, status]);
    }

    this.emitFilters();
  }

  clearAllFilters(): void {
    this.selectedTypes.set([]);
    this.selectedStatuses.set([]);
    this.emitFilters();
  }

  toggleTypeDropdown(): void {
    this.showTypeDropdown.update(v => !v);
    if (this.showTypeDropdown()) {
      this.showStatusDropdown.set(false);
    }
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown.update(v => !v);
    if (this.showStatusDropdown()) {
      this.showTypeDropdown.set(false);
    }
  }

  closeDropdowns(): void {
    this.showTypeDropdown.set(false);
    this.showStatusDropdown.set(false);
  }

  emitFilters(): void {
    this.filtersChange.emit({
      types: this.selectedTypes(),
      statuses: this.selectedStatuses()
    });
  }

  // ==================== UTILITY METHODS ====================

  isTypeSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses().includes(status);
  }

  getTypeDisplayName(type: string): string {
    const names: { [key: string]: string } = {
      'assignment': 'Assignment',
      'personal': 'Personal Task',
      'assigned-by-me': 'มอบหมายโดยฉัน'
    };
    return names[type] || type;
  }

  getStatusDisplayName(status: string): string {
    const names: { [key: string]: string } = {
      'pending': 'รอดำเนินการ',
      'in-progress': 'กำลังดำเนินการ',
      'finished': 'เสร็จสิ้น',
      'returned': 'ส่งคืน',
      'canceled': 'ยกเลิก',
      'overdue': 'เลยกำหนด'
    };
    return names[status] || status;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'assignment': 'pi-users',
      'personal': 'pi-user',
      'assigned-by-me': 'pi-send'
    };
    return icons[type] || 'pi-circle';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'pi-clock',
      'in-progress': 'pi-spinner',
      'finished': 'pi-check-circle',
      'returned': 'pi-replay',
      'canceled': 'pi-times-circle',
      'overdue': 'pi-exclamation-triangle'
    };
    return icons[status] || 'pi-circle';
  }
}
