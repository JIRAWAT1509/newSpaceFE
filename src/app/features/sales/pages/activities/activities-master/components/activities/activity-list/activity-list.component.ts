// activity-list.component.ts
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { Activity, ActivityStatus } from '@core/data/activities.mock';
import { User } from '@core/data/users.mock';
interface StatusUpdateEvent {
  id: string;
  status: ActivityStatus;
  reason?: string;
  finishNote?: string;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.css'
})
export class ActivityListComponent {

  // ==================== EXPOSE DateTime TO TEMPLATE ====================
  protected readonly DateTime = DateTime;

  // ==================== INPUTS ====================
  @Input() activities: Activity[] = [];
  @Input() selectedId: string | null = null;
  @Input() currentUser!: User;

  // ==================== OUTPUTS ====================
  @Output() activitySelect = new EventEmitter<string>();
  @Output() activityEdit = new EventEmitter<Activity>();
  @Output() activityDelete = new EventEmitter<string>();
  @Output() statusUpdate = new EventEmitter<StatusUpdateEvent>();

  // ==================== SIGNALS ====================
  expandedId = signal<string | null>(null);
  showStatusDialog = signal<boolean>(false);
  statusDialogType = signal<'cancel' | 'return' | 'finish'>('cancel');
  statusDialogActivityId = signal<string | null>(null);
  statusDialogReason = signal<string>('');

  // ==================== EVENT HANDLERS ====================

