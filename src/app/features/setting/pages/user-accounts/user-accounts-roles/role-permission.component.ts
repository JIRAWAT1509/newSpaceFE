// role-permission.component.ts - Main component for role and permission management
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import {
  Permission,
  Role,
  MenuTab,
  PermissionTemplate,
  PermissionSummary,
  MENU_TABS
} from '@core/models/permission.model';
import { RolePermissionService } from '@core/services/role-permission.service';
import { RoleService } from '@core/services/role.service';
import { PermissionTreeRowComponent } from './components/permission-tree-row/permission-tree-row.component';
import { RoleDrawerComponent } from './components/role-drawer/role-drawer.component';

@Component({
  selector: 'app-role-permission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    Button,
    InputText,
    Dialog,
    Message,
    Tooltip,
    ConfirmDialogModule,
    Checkbox,
    PermissionTreeRowComponent,
    RoleDrawerComponent,
  ],
  templateUrl: './role-permission.component.html',
  styleUrl: './role-permission.component.css',
  providers: [ConfirmationService],
})
export class RolePermissionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  @ViewChild('permissionSection') permissionSectionRef?: ElementRef<HTMLElement>;

  // ==================== DATA ====================

  roles: Role[] = [];
  selectedRole: string = '';
  /** ค่าใน dropdown (sync กับ selectedRole; ใช้ revert ตอนยกเลิก discard) */
  selectedRoleDropdown: string = '';

  permissionTree: Permission[] = [];
  originalPermissions: Permission[] = [];

  tabs: MenuTab[] = [];
  activeTabIndex: number = 0;

  templates: PermissionTemplate[] = [];

  // ==================== UI STATE ====================

  isLoading: boolean = false;
  isLoadingRoles: boolean = false;
  isSaving: boolean = false;
  hasChanges: boolean = false;

  searchQuery: string = '';
  filteredTree: Permission[] = [];

  showCopyModal: boolean = false;
  showTemplateModal: boolean = false;
  showDiscardModal: boolean = false;
  copyFromRole: string = '';
  selectedTemplate: string = '';
  /** role ที่จะสลับไปเมื่อกด Discard (จาก dropdown หรือคลิกแถว) */
  pendingRoleSelection: string = '';

  /** ตามสเก็ตช์ Assign Permission: Copy from standard role (inline ในส่วน Permission) */
  useCopyFromStandardRole = false;
  copyFromRoleInline: string = '';
  isCopyingPermissions = false;

  showRoleDrawer = false;
  roleDrawerMode: 'create' | 'edit' = 'create';
  roleDrawerRole: Role | null = null;

  /** โมดัล Assign Permission ตามสเก็ต (Role name + Permission + Copy from standard role + แท็บ + Save) */
  showAssignPermissionModal = false;
  /** ชื่อ role ที่แก้ได้ในโมดัล Assign Permission */
  assignPermissionRoleName = '';
  /** เลือกเทมเพลตในโมดัล Assign Permission (ใช้ร่วมกับ Apply Template) */
  templateChoiceInAssignModal = '';

  copyRoleOverlayOptions = { baseZIndex: 99999 };

  summary: PermissionSummary = {
    totalMenus: 0,
    totalFeatures: 0,
    enabledMenus: 0,
    enabledFeatures: 0,
    viewOnlyFeatures: 0,
    fullAccessFeatures: 0
  };

  successMessage: string = '';
  errorMessage: string = '';

  /** แผงกำหนดสิทธิ์ (Select Role + Permission) ย่อ/ขยาย ได้ — เริ่มต้นย่อไว้ */
  permissionPanelExpanded = false;

  constructor(
    private rolePermissionService: RolePermissionService,
    private roleService: RoleService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(query => this.applySearchFilter(query));
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * โหลดรายการ role จาก RoleService (ตาราง + dropdown)
   */
  loadRoles(): void {
    this.isLoadingRoles = true;
    this.roleService.getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.roles = data;
          if (this.roles.length > 0 && !this.selectedRole) {
            this.selectedRole = this.roles[0].USER_GROUP;
            this.selectedRoleDropdown = this.selectedRole;
            this.loadPermissions();
          }
          this.isLoadingRoles = false;
        },
        error: (err) => {
          console.error('Error loading roles:', err);
          this.showError('โหลดรายการ role ไม่สำเร็จ');
          this.isLoadingRoles = false;
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
          this.selectedRoleDropdown = this.selectedRole;
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
   * เมื่อเปลี่ยน role จาก dropdown (p-select ส่ง value มา)
   */
  onRoleChange(ev: { value?: string } | string): void {
    const newValue = (typeof ev === 'object' && ev && ev.value !== undefined ? ev.value : (typeof ev === 'string' ? ev : this.selectedRoleDropdown)) ?? this.selectedRoleDropdown;
    if (this.hasChanges) {
      this.pendingRoleSelection = newValue;
      this.showDiscardModal = true;
    } else {
      this.selectedRole = newValue;
      this.selectedRoleDropdown = newValue;
      this.loadPermissions();
    }
  }

  confirmDiscardChanges(): void {
    this.showDiscardModal = false;
    this.hasChanges = false;
    if (this.pendingRoleSelection) {
      this.selectedRole = this.pendingRoleSelection;
      this.selectedRoleDropdown = this.selectedRole;
      this.pendingRoleSelection = '';
    }
    this.loadPermissions();
  }

  cancelDiscardChanges(): void {
    this.selectedRoleDropdown = this.selectedRole;
    this.pendingRoleSelection = '';
    this.showDiscardModal = false;
  }

  closeRoleDrawer(): void {
    this.showRoleDrawer = false;
    this.roleDrawerRole = null;
  }

  onRoleDrawerSaved(role: Role): void {
    const idx = this.roles.findIndex((r) => r.USER_GROUP === role.USER_GROUP);
    if (idx >= 0) {
      this.roles[idx] = { ...this.roles[idx], ...role };
    } else {
      this.roles = [...this.roles, role];
    }
    this.showSuccess(this.roleDrawerMode === 'create' ? 'สร้าง role แล้ว' : 'อัปเดต role แล้ว');
    this.closeRoleDrawer();
    // หลังสร้าง role ใหม่ ให้เลือก role นั้นและโหลดสิทธิ (พร้อมกด Assign Permission ได้ทันที)
    if (this.roleDrawerMode === 'create') {
      this.selectedRole = role.USER_GROUP;
      this.selectedRoleDropdown = role.USER_GROUP;
      this.loadPermissions();
    }
  }

  /** เลือก role จากแถวในตาราง แล้วโหลด permission */
  selectRoleRow(r: Role): void {
    if (this.hasChanges) {
      this.pendingRoleSelection = r.USER_GROUP;
      this.showDiscardModal = true;
      return;
    }
    this.selectedRole = r.USER_GROUP;
    this.selectedRoleDropdown = r.USER_GROUP;
    this.permissionPanelExpanded = true;
    this.loadPermissions();
  }

  /** scroll ไปส่วน Permission (เมื่อกด Assign Permission) */
  scrollToPermissionSection(): void {
    if (this.permissionSectionRef?.nativeElement) {
      this.permissionSectionRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** สลับย่อ/ขยาย แผงกำหนดสิทธิ์ (Select Role + Permission) */
  togglePermissionPanel(): void {
    this.permissionPanelExpanded = !this.permissionPanelExpanded;
  }

  /** เปิดป้ายประกาศ Assign Permission ตามสเก็ต */
  openAssignPermissionModal(): void {
    if (!this.selectedRole || this.isRoleInactive(this.selectedRole)) return;
    // โหลดสิทธิเฉพาะเมื่อยังไม่มีข้อมูล และไม่ได้กำลังโหลดอยู่ (ไม่ reload ทับการแก้ไขที่ยังไม่บันทึก)
    if (!this.hasPermissions && !this.isLoading) {
      this.loadPermissions();
    }
    this.assignPermissionRoleName = this.getRoleLabel(this.selectedRole);
    this.templateChoiceInAssignModal = '';
    this.showAssignPermissionModal = true;
  }

  closeAssignPermissionModal(): void {
    this.showAssignPermissionModal = false;
  }

  /** บันทึกสิทธิในโมดัล Assign Permission แล้วปิด (รวมอัปเดตชื่อ role ถ้าแก้) */
  savePermissionsAndCloseAssignModal(): void {
    const nameTrimmed = this.assignPermissionRoleName?.trim() ?? '';
    if (!nameTrimmed) {
      this.showError('กรุณากรอกชื่อ role');
      return;
    }
    const currentName = this.getRoleLabel(this.selectedRole);
    const nameChanged = nameTrimmed !== currentName;

    if (nameChanged) {
      this.roleService.updateRole(this.selectedRole, { name: nameTrimmed })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedRole) => {
            const idx = this.roles.findIndex(r => r.USER_GROUP === this.selectedRole);
            if (idx >= 0) {
              this.roles[idx] = { ...this.roles[idx], ...updatedRole };
            }
            this.savePermissions('บันทึกสิทธิและชื่อ role เรียบร้อยแล้ว', () => this.closeAssignPermissionModal());
          },
          error: () => {
            this.showError('อัปเดตชื่อ role ไม่สำเร็จ');
          },
        });
    } else {
      this.savePermissions('บันทึกสิทธิเรียบร้อยแล้ว', () => this.closeAssignPermissionModal());
    }
  }

  openAddRoleDrawer(): void {
    this.roleDrawerMode = 'create';
    this.roleDrawerRole = null;
    this.showRoleDrawer = true;
  }

  openEditRoleDrawer(r: Role): void {
    this.roleDrawerMode = 'edit';
    this.roleDrawerRole = { ...r };
    this.showRoleDrawer = true;
  }

  /** เช็คว่า role นี้ inactive หรือไม่ (ใช้ disable Assign Permission) */
  isRoleInactive(role: Role | string | null): boolean {
    if (!role) return true;
    const r = typeof role === 'string' ? this.roles.find(x => x.USER_GROUP === role) : role;
    return r ? r.ACTIVE === 'N' : true;
  }

  /** สลับ Active จาก checkbox ในตาราง (optimistic) */
  onRoleActiveToggle(r: Role, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const prev = r.ACTIVE;
    r.ACTIVE = checked ? 'Y' : 'N';
    this.roleService.toggleRoleActive(r.USER_GROUP, checked)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => {
          r.ACTIVE = prev;
          this.showError('เปลี่ยนสถานะ Active ไม่สำเร็จ');
          this.cdr.markForCheck();
        }
      });
  }

  confirmDeleteRole(r: Role): void {
    this.confirmationService.confirm({
      message: `ต้องการลบ role "${r.GROUP_NAME}" ใช่หรือไม่?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRole(r),
    });
  }

  deleteRole(r: Role): void {
    this.roleService.deleteRole(r.USER_GROUP)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.roles = this.roles.filter(x => x.USER_GROUP !== r.USER_GROUP);
          if (this.selectedRole === r.USER_GROUP) {
            this.selectedRole = this.roles[0]?.USER_GROUP ?? '';
            this.selectedRoleDropdown = this.selectedRole;
            this.loadPermissions();
          }
          this.showSuccess('ลบ role แล้ว');
          this.cdr.markForCheck();
        },
        error: () => this.showError('ลบ role ไม่สำเร็จ'),
      });
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
   * Cancel template modal
   */
  cancelTemplateModal(): void {
    this.showTemplateModal = false;
    this.selectedTemplate = '';
  }

  /**
   * Handle template selection (does NOT apply, just selects)
   */
  onTemplateSelect(templateId: string): void {
    this.selectedTemplate = templateId;
    // Force change detection to update footer button
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Apply template to permission tree (ไม่บันทึก ไม่ปิดโมดัล — ใช้ใน Assign Permission modal)
   * @returns true ถ้า apply สำเร็จ
   */
  applyTemplateToTree(templateId: string): boolean {
    if (!templateId) return false;
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return false;

    const flatPermissions = this.rolePermissionService.flattenTree(this.permissionTree);
    const updatedPermissions = this.rolePermissionService.applyTemplate(
      flatPermissions,
      template
    );
    this.permissionTree = this.rolePermissionService.buildTree(updatedPermissions);
    this.permissionTree = this.rolePermissionService.updateIndeterminateStates(
      this.permissionTree
    );
    this.filteredTree = [...this.permissionTree];
    this.buildTabs();
    this.hasChanges = true;
    this.updateSummary();
    return true;
  }

  /**
   * Apply selected template (only called when user clicks Apply Template button on main page)
   */
  applyTemplate(): void {
    if (!this.selectedTemplate) return;
    if (!this.applyTemplateToTree(this.selectedTemplate)) return;
    const template = this.templates.find(t => t.id === this.selectedTemplate);
    const templateName = template?.name ?? '';
    this.showTemplateModal = false;
    this.selectedTemplate = '';
    this.savePermissions(`Template "${templateName}" applied and saved.`);
  }

  /**
   * Apply template ภายในโมดัล Assign Permission (ไม่ปิดโมดัล ไม่บันทึก — ให้กด Save ด้านล่าง)
   */
  applyTemplateInAssignModal(): void {
    if (!this.templateChoiceInAssignModal) {
      this.showError('กรุณาเลือกเทมเพลต');
      return;
    }
    if (this.applyTemplateToTree(this.templateChoiceInAssignModal)) {
      this.showSuccess('ใช้เทมเพลตแล้ว — กด Save ด้านล่างเพื่อบันทึก');
    }
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
   * Cancel copy modal
   */
  cancelCopyModal(): void {
    this.showCopyModal = false;
    this.copyFromRole = '';
  }

  /** Apply Copy from standard role (inline ในส่วน Permission ตามสเก็ตช์) */
  applyCopyFromStandardRoleInline(): void {
    if (!this.copyFromRoleInline || this.copyFromRoleInline === this.selectedRole) {
      this.showError('กรุณาเลือก role ต้นทางที่แตกต่างจาก role ปัจจุบัน');
      return;
    }
    this.isCopyingPermissions = true;
    this.clearMessages();
    this.rolePermissionService
      .getPermissions({ USER_GROUP: this.copyFromRoleInline })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const sourceWithMode = response.data.map((p) => {
            const mode = this.rolePermissionService.calculateAccessMode(p);
            return { ...p, isEnabled: mode.isEnabled, isViewOnly: mode.isViewOnly };
          });
          this.permissionTree = this.rolePermissionService.mergePermissionsFromSource(
            this.permissionTree,
            sourceWithMode,
            this.selectedRole
          );
          this.permissionTree = this.rolePermissionService.updateIndeterminateStates(this.permissionTree);
          if (this.searchQuery) {
            this.applySearchFilter(this.searchQuery);
          } else {
            this.filteredTree = [...this.permissionTree];
          }
          this.buildTabs();
          this.updateSummary();
          this.hasChanges = true;
          this.isCopyingPermissions = false;
          const label = this.roles.find((r) => r.USER_GROUP === this.copyFromRoleInline)?.GROUP_NAME ?? this.copyFromRoleInline;
          this.showSuccess(`คัดลอกสิทธิจาก role "${label}" แล้ว — กด "บันทึกการเปลี่ยนแปลง" เพื่อบันทึก`);
        },
        error: (err) => {
          console.error('Error copying permissions:', err);
          this.showError('โหลดสิทธิจาก role ต้นทางไม่สำเร็จ');
          this.isCopyingPermissions = false;
        },
      });
  }

  /**
   * Copy permissions from another role into the current role (in memory).
   * Loads source role's permissions and merges their flags into the current tree.
   * User must click Save to persist.
   */
  copyFromOtherRole(): void {
    if (!this.copyFromRole || this.copyFromRole === this.selectedRole) {
      this.showError('Please select a different role');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.rolePermissionService
      .getPermissions({ USER_GROUP: this.copyFromRole })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const sourceWithMode = response.data.map((p) => {
            const mode = this.rolePermissionService.calculateAccessMode(p);
            return { ...p, isEnabled: mode.isEnabled, isViewOnly: mode.isViewOnly };
          });

          this.permissionTree = this.rolePermissionService.mergePermissionsFromSource(
            this.permissionTree,
            sourceWithMode,
            this.selectedRole
          );
          this.permissionTree = this.rolePermissionService.updateIndeterminateStates(
            this.permissionTree
          );

          if (this.searchQuery) {
            this.applySearchFilter(this.searchQuery);
          } else {
            this.filteredTree = [...this.permissionTree];
          }
          this.buildTabs();
          this.updateSummary();
          this.hasChanges = true;

          const copiedLabel = this.roles.find((r) => r.USER_GROUP === this.copyFromRole)?.GROUP_NAME ?? this.copyFromRole;
          this.showCopyModal = false;
          this.copyFromRole = '';
          this.isLoading = false;
          this.savePermissions(`Permissions copied from "${copiedLabel}" and saved.`);
        },
        error: (error) => {
          console.error('Error copying permissions:', error);
          this.showError('Failed to load source role permissions');
          this.isLoading = false;
        },
      });
  }

  // ==================== SAVE & CANCEL ====================

  /**
   * Save permissions to backend.
   * @param optionalSuccessMessage If provided, shown on success instead of default message.
   * @param onSuccess Optional callback after save success (e.g. close Assign Permission modal).
   */
  savePermissions(optionalSuccessMessage?: string, onSuccess?: () => void): void {
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
          this.showSuccess(optionalSuccessMessage ?? 'Permissions saved successfully');
          onSuccess?.();
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
