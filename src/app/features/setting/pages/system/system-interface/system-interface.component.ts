import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  UiConfig,
  UiPreset,
  UI_PRESETS,
  UiStatusPreset,
  UI_STATUS_PRESETS,
  DEFAULT_UI_CONFIG,
  applyUiConfig,
  loadUiConfig,
  saveUiConfig,
  resolveTokens,
  ModuleId,
  AreaAvailabilityConfig,
  FacilitiesUtilitiesConfig,
  getAreaAvailabilityConfig,
  getFacilitiesUtilitiesConfig,
  updateModuleConfig,
  fileToDataURL,
  DEFAULT_AREA_AVAILABILITY_CONFIG,
  DEFAULT_FACILITIES_UTILITIES_CONFIG,
} from '@core/services/ui-settings';

@Component({
  selector: 'app-system-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ConfirmDialogModule],
  templateUrl: './system-interface.component.html',
  styleUrl: './system-interface.component.css',
  providers: [MessageService, ConfirmationService],
})
export class SystemInterfaceComponent implements OnInit, OnDestroy {
  config: UiConfig = { ...DEFAULT_UI_CONFIG };
  presets: UiPreset[] = UI_PRESETS;
  statusPresets: UiStatusPreset[] = UI_STATUS_PRESETS;
  selectedElement: string = 'Background';
  private lastSavedConfig: UiConfig = cloneConfig(DEFAULT_UI_CONFIG);

  // Loading states
  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Module selection (can be 'global' or module ID)
  selectedModule: ModuleId | 'global' = 'global';
  
  // Area Availability config
  areaConfig: AreaAvailabilityConfig = getAreaAvailabilityConfig();
  
  // Facilities Utilities config
  facilitiesConfig: FacilitiesUtilitiesConfig = getFacilitiesUtilitiesConfig();
  
  // Rentable items (for Facilities)
  rentableItems = signal<Array<{
    id: string;
    name: string;
    nameTh: string;
    icon: string;
    iconType: 'library' | 'upload'; // 'library' for PrimeIcon class, 'upload' for dataURL
    color: string;
    enabled: boolean;
    order: number;
  }>>([]);
  /** Snapshot of rentable items when last loaded/saved (for dirty check) */
  private rentableItemsSnapshot: string = '[]';
  private rentableSaveDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly RENTABLE_SAVE_DEBOUNCE_MS = 1200;

  // Icon library modal
  showIconLibrary = signal<boolean>(false);
  selectedItemForIcon: string | null = null;
  iconSearchQuery: string = '';
  
  // Common PrimeIcons for selection - organized by category
  iconLibrary = [
    // Buildings & Places
    'pi-home', 'pi-building', 'pi-map-marker', 'pi-globe', 'pi-flag',
    // Transportation
    'pi-car', 'pi-truck', 'pi-send',
    // Technology
    'pi-desktop', 'pi-laptop', 'pi-mobile', 'pi-tablet', 'pi-wifi', 'pi-server',
    // Communication
    'pi-phone', 'pi-envelope', 'pi-comments', 'pi-send',
    // Time & Calendar
    'pi-calendar', 'pi-clock', 'pi-calendar-times', 'pi-calendar-plus',
    // People
    'pi-users', 'pi-user', 'pi-user-plus', 'pi-user-minus', 'pi-id-card',
    // Security
    'pi-key', 'pi-lock', 'pi-unlock', 'pi-shield', 'pi-verified',
    // Tools & Settings
    'pi-cog', 'pi-wrench', 'pi-tools', 'pi-settings', 'pi-sliders-h', 'pi-filter',
    // Search & Navigation
    'pi-search', 'pi-arrow-right', 'pi-arrow-left', 'pi-arrow-up', 'pi-arrow-down',
    'pi-angle-right', 'pi-angle-left', 'pi-angle-up', 'pi-angle-down',
    // Energy & Nature & Utilities
    'pi-bolt', 'pi-sun', 'pi-moon', 'pi-cloud', 'pi-snow', 'pi-wave-pulse', 'pi-gauge', 'pi-asterisk', 'pi-lightbulb',
    // Status & Feedback
    'pi-star', 'pi-heart', 'pi-thumbs-up', 'pi-thumbs-down', 'pi-check-circle',
    'pi-times-circle', 'pi-info-circle', 'pi-exclamation-triangle', 'pi-question-circle',
    // Documents & Files
    'pi-file', 'pi-folder', 'pi-folder-open', 'pi-file-edit', 'pi-book', 'pi-bookmark',
    // Media
    'pi-image', 'pi-video', 'pi-music', 'pi-camera', 'pi-picture',
    // Charts & Data
    'pi-chart-bar', 'pi-chart-line', 'pi-chart-pie', 'pi-table', 'pi-list',
    // Business
    'pi-briefcase', 'pi-shopping-cart', 'pi-credit-card', 'pi-wallet', 'pi-money-bill',
    // Actions
    'pi-plus', 'pi-minus', 'pi-times', 'pi-check', 'pi-trash', 'pi-pencil', 'pi-edit',
    'pi-save', 'pi-print', 'pi-download', 'pi-upload', 'pi-refresh', 'pi-replay',
    'pi-stop', 'pi-play', 'pi-pause', 'pi-step-backward', 'pi-step-forward',
    // Layout & Structure
    'pi-sitemap', 'pi-link', 'pi-th-large', 'pi-bars', 'pi-ellipsis-v', 'pi-ellipsis-h',
    // Additional useful icons
    'pi-box', 'pi-inbox', 'pi-tag', 'pi-tags', 'pi-qrcode', 'pi-barcode'
  ];

