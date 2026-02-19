export type UiThemeMode = 'light' | 'dark';
export type UiPaletteMode = 'preset' | 'custom';
export type UiStatusMode = 'preset' | 'custom';
export type UiIconStyle = 'outline' | 'solid';

export interface UiTokens {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  card: string;
  input: string;
  primary: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  success: string;
  successFg: string;
  warning: string;
  warningFg: string;
  danger: string;
  dangerFg: string;
  info: string;
  infoFg: string;
  link: string;
}

export interface UiStatusTokens {
  success: string;
  successFg: string;
  warning: string;
  warningFg: string;
  danger: string;
  dangerFg: string;
  info: string;
  infoFg: string;
}

// Module-specific configuration types
export type ModuleId = 'areaAvailability' | 'facilitiesUtilities';

export interface ModuleStatusConfig {
  // Domain-specific labels (not Success/Warning/Danger/Info)
  labels: {
    [key: string]: string; // e.g., "ไฟฟ้า", "น้ำ", "แก๊ส", "แอร์" for Facilities (Thai)
  };
  // English labels
  labelsEn?: {
    [key: string]: string; // e.g., "Electricity", "Water", "Gas", "AC"
  };
  // Color overrides (hex colors)
  colors: {
    [key: string]: string; // e.g., "electricity": "#FFD700"
  };
  // Icon overrides (dataURL, path, or PrimeIcon class)
  icons: {
    [key: string]: string; // e.g., "electricity": "data:image/svg+xml;base64,..." or "pi-bolt"
  };
  // Icon types (library or upload)
  iconTypes?: {
    [key: string]: 'library' | 'upload'; // Track if icon is from library or uploaded
  };
  // Order/sequence
  order?: string[];
}

export interface AreaAvailabilityConfig extends ModuleStatusConfig {
  // Status icon overrides
  statusIcons?: {
    [key: string]: string; // e.g., "vacant": "data:image/svg+xml;base64,..." or "pi-building"
  };
  // Status icon types
  statusIconTypes?: {
    [key: string]: 'library' | 'upload';
  };
}

export interface FacilitiesUtilitiesConfig extends ModuleStatusConfig {
  // Meter type configurations
  meterTypes?: {
    [key: string]: {
      label: string;
      labelTh: string;
      color: string;
      icon: string;
    };
  };
  // Rentable items (things that can be rented)
  rentableItems?: Array<{
    id: string;
    name: string;
    nameTh: string;
    icon: string;
    iconType?: 'library' | 'upload';
    color: string;
    enabled: boolean;
    order: number;
  }>;
}

export interface ModuleOverrides {
  areaAvailability?: AreaAvailabilityConfig;
  facilitiesUtilities?: FacilitiesUtilitiesConfig;
}

export interface UiConfig {
  themeMode: UiThemeMode;
  paletteMode: UiPaletteMode;
  activePresetId: string | null;
  statusMode: UiStatusMode;
  activeStatusPresetId: string | null;
  tokens: UiTokens;
  iconStyle: UiIconStyle;
  labels: Record<string, string>;
  // NEW: Module-specific overrides
  moduleOverrides?: ModuleOverrides;
}

export interface UiPreset {
  id: string;
  name: string;
  light: UiTokens;
  dark: UiTokens;
}

export interface UiStatusPreset {
  id: string;
  name: string;
  tokens: UiStatusTokens;
}

export const UI_SETTINGS_KEY = 'space_ui_config';
const LEGACY_SETTINGS_KEY = 'space_ui_settings';

