import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface DashboardHeaderProps {
    // title: string; // Deprecated
}

const DashboardHeader = ({ }: DashboardHeaderProps) => {
    const { t, i18n } = useTranslation();
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            if (role === 'Owner') {
                try {
                    const bookings = await import('../api/bookings').then(m => m.getBookings());
                    const count = bookings.filter(b => b.Status === 'Pending').length;
                    setPendingCount(count);
                } catch (error) {
                    console.error('Failed to fetch pending bookings:', error);
                }
            }
        };
        fetchPendingCount();

        // Refresh every 2 minutes
        const interval = setInterval(fetchPendingCount, 120000);
        return () => clearInterval(interval);
    }, [role]);

    // Desktop detection
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { path: '/owner/dashboard', label: isRTL ? 'لوحة التحكم' : 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/', label: t('nav.home'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex items-center justify-between gap-6 relative">
                {/* Menu Button & Logo/Title Container */}
                <div className="flex items-center gap-4 z-20">
                    {/* Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-xl hover:bg-slate-100/80 text-slate-600 transition-all focus:outline-none active:scale-95"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                        {pendingCount > 0 && !isMenuOpen && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Logo - Desktop Only (Left side) */}
                    {isDesktop && (
                        <Link to="/" className="flex-shrink-0">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                width={128}
                                height={48}
                                fetchPriority="high"
                                className="h-12 w-auto hover:opacity-90 transition-opacity"
                            />
                        </Link>
                    )}
                </div>

                {/* Page Title - Centered (Visible on all) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none">
                    <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tight truncate max-w-[200px] md:max-w-md mx-auto">
                        {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                    </h1>
                </div>

                {/* Actions (Desktop) or Logo (Mobile) */}
                <div className="flex items-center gap-4 flex-shrink-0 z-20">
                    {isDesktop ? (
                        <>
                            <LanguageSwitcher />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full transition-all font-medium hover:shadow-md active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">
                                    {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                </span>
                            </button>
                        </>
                    ) : (
                        /* Mobile Logo (Right side) */
                        <Link to="/" className="flex-shrink-0">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                width={112}
                                height={40}
                                fetchPriority="high"
                                className="h-10 w-auto hover:opacity-90 transition-opacity"
                            />
                        </Link>
                    )}
                </div>

                {/* Mobile/Menu Dropdown */}
                {isMenuOpen && (
                    <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} w-72 bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-100 rounded-2xl mt-2 p-3 z-50 animate-fade-in-down mx-4`}>
                        <div className="space-y-1">
                            <div className="space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(link.path)
                                            ? 'bg-blue-50 text-blue-600 font-bold translate-x-1'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                                            }`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                        </svg>
                                        <span className="text-lg flex-1">{link.label}</span>
                                        {link.path === '/owner/dashboard' && pendingCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </Link>
                                ))}

                                <div className="border-t border-gray-100 my-2 pt-2">
                                    <LanguageSwitcher className="px-4 py-2 hover:bg-gray-50 w-full justify-start text-gray-600" />
                                </div>

                                <div className="border-t border-gray-100 my-2 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 rounded-xl transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default DashboardHeader;
