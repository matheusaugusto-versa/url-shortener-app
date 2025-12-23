import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonEN from '@/public/locales/en/common.json';
import messagesEN from '@/public/locales/en/messages.json';
import validationEN from '@/public/locales/en/validation.json';

import commonPT from '@/public/locales/pt-BR/common.json';
import messagesPT from '@/public/locales/pt-BR/messages.json';
import validationPT from '@/public/locales/pt-BR/validation.json';

const resources = {
  en: {
    common: commonEN,
    messages: messagesEN,
    validation: validationEN,
  },
  'pt-BR': {
    common: commonPT,
    messages: messagesPT,
    validation: validationPT,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'messages', 'validation'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    });
}

export default i18n;