export const UI_PRESETS: UiPreset[] = [
  {
    id: 'space-blue',
    name: 'Space Blue',
    light: {
      bg: '#F8FAFC',
      fg: '#0F172A',
      muted: '#64748B',
      border: '#E2E8F0',
      card: '#FFFFFF',
      input: '#FFFFFF',
      primary: '#1677FF',
      primaryFg: '#FFFFFF',
      secondary: '#38BDF8',
      secondaryFg: '#0B1220',
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#EF4444',
      dangerFg: '#450A0A',
      info: '#3B82F6',
      infoFg: '#0B1220',
      link: '#1677FF',
    },
    dark: {
      bg: '#0B1220',
      fg: '#E2E8F0',
      muted: '#94A3B8',
      border: '#1F2A44',
      card: '#111C2F',
      input: '#111C2F',
      primary: '#3B82F6',
      primaryFg: '#E2E8F0',
      secondary: '#38BDF8',
      secondaryFg: '#0B1220',
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#F87171',
      dangerFg: '#450A0A',
      info: '#60A5FA',
      infoFg: '#0B1220',
      link: '#60A5FA',
    },
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    light: {
      bg: '#F0FDFA',
      fg: '#083344',
      muted: '#0F766E',
      border: '#CCFBF1',
      card: '#FFFFFF',
      input: '#FFFFFF',
      primary: '#0EA5A4',
      primaryFg: '#FFFFFF',
      secondary: '#22D3EE',
      secondaryFg: '#083344',
      success: '#10B981',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#EF4444',
      dangerFg: '#450A0A',
      info: '#0284C7',
      infoFg: '#FFFFFF',
      link: '#0EA5A4',
    },
    dark: {
      bg: '#062C2A',
      fg: '#E2E8F0',
      muted: '#94A3B8',
      border: '#123B37',
      card: '#0B3330',
      input: '#0B3330',
      primary: '#0EA5A4',
      primaryFg: '#0B1220',
      secondary: '#22D3EE',
      secondaryFg: '#0B1220',
      success: '#10B981',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#EF4444',
      dangerFg: '#450A0A',
      info: '#0284C7',
      infoFg: '#FFFFFF',
      link: '#22D3EE',
    },
  },
  {
    id: 'indigo-violet',
    name: 'Indigo Violet',
    light: {
      bg: '#F5F3FF',
      fg: '#1E1B4B',
      muted: '#6B7280',
      border: '#EDE9FE',
      card: '#FFFFFF',
      input: '#FFFFFF',
      primary: '#6366F1',
      primaryFg: '#FFFFFF',
      secondary: '#A78BFA',
      secondaryFg: '#1E1B4B',
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#EAB308',
      warningFg: '#713F12',
      danger: '#DC2626',
      dangerFg: '#450A0A',
      info: '#4F46E5',
      infoFg: '#FFFFFF',
      link: '#4F46E5',
    },
    dark: {
      bg: '#0E0F1E',
      fg: '#E5E7EB',
      muted: '#9CA3AF',
      border: '#23253D',
      card: '#14182A',
      input: '#14182A',
      primary: '#6366F1',
      primaryFg: '#0B1220',
      secondary: '#A78BFA',
      secondaryFg: '#0B1220',
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#EAB308',
      warningFg: '#713F12',
      danger: '#DC2626',
      dangerFg: '#450A0A',
      info: '#4F46E5',
      infoFg: '#FFFFFF',
      link: '#A78BFA',
    },
  },
  {
    id: 'emerald-graph',
    name: 'Emerald Graph',
    light: {
      bg: '#F0FDF4',
      fg: '#052E16',
      muted: '#4B5563',
      border: '#DCFCE7',
      card: '#FFFFFF',
      input: '#FFFFFF',
      primary: '#16A34A',
      primaryFg: '#FFFFFF',
      secondary: '#4ADE80',
      secondaryFg: '#052E16',
      success: '#16A34A',
      successFg: '#052E16',
      warning: '#FACC15',
      warningFg: '#713F12',
      danger: '#DC2626',
      dangerFg: '#450A0A',
      info: '#0EA5E9',
      infoFg: '#FFFFFF',
      link: '#16A34A',
    },
    dark: {
      bg: '#0B1A16',
      fg: '#E5F4EE',
      muted: '#92A59D',
      border: '#163027',
      card: '#10241E',
      input: '#10241E',
      primary: '#16A34A',
      primaryFg: '#0B1220',
      secondary: '#4ADE80',
      secondaryFg: '#0B1220',
      success: '#16A34A',
      successFg: '#052E16',
      warning: '#FACC15',
      warningFg: '#451A03',
      danger: '#DC2626',
      dangerFg: '#450A0A',
      info: '#0EA5E9',
      infoFg: '#0B1220',
      link: '#4ADE80',
    },
  },
  {
    id: 'neutral-gray',
    name: 'Neutral Gray',
    light: {
      bg: '#F8FAFC',
      fg: '#0F172A',
      muted: '#64748B',
      border: '#E2E8F0',
      card: '#FFFFFF',
      input: '#FFFFFF',
      primary: '#334155',
      primaryFg: '#FFFFFF',
      secondary: '#94A3B8',
      secondaryFg: '#0B1220',
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#EF4444',
      dangerFg: '#450A0A',
      info: '#3B82F6',
      infoFg: '#FFFFFF',
      link: '#3B82F6',
    },
    dark: {
      bg: '#0B0F15',
      fg: '#E5E7EB',
      muted: '#9CA3AF',
      border: '#1F2937',
      card: '#111827',
      input: '#111827',
      primary: '#94A3B8',
      primaryFg: '#0B1220',
      secondary: '#64748B',
      secondaryFg: '#0B1220',
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#EF4444',
      dangerFg: '#450A0A',
      info: '#3B82F6',
      infoFg: '#0B1220',
      link: '#3B82F6',
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    light: {
      bg: '#FFFFFF',
      fg: '#0B1220',
      muted: '#334155',
      border: '#0B1220',
      card: '#FFFFFF',
      input: '#FFFFFF',
      primary: '#000000',
      primaryFg: '#FFFFFF',
      secondary: '#0B1220',
      secondaryFg: '#FFFFFF',
      success: '#16A34A',
      successFg: '#FFFFFF',
      warning: '#F59E0B',
      warningFg: '#0B1220',
      danger: '#DC2626',
      dangerFg: '#FFFFFF',
      info: '#2563EB',
      infoFg: '#FFFFFF',
      link: '#000000',
    },
    dark: {
      bg: '#000000',
      fg: '#FFFFFF',
      muted: '#CBD5F5',
      border: '#FFFFFF',
      card: '#0B1220',
      input: '#0B1220',
      primary: '#FFFFFF',
      primaryFg: '#0B1220',
      secondary: '#CBD5F5',
      secondaryFg: '#0B1220',
      success: '#22C55E',
      successFg: '#0B1220',
      warning: '#F59E0B',
      warningFg: '#0B1220',
      danger: '#EF4444',
      dangerFg: '#0B1220',
      info: '#60A5FA',
      infoFg: '#0B1220',
      link: '#FFFFFF',
    },
  },
];

export const UI_STATUS_PRESETS: UiStatusPreset[] = [
  {
    id: 'default',
    name: 'Default',
    tokens: {
      success: '#22C55E',
      successFg: '#052E16',
      warning: '#F59E0B',
      warningFg: '#451A03',
      danger: '#EF4444',
      dangerFg: '#450A0A',
      info: '#3B82F6',
      infoFg: '#0B1220',
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    tokens: {
      success: '#10B981',
      successFg: '#ECFDF5',
      warning: '#F97316',
      warningFg: '#FFF7ED',
      danger: '#F43F5E',
      dangerFg: '#FFF1F2',
      info: '#0EA5E9',
      infoFg: '#E0F2FE',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    tokens: {
      success: '#84CC16',
      successFg: '#365314',
      warning: '#F59E0B',
      warningFg: '#78350F',
      danger: '#FB7185',
      dangerFg: '#881337',
      info: '#38BDF8',
      infoFg: '#0C4A6E',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tokens: {
      success: '#34D399',
      successFg: '#064E3B',
      warning: '#FCD34D',
      warningFg: '#78350F',
      danger: '#FB7185',
      dangerFg: '#881337',
      info: '#60A5FA',
      infoFg: '#1E3A8A',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    tokens: {
      success: '#4ADE80',
      successFg: '#14532D',
      warning: '#EAB308',
      warningFg: '#713F12',
      danger: '#F87171',
      dangerFg: '#7F1D1D',
      info: '#38BDF8',
      infoFg: '#0C4A6E',
    },
  },
  {
    id: 'contrast',
    name: 'Contrast',
    tokens: {
      success: '#16A34A',
      successFg: '#FFFFFF',
      warning: '#B45309',
      warningFg: '#FFFFFF',
      danger: '#B91C1C',
      dangerFg: '#FFFFFF',
      info: '#1D4ED8',
      infoFg: '#FFFFFF',
    },
  },
];

// Default module configurations
export const DEFAULT_AREA_AVAILABILITY_CONFIG: AreaAvailabilityConfig = {
  labels: {
    unallocated: 'ยังไม่พร้อม',
    quotation: 'คำใบเสนอราคา',
    leased: 'เช่า',
    vacant: 'ว่าง',
  },
  labelsEn: {
    unallocated: 'Unallocated',
    quotation: 'Quotation',
    leased: 'Leased',
    vacant: 'Vacant',
  },
  colors: {
    unallocated: '#EF4444', // danger
    quotation: '#3B82F6', // info
    leased: '#F59E0B', // warning
    vacant: '#22C55E', // success
  },
  icons: {},
  iconTypes: {},
  order: ['unallocated', 'quotation', 'leased', 'vacant'],
  statusIcons: {
    unallocated: 'pi-ban', // ห้าม/ไม่พร้อม
    quotation: 'pi-file-edit', // เอกสาร/ใบเสนอราคา
    leased: 'pi-key', // กุญแจ/เช่า
    vacant: 'pi-check-circle', // ว่าง/พร้อม
  },
  statusIconTypes: {
    unallocated: 'library',
    quotation: 'library',
    leased: 'library',
    vacant: 'library',
  },
};

export const DEFAULT_FACILITIES_UTILITIES_CONFIG: FacilitiesUtilitiesConfig = {
  labels: {
    electricity: 'ไฟฟ้า',
    water: 'น้ำ',
    gas: 'แก๊ส',
    ac: 'แอร์',
  },
  labelsEn: {
    electricity: 'Electricity',
    water: 'Water',
    gas: 'Gas',
    ac: 'Air Conditioning',
  },
  colors: {
    electricity: '#FFD700',
    water: '#4CA3FF',
    gas: '#FF6384',
    ac: '#80E08E',
  },
  icons: {},
  iconTypes: {},
  order: ['electricity', 'water', 'gas', 'ac'],
  meterTypes: {
    electricity: {
      label: 'Electricity',
      labelTh: 'ไฟฟ้า',
      color: '#FFD700',
      icon: 'pi-bolt', // Lightning bolt for electricity
    },
    water: {
      label: 'Water',
      labelTh: 'น้ำ',
      color: '#4CA3FF',
      icon: 'pi-wave-pulse', // Wave icon for water
    },
    gas: {
      label: 'Gas',
      labelTh: 'แก๊ส',
      color: '#FF6384',
      icon: 'pi-gauge', // Gauge icon for gas meter
    },
    ac: {
      label: 'Air Conditioning',
      labelTh: 'แอร์',
      color: '#80E08E',
      icon: 'pi-asterisk', // Asterisk (snowflake-like) for cooling
    },
  },
  rentableItems: [],
};

export const DEFAULT_UI_CONFIG: UiConfig = {
  themeMode: 'light',
  paletteMode: 'preset',
  activePresetId: 'space-blue',
  statusMode: 'custom',
  activeStatusPresetId: null,
  tokens: UI_PRESETS[0].light,
  iconStyle: 'outline',
  labels: {
    sales: 'Sales',
    area: 'Area',
    contract: 'Contract',
    collection_finance: 'Collection & Finance',
    facilities: 'Facilities',
    report: 'Report',
    report_dashboard: 'Report',
  },
  moduleOverrides: {
    areaAvailability: DEFAULT_AREA_AVAILABILITY_CONFIG,
    facilitiesUtilities: DEFAULT_FACILITIES_UTILITIES_CONFIG,
  },
};

export const loadUiConfig = (): UiConfig => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_UI_CONFIG };
  }

  const raw =
    window.localStorage.getItem(UI_SETTINGS_KEY) ||
    window.localStorage.getItem(LEGACY_SETTINGS_KEY);
  if (!raw) {
    return { ...DEFAULT_UI_CONFIG };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UiConfig>;
    const presetId = parsed.activePresetId ?? DEFAULT_UI_CONFIG.activePresetId;
    const resolvedPresetId = UI_PRESETS.some((item) => item.id === presetId)
      ? presetId
      : DEFAULT_UI_CONFIG.activePresetId;
    const statusPresetId =
      parsed.activeStatusPresetId ?? DEFAULT_UI_CONFIG.activeStatusPresetId;
    const resolvedStatusPresetId = UI_STATUS_PRESETS.some(
      (item) => item.id === statusPresetId,
    )
      ? statusPresetId
      : 'default';
    const mergedTokens = {
      ...DEFAULT_UI_CONFIG.tokens,
      ...(parsed.tokens || {}),
    };
    const paletteMode = parsed.paletteMode ?? DEFAULT_UI_CONFIG.paletteMode;
    const statusMode = parsed.statusMode ?? DEFAULT_UI_CONFIG.statusMode;

    // Merge module overrides with deep merge
    const mergedModuleOverrides: ModuleOverrides = {
      areaAvailability: {
        ...DEFAULT_AREA_AVAILABILITY_CONFIG,
        ...(parsed.moduleOverrides?.areaAvailability || {}),
        labels: {
          ...DEFAULT_AREA_AVAILABILITY_CONFIG.labels,
          ...(parsed.moduleOverrides?.areaAvailability?.labels || {}),
        },
        labelsEn: {
          ...(DEFAULT_AREA_AVAILABILITY_CONFIG.labelsEn || {}),
          ...(parsed.moduleOverrides?.areaAvailability?.labelsEn || {}),
        },
        colors: {
          ...DEFAULT_AREA_AVAILABILITY_CONFIG.colors,
          ...(parsed.moduleOverrides?.areaAvailability?.colors || {}),
        },
        icons: {
          ...DEFAULT_AREA_AVAILABILITY_CONFIG.icons,
          ...(parsed.moduleOverrides?.areaAvailability?.icons || {}),
        },
        iconTypes: {
          ...(DEFAULT_AREA_AVAILABILITY_CONFIG.iconTypes || {}),
          ...(parsed.moduleOverrides?.areaAvailability?.iconTypes || {}),
        },
        statusIcons: {
          ...(DEFAULT_AREA_AVAILABILITY_CONFIG.statusIcons || {}),
          ...(parsed.moduleOverrides?.areaAvailability?.statusIcons || {}),
        },
        statusIconTypes: {
          ...(DEFAULT_AREA_AVAILABILITY_CONFIG.statusIconTypes || {}),
          ...(parsed.moduleOverrides?.areaAvailability?.statusIconTypes || {}),
        },
      },
      facilitiesUtilities: {
        ...DEFAULT_FACILITIES_UTILITIES_CONFIG,
        ...(parsed.moduleOverrides?.facilitiesUtilities || {}),
        labels: {
          ...DEFAULT_FACILITIES_UTILITIES_CONFIG.labels,
          ...(parsed.moduleOverrides?.facilitiesUtilities?.labels || {}),
        },
        labelsEn: {
          ...(DEFAULT_FACILITIES_UTILITIES_CONFIG.labelsEn || {}),
          ...(parsed.moduleOverrides?.facilitiesUtilities?.labelsEn || {}),
        },
        colors: {
          ...DEFAULT_FACILITIES_UTILITIES_CONFIG.colors,
          ...(parsed.moduleOverrides?.facilitiesUtilities?.colors || {}),
        },
        icons: {
          ...DEFAULT_FACILITIES_UTILITIES_CONFIG.icons,
          ...(parsed.moduleOverrides?.facilitiesUtilities?.icons || {}),
        },
        iconTypes: {
          ...(DEFAULT_FACILITIES_UTILITIES_CONFIG.iconTypes || {}),
          ...(parsed.moduleOverrides?.facilitiesUtilities?.iconTypes || {}),
        },
        meterTypes: {
          ...(DEFAULT_FACILITIES_UTILITIES_CONFIG.meterTypes || {}),
          ...(parsed.moduleOverrides?.facilitiesUtilities?.meterTypes || {}),
        },
        rentableItems:
          parsed.moduleOverrides?.facilitiesUtilities?.rentableItems ||
          DEFAULT_FACILITIES_UTILITIES_CONFIG.rentableItems,
      },
    };

    // Normalize labels: replace raw keys that were never properly set
    const mergedLabels = {
      ...DEFAULT_UI_CONFIG.labels,
      ...(parsed.labels || {}),
    };
    // Fix legacy raw-key labels (e.g. 'collection_finance' → 'Collection & Finance')
    for (const [key, value] of Object.entries(mergedLabels)) {
      if (value === key) {
        mergedLabels[key] = DEFAULT_UI_CONFIG.labels[key] || value;
      }
    }
    return {
      ...DEFAULT_UI_CONFIG,
      ...parsed,
      tokens: mergedTokens,
      labels: mergedLabels,
      moduleOverrides: mergedModuleOverrides,
      paletteMode,
      activePresetId: paletteMode === 'preset' ? resolvedPresetId : null,
      statusMode,
      activeStatusPresetId:
        statusMode === 'preset' ? resolvedStatusPresetId : null,
    };
  } catch {
    return { ...DEFAULT_UI_CONFIG };
  }
};

export const saveUiConfig = (config: UiConfig): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(config));
};

