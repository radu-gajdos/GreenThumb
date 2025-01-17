import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const savedLanguage = localStorage.getItem('locale') || 'en';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: savedLanguage, // Force i18next to use the saved language
    fallbackLng: 'en', // Default language if detection fails
    supportedLngs: ['en', 'de'], // Supported languages
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      loadPath: '/internationalisation/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'cookie', 'querystring', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'locale',
    },
  });

export default i18n;
