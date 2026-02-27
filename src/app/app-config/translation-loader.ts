import { inject, provideEnvironmentInitializer } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslatorService } from '../core/services/settings/translator.service';

export const translateLoader = provideTranslateService({
  // defaultLanguage: 'en',
  loader: provideTranslateHttpLoader({
    prefix: './assets/language/',
    suffix: '.json',
  }),
});

export const translateCacher = provideEnvironmentInitializer(() => {
  inject(TranslatorService).init();
});
