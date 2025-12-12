import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
            title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <img
                src={i18n.language === 'ar' ? '/uk-flag.png' : '/egypt-flag.png'}
                alt={i18n.language === 'ar' ? 'English' : 'العربية'}
                className="w-6 h-6 rounded object-cover shadow-sm"
            />
            <span className="hidden sm:inline text-gray-700 text-sm font-medium">
                {i18n.language === 'ar' ? 'English' : 'العربية'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
