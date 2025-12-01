// role-permission.service.ts - Service for managing roles and permissions
import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import {
  Permission,
  Role,
  MenuTab,
  PermissionTemplate,
  GetPermissionsRequest,
  GetPermissionsResponse,
  SavePermissionsRequest,
  SavePermissionsResponse,
  GetRolesResponse,
  SaveRoleRequest,
  SaveRoleResponse,
  CopyPermissionsRequest,
  PermissionSummary,
  TreeNode,
  ROOT_PARENT_ID,
  MENU_TABS,
  PERMISSION_TEMPLATES,
} from '@core/models/permission.model';

import { ALL_PERMISSION_TABS } from '@core/data/permissions/index';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionService {
  constructor() {}

  // ==================== ROLE OPERATIONS ====================

  /**
   * Get all available roles
   */
  getRoles(): Observable<GetRolesResponse> {
    // TODO: Replace with actual API call
    const mockRoles: Role[] = [
      {
        USER_GROUP: 'ADMIN',
        GROUP_NAME: 'Administrator',
        DESCRIPTION: 'Full system access',
        ACTIVE: 'Y',
        OU_CODE: '001',
      },
      {
        USER_GROUP: 'BE',
        GROUP_NAME: 'Building Engineer',
        DESCRIPTION: 'Building and facility management',
        ACTIVE: 'Y',
        OU_CODE: '001',
      },
      {
        USER_GROUP: 'CS',
        GROUP_NAME: 'Customer Service',
        DESCRIPTION: 'Customer support and relations',
        ACTIVE: 'Y',
        OU_CODE: '001',
      },
      {
        USER_GROUP: 'VIEWER',
        GROUP_NAME: 'Viewer',
        DESCRIPTION: 'Read-only access',
        ACTIVE: 'Y',
        OU_CODE: '001',
      },
    ];

    return of({
      data: mockRoles,
      total: mockRoles.length,
    }).pipe(delay(300));
  }

  /**
   * Create or update a role
   */
  saveRole(request: SaveRoleRequest): Observable<SaveRoleResponse> {
    // TODO: Replace with actual API call
    console.log('Saving role:', request);

    return of({
      success: true,
      message: 'Role saved successfully',
      role: {
        ...request,
        CREATED_DATE: new Date().toISOString(),
      } as Role,
    }).pipe(delay(500));
  }

  /**
   * Delete a role
   */
  deleteRole(
    userGroup: string
  ): Observable<{ success: boolean; message: string }> {
    // TODO: Replace with actual API call
    console.log('Deleting role:', userGroup);

    return of({
      success: true,
      message: 'Role deleted successfully',
    }).pipe(delay(500));
  }

  // ==================== PERMISSION OPERATIONS ====================
   private flattenPermissionItem(
    item: any,
    result: Permission[],
    parentId: string,
    userGroup: string,
    seq: number = 1
  ): void {
    const currentDate = new Date().toISOString();

    const permission: Permission = {
      // Basic info
      MENU_ID: item.MENU_ID,
      MenuName: item.MenuName,
      Level: item.Level,
      Seq: seq,
      ParentMenu: parentId,
      IsLeaf: !item.children || item.children.length === 0,

      // Permission flags
      USE_FLAG: item.isEnabled ? 'Y' : 'N',
      INS_FLAG: item.isEnabled && !item.isViewOnly ? 'Y' : 'N',
      QRY_FLAG: item.isEnabled ? 'Y' : 'N',
      UPD_FLAG: item.isEnabled && !item.isViewOnly ? 'Y' : 'N',
      DEL_FLAG: item.isEnabled && !item.isViewOnly ? 'Y' : 'N',
      REP_FLAG: item.isEnabled ? 'Y' : 'N',

      // Required metadata fields
      USER_GROUP: userGroup,
      OU_CODE: '001', // Default organization code
      MENU_FLAG: null,
      UPD_BY: 'SYSTEM', // Required field - default to SYSTEM
      UPD_DATE: currentDate, // Required field - current date

      // UI state
      DataState: 3, // 3 = Unchanged
      ReadOnly: false,
      IsSelected: false,

      // Computed UI properties
      isEnabled: item.isEnabled,
      isViewOnly: item.isViewOnly,
      isExpanded: false,
      isVisible: true
    };

    result.push(permission);

    // Process children recursively
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: any, index: number) => {
        this.flattenPermissionItem(child, result, item.MENU_ID, userGroup, index + 1);
      });
    }
  }


  getMenuTabsWithData(): Observable<MenuTab[]> {
    const tabs: MenuTab[] = ALL_PERMISSION_TABS.map((tab, index) => ({
      id: tab.label.toLowerCase().replace(/\s+/g, '-'),
      label: tab.label,
      icon: tab.icon,
      menuPrefix: tab.items[0]?.MENU_ID.substring(0, 2) || '',
      items: this.convertToPermissions(tab.items),
      order: index + 1,
    }));

    return of(tabs).pipe(delay(300));
  }

  /**
   * Convert your data structure to Permission interface
   */
  private convertToPermissions(items: any[]): Permission[] {
    return items.map((item) => this.convertItemToPermission(item, '000000'));
  }

  private convertItemToPermission(item: any, parentId: string): Permission {
    const permission: Permission = {
      MENU_ID: item.MENU_ID,
      MenuName: item.MenuName,
      Level: item.Level,
      Seq: 1,
      ParentMenu: parentId,
      IsLeaf: !item.children || item.children.length === 0,
      USE_FLAG: item.isEnabled ? 'Y' : 'N',
      INS_FLAG: item.isEnabled && !item.isViewOnly ? 'Y' : 'N',
      QRY_FLAG: item.isEnabled ? 'Y' : 'N',
      UPD_FLAG: item.isEnabled && !item.isViewOnly ? 'Y' : 'N',
      DEL_FLAG: item.isEnabled && !item.isViewOnly ? 'Y' : 'N',
      USER_GROUP: null,
      OU_CODE: null,
      DataState: 3,
      ReadOnly: false,
      IsSelected: false,
      isEnabled: item.isEnabled,
      isViewOnly: item.isViewOnly,
      children: item.children?.map((child: any) => this.convertItemToPermission(child, item.MENU_ID)
      ) || [],
      UPD_BY: null,
      UPD_DATE: null
    };

    return permission;
  }

  /**
   * Get permissions for a specific role
   */