export const applyUiConfig = (config: UiConfig): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.dataset['theme'] = config.themeMode;
  root.dataset['iconStyle'] = config.iconStyle;

  const activeTokens = resolveTokens(config);
  setColorVars(activeTokens);
};

export const getLabelOverride = (key: string): string | null => {
  const config = loadUiConfig();
  return config.labels?.[key] || null;
};

export const resolveTokens = (config: UiConfig): UiTokens => {
  let tokens = config.tokens;
  if (config.paletteMode === 'preset' && config.activePresetId) {
    const preset = UI_PRESETS.find((item) => item.id === config.activePresetId);
    if (preset) {
      tokens = config.themeMode === 'dark' ? preset.dark : preset.light;
    }
  }

  if (config.statusMode === 'preset' && config.activeStatusPresetId) {
    const statusPreset = UI_STATUS_PRESETS.find(
      (item) => item.id === config.activeStatusPresetId,
    );
    if (statusPreset) {
      return {
        ...tokens,
        ...statusPreset.tokens,
      };
    }
  }

  return tokens;
};

const setColorVars = (tokens: UiTokens): void => {
  setColorVar('--bg', tokens.bg);
  setColorVar('--fg', tokens.fg);
  setColorVar('--muted', tokens.muted);
  setColorVar('--border', tokens.border);
  setColorVar('--card', tokens.card);
  setColorVar('--input', tokens.input);
  setColorVar('--primary', tokens.primary);
  setColorVar('--primary-fg', tokens.primaryFg);
  setColorVar('--secondary', tokens.secondary);
  setColorVar('--secondary-fg', tokens.secondaryFg);
  setColorVar('--success', tokens.success);
  setColorVar('--success-fg', tokens.successFg);
  setColorVar('--warning', tokens.warning);
  setColorVar('--warning-fg', tokens.warningFg);
  setColorVar('--danger', tokens.danger);
  setColorVar('--danger-fg', tokens.dangerFg);
  setColorVar('--info', tokens.info);
  setColorVar('--info-fg', tokens.infoFg);
  setColorVar('--link', tokens.link);
  setColorVar('--ring', tokens.primary);

  document.documentElement.style.setProperty(
    '--primary-foreground',
    'var(--primary-fg)',
  );
  document.documentElement.style.setProperty(
    '--secondary-foreground',
    'var(--secondary-fg)',
  );
  document.documentElement.style.setProperty(
    '--success-foreground',
    'var(--success-fg)',
  );
  document.documentElement.style.setProperty(
    '--warning-foreground',
    'var(--warning-fg)',
  );
  document.documentElement.style.setProperty(
    '--danger-foreground',
    'var(--danger-fg)',
  );
  document.documentElement.style.setProperty(
    '--info-foreground',
    'var(--info-fg)',
  );
};

