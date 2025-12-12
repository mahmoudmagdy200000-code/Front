import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className={`w-64 bg-gray-100 flex flex-col shadow-lg ${isRTL ? 'border-l' : 'border-r'} border-gray-200 relative z-20`}>
            {/* Logo Section */}
            <div className="p-6 flex justify-center">
                <Link to="/" className="group">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-32 w-auto transition-transform group-hover:scale-105"
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                <Link
                    to="/"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/')
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">{t('nav.home')}</span>
                </Link>

                <Link
                    to="/chalets"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/chalets')
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">{isRTL ? 'الشاليهات' : 'Chalets'}</span>
                </Link>

                <Link
                    to="/bookings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/bookings')
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{isRTL ? 'الحجوزات' : 'Bookings'}</span>
                </Link>

                <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard')
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium">{t('nav.dashboard')}</span>
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
