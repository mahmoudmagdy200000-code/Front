import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arTranslations from './translations/ar.json';
import enTranslations from './translations/en.json';

const savedLanguage = localStorage.getItem('language') || 'ar';

try {
    i18n
        .use(initReactI18next)
        .init({
            resources: {
                ar: { translation: arTranslations },
                en: { translation: enTranslations },
            },
            lng: savedLanguage,
            fallbackLng: 'ar',
            interpolation: {
                escapeValue: false,
            },
        });
    console.log('i18n initialized successfully');
} catch (error) {
    console.error('i18n initialization failed:', error);
}

export default i18n;
