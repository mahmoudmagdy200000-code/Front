import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface LanguageSwitcherProps {
    className?: string;
    labelClassName?: string;
}

const LanguageSwitcher = ({ className = '', labelClassName = '' }: LanguageSwitcherProps) => {
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
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border border-transparent ${className}`}
            title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <img
                src={i18n.language === 'ar' ? '/uk-flag.png' : '/egypt-flag.png'}
                alt={i18n.language === 'ar' ? 'English' : 'العربية'}
                className="w-6 h-6 rounded object-cover shadow-sm"
            />
            <span className={`text-sm font-medium ${labelClassName}`}>
                {i18n.language === 'ar' ? 'English' : 'العربية'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
