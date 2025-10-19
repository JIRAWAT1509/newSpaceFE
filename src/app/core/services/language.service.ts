import { Injectable, signal } from '@angular/core';
import { Language } from '../models/language.model';
import { AVAILABLE_LANGUAGES } from '../data/language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private availableLanguages = AVAILABLE_LANGUAGES;
  // private currentLanguage = signal<Language>(AVAILABLE_LANGUAGES[1]); // Default to English
  private currentLanguageSignal = signal<Language>(AVAILABLE_LANGUAGES[1]); // Default to English
  public readonly currentLanguage = this.currentLanguageSignal.asReadonly();

  constructor() {
    // Load saved language from localStorage
    this.loadLanguageFromStorage();
  }

  // private loadLanguageFromStorage(): void {
  //   const savedLangCode = localStorage.getItem('selectedLanguage');
  //   if (savedLangCode) {
  //     const lang = this.availableLanguages.find(l => l.code === savedLangCode);
  //     if (lang) {
  //       this.currentLanguage.set(lang);
  //     }
  //   }
  // }
  private loadLanguageFromStorage(): void {
    const savedLangCode = localStorage.getItem('selectedLanguage');
    if (savedLangCode) {
      const lang = this.availableLanguages.find(l => l.code === savedLangCode);
      if (lang) {
        this.currentLanguageSignal.set(lang);
      }
    }
  }


  getAvailableLanguages(): Language[] {
    return this.availableLanguages;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  // setLanguage(languageCode: string): void {
  //   const lang = this.availableLanguages.find(l => l.code === languageCode);
  //   if (lang) {
  //     this.currentLanguage.set(lang);
  //     localStorage.setItem('selectedLanguage', languageCode);
  //   }
  // }
    setLanguage(languageCode: string): void {
    const lang = this.availableLanguages.find(l => l.code === languageCode);
    if (lang) {
      this.currentLanguageSignal.set(lang);
      localStorage.setItem('selectedLanguage', languageCode);
    }
  }


  getCurrentAbbreviation(): string {
    return this.currentLanguage().abbreviation;
  }
}