getPermissions(request: GetPermissionsRequest): Observable<GetPermissionsResponse> {
    console.log('Getting permissions for:', request);

    // Convert your data structure to the Permission interface
    const allPermissions: Permission[] = [];

    ALL_PERMISSION_TABS.forEach(tab => {
      tab.items.forEach(item => {
        this.flattenPermissionItem(item, allPermissions, '000000', request.USER_GROUP);
      });
    });

    // Apply role-specific permissions
    const rolePermissions = this.applyRolePermissions(allPermissions, request.USER_GROUP);

    return of({
      data: rolePermissions,
      total: rolePermissions.length
    }).pipe(delay(300));
  }

  private applyRolePermissions(
    permissions: Permission[],
    userGroup: string
  ): Permission[] {
    return permissions.map(permission => {
      switch (userGroup) {
        case 'ADMIN':
          return this.setPermissionAccess(permission, true, false);

        case 'VIEWER':
          return this.setPermissionAccess(permission, true, true);

        case 'BE':
        case 'CS':
          // Keep the default permissions from the data
          return permission;

        default:
          return permission;
      }
    });
  }

  /**
   * Save permissions for a role
   */
  savePermissions(
    request: SavePermissionsRequest
  ): Observable<SavePermissionsResponse> {
    // TODO: Replace with actual API call
    console.log('Saving permissions:', request);

    return of({
      success: true,
      message: 'Permissions saved successfully',
      updatedCount: request.permissions.length,
    }).pipe(delay(500));
  }

  /**
   * Copy permissions from one role to another
   */
  copyPermissions(
    request: CopyPermissionsRequest
  ): Observable<SavePermissionsResponse> {
    // TODO: Replace with actual API call
    console.log('Copying permissions:', request);

    return of({
      success: true,
      message: `Permissions copied from ${request.fromRole} to ${request.toRole}`,
      updatedCount: 0,
    }).pipe(delay(500));
  }

  // ==================== TEMPLATE OPERATIONS ====================

  /**
   * Get available permission templates
   */
  getTemplates(): PermissionTemplate[] {
    return PERMISSION_TEMPLATES;
  }

  /**
   * Apply a template to permissions
   */
  applyTemplate(
    permissions: Permission[],
    template: PermissionTemplate
  ): Permission[] {
    const updatedPermissions = permissions.map((permission) => {
      const shouldApply =
        template.config.applyToAll ||
        (template.config.specificMenus?.includes(permission.MENU_ID) ?? false);

      if (!shouldApply) {
        return permission;
      }

      // Apply template configuration
      return this.setPermissionAccess(
        permission,
        template.config.enable,
        template.config.viewOnly
      );
    });

    return updatedPermissions;
  }

  // ==================== TREE OPERATIONS ====================

  /**
   * Build hierarchical tree from flat permission list
   */
  buildTree(permissions: Permission[]): Permission[] {
    // Create a map for quick lookup
    const map = new Map<string, Permission>();
    const roots: Permission[] = [];

    // First pass: Initialize all items with empty children array
    permissions.forEach((permission) => {
      map.set(permission.MENU_ID, {
        ...permission,
        children: [],
        isExpanded: false,
        isVisible: true,
      });
    });

    // Second pass: Build parent-child relationships
    permissions.forEach((permission) => {
      const node = map.get(permission.MENU_ID);
      if (!node) return;

      if (permission.ParentMenu === ROOT_PARENT_ID || !permission.ParentMenu) {
        // Root level item
        roots.push(node);
      } else {
        // Child item - add to parent's children
        const parent = map.get(permission.ParentMenu);
        if (parent && parent.children) {
          parent.children.push(node);
        } else {
          // Parent not found, treat as root
          roots.push(node);
        }
      }
    });

    // Sort by sequence at each level
    const sortChildren = (items: Permission[]) => {
      items.sort((a, b) => a.Seq - b.Seq);
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    sortChildren(roots);
    return roots;
  }

  /**
   * Flatten tree back to list
   */
  flattenTree(tree: Permission[]): Permission[] {
    const result: Permission[] = [];

    const traverse = (nodes: Permission[]) => {
      nodes.forEach((node) => {
        // Remove UI-specific properties before saving
        const {
          children,
          isExpanded,
          isVisible,
          isIndeterminate,
          ...cleanNode
        } = node;
        result.push(cleanNode as Permission);

        if (children && children.length > 0) {
          traverse(children);
        }
      });
    };

    traverse(tree);
    return result;
  }

  /**
   * Filter tree by search query and tab
   */
  filterTree(
    tree: Permission[],
    searchQuery?: string,
    tabId?: string
  ): Permission[] {
    if (!searchQuery && !tabId) {
      return tree;
    }

    const filterNode = (node: Permission): Permission | null => {
      // Filter by tab (check first 2 digits of MENU_ID)
      if (tabId) {
        const tab = MENU_TABS.find((t) => t.id === tabId);
        if (tab && !node.MENU_ID.startsWith(tab.menuPrefix)) {
          return null;
        }
      }

      // Filter by search query
      const matchesSearch =
        !searchQuery ||
        node.MenuName.toLowerCase().includes(searchQuery.toLowerCase());

      // Check children recursively
      const filteredChildren =
        node.children
          ?.map((child) => filterNode(child))
          .filter((child): child is Permission => child !== null) || [];

      // Show node if it matches OR has matching children
      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          isVisible: true,
          isExpanded: filteredChildren.length > 0, // Auto-expand if has visible children
        };
      }

      return null;
    };

    return tree
      .map((node) => filterNode(node))
      .filter((node): node is Permission => node !== null);
  }

  /**
   * Get all menu tabs with their root items
   */
  getMenuTabs(permissions: Permission[]): MenuTab[] {
    const tree = this.buildTree(permissions);

    return MENU_TABS.map((tabConfig) => ({
      ...tabConfig,
      items: tree.filter((item) =>
        item.MENU_ID.startsWith(tabConfig.menuPrefix)
      ),
    }));
  }

  // ==================== PERMISSION LOGIC ====================

  /**
   * Set permission access (2-column logic)
   * @param permission - Permission to modify
   * @param enable - Enable access
   * @param viewOnly - View-only mode
   */
  setPermissionAccess(
    permission: Permission,
    enable: boolean,
    viewOnly: boolean
  ): Permission {
    const currentDate = new Date().toISOString();

    if (!enable) {
      return {
        ...permission,
        USE_FLAG: 'N',
        INS_FLAG: 'N',
        QRY_FLAG: 'N',
        UPD_FLAG: 'N',
        DEL_FLAG: 'N',
        REP_FLAG: 'N',
        isEnabled: false,
        isViewOnly: false,
        UPD_DATE: currentDate,
        DataState: 2 // 2 = Modified
      };
    }

    if (viewOnly) {
      return {
        ...permission,
        USE_FLAG: 'Y',
        INS_FLAG: 'N',
        QRY_FLAG: 'Y',
        UPD_FLAG: 'N',
        DEL_FLAG: 'N',
        REP_FLAG: 'Y',
        isEnabled: true,
        isViewOnly: true,
        UPD_DATE: currentDate,
        DataState: 2 // 2 = Modified
      };
    }

    return {
      ...permission,
      USE_FLAG: 'Y',
      INS_FLAG: 'Y',
      QRY_FLAG: 'Y',
      UPD_FLAG: 'Y',
      DEL_FLAG: 'Y',
      REP_FLAG: 'Y',
      isEnabled: true,
      isViewOnly: false,
      UPD_DATE: currentDate,
      DataState: 2 // 2 = Modified
    };
  }

  /**
   * Calculate isEnabled and isViewOnly from flags
   */
  calculateAccessMode(permission: Permission): {
    isEnabled: boolean;
    isViewOnly: boolean;
  } {
    const hasAnyAccess = permission.USE_FLAG === 'Y' || permission.QRY_FLAG === 'Y';

    if (!hasAnyAccess) {
      return { isEnabled: false, isViewOnly: false };
    }

    const hasFullAccess =
      permission.INS_FLAG === 'Y' ||
      permission.UPD_FLAG === 'Y' ||
      permission.DEL_FLAG === 'Y';

    return {
      isEnabled: true,
      isViewOnly: !hasFullAccess
    };
  }


  /**
   * Update permission and propagate to children
   */
  updatePermissionWithChildren(
    permission: Permission,
    enable: boolean,
    viewOnly: boolean,
    propagateToChildren: boolean = true
  ): Permission {
    const currentDate = new Date().toISOString();

    // Update current permission
    const updated = {
      ...this.setPermissionAccess(permission, enable, viewOnly),
      UPD_DATE: currentDate,
      DataState: 2 // Mark as modified
    };

    // Propagate to children if needed
    if (propagateToChildren && updated.children && updated.children.length > 0) {
      updated.children = updated.children.map(child =>
        this.updatePermissionWithChildren(child, enable, viewOnly, true)
      );
    }

    return updated;
  }

  /**
   * Calculate indeterminate state for parent nodes
   */
  calculateIndeterminateState(permission: Permission): boolean {
    if (!permission.children || permission.children.length === 0) {
      return false;
    }

    const enabledChildren = permission.children.filter((c) => {
      const mode = this.calculateAccessMode(c);
      return mode.isEnabled;
    });

    // Indeterminate if some (but not all) children are enabled
    return (
      enabledChildren.length > 0 &&
      enabledChildren.length < permission.children.length
    );
  }

  /**
   * Update indeterminate states for entire tree
   */
  updateIndeterminateStates(tree: Permission[]): Permission[] {
    const updateNode = (node: Permission): Permission => {
      // First, update children recursively
      if (node.children && node.children.length > 0) {
        node.children = node.children.map((child) => updateNode(child));
      }

      // Then calculate indeterminate state for this node
      return {
        ...node,
        isIndeterminate: this.calculateIndeterminateState(node),
      };
    };

    return tree.map((node) => updateNode(node));
  }

  // ==================== SUMMARY & STATISTICS ====================

  /**
   * Calculate permission summary statistics
   */
  calculateSummary(permissions: Permission[]): PermissionSummary {
    let totalMenus = 0;
    let totalFeatures = 0;
    let enabledMenus = 0;
    let enabledFeatures = 0;
    let viewOnlyFeatures = 0;
    let fullAccessFeatures = 0;

    permissions.forEach((permission) => {
      if (permission.IsLeaf) {
        totalFeatures++;
        const mode = this.calculateAccessMode(permission);
        if (mode.isEnabled) {
          enabledFeatures++;
          if (mode.isViewOnly) {
            viewOnlyFeatures++;
          } else {
            fullAccessFeatures++;
          }
        }
      } else {
        totalMenus++;
        const mode = this.calculateAccessMode(permission);
        if (mode.isEnabled) {
          enabledMenus++;
        }
      }
    });

    return {
      totalMenus,
      totalFeatures,
      enabledMenus,
      enabledFeatures,
      viewOnlyFeatures,
      fullAccessFeatures,
    };
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Expand all nodes in tree
   */
  expandAll(tree: Permission[]): Permission[] {
    const expandNode = (node: Permission): Permission => ({
      ...node,
      isExpanded: true,
      children: node.children?.map((child) => expandNode(child)),
    });

    return tree.map((node) => expandNode(node));
  }

  /**
   * Collapse all nodes in tree
   */
  collapseAll(tree: Permission[]): Permission[] {
    const collapseNode = (node: Permission): Permission => ({
      ...node,
      isExpanded: false,
      children: node.children?.map((child) => collapseNode(child)),
    });

    return tree.map((node) => collapseNode(node));
  }

  /**
   * Enable all permissions
   */
  enableAll(
    permissions: Permission[],
    viewOnly: boolean = false
  ): Permission[] {
    return permissions.map((permission) =>
      this.updatePermissionWithChildren(permission, true, viewOnly, true)
    );
  }

  /**
   * Disable all permissions
   */
  disableAll(permissions: Permission[]): Permission[] {
    return permissions.map((permission) =>
      this.updatePermissionWithChildren(permission, false, false, true)
    );
  }

  // ==================== VALIDATION ====================

  /**
   * Validate permission data before saving
   */
  validatePermissions(permissions: Permission[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    permissions.forEach((permission) => {
      // Check required fields
      if (!permission.MENU_ID) {
        errors.push(`Permission missing MENU_ID: ${permission.MenuName}`);
      }

      // Check valid flag values
      const flags = [
        permission.USE_FLAG,
        permission.INS_FLAG,
        permission.QRY_FLAG,
        permission.UPD_FLAG,
        permission.DEL_FLAG,
      ];

      flags.forEach((flag, index) => {
        if (flag !== 'Y' && flag !== 'N') {
          errors.push(`Invalid flag value for ${permission.MenuName}`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
