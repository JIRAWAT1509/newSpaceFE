// permission.model.ts - Data models for role and permission management

/**
 * Main Permission/Menu Item
 * Represents a hierarchical menu structure with permissions
 */
export interface Permission {
  // Menu identification
  MENU_ID: string;           // Format: "0102030405" (hierarchical ID)
  MenuName: string;          // Display name (e.g., "Master", "Company Data")
  Level: number;             // Hierarchy level (1=Menu, 2=SubMenu, 3=Feature, etc.)
  Seq: number;               // Display sequence within same level
  ParentMenu: string;        // Parent's MENU_ID (root items use "000000")
  IsLeaf: boolean;           // True if this is a feature (no children)

  // Permission flags (from backend)
  USE_FLAG: 'Y' | 'N';       // Can access this menu
  INS_FLAG: 'Y' | 'N';       // Can create (Insert)
  QRY_FLAG: 'Y' | 'N';       // Can query/view
  UPD_FLAG: 'Y' | 'N';       // Can update/edit
  DEL_FLAG: 'Y' | 'N';       // Can delete
  REP_FLAG?: 'Y' | 'N' | null; // Can generate reports (optional)

  // Metadata
  USER_GROUP: string | null;  // Role this permission belongs to
  OU_CODE: string | null;     // Organization unit code
  MENU_FLAG?: string | null;  // Additional menu flags
  UPD_BY: string | null;      // Last updated by
  UPD_DATE: string | null;    // Last update date
  DataState: number;          // Data state (1=New, 2=Modified, 3=Unchanged, 4=Deleted)
  ReadOnly: boolean;          // Is this read-only?
  IsSelected: boolean;        // UI selection state

  // UI-specific properties
  isExpanded?: boolean;       // Is tree node expanded?
  isVisible?: boolean;        // Is visible in current filter/search?
  isIndeterminate?: boolean;  // Partial selection state (some children checked)
  children?: Permission[];    // Child menu items (populated in UI)

  // Computed properties for simplified 2-column logic
  isEnabled?: boolean;        // Enable toggle (computed from flags)
  isViewOnly?: boolean;       // View-only mode (computed from flags)
}

/**
 * Role/User Group
 */
export interface Role {
  USER_GROUP: string;         // Role ID (e.g., "BE", "CS", "ADMIN")
  GROUP_NAME: string;         // Display name (e.g., "Building Engineer")
  DESCRIPTION?: string;       // Role description
  OU_CODE?: string;           // Organization unit
  ACTIVE: 'Y' | 'N';          // Is role active?
  CREATED_BY?: string;        // Created by user
  CREATED_DATE?: string;      // Creation date
  UPD_BY?: string;            // Last updated by
  UPD_DATE?: string;          // Last update date
  permissions?: Permission[]; // Full permission list for this role
}

/**
 * Tab/Section grouping for UI
 */
export interface MenuTab {
  id: string;                 // Tab ID (e.g., "master", "area", "contract")
  label: string;              // Display label
  icon?: string;              // Optional icon class
  menuPrefix: string;         // Menu ID prefix (e.g., "01" for Master)
  items: Permission[];        // Root-level items for this tab
  order: number;              // Display order
}

/**
 * Permission Template (Quick Setup)
 */
export interface PermissionTemplate {
  id: string;                 // Template ID
  name: string;               // Template name (e.g., "Administrator", "Viewer")
  description: string;        // Description
  icon?: string;              // Optional icon
  config: {
    applyToAll: boolean;      // Apply to all menus?
    enable: boolean;          // Enable access
    viewOnly: boolean;        // View-only mode
    specificMenus?: string[]; // Apply only to specific menu IDs
  };
}

/**
 * Request/Response DTOs
 */

// Get permissions for a role
export interface GetPermissionsRequest {
  USER_GROUP: string;
  OU_CODE?: string;
}

export interface GetPermissionsResponse {
  data: Permission[];
  total: number;
}

// Save/Update permissions
export interface SavePermissionsRequest {
  USER_GROUP: string;
  OU_CODE?: string;
  permissions: Permission[];
}

export interface SavePermissionsResponse {
  success: boolean;
  message: string;
  updatedCount?: number;
}

