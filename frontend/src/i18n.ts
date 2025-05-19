import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)               // încarcă traducerile din public/locales
  .use(LanguageDetector)          // detectează limba browser-ului
  .use(initReactI18next)          // conectează la React
  .init({
    fallbackLng: 'en',            // dacă nu există traducere, folosește engleza
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,         // React scapă deja caracterele
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      // poți configura cum detectezi limba (localStorage, queryParam etc.)
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
