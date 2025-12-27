import { useState, useEffect } from 'react';
import { parseDateFromDDMMYYYY } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import DatePicker from './DatePicker';

const Header = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, role, fullName, email } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const checkInISO = checkIn ? parseDateFromDDMMYYYY(checkIn) : '';
        const checkOutISO = checkOut ? parseDateFromDDMMYYYY(checkOut) : '';

        if (checkInISO && checkOutISO && checkInISO >= checkOutISO) {
            alert(t('booking.invalidDates') || 'Check-out date must be after check-in date');
            return;
        }

        const params = new URLSearchParams();
        if (checkInISO) params.append('checkInDate', checkInISO);
        if (checkOutISO) params.append('checkOutDate', checkOutISO);

        navigate(`/?${params.toString()}`);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const getUserDisplayName = () => {
        if (fullName) return fullName;
        if (email) return email.split('@')[0];
        return 'User';
    };

    return (
        <header className="bg-gray-900 shadow-lg border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                    {/* Logo & Title */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group order-1"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <img src="/logo.jpg" alt="RSR Logo" width={48} height={48} fetchPriority="high" className="relative h-12 w-12 rounded-full object-cover border-2 border-gray-700" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            <span className="text-blue-500">RAS</span> SEDR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">RENTAL</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-3xl w-full mx-auto order-3 lg:order-2 mt-2 lg:mt-0">
                        <div className="flex flex-col sm:flex-row gap-4 bg-gray-800/50 backdrop-blur-md p-3 rounded-2xl border border-gray-700/50 shadow-2xl">
                            <div className="flex-1 relative group date-picker-dark-mode">
                                <label className="absolute -top-3 left-4 bg-gray-800 px-2 text-xs text-blue-400 font-semibold tracking-wide uppercase z-10">
                                    {t('dashboard.checkIn')}
                                </label>
                                <DatePicker
                                    value={checkIn}
                                    onChange={setCheckIn}
                                    placeholder={isRTL ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}
                                    minDate={new Date()}
                                    isRTL={isRTL}
                                />
                            </div>
                            <div className="flex-1 relative group date-picker-dark-mode">
                                <label className="absolute -top-3 left-4 bg-gray-800 px-2 text-xs text-blue-400 font-semibold tracking-wide uppercase z-10">
                                    {t('dashboard.checkOut')}
                                </label>
                                <DatePicker
                                    value={checkOut}
                                    onChange={setCheckOut}
                                    placeholder={isRTL ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}
                                    minDate={new Date()}
                                    isRTL={isRTL}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2 h-14 min-w-[200px]"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {t('booking.checkAvailability')}
                            </button>
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 order-2 lg:order-3">



                        {/* Desktop Actions (Hidden on Mobile/Tablet) */}
                        {isDesktop && (
                            <div className="hidden lg:flex items-center gap-4">
                                {!isAuthenticated && (
                                    <LanguageSwitcher />
                                )}

                                {isAuthenticated ? (
                                    <>
                                        {/* Desktop User Actions */}
                                        {role === 'Client' && (
                                            <button
                                                onClick={() => navigate('/client/dashboard')}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                <span className="hidden lg:inline">{isRTL ? 'حسابي' : 'My Profile'}</span>
                                            </button>
                                        )}
                                        {role === 'Owner' && (
                                            <button onClick={() => navigate('/owner/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium shadow-lg transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
                                                <span className="hidden lg:inline">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
                                            </button>
                                        )}
                                        {(role === 'Admin' || role === 'SuperAdmin') && (
                                            <button onClick={() => navigate('/admin/owner-requests')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium shadow-lg transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                <span className="hidden lg:inline">
                                                    {role === 'SuperAdmin' ? (isRTL ? 'إدارة عليا' : 'Super Admin') : (isRTL ? 'لوحة الإدارة' : 'Admin')}
                                                </span>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate('/owner/login')}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 rounded-lg border border-gray-700 transition-all text-xs sm:text-sm font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            {isRTL ? 'دخول' : 'Login'}
                                        </button>
                                        <button
                                            onClick={() => navigate('/owner/register')}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium shadow-lg transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                            {isRTL ? 'تسجيل' : 'Register'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Unified Menu Button - VISIBLE TO ALL USERS (Auth & Guest) */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full border transition-all ${isAuthenticated
                                    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                                    : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300'}`}
                            >
                                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {isAuthenticated && (
                                    <div className="hidden md:flex w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full items-center justify-center text-xs font-bold text-white shadow-sm">
                                        {getUserDisplayName().charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {/* Unified Dropdown Menu */}
                            {showUserMenu && (
                                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden`}>

                                    {/* Language Switcher - ALWAYS FIRST */}
                                    <div className="border-b border-gray-700 pb-1">
                                        <LanguageSwitcher
                                            className="w-full px-4 py-3 hover:bg-gray-700/50 text-gray-200 justify-start"
                                            labelClassName="text-gray-200 text-sm"
                                        />
                                    </div>

                                    {isAuthenticated && (
                                        <>
                                            <div className="px-4 py-3 border-b border-gray-700">
                                                <p className="text-sm font-medium text-white truncate">{getUserDisplayName()}</p>
                                                <p className="text-xs text-gray-400 truncate">{email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-900/50 text-blue-400 border border-blue-800">
                                                    {role === 'SuperAdmin' ? (isRTL ? 'مدير أعلى' : 'Super Admin') :
                                                        role === 'Admin' ? (isRTL ? 'مدير' : 'Admin') :
                                                            role === 'Owner' ? (isRTL ? 'مالك' : 'Owner') :
                                                                (isRTL ? 'عميل' : 'Client')}
                                                </span>
                                            </div>

                                            {/* Mobile Navigation Links */}
                                            <div className="md:hidden border-b border-gray-700 py-1">
                                                {role === 'Client' && (
                                                    <button
                                                        onClick={() => { setShowUserMenu(false); navigate('/client/dashboard'); }}
                                                        className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        <span>{isRTL ? 'حسابي' : 'My Profile'}</span>
                                                    </button>
                                                )}
                                                {role === 'Owner' && (
                                                    <button onClick={() => { setShowUserMenu(false); navigate('/owner/dashboard'); }} className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700/50 transition-colors flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
                                                        <span>{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
                                                    </button>
                                                )}
                                                {(role === 'Admin' || role === 'SuperAdmin') && (
                                                    <button onClick={() => { setShowUserMenu(false); navigate('/admin/owner-requests'); }} className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700/50 transition-colors flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                        <span>{role === 'SuperAdmin' ? (isRTL ? 'إدارة عليا' : 'Super Admin') : (isRTL ? 'لوحة الإدارة' : 'Admin')}</span>
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/30 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                            </button>
                                        </>
                                    )}

                                    {!isAuthenticated && (
                                        <div className="py-1">
                                            <button
                                                onClick={() => { setShowUserMenu(false); navigate('/owner/login'); }}
                                                className="w-full px-4 py-3 text-left text-blue-400 hover:bg-gray-700/50 transition-colors flex items-center gap-3"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                                <span className="font-medium">{isRTL ? 'تسجيل الدخول' : 'Login'}</span>
                                            </button>
                                            <button
                                                onClick={() => { setShowUserMenu(false); navigate('/owner/register'); }}
                                                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/50 transition-colors flex items-center gap-3"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                                <span className="font-medium">{isRTL ? 'إنشاء حساب جديد' : 'Register'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