  onActivityClick(activityId: string): void {
    // Toggle selection
    this.activitySelect.emit(activityId);

    // Toggle expand
    if (this.expandedId() === activityId) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(activityId);
    }
  }

  onEdit(activity: Activity, event: Event): void {
    event.stopPropagation();
    this.activityEdit.emit(activity);
  }

  onDelete(activityId: string, event: Event): void {
    event.stopPropagation();
    this.activityDelete.emit(activityId);
  }

  onStatusChange(activityId: string, status: ActivityStatus, event: Event): void {
    event.stopPropagation();

    // If status requires reason, show dialog
    if (status === 'canceled' || status === 'returned') {
      this.statusDialogType.set(status === 'canceled' ? 'cancel' : 'return');
      this.statusDialogActivityId.set(activityId);
      this.showStatusDialog.set(true);
    } else if (status === 'finished') {
      // Check if activity requires finish note/file
      const activity = this.activities.find(a => a.id === activityId);
      if (activity?.finishRequirement && activity.finishRequirement.type !== 'none') {
        this.statusDialogType.set('finish');
        this.statusDialogActivityId.set(activityId);
        this.showStatusDialog.set(true);
      } else {
        // No requirement, just finish
        this.statusUpdate.emit({ id: activityId, status });
      }
    } else {
      // No dialog needed for other statuses
      this.statusUpdate.emit({ id: activityId, status });
    }
  }

  onStatusDialogSubmit(): void {
    const activityId = this.statusDialogActivityId();
    const type = this.statusDialogType();
    const reason = this.statusDialogReason();

    if (!activityId) return;

    if (type === 'cancel') {
      this.statusUpdate.emit({
        id: activityId,
        status: 'canceled',
        reason
      });
    } else if (type === 'return') {
      this.statusUpdate.emit({
        id: activityId,
        status: 'returned',
        reason
      });
    } else if (type === 'finish') {
      this.statusUpdate.emit({
        id: activityId,
        status: 'finished',
        finishNote: reason
      });
    }

    this.closeStatusDialog();
  }

  closeStatusDialog(): void {
    this.showStatusDialog.set(false);
    this.statusDialogReason.set('');
    this.statusDialogActivityId.set(null);
  }

  // ==================== UTILITY METHODS ====================

  // Check if activity is expanded
  isExpanded(activityId: string): boolean {
    return this.expandedId() === activityId;
  }

  // Check if activity is selected
  isSelected(activityId: string): boolean {
    return this.selectedId === activityId;
  }

  // Check if current user is creator
  isCreator(activity: Activity): boolean {
    return activity.createdBy === this.currentUser?.id;
  }

  // Check if current user is assignee
  isAssignee(activity: Activity): boolean {
    return activity.assignedTo?.includes(this.currentUser?.id) || false;
  }

  // Check if user can edit
  canEdit(activity: Activity): boolean {
    return this.isCreator(activity);
  }

  // Check if user can delete
  canDelete(activity: Activity): boolean {
    // Personal tasks: only creator can delete
    // Assignments: only creator can delete
    return this.isCreator(activity);
  }

  // Check if user can update status
  canUpdateStatus(activity: Activity): boolean {
    // Personal: creator only
    if (activity.type === 'personal') {
      return this.isCreator(activity);
    }
    // Assignment: creator or assignee
    return this.isCreator(activity) || this.isAssignee(activity);
  }

  // Get status badge class
  getStatusClass(status: ActivityStatus): string {
    const statusMap: { [key in ActivityStatus]: string } = {
      'pending': 'status-pending',
      'in-progress': 'status-in-progress',
      'finished': 'status-finished',
      'canceled': 'status-canceled',
      'returned': 'status-returned'
    };
    return statusMap[status];
  }

  // Get status display text (Thai)
  getStatusText(status: ActivityStatus): string {
    const statusMap: { [key in ActivityStatus]: string } = {
      'pending': 'รอดำเนินการ',
      'in-progress': 'กำลังดำเนินการ',
      'finished': 'เสร็จสิ้น',
      'canceled': 'ยกเลิก',
      'returned': 'ส่งคืน'
    };
    return statusMap[status];
  }

  // Get type badge class
  getTypeClass(type: string): string {
    return type === 'assignment' ? 'type-assignment' : 'type-personal';
  }

  // Get type display text (Thai)
  getTypeText(type: string): string {
    return type === 'assignment' ? 'Assignment' : 'Personal Task';
  }

  // Format date range
  getDateRangeText(activity: Activity): string {
    const start = DateTime.fromISO(activity.startDate);
    const end = DateTime.fromISO(activity.endDate);

    // Same day
    if (start.hasSame(end, 'day')) {
      return `${start.toFormat('dd MMM yyyy')} (${start.toFormat('HH:mm')} - ${end.toFormat('HH:mm')})`;
    }

    // Multi-day
    return `${start.toFormat('dd MMM yyyy HH:mm')} - ${end.toFormat('dd MMM yyyy HH:mm')}`;
  }

  // Get relative date
  getRelativeDate(dateString: string): string {
    const date = DateTime.fromISO(dateString);
    const now = DateTime.now();
    const diff = now.diff(date, ['days', 'hours']);

    if (diff.days < 0) {
      const absDays = Math.abs(Math.floor(diff.days));
      return absDays === 0 ? 'Today' : `In ${absDays} days`;
    } else if (diff.days < 1) {
      return 'Today';
    } else if (diff.days < 2) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diff.days)} days ago`;
    }
  }

  // Check if overdue
  isOverdue(activity: Activity): boolean {
    if (activity.status === 'finished' || activity.status === 'canceled') {
      return false;
    }

    const endDate = DateTime.fromISO(activity.endDate);
    return endDate < DateTime.now();
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Get file icon class
  getFileIconClass(type: string): string {
    if (type.includes('pdf')) return 'pi-file-pdf';
    if (type.includes('word') || type.includes('document')) return 'pi-file-word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'pi-file-excel';
    if (type.includes('image')) return 'pi-image';
    return 'pi-file';
  }

  // Get assignee display text
  getAssigneeText(activity: Activity): string {
    const assignedCount = activity.assignedTo?.length || 0;
    const roleCount = activity.assignedToRoles?.length || 0;
    const total = assignedCount + roleCount;

    if (total === 0) return 'ไม่มีผู้รับผิดชอบ';
    if (total === 1) return '1 คน';
    return `${total} คน/กลุ่ม`;
  }

  // Get finish requirement text
  getFinishRequirementText(activity: Activity): string {
    if (!activity.finishRequirement) return '';

    const req = activity.finishRequirement;
    if (req.type === 'none') return '';
    if (req.type === 'text') return 'ต้องการบันทึกข้อความ';
    if (req.type === 'file') return 'ต้องการไฟล์แนบ';
    if (req.type === 'both') return 'ต้องการข้อความและไฟล์';
    return '';
  }

  // Truncate text
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