const setColorVar = (name: string, hex: string): void => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return;
  }
  document.documentElement.style.setProperty(
    name,
    `${rgb.r} ${rgb.g} ${rgb.b}`,
  );
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

// ============================================
// Module-scoped Configuration Helpers
// ============================================

/**
 * Get module configuration with fallback to defaults
 */
export const getModuleConfig = (moduleId: ModuleId): ModuleStatusConfig => {
  const config = loadUiConfig();
  const override = config.moduleOverrides?.[moduleId];

  if (moduleId === 'areaAvailability') {
    return (
      (override as AreaAvailabilityConfig) || DEFAULT_AREA_AVAILABILITY_CONFIG
    );
  }
  if (moduleId === 'facilitiesUtilities') {
    return (
      (override as FacilitiesUtilitiesConfig) ||
      DEFAULT_FACILITIES_UTILITIES_CONFIG
    );
  }

  return DEFAULT_AREA_AVAILABILITY_CONFIG; // fallback
};

/**
 * Get Area Availability configuration
 */
export const getAreaAvailabilityConfig = (): AreaAvailabilityConfig => {
  return getModuleConfig('areaAvailability') as AreaAvailabilityConfig;
};

/**
 * Get Facilities Utilities configuration
 */
export const getFacilitiesUtilitiesConfig = (): FacilitiesUtilitiesConfig => {
  return getModuleConfig('facilitiesUtilities') as FacilitiesUtilitiesConfig;
};

