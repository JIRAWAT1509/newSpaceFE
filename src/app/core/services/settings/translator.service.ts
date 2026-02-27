import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalstorageService } from './localstorage.service';

export interface Language {
  code: string;
  name: string;
  abbreviation: string;
}

const AVAILABLE_LANGUAGES: { [key: string]: Language } = {
  zh: {
    code: 'zh',
    name: 'Chinese',
    abbreviation: 'CN',
  },
  en: {
    code: 'en',
    name: 'English',
    abbreviation: 'EN',
  },
  th: {
    code: 'th',
    name: 'Thai',
    abbreviation: 'TH',
  },
};

@Injectable({ providedIn: 'root' })
export class TranslatorService {
  private translate = inject(TranslateService);
  private lss = inject(LocalstorageService);

  currentLanguage = signal<string>('en'); // default language

  init(): void {
    effect(() => this.translate.use(this.currentLanguage()));
    this.loadLanguage();
  }

  // Load saved language from local storage
  loadLanguage(): void {
    const lang = this.lss.getItem('setting-language');
    if (lang) {
      this.currentLanguage.set(lang);
    }
  }

  // Switch language at runtime
  setLanguage(lang: string, save: boolean): void {
    this.currentLanguage.set(lang);
    if (save) {
      this.lss.setItem('setting-language', this.currentLanguage());
    }
  }

  get abbreviation() {
    return AVAILABLE_LANGUAGES[this.currentLanguage()].abbreviation;
  }
}
