import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { getMyOwnerRequest, requestOwnerUpgrade, type OwnerRequest } from '../api/admin';

interface HomeHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const HomeHeader = ({ searchQuery, setSearchQuery }: HomeHeaderProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, role, fullName, email } = useAuth();
    const isRTL = i18n.language === 'ar';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();

    // Owner request state
    const [pendingRequest, setPendingRequest] = useState<OwnerRequest | null>(null);

    const [requestLoading, setRequestLoading] = useState(false);

    // Desktop detection
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    // Notification state
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Clear notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Check for pending owner request if logged in as Client
    useEffect(() => {
        if (isAuthenticated && role === 'Client') {
            checkPendingRequest();
        }
    }, [isAuthenticated, role]);

    const checkPendingRequest = async () => {
        try {
            const data = await getMyOwnerRequest();
            setPendingRequest(data.request);
        } catch (err) {
            // Ignore errors
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const handleBecomeOwner = async () => {
        try {
            setRequestLoading(true);
            const result = await requestOwnerUpgrade();
            setPendingRequest(result);
            setNotification({
                type: 'success',
                message: isRTL ? 'تم إرسال طلبك بنجاح!' : 'Your request has been submitted successfully!'
            });
        } catch (err: any) {
            setNotification({
                type: 'error',
                message: err.message || (isRTL ? 'فشل إرسال الطلب' : 'Failed to submit request')
            });
        } finally {
            setRequestLoading(false);
        }
    };

    const getUserDisplayName = () => {
        if (fullName) return fullName;
        if (email) return email.split('@')[0];
        return 'User';
    };

    const navLinks = [
        { path: '/', label: t('nav.home'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/chalets', label: isRTL ? 'الشاليهات' : 'Chalets', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { path: '/bookings', label: isRTL ? 'الحجوزات' : 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex items-center justify-between gap-6 relative">
                {/* Menu Button & Logo Container */}
                <div className={`flex items-center gap-4 z-20 ${!isDesktop ? 'w-full justify-between' : ''}`}>
                    {/* Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Logo - Mobile: Right (End), Desktop: Left (Start) */}
                    <Link to="/" className={`flex-shrink-0 ${!isDesktop ? 'order-last' : ''}`}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className={`${!isDesktop ? 'h-24' : 'h-32'} w-auto hover:opacity-90 transition-opacity`}
                        />
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl relative hidden md:block">
                    <input
                        type="text"
                        placeholder={isRTL ? "ابحث عن شاليه..." : "Search for a chalet..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-700 transition-all ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'
                            }`}
                    />
                    <svg
                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Desktop Actions */}
                {isDesktop && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <LanguageSwitcher />

                        {isAuthenticated ? (
                            /* ===== LOGGED IN USER ===== */
                            <div className="flex items-center gap-3">
                                {/* Become Owner Button - Only for Clients */}
                                {role === 'Client' && (
                                    <button
                                        onClick={pendingRequest ? undefined : handleBecomeOwner}
                                        disabled={requestLoading || !!pendingRequest}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${pendingRequest
                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-default'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {requestLoading ? (
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : pendingRequest ? (
                                            <>
                                                <span>⏳</span>
                                                <span className="hidden sm:inline">{isRTL ? 'قيد المراجعة' : 'Pending'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🏠</span>
                                                <span className="hidden sm:inline">{isRTL ? 'كن مالك' : 'Become Owner'}</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Owner Dashboard Button */}
                                {role === 'Owner' && (
                                    <Link
                                        to="/owner/dashboard"
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                        </svg>
                                        <span className="hidden sm:inline">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
                                    </Link>
                                )}

                                {/* Admin Dashboard Button */}
                                {role === 'Admin' && (
                                    <Link
                                        to="/admin/owner-requests"
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="hidden sm:inline">{isRTL ? 'الإدارة' : 'Admin'}</span>
                                    </Link>
                                )}

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                                    >
                                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {getUserDisplayName().charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden md:inline text-gray-700 font-medium max-w-[100px] truncate">
                                            {getUserDisplayName()}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* User Dropdown */}
                                    {showUserMenu && (
                                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50`}>
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{getUserDisplayName()}</p>
                                                <p className="text-xs text-gray-500 truncate">{email}</p>
                                                <span className="inline-block mt-2 px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                                                    {role === 'Admin' ? (isRTL ? 'مدير' : 'Admin') :
                                                        role === 'Owner' ? (isRTL ? 'مالك' : 'Owner') :
                                                            (isRTL ? 'عميل' : 'Client')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ===== NOT LOGGED IN ===== */
                            <>
                                <Link
                                    to="/owner/register"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full transition-all font-medium shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span className="hidden sm:inline">
                                        {isRTL ? 'التسجيل' : 'Register'}
                                    </span>
                                </Link>

                                <Link
                                    to="/owner/login"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all font-medium shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="hidden sm:inline">
                                        {isRTL ? 'تسجيل الدخول' : 'Login'}
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Mobile/Menu Dropdown */}
                {isMenuOpen && (
                    <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} w-72 bg-white shadow-xl border border-gray-100 rounded-b-2xl py-4 px-2 z-50 animate-fade-in-down`}>
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(link.path)
                                        ? 'bg-blue-50 text-blue-600 font-bold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                    </svg>
                                    <span className="text-lg">{link.label}</span>
                                </Link>
                            ))}

                            <div className="border-t border-gray-100 my-2 pt-2">
                                <LanguageSwitcher className="px-4 py-2 hover:bg-gray-50 w-full justify-start text-gray-600" />
                            </div>

                            {isAuthenticated ? (
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <div className="px-4 py-2">
                                        <p className="font-semibold text-gray-800">{getUserDisplayName()}</p>
                                        <p className="text-xs text-gray-500">{email}</p>
                                    </div>

                                    {role === 'Client' && (
                                        <button
                                            onClick={() => {
                                                if (!pendingRequest) handleBecomeOwner();
                                                setIsMenuOpen(false);
                                            }}
                                            disabled={requestLoading || !!pendingRequest}
                                            className="w-full px-4 py-3 text-left text-green-600 hover:bg-green-50 flex items-center gap-3"
                                        >
                                            {pendingRequest ? <span>⏳ {isRTL ? 'طلبك قيد المراجعة' : 'Request Pending'}</span> : <span>🏠 {isRTL ? 'كن مالك' : 'Become Owner'}</span>}
                                        </button>
                                    )}

                                    {role === 'Owner' && (
                                        <Link
                                            to="/owner/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-3 text-blue-600 hover:bg-blue-50 flex items-center gap-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
                                            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                                        </Link>
                                    )}

                                    {role === 'Admin' && (
                                        <Link
                                            to="/admin/owner-requests"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-3 text-purple-600 hover:bg-purple-50 flex items-center gap-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            {isRTL ? 'الإدارة' : 'Admin'}
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <Link
                                        to="/owner/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium"
                                    >
                                        {isRTL ? 'تسجيل الدخول' : 'Login'}
                                    </Link>
                                    <Link
                                        to="/owner/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-800 hover:bg-gray-50 font-medium"
                                    >
                                        {isRTL ? 'إنشاء حساب جديد' : 'Register'}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Search Bar (visible only on small screens) */}
            <div className="md:hidden px-6 pb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={isRTL ? "ابحث عن شاليه..." : "Search for a chalet..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-700 transition-all ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'
                            }`}
                    />
                    <svg
                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Notification Toast */}
            {
                notification && (
                    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-fade-in-down ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        {notification.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )
            }
        </header >
    );
};

export default HomeHeader;