  // Filtered icons based on search
  filteredIcons = computed(() => {
    const query = this.iconSearchQuery.toLowerCase().trim();
    if (!query) {
      return this.iconLibrary;
    }
    return this.iconLibrary.filter(icon => 
      icon.toLowerCase().includes(query) || 
      icon.replace('pi-', '').includes(query)
    );
  });

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    try {
      this.config = loadUiConfig();
      this.lastSavedConfig = cloneConfig(this.config);
      this.syncPresetTokens();
      applyUiConfig(this.config);
      
      // Load module configs
      this.areaConfig = getAreaAvailabilityConfig();
      this.facilitiesConfig = getFacilitiesUtilitiesConfig();
      
      // Load rentable items from Facilities config
      this.loadRentableItems();
      
      // Load selected module from localStorage
      const savedModule = localStorage.getItem('interface_selected_module');
      if (savedModule === 'global' || savedModule === 'areaAvailability' || savedModule === 'facilitiesUtilities') {
        this.selectedModule = savedModule;
      }
    } catch (error) {
      console.error('Error loading interface settings:', error);
      this.showError('เกิดข้อผิดพลาดในการโหลดการตั้งค่า');
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.rentableSaveDebounce) {
      clearTimeout(this.rentableSaveDebounce);
      this.rentableSaveDebounce = null;
    }
  }

  // Temporary storage for global settings changes
  globalChanges: {
    themeMode?: 'light' | 'dark';
    paletteMode?: 'preset' | 'custom';
    activePresetId?: string | null;
    statusMode?: 'preset' | 'custom';
    activeStatusPresetId?: string | null;
    iconStyle?: 'outline' | 'solid';
    tokens?: Partial<UiConfig['tokens']>;
  } = {};

  onSettingsChange(): void {
    // Don't save immediately - store in temporary changes
    // User must click Save button to persist
  }

  selectPreset(preset: UiPreset): void {
    this.globalChanges.paletteMode = 'preset';
    this.globalChanges.activePresetId = preset.id;
    this.config.paletteMode = 'preset';
    this.config.activePresetId = preset.id;
    this.config.tokens = resolveTokens(this.config);
    applyUiConfig(this.config);
    this.persistGlobalConfig();
  }

  onTokenChange(): void {
    this.globalChanges.paletteMode = 'custom';
    this.globalChanges.activePresetId = null;
    // Apply preview immediately
    this.config.paletteMode = 'custom';
    this.config.activePresetId = null;
    applyUiConfig(this.config);
  }

  onStatusTokenChange(): void {
    this.globalChanges.statusMode = 'custom';
    this.globalChanges.activeStatusPresetId = null;
    // Apply preview immediately
    this.config.statusMode = 'custom';
    this.config.activeStatusPresetId = null;
    applyUiConfig(this.config);
  }

  selectStatusPreset(preset: UiStatusPreset): void {
    this.globalChanges.statusMode = 'preset';
    this.globalChanges.activeStatusPresetId = preset.id;
    this.config.statusMode = 'preset';
    this.config.activeStatusPresetId = preset.id;
    this.config.tokens = resolveTokens(this.config);
    applyUiConfig(this.config);
    this.persistGlobalConfig();
  }
  
  getCurrentStatusColor(type: 'success' | 'warning' | 'danger' | 'info'): string {
    // Get current tokens (including any unsaved changes)
    const currentConfig = { ...this.config };
    if (this.globalChanges.statusMode !== undefined) {
      currentConfig.statusMode = this.globalChanges.statusMode;
    }
    if (this.globalChanges.activeStatusPresetId !== undefined) {
      currentConfig.activeStatusPresetId = this.globalChanges.activeStatusPresetId;
    }
    const tokens = resolveTokens(currentConfig);
    return tokens[type] || '#000000';
  }

  onThemeModeChange(mode: 'light' | 'dark'): void {
    this.globalChanges.themeMode = mode;
    this.config.themeMode = mode;
    applyUiConfig(this.config);
    this.persistGlobalConfig();
  }

  onIconStyleChange(style: 'outline' | 'solid'): void {
    this.globalChanges.iconStyle = style;
    this.config.iconStyle = style;
    applyUiConfig(this.config);
    this.persistGlobalConfig();
  }

  /** Persist global config when user clicks Save. */
  private persistGlobalConfig(): void {
    if (!this.hasGlobalChanges()) return;
    this.isSaving.set(true);
    try {
      if (this.globalChanges.themeMode !== undefined) this.config.themeMode = this.globalChanges.themeMode;
      if (this.globalChanges.paletteMode !== undefined) this.config.paletteMode = this.globalChanges.paletteMode;
      if (this.globalChanges.activePresetId !== undefined) this.config.activePresetId = this.globalChanges.activePresetId;
      if (this.globalChanges.statusMode !== undefined) this.config.statusMode = this.globalChanges.statusMode;
      if (this.globalChanges.activeStatusPresetId !== undefined) this.config.activeStatusPresetId = this.globalChanges.activeStatusPresetId;
      if (this.globalChanges.iconStyle !== undefined) this.config.iconStyle = this.globalChanges.iconStyle;
      if (this.globalChanges.tokens) this.config.tokens = { ...this.config.tokens, ...this.globalChanges.tokens };
      if (this.config.paletteMode === 'preset') this.config.tokens = resolveTokens(this.config);
      saveUiConfig(this.config);
      applyUiConfig(this.config);
      this.lastSavedConfig = cloneConfig(this.config);
      this.globalChanges = {};
      this.showSuccess('บันทึกสำเร็จ', 'การตั้งค่าได้รับการบันทึกแล้ว');
    } catch (error) {
      console.error('Error saving global config:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      this.isSaving.set(false);
    }
  }

  saveGlobalConfig(): void {
    this.persistGlobalConfig();
  }

  hasGlobalChanges(): boolean {
    return Object.keys(this.globalChanges).length > 0;
  }

  resetGlobalConfigToDefault(): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่? การเปลี่ยนแปลงทั้งหมดจะถูกลบ',
      header: 'ยืนยันการรีเซ็ต',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'รีเซ็ต',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        try {
          this.config = cloneConfig(DEFAULT_UI_CONFIG);
          this.config.themeMode = DEFAULT_UI_CONFIG.themeMode;
          this.config.paletteMode = DEFAULT_UI_CONFIG.paletteMode;
          this.config.activePresetId = DEFAULT_UI_CONFIG.activePresetId;
          this.config.statusMode = DEFAULT_UI_CONFIG.statusMode;
          this.config.activeStatusPresetId = DEFAULT_UI_CONFIG.activeStatusPresetId;
          this.config.tokens = resolveTokens(this.config);
          saveUiConfig(this.config);
          applyUiConfig(this.config);
          this.lastSavedConfig = cloneConfig(this.config);
          this.globalChanges = {};
          this.showSuccess('รีเซ็ตสำเร็จ', 'การตั้งค่าถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว');
        } catch (error) {
          console.error('Error resetting config:', error);
          this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถรีเซ็ตการตั้งค่าได้');
        }
      }
    });
  }

  resetToDefault(): void {
    // Legacy method - redirect to new method
    this.resetGlobalConfigToDefault();
  }

  cancelChanges(): void {
    this.config = cloneConfig(this.lastSavedConfig);
    applyUiConfig(this.config);
  }

  setSelectedElement(label: string): void {
    this.selectedElement = label;
  }

  private syncPresetTokens(): void {
    if (this.config.paletteMode === 'preset') {
      this.config.tokens = resolveTokens(this.config);
    }
  }

  private showSuccess(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary: message,
      detail: detail || '',
      life: 3000
    });
  }
  
  private showError(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: message,
      detail: detail || '',
      life: 5000
    });
  }
  
  private showInfo(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: message,
      detail: detail || '',
      life: 3000
    });
  }

  // ============================================
  // Module Selection
  // ============================================
  onModuleChange(newModule: ModuleId | 'global'): void {
    const current = this.selectedModule;
    if (current === 'global' && this.hasGlobalChanges()) this.persistGlobalConfig();
    if (current === 'areaAvailability' && this.hasAreaChanges()) this.persistAreaConfig();
    if (current === 'facilitiesUtilities') {
      if (this.hasFacilitiesChanges()) this.persistFacilitiesConfig();
      if (this.hasRentableItemsChanges()) this.flushRentableSaveDebounce();
    }
    this.selectedModule = newModule;
    this.switchModule();
  }

  private switchModule(): void {
    localStorage.setItem('interface_selected_module', this.selectedModule);
    this.areaConfig = getAreaAvailabilityConfig();
    this.facilitiesConfig = getFacilitiesUtilitiesConfig();
    this.loadRentableItems();
    this.globalChanges = {};
    this.areaChanges = {};
    this.facilitiesChanges = {};
  }

  private loadRentableItems(): void {
    if (this.facilitiesConfig.rentableItems && this.facilitiesConfig.rentableItems.length > 0) {
      const items = this.facilitiesConfig.rentableItems.map(item => ({
        ...item,
        iconType: (item.iconType || (item.icon?.startsWith('data:') ? 'upload' : 'library')) as 'library' | 'upload'
      }));
      this.rentableItems.set(items);
    } else {
      this.rentableItems.set([]);
    }
    this.rentableItemsSnapshot = JSON.stringify(this.rentableItems());
  }

  // ============================================
  // Area Availability Methods
  // ============================================
  getAreaColor(key: string): string {
    // Return from changes first, then config
    return this.areaChanges.colors?.[key] || this.areaConfig.colors?.[key] || '#000000';
  }

  getAreaLabel(key: string): string {
    // Return from changes first, then config
    return this.areaChanges.labels?.[key] || this.areaConfig.labels?.[key] || key;
  }

  getAreaLabelEn(key: string): string {
    // Return from changes first, then config, then default
    return this.areaChanges.labelsEn?.[key] || this.areaConfig.labelsEn?.[key] || key;
  }

  getAreaIconType(key: string): 'library' | 'upload' {
    // Return from changes first, then config
    // Use statusIconTypes for Area Availability status icons
    return this.areaChanges.statusIconTypes?.[key] || 
           this.areaConfig.statusIconTypes?.[key] || 
           ((this.areaChanges.statusIcons?.[key] || this.areaConfig.statusIcons?.[key])?.startsWith('data:') ? 'upload' : 'library');
  }

  getAreaIcon(key: string): string {
    // Return from changes first, then config
    // Use statusIcons for Area Availability status icons
    return this.areaChanges.statusIcons?.[key] || this.areaConfig.statusIcons?.[key] || '';
  }

  // Temporary storage for unsaved changes (exposed for template)
  areaChanges: {
    colors?: Record<string, string>;
    labels?: Record<string, string>;
    labelsEn?: Record<string, string>;
    statusIcons?: Record<string, string>;
    statusIconTypes?: Record<string, 'library' | 'upload'>;
  } = {};

  onAreaColorChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const hex = this.normalizeHexColor(value);
    if (!this.areaChanges.colors) this.areaChanges.colors = {};
    this.areaChanges.colors[key] = hex || value;
    if (hex && input.type === 'text') {
      input.value = hex;
    }
    this.persistAreaConfig();
  }

  onAreaLabelChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.areaChanges.labels) this.areaChanges.labels = {};
    this.areaChanges.labels[key] = input.value;
    this.persistAreaConfig();
  }

  onAreaLabelEnChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.areaChanges.labelsEn) this.areaChanges.labelsEn = {};
    this.areaChanges.labelsEn[key] = input.value;
    this.persistAreaConfig();
  }

  openAreaIconLibrary(key: string): void {
    this.selectedItemForIcon = `area_${key}`;
    this.iconSearchQuery = '';
    this.showIconLibrary.set(true);
  }

  async onAreaIconUpload(key: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(png|svg\+xml)/)) {
      this.showError('ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์ PNG หรือ SVG เท่านั้น');
      input.value = '';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.showError('ไฟล์ใหญ่เกินไป', 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 2MB');
      input.value = '';
      return;
    }

    try {
      const dataURL = await fileToDataURL(file);
      if (!this.areaChanges.statusIcons) this.areaChanges.statusIcons = {};
      if (!this.areaChanges.statusIconTypes) this.areaChanges.statusIconTypes = {};
      this.areaChanges.statusIcons[key] = dataURL;
      this.areaChanges.statusIconTypes[key] = 'upload';
      input.value = ''; // allow selecting same file again
      this.persistAreaConfig();
    } catch (error) {
      console.error('Error uploading icon:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถอัปโหลดไอคอนได้');
      input.value = '';
    }
  }

  /** Persist area config (auto-save). */
  private persistAreaConfig(): void {
    if (!this.hasAreaChanges()) return;
    this.isSaving.set(true);
    try {
      const updates: any = {};
      if (this.areaChanges.colors) updates.colors = { ...this.areaConfig.colors, ...this.areaChanges.colors };
      if (this.areaChanges.labels) updates.labels = { ...this.areaConfig.labels, ...this.areaChanges.labels };
      if (this.areaChanges.labelsEn) updates.labelsEn = { ...(this.areaConfig.labelsEn || {}), ...this.areaChanges.labelsEn };
      if (this.areaChanges.statusIcons) updates.statusIcons = { ...(this.areaConfig.statusIcons || {}), ...this.areaChanges.statusIcons };
      if (this.areaChanges.statusIconTypes) updates.statusIconTypes = { ...(this.areaConfig.statusIconTypes || {}), ...this.areaChanges.statusIconTypes };
      if (Object.keys(updates).length > 0) {
        updateModuleConfig('areaAvailability', updates);
        this.areaConfig = getAreaAvailabilityConfig();
        this.areaChanges = {};
        this.showSuccess('บันทึกสำเร็จ', 'การตั้งค่า Area Availability ได้รับการบันทึกแล้ว');
      }
    } catch (error) {
      console.error('Error saving area config:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      this.isSaving.set(false);
    }
  }

  saveAreaConfig(): void {
    if (!this.hasAreaChanges()) {
      this.showInfo('ไม่มีข้อมูลที่ต้องบันทึก');
      return;
    }
    this.persistAreaConfig();
  }

  hasAreaChanges(): boolean {
    return Object.keys(this.areaChanges).length > 0;
  }

  resetAreaConfigToDefault(): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการรีเซ็ตการตั้งค่า Area Availability กลับเป็นค่าเริ่มต้นหรือไม่? การเปลี่ยนแปลงทั้งหมดจะถูกลบ',
      header: 'ยืนยันการรีเซ็ต',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'รีเซ็ต',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        try {
          updateModuleConfig('areaAvailability', DEFAULT_AREA_AVAILABILITY_CONFIG);
          this.areaConfig = getAreaAvailabilityConfig();
          this.areaChanges = {};
          this.showSuccess('รีเซ็ตสำเร็จ', 'การตั้งค่า Area Availability ถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว');
        } catch (error) {
          console.error('Error resetting area config:', error);
          this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถรีเซ็ตการตั้งค่าได้');
        }
      }
    });
  }

  // ============================================
  // Rentable Items Management (for Facilities)
  // ============================================
  addRentableItem(): void {
    const newItem = {
      id: `item_${Date.now()}`,
      name: '',
      nameTh: '',
      icon: 'pi-box',
      iconType: 'library' as const,
      color: '#3B82F6',
      enabled: true,
      order: this.rentableItems().length,
    };
    this.rentableItems.set([...this.rentableItems(), newItem]);
  }

  removeRentableItem(id: string): void {
    const item = this.rentableItems().find(i => i.id === id);
    const itemName = item?.nameTh || item?.name || 'รายการนี้';

    this.confirmationService.confirm({
      message: `คุณต้องการลบ "${itemName}" หรือไม่?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        this.rentableItems.set(this.rentableItems().filter(i => i.id !== id));
        this.saveRentableItems();
        this.showSuccess('ลบรายการแล้ว', 'บันทึกอัตโนมัติแล้ว');
      }
    });
  }

  /** Debounced auto-save for rentable items (name/color/icon/toggle changes). */
  onRentableItemFieldChange(): void {
    if (this.rentableSaveDebounce) clearTimeout(this.rentableSaveDebounce);
    this.rentableSaveDebounce = setTimeout(() => {
      this.rentableSaveDebounce = null;
      this.saveRentableItems();
    }, this.RENTABLE_SAVE_DEBOUNCE_MS);
  }

  private flushRentableSaveDebounce(): void {
    if (this.rentableSaveDebounce) {
      clearTimeout(this.rentableSaveDebounce);
      this.rentableSaveDebounce = null;
      this.saveRentableItems();
    }
  }

  saveRentableItems(): void {
    const items = this.rentableItems();
    const invalidItems = items.filter(item => !item.nameTh || !item.nameTh.trim());
    if (invalidItems.length > 0) {
      this.showError('กรุณากรอกชื่อ (ไทย) สำหรับทุกรายการ');
      return;
    }
    this.isSaving.set(true);
    try {
      updateModuleConfig('facilitiesUtilities', {
        rentableItems: items,
      } as Partial<FacilitiesUtilitiesConfig>);
      this.facilitiesConfig = getFacilitiesUtilitiesConfig();
      this.loadRentableItems();
      this.showSuccess('บันทึกแล้ว', 'รายการสิ่งที่จะเช่าได้บันทึกอัตโนมัติ');
    } catch (error) {
      console.error('Error saving rentable items:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกรายการได้');
    } finally {
      this.isSaving.set(false);
    }
  }

  resetRentableItemsToDefault(): void {
    const itemCount = this.rentableItems().length;
    if (itemCount === 0) {
      this.showError('ไม่มีรายการ', 'ไม่มีรายการสิ่งที่จะเช่าได้ให้ลบ');
      return;
    }
    
    this.confirmationService.confirm({
      message: `คุณต้องการลบรายการ "สิ่งที่จะเช่าได้" ทั้งหมด ${itemCount} รายการหรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      header: 'ยืนยันการลบรายการทั้งหมด',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'ลบทั้งหมด',
      rejectLabel: 'ยกเลิก',
        accept: () => {
        try {
          this.rentableItems.set([]);
          updateModuleConfig('facilitiesUtilities', {
            rentableItems: [],
          } as Partial<FacilitiesUtilitiesConfig>);
          this.facilitiesConfig = getFacilitiesUtilitiesConfig();
          this.loadRentableItems(); // sync snapshot
          this.showSuccess('ลบสำเร็จ', 'ลบรายการสิ่งที่จะเช่าได้ทั้งหมดแล้ว');
        } catch (error) {
          console.error('Error resetting rentable items:', error);
          this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
        }
      }
    });
  }

  openIconLibrary(itemId: string): void {
    this.selectedItemForIcon = itemId;
    this.iconSearchQuery = '';
    this.showIconLibrary.set(true);
  }

  selectIconFromLibrary(iconClass: string): void {
    if (!this.selectedItemForIcon) return;
    
    // Handle rentable items
    if (!this.selectedItemForIcon.startsWith('area_') && !this.selectedItemForIcon.startsWith('facilities_')) {
      const items = this.rentableItems().map(item =>
        item.id === this.selectedItemForIcon 
          ? { ...item, icon: iconClass, iconType: 'library' as const }
          : item
      );
      this.rentableItems.set(items);
      this.onRentableItemFieldChange();
    }
    // Handle Area status icons
    else if (this.selectedItemForIcon.startsWith('area_')) {
      const key = this.selectedItemForIcon.replace('area_', '');
      if (!this.areaChanges.statusIcons) this.areaChanges.statusIcons = {};
      if (!this.areaChanges.statusIconTypes) this.areaChanges.statusIconTypes = {};
      this.areaChanges.statusIcons[key] = iconClass;
      this.areaChanges.statusIconTypes[key] = 'library';
      this.persistAreaConfig();
    }
    // Handle Facilities meter type icons
    else if (this.selectedItemForIcon.startsWith('facilities_')) {
      const key = this.selectedItemForIcon.replace('facilities_', '');
      if (!this.facilitiesChanges.icons) this.facilitiesChanges.icons = {};
      if (!this.facilitiesChanges.iconTypes) this.facilitiesChanges.iconTypes = {};
      this.facilitiesChanges.icons[key] = iconClass;
      this.facilitiesChanges.iconTypes[key] = 'library';
      this.persistFacilitiesConfig();
    }

    this.showIconLibrary.set(false);
    this.selectedItemForIcon = null;
    this.iconSearchQuery = '';
  }

  async onRentableItemIconUpload(id: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(png|svg\+xml)/)) {
      this.showError('ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์ PNG หรือ SVG เท่านั้น');
      input.value = '';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.showError('ไฟล์ใหญ่เกินไป', 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 2MB');
      input.value = '';
      return;
    }

    try {
      const dataURL = await fileToDataURL(file);
      const items = this.rentableItems().map(item =>
        item.id === id ? { ...item, icon: dataURL, iconType: 'upload' as const } : item
      );
      this.rentableItems.set(items);
      input.value = ''; // allow selecting same file again
      this.onRentableItemFieldChange();
    } catch (error) {
      console.error('Error uploading icon:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถอัปโหลดไอคอนได้');
      input.value = '';
    }
  }

  // ============================================
  // Facilities Utilities Methods
  // ============================================
  getFacilitiesColor(key: string): string {
    // Return from changes first, then config
    return this.facilitiesChanges.colors?.[key] || this.facilitiesConfig.colors?.[key] || '#000000';
  }

  getFacilitiesLabel(key: string): string {
    // Return from changes first, then config
    return this.facilitiesChanges.labels?.[key] || this.facilitiesConfig.labels?.[key] || key;
  }

  getFacilitiesLabelEn(key: string): string {
    // Return from changes first, then config, then default
    return this.facilitiesChanges.labelsEn?.[key] || this.facilitiesConfig.labelsEn?.[key] || key;
  }

  getFacilitiesIconType(key: string): 'library' | 'upload' {
    const icon = this.getFacilitiesIcon(key);
    if (!icon) return 'library';
    return this.facilitiesChanges.iconTypes?.[key] ||
           this.facilitiesConfig.iconTypes?.[key] ||
           (icon.startsWith('data:') ? 'upload' : 'library');
  }

  getFacilitiesIcon(key: string): string {
    // Return from changes first, then config.icons, then meterTypes (default)
    const fromChanges = this.facilitiesChanges.icons?.[key];
    const fromConfig = this.facilitiesConfig.icons?.[key];
    const fromMeterTypes = this.facilitiesConfig.meterTypes?.[key]?.icon;
    return fromChanges ?? fromConfig ?? fromMeterTypes ?? '';
  }

  // Temporary storage for unsaved changes (exposed for template)
  facilitiesChanges: {
    colors?: Record<string, string>;
    labels?: Record<string, string>;
    labelsEn?: Record<string, string>;
    icons?: Record<string, string>;
    iconTypes?: Record<string, 'library' | 'upload'>;
  } = {};

  onFacilitiesColorChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const hex = this.normalizeHexColor(value);
    if (!this.facilitiesChanges.colors) this.facilitiesChanges.colors = {};
    this.facilitiesChanges.colors[key] = hex || value;
    if (hex && input.type === 'text') {
      input.value = hex;
    }
    this.persistFacilitiesConfig();
  }

  onFacilitiesLabelChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.facilitiesChanges.labels) this.facilitiesChanges.labels = {};
    this.facilitiesChanges.labels[key] = input.value;
    this.persistFacilitiesConfig();
  }

  onFacilitiesLabelEnChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.facilitiesChanges.labelsEn) this.facilitiesChanges.labelsEn = {};
    this.facilitiesChanges.labelsEn[key] = input.value;
    this.persistFacilitiesConfig();
  }

  openFacilitiesIconLibrary(key: string): void {
    this.selectedItemForIcon = `facilities_${key}`;
    this.iconSearchQuery = '';
    this.showIconLibrary.set(true);
  }

  async onFacilitiesIconUpload(key: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(png|svg\+xml)/)) {
      this.showError('ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์ PNG หรือ SVG เท่านั้น');
      input.value = '';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.showError('ไฟล์ใหญ่เกินไป', 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 2MB');
      input.value = '';
      return;
    }

    try {
      const dataURL = await fileToDataURL(file);
      if (!this.facilitiesChanges.icons) this.facilitiesChanges.icons = {};
      if (!this.facilitiesChanges.iconTypes) this.facilitiesChanges.iconTypes = {};
      this.facilitiesChanges.icons[key] = dataURL;
      this.facilitiesChanges.iconTypes[key] = 'upload';
      input.value = ''; // allow selecting same file again
      this.persistFacilitiesConfig();
    } catch (error) {
      console.error('Error uploading icon:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถอัปโหลดไอคอนได้');
      input.value = '';
    }
  }

  /** Persist facilities meter types only (auto-save). Rentable items saved via saveRentableItems. */
  private persistFacilitiesConfig(): void {
    if (!this.hasFacilitiesChanges()) return;
    this.isSaving.set(true);
    try {
      const updates: any = {};
      if (this.facilitiesChanges.colors) updates.colors = { ...this.facilitiesConfig.colors, ...this.facilitiesChanges.colors };
      if (this.facilitiesChanges.labels) updates.labels = { ...this.facilitiesConfig.labels, ...this.facilitiesChanges.labels };
      if (this.facilitiesChanges.labelsEn) updates.labelsEn = { ...(this.facilitiesConfig.labelsEn || {}), ...this.facilitiesChanges.labelsEn };
      if (this.facilitiesChanges.icons) updates.icons = { ...this.facilitiesConfig.icons, ...this.facilitiesChanges.icons };
      if (this.facilitiesChanges.iconTypes) updates.iconTypes = { ...(this.facilitiesConfig.iconTypes || {}), ...this.facilitiesChanges.iconTypes };
      if (Object.keys(updates).length > 0) {
        updateModuleConfig('facilitiesUtilities', updates);
        this.facilitiesConfig = getFacilitiesUtilitiesConfig();
        this.facilitiesChanges = {};
        this.showSuccess('บันทึกแล้ว', 'การตั้งค่า Facilities บันทึกอัตโนมัติ');
      }
    } catch (error) {
      console.error('Error saving facilities config:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      this.isSaving.set(false);
    }
  }

  saveFacilitiesConfig(): void {
    this.persistFacilitiesConfig();
  }

  hasFacilitiesChanges(): boolean {
    return Object.keys(this.facilitiesChanges).length > 0;
  }

  /** True when rentable items list or any item content differs from saved state */
  hasRentableItemsChanges(): boolean {
    return JSON.stringify(this.rentableItems()) !== this.rentableItemsSnapshot;
  }
  
  hasUnsavedChanges(): boolean {
    if (this.selectedModule === 'global') {
      return this.hasGlobalChanges();
    } else if (this.selectedModule === 'areaAvailability') {
      return this.hasAreaChanges();
    } else if (this.selectedModule === 'facilitiesUtilities') {
      return this.hasFacilitiesChanges() || this.hasRentableItemsChanges();
    }
    return false;
  }

  resetFacilitiesConfigToDefault(): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการรีเซ็ตการตั้งค่า Facilities (Utilities) กลับเป็นค่าเริ่มต้นหรือไม่?\n\n(รายการ "สิ่งที่จะเช่าได้" ที่เพิ่มไว้จะยังคงอยู่)',
      header: 'ยืนยันการรีเซ็ต',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'รีเซ็ต',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        try {
          // Preserve existing rentable items when resetting
          const currentRentableItems = this.facilitiesConfig.rentableItems || [];
          
          // Reset to default but keep rentable items
          const resetConfig = {
            ...DEFAULT_FACILITIES_UTILITIES_CONFIG,
            rentableItems: currentRentableItems
          };
          
          updateModuleConfig('facilitiesUtilities', resetConfig);
          this.facilitiesConfig = getFacilitiesUtilitiesConfig();
          this.facilitiesChanges = {};
          this.loadRentableItems();
          this.showSuccess('รีเซ็ตสำเร็จ', 'การตั้งค่า Facilities (Utilities) ถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว\n(รายการสิ่งที่จะเช่าได้ยังคงอยู่)');
        } catch (error) {
          console.error('Error resetting facilities config:', error);
          this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถรีเซ็ตการตั้งค่าได้');
        }
      }
    });
  }

  /** Normalize hex color to #RRGGBB (6 digits). Returns empty string if invalid. */
  private normalizeHexColor(value: string): string {
    const v = (value || '').trim();
    if (/^#([A-Fa-f0-9]{6})$/.test(v)) return v;
    if (/^#([A-Fa-f0-9]{3})$/.test(v)) {
      const r = v[1] + v[1], g = v[2] + v[2], b = v[3] + v[3];
      return `#${r}${g}${b}`;
    }
    if (/^([A-Fa-f0-9]{6})$/.test(v)) return '#' + v;
    if (/^([A-Fa-f0-9]{3})$/.test(v)) {
      const r = v[0] + v[0], g = v[1] + v[1], b = v[2] + v[2];
      return '#' + r + g + b;
    }
    return '';
  }
}

const cloneConfig = (config: UiConfig): UiConfig =>
  JSON.parse(JSON.stringify(config)) as UiConfig;
