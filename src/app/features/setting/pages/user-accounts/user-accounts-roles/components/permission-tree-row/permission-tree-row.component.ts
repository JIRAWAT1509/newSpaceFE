// permission-tree-row.component.ts - Recursive tree row component
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Permission } from '@core/models/permission.model';

@Component({
  selector: 'app-permission-tree-row',
  standalone: true,
  imports: [CommonModule, FormsModule, Checkbox],
  templateUrl: './permission-tree-row.component.html',
  styleUrl: './permission-tree-row.component.css'
})
export class PermissionTreeRowComponent {

  // ==================== INPUTS ====================

  @Input() permission!: Permission;
  @Input() level: number = 1;

  // ==================== OUTPUTS ====================

  @Output() enableChange = new EventEmitter<{
    permission: Permission;
    event: any;
  }>();

  @Output() viewOnlyChange = new EventEmitter<{
    permission: Permission;
    event: any;
  }>();

  @Output() toggleExpand = new EventEmitter<Permission>();

  // ==================== METHODS ====================

  /**
   * Handle expand/collapse toggle
   */
  onToggleExpand(): void {
    if (this.hasChildren) {
      this.toggleExpand.emit(this.permission);
    }
  }

  /**
   * Handle enable checkbox change
   */
  onEnableToggle(event: any): void {
    this.enableChange.emit({
      permission: this.permission,
      event: event
    });
  }

  /**
   * Handle view-only checkbox change
   */
  onViewOnlyToggle(event: any): void {
    this.viewOnlyChange.emit({
      permission: this.permission,
      event: event
    });
  }

  /**
   * Propagate child enable change to parent
   */
  onChildEnableChange(event: { permission: Permission; event: any }): void {
    this.enableChange.emit(event);
  }

  /**
   * Propagate child view-only change to parent
   */
  onChildViewOnlyChange(event: { permission: Permission; event: any }): void {
    this.viewOnlyChange.emit(event);
  }

  /**
   * Propagate child expand toggle to parent
   */
  onChildToggleExpand(permission: Permission): void {
    this.toggleExpand.emit(permission);
  }

  // ==================== GETTERS ====================

  /**
   * Check if this node has children
   */
  get hasChildren(): boolean {
    return !!(this.permission.children && this.permission.children.length > 0);
  }

  /**
   * Check if this node is expanded
   */
  get isExpanded(): boolean {
    return this.permission.isExpanded || false;
  }

  /**
   * Get expand/collapse icon
   */
  get expandIcon(): string {
    if (!this.hasChildren) {
      return '';
    }
    return this.isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right';
  }

  /**
   * Get indentation padding based on level
   */
  get indentPadding(): string {
    return `${(this.level - 1) * 24}px`;
  }

  /**
   * Check if node is a leaf (feature)
   */
  get isLeaf(): boolean {
    return this.permission.IsLeaf;
  }

  /**
   * Check if enable is checked
   */
  get isEnableChecked(): boolean {
    return this.permission.isEnabled || false;
  }

  /**
   * Check if view-only is checked
   */
  get isViewOnlyChecked(): boolean {
    return this.permission.isViewOnly || false;
  }

  /**
   * Check if view-only should be disabled
   */
  get isViewOnlyDisabled(): boolean {
    // View-only is only enabled when Enable is checked
    return !this.isEnableChecked;
  }

  /**
   * Check if node has indeterminate state
   */
  get isIndeterminate(): boolean {
    return this.permission.isIndeterminate || false;
  }

  /**
   * Get row CSS classes
   */
  get rowClasses(): string {
    const classes: string[] = ['tree-row'];

    if (this.isLeaf) {
      classes.push('is-leaf');
    } else {
      classes.push('is-parent');
    }

    if (this.isExpanded) {
      classes.push('is-expanded');
    }

    if (this.level === 1) {
      classes.push('level-1');
    } else if (this.level === 2) {
      classes.push('level-2');
    } else if (this.level === 3) {
      classes.push('level-3');
    } else {
      classes.push('level-deep');
    }

    return classes.join(' ');
  }

  /**
   * Get menu name CSS classes
   */
  get nameClasses(): string {
    const classes: string[] = ['menu-name'];

    if (!this.isLeaf) {
      classes.push('is-group');
    }

    return classes.join(' ');
  }
}
