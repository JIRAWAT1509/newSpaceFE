import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
} from '@core/services/ui-settings';

@Component({
  selector: 'app-system-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-interface.component.html',
  styleUrl: './system-interface.component.css',
})
export class SystemInterfaceComponent implements OnInit {
  config: UiConfig = { ...DEFAULT_UI_CONFIG };
  presets: UiPreset[] = UI_PRESETS;
  statusPresets: UiStatusPreset[] = UI_STATUS_PRESETS;
  selectedElement: string = 'Background';
  private lastSavedConfig: UiConfig = cloneConfig(DEFAULT_UI_CONFIG);
  saveStatus: string = '';
  private saveStatusTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.config = loadUiConfig();
    this.lastSavedConfig = cloneConfig(this.config);
    this.syncPresetTokens();
    applyUiConfig(this.config);
  }

  onSettingsChange(): void {
    if (this.config.paletteMode === 'preset') {
      this.config.tokens = resolveTokens(this.config);
    }
    saveUiConfig(this.config);
    applyUiConfig(this.config);
    this.lastSavedConfig = cloneConfig(this.config);
    this.showSaveStatus('Saved');
  }

  selectPreset(preset: UiPreset): void {
    this.config.paletteMode = 'preset';
    this.config.activePresetId = preset.id;
    this.config.tokens = resolveTokens(this.config);
    this.onSettingsChange();
  }

  onTokenChange(): void {
    this.config.paletteMode = 'custom';
    this.config.activePresetId = null;
    this.onSettingsChange();
  }

  onStatusTokenChange(): void {
    this.config.statusMode = 'custom';
    this.config.activeStatusPresetId = null;
    this.onTokenChange();
  }

  selectStatusPreset(preset: UiStatusPreset): void {
    this.config.statusMode = 'preset';
    this.config.activeStatusPresetId = preset.id;
    this.config.tokens = {
      ...this.config.tokens,
      ...preset.tokens,
    };
    this.onSettingsChange();
  }

  resetToDefault(): void {
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
    this.showSaveStatus('Reset to default');
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
}

const cloneConfig = (config: UiConfig): UiConfig =>
  JSON.parse(JSON.stringify(config)) as UiConfig;
