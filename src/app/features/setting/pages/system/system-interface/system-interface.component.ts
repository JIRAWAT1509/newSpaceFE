import { Component, OnInit, signal, computed } from '@angular/core';
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
export class SystemInterfaceComponent implements OnInit {
  config: UiConfig = { ...DEFAULT_UI_CONFIG };
  presets: UiPreset[] = UI_PRESETS;
  statusPresets: UiStatusPreset[] = UI_STATUS_PRESETS;
  selectedElement: string = 'Background';
  private lastSavedConfig: UiConfig = cloneConfig(DEFAULT_UI_CONFIG);
  saveStatus: string = '';
  private saveStatusTimer: ReturnType<typeof setTimeout> | null = null;
  
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
    // Energy & Nature
    'pi-bolt', 'pi-sun', 'pi-moon', 'pi-cloud', 'pi-snow',
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
      if (savedModule === 'areaAvailability' || savedModule === 'facilitiesUtilities') {
        this.selectedModule = savedModule;
      }
    } catch (error) {
      console.error('Error loading interface settings:', error);
      this.showError('เกิดข้อผิดพลาดในการโหลดการตั้งค่า');
    } finally {
      this.isLoading.set(false);
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
    // Apply preview immediately
    this.config.paletteMode = 'preset';
    this.config.activePresetId = preset.id;
    this.config.tokens = resolveTokens(this.config);
    applyUiConfig(this.config);
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
    // Apply preview immediately
    this.config.statusMode = 'preset';
    this.config.activeStatusPresetId = preset.id;
    // Resolve tokens to get the correct merged tokens (this will merge status preset tokens)
    this.config.tokens = resolveTokens(this.config);
    // Apply the config to update CSS variables immediately
    applyUiConfig(this.config);
    this.showSuccess('เลือกชุดสีสถานะ', `เลือก "${preset.name}" แล้ว สีจะเปลี่ยนทันทีใน badges, buttons, และ status indicators ทั่วทั้งระบบ กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง`);
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
  }

  onIconStyleChange(style: 'outline' | 'solid'): void {
    this.globalChanges.iconStyle = style;
    this.config.iconStyle = style;
    applyUiConfig(this.config);
  }

  saveGlobalConfig(): void {
    if (!this.hasGlobalChanges()) {
      this.showInfo('ไม่มีข้อมูลที่ต้องบันทึก');
      return;
    }
    
    this.isSaving.set(true);
    try {
      // Apply all global changes
      if (this.globalChanges.themeMode !== undefined) {
        this.config.themeMode = this.globalChanges.themeMode;
      }
      if (this.globalChanges.paletteMode !== undefined) {
        this.config.paletteMode = this.globalChanges.paletteMode;
      }
      if (this.globalChanges.activePresetId !== undefined) {
        this.config.activePresetId = this.globalChanges.activePresetId;
      }
      if (this.globalChanges.statusMode !== undefined) {
        this.config.statusMode = this.globalChanges.statusMode;
      }
      if (this.globalChanges.activeStatusPresetId !== undefined) {
        this.config.activeStatusPresetId = this.globalChanges.activeStatusPresetId;
      }
      if (this.globalChanges.iconStyle !== undefined) {
        this.config.iconStyle = this.globalChanges.iconStyle;
      }
      if (this.globalChanges.tokens) {
        this.config.tokens = { ...this.config.tokens, ...this.globalChanges.tokens };
      }

      // Resolve tokens if needed (after applying all changes)
      if (this.config.paletteMode === 'preset') {
        this.config.tokens = resolveTokens(this.config);
      }

      // Save to storage
      saveUiConfig(this.config);
      applyUiConfig(this.config);
      this.lastSavedConfig = cloneConfig(this.config);
      this.globalChanges = {};
      this.showSuccess('บันทึกสำเร็จ', 'การตั้งค่าได้รับการบันทึกแล้ว');
      this.showSaveStatus('บันทึกสำเร็จ');
    } catch (error) {
      console.error('Error saving global config:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      this.isSaving.set(false);
    }
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
          this.showSaveStatus('รีเซ็ตเป็นค่าเริ่มต้นแล้ว');
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

  private showSaveStatus(message: string): void {
    this.saveStatus = message;
    if (this.saveStatusTimer) {
      clearTimeout(this.saveStatusTimer);
    }
    this.saveStatusTimer = setTimeout(() => {
      this.saveStatus = '';
    }, 2000);
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
  onModuleChange(): void {
    // Check for unsaved changes before switching
    if (this.hasUnsavedChanges()) {
      this.confirmationService.confirm({
        message: 'คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการเปลี่ยนหน้าหรือไม่?',
        header: 'ยืนยันการเปลี่ยนหน้า',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'เปลี่ยนหน้า',
        rejectLabel: 'ยกเลิก',
        accept: () => {
          this.switchModule();
        }
      });
    } else {
      this.switchModule();
    }
  }
  
  private switchModule(): void {
    localStorage.setItem('interface_selected_module', this.selectedModule);
    // Reload configs when switching modules
    this.areaConfig = getAreaAvailabilityConfig();
    this.facilitiesConfig = getFacilitiesUtilitiesConfig();
    // Load rentable items from Facilities config
    this.loadRentableItems();
    // Clear any unsaved changes
    this.globalChanges = {};
    this.areaChanges = {};
    this.facilitiesChanges = {};
  }

  private loadRentableItems(): void {
    if (this.facilitiesConfig.rentableItems) {
      // Ensure iconType has default value
      const items = this.facilitiesConfig.rentableItems.map(item => ({
        ...item,
        iconType: item.iconType || (item.icon?.startsWith('data:') ? 'upload' : 'library')
      }));
      this.rentableItems.set(items);
    } else {
      this.rentableItems.set([]);
    }
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
    if (!this.areaChanges.colors) this.areaChanges.colors = {};
    this.areaChanges.colors[key] = input.value;
  }

  onAreaLabelChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.areaChanges.labels) this.areaChanges.labels = {};
    this.areaChanges.labels[key] = input.value;
  }

  onAreaLabelEnChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.areaChanges.labelsEn) this.areaChanges.labelsEn = {};
    this.areaChanges.labelsEn[key] = input.value;
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
      this.showInfo('อัปโหลดสำเร็จ', 'กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง');
    } catch (error) {
      console.error('Error uploading icon:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถอัปโหลดไอคอนได้');
      input.value = '';
    }
  }

  saveAreaConfig(): void {
    if (!this.hasAreaChanges()) {
      this.showInfo('ไม่มีข้อมูลที่ต้องบันทึก');
      return;
    }
    
    this.isSaving.set(true);
    try {
      const updates: any = {};
      if (this.areaChanges.colors) {
        updates.colors = { ...this.areaConfig.colors, ...this.areaChanges.colors };
      }
      if (this.areaChanges.labels) {
        updates.labels = { ...this.areaConfig.labels, ...this.areaChanges.labels };
      }
      if (this.areaChanges.labelsEn) {
        updates.labelsEn = { ...(this.areaConfig.labelsEn || {}), ...this.areaChanges.labelsEn };
      }
      if (this.areaChanges.statusIcons) {
        updates.statusIcons = { ...(this.areaConfig.statusIcons || {}), ...this.areaChanges.statusIcons };
      }
      if (this.areaChanges.statusIconTypes) {
        updates.statusIconTypes = { ...(this.areaConfig.statusIconTypes || {}), ...this.areaChanges.statusIconTypes };
      }

      if (Object.keys(updates).length > 0) {
        updateModuleConfig('areaAvailability', updates);
        this.areaConfig = getAreaAvailabilityConfig();
        this.areaChanges = {};
        this.showSuccess('บันทึกสำเร็จ', 'การตั้งค่า Area Availability ได้รับการบันทึกแล้ว');
        this.showSaveStatus('บันทึกสำเร็จ');
      } else {
        this.showInfo('ไม่มีข้อมูลที่ต้องบันทึก');
      }
    } catch (error) {
      console.error('Error saving area config:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      this.isSaving.set(false);
    }
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
          this.showSaveStatus('รีเซ็ตเป็นค่าเริ่มต้นแล้ว');
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
    const itemName = item?.nameTh || 'รายการนี้';
    
    this.confirmationService.confirm({
      message: `คุณต้องการลบ${itemName}หรือไม่?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        this.rentableItems.set(this.rentableItems().filter(item => item.id !== id));
        this.showInfo('ลบสำเร็จ', `ลบ${itemName}เรียบร้อยแล้ว`);
      }
    });
  }

  saveRentableItems(): void {
    // Validate items
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
      this.showSuccess('บันทึกสำเร็จ', 'รายการสิ่งที่จะเช่าได้ได้รับการบันทึกแล้ว');
      this.showSaveStatus('บันทึกสำเร็จ');
    } catch (error) {
      console.error('Error saving rentable items:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกรายการได้');
    } finally {
      this.isSaving.set(false);
    }
  }

  resetRentableItemsToDefault(): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการลบรายการสิ่งที่จะเช่าได้ทั้งหมดหรือไม่?',
      header: 'ยืนยันการรีเซ็ต',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'รีเซ็ต',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        try {
          this.rentableItems.set([]);
          updateModuleConfig('facilitiesUtilities', {
            rentableItems: [],
          } as Partial<FacilitiesUtilitiesConfig>);
          this.facilitiesConfig = getFacilitiesUtilitiesConfig();
          this.showSuccess('รีเซ็ตสำเร็จ', 'รายการสิ่งที่จะเช่าได้ถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว');
          this.showSaveStatus('รีเซ็ตเป็นค่าเริ่มต้นแล้ว');
        } catch (error) {
          console.error('Error resetting rentable items:', error);
          this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถรีเซ็ตรายการได้');
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
      this.showInfo('เลือกไอคอนสำเร็จ', 'กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง');
    } 
    // Handle Area status icons
    else if (this.selectedItemForIcon.startsWith('area_')) {
      const key = this.selectedItemForIcon.replace('area_', '');
      if (!this.areaChanges.statusIcons) this.areaChanges.statusIcons = {};
      if (!this.areaChanges.statusIconTypes) this.areaChanges.statusIconTypes = {};
      this.areaChanges.statusIcons[key] = iconClass;
      this.areaChanges.statusIconTypes[key] = 'library';
      this.showInfo('เลือกไอคอนสำเร็จ', 'กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง');
    }
    // Handle Facilities meter type icons
    else if (this.selectedItemForIcon.startsWith('facilities_')) {
      const key = this.selectedItemForIcon.replace('facilities_', '');
      if (!this.facilitiesChanges.icons) this.facilitiesChanges.icons = {};
      if (!this.facilitiesChanges.iconTypes) this.facilitiesChanges.iconTypes = {};
      this.facilitiesChanges.icons[key] = iconClass;
      this.facilitiesChanges.iconTypes[key] = 'library';
      this.showInfo('เลือกไอคอนสำเร็จ', 'กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง');
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
      this.showInfo('อัปโหลดสำเร็จ', 'กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง');
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
    // Return from changes first, then config
    return this.facilitiesChanges.iconTypes?.[key] || 
           this.facilitiesConfig.iconTypes?.[key] || 
           ((this.facilitiesChanges.icons?.[key] || this.facilitiesConfig.icons?.[key])?.startsWith('data:') ? 'upload' : 'library');
  }

  getFacilitiesIcon(key: string): string {
    // Return from changes first, then config
    return this.facilitiesChanges.icons?.[key] || this.facilitiesConfig.icons?.[key] || '';
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
    if (!this.facilitiesChanges.colors) this.facilitiesChanges.colors = {};
    this.facilitiesChanges.colors[key] = input.value;
  }

  onFacilitiesLabelChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.facilitiesChanges.labels) this.facilitiesChanges.labels = {};
    this.facilitiesChanges.labels[key] = input.value;
  }

  onFacilitiesLabelEnChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.facilitiesChanges.labelsEn) this.facilitiesChanges.labelsEn = {};
    this.facilitiesChanges.labelsEn[key] = input.value;
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
      this.showInfo('อัปโหลดสำเร็จ', 'กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง');
    } catch (error) {
      console.error('Error uploading icon:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถอัปโหลดไอคอนได้');
      input.value = '';
    }
  }

  saveFacilitiesConfig(): void {
    if (!this.hasFacilitiesChanges() && this.rentableItems().length === (this.facilitiesConfig.rentableItems?.length || 0)) {
      this.showInfo('ไม่มีข้อมูลที่ต้องบันทึก');
      return;
    }
    
    this.isSaving.set(true);
    try {
      const updates: any = {};
      if (this.facilitiesChanges.colors) {
        updates.colors = { ...this.facilitiesConfig.colors, ...this.facilitiesChanges.colors };
      }
      if (this.facilitiesChanges.labels) {
        updates.labels = { ...this.facilitiesConfig.labels, ...this.facilitiesChanges.labels };
      }
      if (this.facilitiesChanges.labelsEn) {
        updates.labelsEn = { ...(this.facilitiesConfig.labelsEn || {}), ...this.facilitiesChanges.labelsEn };
      }
      if (this.facilitiesChanges.icons) {
        updates.icons = { ...this.facilitiesConfig.icons, ...this.facilitiesChanges.icons };
      }
      if (this.facilitiesChanges.iconTypes) {
        updates.iconTypes = { ...(this.facilitiesConfig.iconTypes || {}), ...this.facilitiesChanges.iconTypes };
      }
      
      // Always save rentable items if they exist
      if (this.rentableItems().length > 0) {
        updates.rentableItems = this.rentableItems();
      }

      if (Object.keys(updates).length > 0) {
        updateModuleConfig('facilitiesUtilities', updates);
        this.facilitiesConfig = getFacilitiesUtilitiesConfig();
        this.facilitiesChanges = {};
        this.loadRentableItems();
        this.showSuccess('บันทึกสำเร็จ', 'การตั้งค่า Facilities (Utilities) ได้รับการบันทึกแล้ว');
        this.showSaveStatus('บันทึกสำเร็จ');
      } else {
        this.showInfo('ไม่มีข้อมูลที่ต้องบันทึก');
      }
    } catch (error) {
      console.error('Error saving facilities config:', error);
      this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      this.isSaving.set(false);
    }
  }

  hasFacilitiesChanges(): boolean {
    return Object.keys(this.facilitiesChanges).length > 0;
  }
  
  hasUnsavedChanges(): boolean {
    if (this.selectedModule === 'global') {
      return this.hasGlobalChanges();
    } else if (this.selectedModule === 'areaAvailability') {
      return this.hasAreaChanges();
    } else if (this.selectedModule === 'facilitiesUtilities') {
      return this.hasFacilitiesChanges();
    }
    return false;
  }

  resetFacilitiesConfigToDefault(): void {
    this.confirmationService.confirm({
      message: 'คุณต้องการรีเซ็ตการตั้งค่า Facilities (Utilities) กลับเป็นค่าเริ่มต้นหรือไม่? การเปลี่ยนแปลงทั้งหมดจะถูกลบ',
      header: 'ยืนยันการรีเซ็ต',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'รีเซ็ต',
      rejectLabel: 'ยกเลิก',
      accept: () => {
        try {
          updateModuleConfig('facilitiesUtilities', DEFAULT_FACILITIES_UTILITIES_CONFIG);
          this.facilitiesConfig = getFacilitiesUtilitiesConfig();
          this.facilitiesChanges = {};
          this.loadRentableItems();
          this.showSuccess('รีเซ็ตสำเร็จ', 'การตั้งค่า Facilities (Utilities) ถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว');
          this.showSaveStatus('รีเซ็ตเป็นค่าเริ่มต้นแล้ว');
        } catch (error) {
          console.error('Error resetting facilities config:', error);
          this.showError('เกิดข้อผิดพลาด', 'ไม่สามารถรีเซ็ตการตั้งค่าได้');
        }
      }
    });
  }
}

const cloneConfig = (config: UiConfig): UiConfig =>
  JSON.parse(JSON.stringify(config)) as UiConfig;