/**
 * Apply scoped CSS variables to a specific element (for module-specific styling)
 * This sets CSS variables on the element itself, not on :root
 */
export const applyModuleScopedColors = (
  element: HTMLElement,
  moduleId: ModuleId,
  colorMap: Record<string, string>,
): void => {
  if (!element) return;

  Object.entries(colorMap).forEach(([key, hexColor]) => {
    const rgb = hexToRgb(hexColor);
    if (rgb) {
      // Set scoped variable: --module-{moduleId}-{key}
      const varName = `--module-${moduleId}-${key}`;
      element.style.setProperty(varName, `${rgb.r} ${rgb.g} ${rgb.b}`);
    }
  });
};

/**
 * Get color for a specific module and key with fallback
 */
export const getModuleColor = (
  moduleId: ModuleId,
  key: string,
  fallback?: string,
): string => {
  const config = getModuleConfig(moduleId);
  return config.colors?.[key] || fallback || '#000000';
};

/**
 * Get label for a specific module and key with fallback
 */
export const getModuleLabel = (
  moduleId: ModuleId,
  key: string,
  fallback?: string,
): string => {
  const config = getModuleConfig(moduleId);
  return config.labels?.[key] || fallback || key;
};

/**
 * Get English label for a specific module and key with fallback
 */
