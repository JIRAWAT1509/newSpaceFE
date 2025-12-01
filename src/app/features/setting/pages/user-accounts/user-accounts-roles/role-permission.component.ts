// role-permission.component.ts - Main component for role and permission management
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tabs } from 'primeng/tabs';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import {
  Permission,
  Role,
  MenuTab,
  PermissionTemplate,
  PermissionSummary,
  BulkActionType,
  MENU_TABS
} from '@core/models/permission.model';
import { RolePermissionService } from '@core/services/role-permission.service';
import { PermissionTreeRowComponent } from './components/permission-tree-row/permission-tree-row.component';

@Component({
  selector: 'app-role-permission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    Button,
    InputText,
    // Tabs,
    Dialog,
    Message,
    // Tooltip,
    PermissionTreeRowComponent
  ],
  templateUrl: './role-permission.component.html',
  styleUrl: './role-permission.component.css'
})
export class RolePermissionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ==================== DATA ====================

  // Roles
  roles: Role[] = [];
  selectedRole: string = '';

  // Permissions (tree structure)
  permissionTree: Permission[] = [];
  originalPermissions: Permission[] = []; // For cancel/reset

  // Tabs
  tabs: MenuTab[] = [];
  activeTabIndex: number = 0;

  // Templates
  templates: PermissionTemplate[] = [];

  // ==================== UI STATE ====================

  isLoading: boolean = false;
  isSaving: boolean = false;
  hasChanges: boolean = false;

  // Search & Filter
  searchQuery: string = '';
  filteredTree: Permission[] = [];

  // Modals
  showCopyModal: boolean = false;
  showTemplateModal: boolean = false;
  showDiscardModal: boolean = false;
  copyFromRole: string = '';
  selectedTemplate: string = '';

  // Statistics
  summary: PermissionSummary = {
    totalMenus: 0,
    totalFeatures: 0,
    enabledMenus: 0,
    enabledFeatures: 0,
    viewOnlyFeatures: 0,
    fullAccessFeatures: 0
  };

  // Messages
  successMessage: string = '';
  errorMessage: string = '';

  // ==================== CONSTRUCTOR ====================

  constructor(private rolePermissionService: RolePermissionService) {
    // Setup search debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.applySearchFilter(query);
      });
  }

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.loadRoles();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== LOAD DATA ====================

  /**
   * Load all available roles
   */
  loadRoles(): void {
    this.isLoading = true;

    this.rolePermissionService.getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.roles = response.data;

          // Auto-select first role if available
          if (this.roles.length > 0 && !this.selectedRole) {
            this.selectedRole = this.roles[0].USER_GROUP;
            this.loadPermissions();
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.showError('Failed to load roles');
          this.isLoading = false;
        }
      });
  }

  /**
   * Load permissions for selected role
   */
  loadPermissions(): void {
    if (!this.selectedRole) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.rolePermissionService.getPermissions({
      USER_GROUP: this.selectedRole
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Calculate access mode for each permission
          const processedPermissions = response.data.map(p => {
            const mode = this.rolePermissionService.calculateAccessMode(p);
            return {
              ...p,
              isEnabled: mode.isEnabled,
              isViewOnly: mode.isViewOnly
            };
          });

          // Build tree structure
          this.permissionTree = this.rolePermissionService.buildTree(processedPermissions);

          // Update indeterminate states
          this.permissionTree = this.rolePermissionService.updateIndeterminateStates(
            this.permissionTree
          );

          // Store original for cancel
          this.originalPermissions = JSON.parse(JSON.stringify(this.permissionTree));

          // Build tabs with permissions
          this.buildTabs();

          // Apply current search if any
          if (this.searchQuery) {
            this.applySearchFilter(this.searchQuery);
          } else {
            this.filteredTree = [...this.permissionTree];
          }

          // Calculate summary
          this.updateSummary();

          this.hasChanges = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading permissions:', error);
          this.showError('Failed to load permissions');
          this.isLoading = false;
        }
      });
  }

  /**
   * Load permission templates
   */
  loadTemplates(): void {
    this.templates = this.rolePermissionService.getTemplates();
  }

  /**
   * Build tabs from permission tree
   */
  buildTabs(): void {
    this.tabs = MENU_TABS.map(tabConfig => ({
      ...tabConfig,
      items: this.permissionTree.filter(item =>
        item.MENU_ID.startsWith(tabConfig.menuPrefix)
      )
    }));
  }

  // ==================== ROLE SELECTION ====================

  /**
   * Handle role selection change
   */
  onRoleChange(): void {
    if (this.hasChanges) {
      this.showDiscardModal = true;
    } else {
      this.loadPermissions();
    }
  }

  /**
   * Confirm discard changes and load new role
   */
  confirmDiscardChanges(): void {
    this.showDiscardModal = false;
    this.hasChanges = false;
    this.loadPermissions();
  }

  /**
   * Cancel discard and revert role selection
   */
  cancelDiscardChanges(): void {
    // Revert to previous role selection
    const previousRole = this.roles.find(r =>
      JSON.stringify(this.originalPermissions).includes(r.USER_GROUP)
    );
    if (previousRole) {
      this.selectedRole = previousRole.USER_GROUP;
    }
    this.showDiscardModal = false;
  }

  // ==================== PERMISSION CHANGES ====================

  /**
   * Handle enable toggle change
   */
  onEnableChange(permission: Permission, event: any): void {
    const enable = event.checked || event.target?.checked || false;

    // Update permission and children
    const updated = this.rolePermissionService.updatePermissionWithChildren(
      permission,
      enable,
      permission.isViewOnly || false,
      true
    );

    // Update in tree
    this.updatePermissionInTree(updated);

    // Mark as changed
    this.hasChanges = true;
    this.updateSummary();
  }

  /**
   * Handle view-only toggle change
   */
  onViewOnlyChange(permission: Permission, event: any): void {
    const viewOnly = event.checked || event.target?.checked || false;

    // Update permission and children
    const updated = this.rolePermissionService.updatePermissionWithChildren(
      permission,
      permission.isEnabled || false,
      viewOnly,
      true
    );

    // Update in tree
    this.updatePermissionInTree(updated);

    // Mark as changed
    this.hasChanges = true;
    this.updateSummary();
  }

  /**
   * Update permission in tree (recursive)
   */
  private updatePermissionInTree(updated: Permission): void {
    const updateInArray = (items: Permission[]): Permission[] => {
      return items.map(item => {
        if (item.MENU_ID === updated.MENU_ID) {
          return updated;
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateInArray(item.children)
          };
        }
        return item;
      });
    };

    this.permissionTree = updateInArray(this.permissionTree);
    this.permissionTree = this.rolePermissionService.updateIndeterminateStates(
      this.permissionTree
    );

    // Update filtered tree if search is active
    if (this.searchQuery) {
      this.applySearchFilter(this.searchQuery);
    } else {
      this.filteredTree = [...this.permissionTree];
    }

    // Rebuild tabs
    this.buildTabs();
  }

  // ==================== EXPAND/COLLAPSE ====================

  /**
   * Toggle node expansion
   */
  toggleExpand(permission: Permission): void {
    permission.isExpanded = !permission.isExpanded;
    this.updatePermissionInTree(permission);
  }

  /**
   * Expand all nodes
   */
  expandAll(): void {
    this.permissionTree = this.rolePermissionService.expandAll(this.permissionTree);
    this.filteredTree = [...this.permissionTree];
    this.buildTabs();
  }

  /**
   * Collapse all nodes
   */
  collapseAll(): void {
    this.permissionTree = this.rolePermissionService.collapseAll(this.permissionTree);
    this.filteredTree = [...this.permissionTree];
    this.buildTabs();
  }

  // ==================== SEARCH & FILTER ====================

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  /**
   * Apply search filter
   */
  private applySearchFilter(query: string): void {
    if (!query || query.trim() === '') {
      this.filteredTree = [...this.permissionTree];
    } else {
      this.filteredTree = this.rolePermissionService.filterTree(
        this.permissionTree,
        query,
        undefined
      );
    }

    // Rebuild tabs with filtered data
    this.buildTabs();
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.applySearchFilter('');
  }

  // ==================== BULK ACTIONS ====================

  /**
   * Enable all permissions in current tab
   */
  enableAllInTab(): void {
    const currentTab = this.tabs[this.activeTabIndex];
    if (!currentTab) return;

    currentTab.items = this.rolePermissionService.enableAll(currentTab.items, false);
    this.syncTabChangesToTree();
    this.hasChanges = true;
    this.updateSummary();
  }

  /**
   * Set all to view-only in current tab
   */
  setViewOnlyInTab(): void {
    const currentTab = this.tabs[this.activeTabIndex];
    if (!currentTab) return;

    currentTab.items = this.rolePermissionService.enableAll(currentTab.items, true);
    this.syncTabChangesToTree();
    this.hasChanges = true;
    this.updateSummary();
  }

  /**
   * Disable all permissions in current tab
   */
  disableAllInTab(): void {
    const currentTab = this.tabs[this.activeTabIndex];
    if (!currentTab) return;

    currentTab.items = this.rolePermissionService.disableAll(currentTab.items);
    this.syncTabChangesToTree();
    this.hasChanges = true;
    this.updateSummary();
  }

  /**
   * Sync tab changes back to main tree
   */
  private syncTabChangesToTree(): void {
    // Flatten all tabs back to tree
    const allItems = this.tabs.flatMap(tab => tab.items);
    this.permissionTree = allItems;
    this.permissionTree = this.rolePermissionService.updateIndeterminateStates(
      this.permissionTree
    );
    this.filteredTree = [...this.permissionTree];
  }

  // ==================== TEMPLATES ====================

  /**
   * Open template selection modal
   */
  openTemplateModal(): void {
    this.selectedTemplate = '';
    this.showTemplateModal = true;
  }

  /**
   * Apply selected template
   */
  applyTemplate(): void {
    if (!this.selectedTemplate) return;

    const template = this.templates.find(t => t.id === this.selectedTemplate);
    if (!template) return;

    // Flatten tree to apply template
    const flatPermissions = this.rolePermissionService.flattenTree(this.permissionTree);

    // Apply template
    const updatedPermissions = this.rolePermissionService.applyTemplate(
      flatPermissions,
      template
    );

    // Rebuild tree
    this.permissionTree = this.rolePermissionService.buildTree(updatedPermissions);
    this.permissionTree = this.rolePermissionService.updateIndeterminateStates(
      this.permissionTree
    );
    this.filteredTree = [...this.permissionTree];
    this.buildTabs();

    this.hasChanges = true;
    this.updateSummary();
    this.showTemplateModal = false;
    this.showSuccess(`Template "${template.name}" applied successfully`);
  }

  // ==================== COPY FROM ROLE ====================

  /**
   * Open copy from role modal
   */
  openCopyModal(): void {
    this.copyFromRole = '';
    this.showCopyModal = true;
  }

  /**
   * Copy permissions from another role
   */
  copyFromOtherRole(): void {
    if (!this.copyFromRole || this.copyFromRole === this.selectedRole) {
      this.showError('Please select a different role');
      return;
    }

    this.isLoading = true;

    this.rolePermissionService.copyPermissions({
      fromRole: this.copyFromRole,
      toRole: this.selectedRole
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showCopyModal = false;
          this.loadPermissions();
          this.showSuccess('Permissions copied successfully');
        },
        error: (error) => {
          console.error('Error copying permissions:', error);
          this.showError('Failed to copy permissions');
          this.isLoading = false;
        }
      });
  }

  // ==================== SAVE & CANCEL ====================

  /**
   * Save permissions
   */
  savePermissions(): void {
    if (!this.selectedRole) {
      this.showError('Please select a role');
      return;
    }

    // Flatten tree to save
    const flatPermissions = this.rolePermissionService.flattenTree(this.permissionTree);

    // Validate
    const validation = this.rolePermissionService.validatePermissions(flatPermissions);
    if (!validation.valid) {
      this.showError('Validation failed: ' + validation.errors.join(', '));
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    this.rolePermissionService.savePermissions({
      USER_GROUP: this.selectedRole,
      permissions: flatPermissions
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.hasChanges = false;
          this.originalPermissions = JSON.parse(JSON.stringify(this.permissionTree));
          this.isSaving = false;
          this.showSuccess('Permissions saved successfully');
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          this.showError('Failed to save permissions');
          this.isSaving = false;
        }
      });
  }

  /**
   * Cancel changes and revert to original
   */
  cancelChanges(): void {
    this.permissionTree = JSON.parse(JSON.stringify(this.originalPermissions));
    this.filteredTree = [...this.permissionTree];
    this.buildTabs();
    this.hasChanges = false;
    this.updateSummary();
    this.clearMessages();
    this.showSuccess('Changes discarded');
  }

  // ==================== STATISTICS ====================

  /**
   * Update summary statistics
   */
  private updateSummary(): void {
    const flatPermissions = this.rolePermissionService.flattenTree(this.permissionTree);
    this.summary = this.rolePermissionService.calculateSummary(flatPermissions);
  }

  // ==================== MESSAGES ====================

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ==================== GETTERS ====================

  get currentTab(): MenuTab | undefined {
    return this.tabs[this.activeTabIndex];
  }

  get currentTabItems(): Permission[] {
    return this.currentTab?.items || [];
  }

  get roleOptions() {
    return this.roles.map(role => ({
      label: role.GROUP_NAME,
      value: role.USER_GROUP
    }));
  }

  get templateOptions() {
    return this.templates.map(template => ({
      label: template.name,
      value: template.id,
      icon: template.icon
    }));
  }

  get copyRoleOptions() {
    return this.roles
      .filter(role => role.USER_GROUP !== this.selectedRole)
      .map(role => ({
        label: role.GROUP_NAME,
        value: role.USER_GROUP
      }));
  }

  get hasPermissions(): boolean {
    return this.permissionTree.length > 0;
  }

  get isSearchActive(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  /**
   * Get role label by value
   */
  getRoleLabel(value: string): string {
    const role = this.roles.find(r => r.USER_GROUP === value);
    return role ? role.GROUP_NAME : value;
  }
}