// Get all roles
export interface GetRolesResponse {
  data: Role[];
  total: number;
}

// Create/Update role
export interface SaveRoleRequest {
  USER_GROUP: string;
  GROUP_NAME: string;
  DESCRIPTION?: string;
  OU_CODE?: string;
  ACTIVE: 'Y' | 'N';
}

export interface SaveRoleResponse {
  success: boolean;
  message: string;
  role?: Role;
}

/**
 * Filter/Search options
 */
export interface PermissionFilterOptions {
  searchQuery?: string;       // Search by menu name
  tabId?: string;             // Filter by tab
  level?: number;             // Filter by level
  hasAccess?: boolean;        // Show only with access
  showOnlyLeaf?: boolean;     // Show only leaf items (features)
}

/**
 * Bulk action types
 */
export enum BulkActionType {
  ENABLE_ALL = 'enable_all',
  DISABLE_ALL = 'disable_all',
  SET_VIEW_ONLY = 'set_view_only',
  SET_FULL_ACCESS = 'set_full_access',
  EXPAND_ALL = 'expand_all',
  COLLAPSE_ALL = 'collapse_all'
}

/**
 * Permission change event
 */
export interface PermissionChangeEvent {
  permission: Permission;
  field: 'enable' | 'viewOnly';
  newValue: boolean;
  propagateToChildren: boolean;
}

/**
 * Copy permissions request
 */
export interface CopyPermissionsRequest {
  fromRole: string;           // Source role
  toRole: string;             // Target role
  OU_CODE?: string;
}

/**
 * Helper type for tree manipulation
 */
export interface TreeNode extends Permission {
  children: TreeNode[];
  parent?: TreeNode;
  depth: number;
}

/**
 * Statistics/Summary
 */
export interface PermissionSummary {
  totalMenus: number;
  totalFeatures: number;
  enabledMenus: number;
  enabledFeatures: number;
  viewOnlyFeatures: number;
  fullAccessFeatures: number;
}

/**
 * Constants
 */
export const ROOT_PARENT_ID = '000000';

export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features',
    icon: 'pi pi-shield',
    config: {
      applyToAll: true,
      enable: true,
      viewOnly: false
    }
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to all features',
    icon: 'pi pi-eye',
    config: {
      applyToAll: true,
      enable: true,
      viewOnly: true
    }
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can view and edit, but not delete',
    icon: 'pi pi-pencil',
    config: {
      applyToAll: true,
      enable: true,
      viewOnly: false
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Manually configure permissions',
    icon: 'pi pi-cog',
    config: {
      applyToAll: false,
      enable: false,
      viewOnly: false
    }
  }
];

/**
 * Tab configuration based on menu structure
 */
// Update MENU_TABS to use the imported data
import { ALL_PERMISSION_TABS } from '@core/data/permissions/index';

export const MENU_TABS: MenuTab[] = ALL_PERMISSION_TABS.map((tab, index) => ({
  id: tab.label.toLowerCase().replace(/\s+/g, '-'),
  label: tab.label,
  icon: tab.icon,
  menuPrefix: tab.items[0]?.MENU_ID.substring(0, 2) || '',
  items: [],
  order: index + 1
}));

// permission.model.ts - Add this interface for your data structure

export interface PermissionTabData {
  label: string;
  icon: string;
  items: PermissionItem[];
}

export interface PermissionItem {
  MENU_ID: string;
  MenuName: string;
  Level: number;
  isEnabled: boolean;
  isViewOnly: boolean;
  children: PermissionItem[];

  // Additional fields for backend integration
  Seq?: number;
  ParentMenu?: string;
  IsLeaf?: boolean;
  USE_FLAG?: 'Y' | 'N';
  INS_FLAG?: 'Y' | 'N';
  QRY_FLAG?: 'Y' | 'N';
  UPD_FLAG?: 'Y' | 'N';
  DEL_FLAG?: 'Y' | 'N';
  USER_GROUP?: string | null;
  OU_CODE?: string | null;
  DataState?: number;
  ReadOnly?: boolean;
  IsSelected?: boolean;
  isExpanded?: boolean;
  isVisible?: boolean;
  isIndeterminate?: boolean;
}