export const getModuleLabelEn = (
  moduleId: ModuleId,
  key: string,
  fallback?: string,
): string => {
  const config = getModuleConfig(moduleId);
  return config.labelsEn?.[key] || fallback || key;
};

/**
 * Get icon for a specific module and key with fallback
 */
export const getModuleIcon = (
  moduleId: ModuleId,
  key: string,
  fallback?: string,
): string => {
  const config = getModuleConfig(moduleId);
  return config.icons?.[key] || fallback || '';
};

/**
 * Get icon type for a specific module and key
 */
export const getModuleIconType = (
  moduleId: ModuleId,
  key: string,
): 'library' | 'upload' => {
  const config = getModuleConfig(moduleId);
  return (
    config.iconTypes?.[key] ||
    (config.icons?.[key]?.startsWith('data:') ? 'upload' : 'library')
  );
};

/**
 * Get status icon for Area Availability module
 */
export const getAreaStatusIcon = (
  statusId: string,
  fallback?: string,
): string => {
  const config = getAreaAvailabilityConfig();
  // Check config first, then fallback, then default from DEFAULT_AREA_AVAILABILITY_CONFIG
  const icon =
    config.statusIcons?.[statusId] ||
    fallback ||
    DEFAULT_AREA_AVAILABILITY_CONFIG.statusIcons?.[statusId] ||
    'pi-building';
  return icon;
};

