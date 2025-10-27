// export interface NavigationSub {
//   name: string;
//   route: string;
// }

// export interface NavigationSecondary {
//   name: string;
//   icon: string;
//   route?: string;
//   sub?: NavigationSub[];
// }

// export interface NavigationItem {
//   primary_content: string;
//   secondary_content: NavigationSecondary[];
// }

// navigation.model.ts - Updated for new menu structure

/**
 * Tertiary level navigation (deepest level in sidebar)
 * This represents the actual clickable items that navigate to pages
 */
export interface NavigationTertiary {
  name: string;        // Display name key for translation
  route: string;       // Angular route path
  hasDeeper?: boolean; // Flag to indicate if this item has 4th/5th level (show in future phases)
  deeperNote?: string; // Note about deeper levels for future implementation
}

/**
 * Secondary level navigation (middle level in sidebar)
 * This can be either:
 * 1. A direct link (has route property)
 * 2. An accordion parent (has sub property with tertiary items)
 */
export interface NavigationSecondary {
  name: string;                      // Display name key for translation
  icon: string;                      // Icon path (relative to assets)
  route?: string;                    // Direct route (if no sub-items)
  sub?: NavigationTertiary[];        // Sub-items (if accordion)
  hasDeeper?: boolean;               // Flag for items with 4+ levels
  deeperNote?: string;               // Note for future implementation
}

/**
 * Primary level navigation (top level - shown in header)
 * Each primary item contains secondary items shown in sidebar
 */
export interface NavigationItem {
  primary_content: string;           // Primary category name (e.g., 'sales', 'area')
  displayName?: string;              // Optional display override
  secondary_content: NavigationSecondary[];  // Sidebar items for this category
}

/**
 * Type for tracking which items have deeper levels
 * This helps us plan for future phased implementation
 */
export interface DeepNavigationNote {
  path: string;        // Full path like "collection.invoicing.daily"
  currentLevel: number; // Current implemented level (3)
  totalLevels: number;  // Total levels in full structure (4 or 5)
  note: string;        // Description of what's nested deeper
}