/**
 * Get status icon type for Area Availability module
 */
export const getAreaStatusIconType = (
  statusId: string,
): 'library' | 'upload' => {
  const config = getAreaAvailabilityConfig();
  return (
    config.statusIconTypes?.[statusId] ||
    (config.statusIcons?.[statusId]?.startsWith('data:') ? 'upload' : 'library')
  );
};

/**
 * Convert file to dataURL (for icon upload)
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Update module configuration (merges with existing)
 */
export const updateModuleConfig = (
  moduleId: ModuleId,
  updates: Partial<ModuleStatusConfig>,
): void => {
  const config = loadUiConfig();

  // Get current config with proper typing
  let current: ModuleStatusConfig;
  if (moduleId === 'areaAvailability') {
    current =
      config.moduleOverrides?.areaAvailability ||
      DEFAULT_AREA_AVAILABILITY_CONFIG;
  } else if (moduleId === 'facilitiesUtilities') {
    current =
      config.moduleOverrides?.facilitiesUtilities ||
      DEFAULT_FACILITIES_UTILITIES_CONFIG;
  } else {
    current = DEFAULT_AREA_AVAILABILITY_CONFIG;
  }

  // Ensure current has required properties
  const currentLabels = (current as ModuleStatusConfig).labels || {};
  const currentColors = (current as ModuleStatusConfig).colors || {};
  const currentIcons = (current as ModuleStatusConfig).icons || {};

  // Handle Area Availability specific fields (statusIcons, statusIconTypes)
  let updated: any = {
    ...current,
    ...updates,
    labels: {
      ...currentLabels,
      ...(updates.labels || {}),
    },
    colors: {
      ...currentColors,
      ...(updates.colors || {}),
    },
    icons: {
      ...currentIcons,
      ...(updates.icons || {}),
    },
  };

  // Merge statusIcons and statusIconTypes for Area Availability
  if (moduleId === 'areaAvailability') {
    const areaConfig = current as AreaAvailabilityConfig;
    const areaUpdates = updates as Partial<AreaAvailabilityConfig>;
    updated.statusIcons = {
      ...(areaConfig.statusIcons || {}),
      ...(areaUpdates.statusIcons || {}),
    };
    updated.statusIconTypes = {
      ...(areaConfig.statusIconTypes || {}),
      ...(areaUpdates.statusIconTypes || {}),
    };
  }

  // Merge iconTypes for Facilities Utilities
  if (moduleId === 'facilitiesUtilities') {
    const facConfig = current as FacilitiesUtilitiesConfig;
    const facUpdates = updates as Partial<FacilitiesUtilitiesConfig>;
    updated.iconTypes = {
      ...(facConfig.iconTypes || {}),
      ...(facUpdates.iconTypes || {}),
    };
  }

  if (!config.moduleOverrides) {
    config.moduleOverrides = {};
  }

  config.moduleOverrides[moduleId] = updated as any;
  saveUiConfig(config);
};
