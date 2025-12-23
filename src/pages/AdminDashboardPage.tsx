import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, Card, LoadingSpinner, EmptyState } from '../components/ui';
import { getAllOwnerRequests, approveOwnerRequest, rejectOwnerRequest, type OwnerRequest } from '../api/admin';
import PendingReviews from '../components/reviews/PendingReviews';
import FeaturedChaletsManagement from '../components/admin/FeaturedChaletsManagement';
import AllBookingsManagement from '../components/admin/AllBookingsManagement';
import PlatformAnalyticsComponent from '../components/admin/PlatformAnalytics';
import DepositsAuditLog from '../components/admin/DepositsAuditLog';

// --- Icon Components ---
const OverviewIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const StarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const ReviewsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

const AdminDashboardPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { role, logout } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'reviews' | 'featured' | 'users' | 'bookings' | 'system_admins' | 'deposits'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [requests, setRequests] = useState<OwnerRequest[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [bookingFilters, setBookingFilters] = useState<{ status?: string; fromDate?: string; toDate?: string; chaletId?: number } | undefined>(undefined);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ FullName: '', Email: '', PhoneNumber: '' });

    // Redirect non-admin users
    useEffect(() => {
        if (role !== 'Admin' && role !== 'SuperAdmin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsData, usersData] = await Promise.all([
                getAllOwnerRequests(),
                import('../api/admin').then(m => m.getAllUsers())
            ]);
            setRequests(requestsData);
            setUsers(usersData);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            setActionLoading(requestId);
            const result = await approveOwnerRequest(requestId);
            setSuccessMessage(result.message);

            // Refresh the entire data to get the correct new status from the server
            fetchData();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to approve request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            setActionLoading(requestId);
            const result = await rejectOwnerRequest(requestId);
            setSuccessMessage(result.message);
            setRequests(prev => prev.map(r => r.Id === requestId ? { ...r, Status: 'Rejected' } : r));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reject request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpgradeUser = async (userId: string) => {
        try {
            setActionLoading(999999); // Dummy ID for user actions
            await import('../api/admin').then(m => m.upgradeUserToOwner(userId));
            setSuccessMessage(isRTL ? 'تم ترقية المستخدم بنجاح' : 'User upgraded successfully');
            setUsers(prev => prev.map(u => u.UserId === userId ? { ...u, Role: 'Owner' } : u));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to upgrade user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDowngradeUser = async (userId: string) => {
        try {
            setActionLoading(999999);
            const result = await import('../api/admin').then(m => m.downgradeUserToClient(userId));
            setSuccessMessage(result.message);

            // Re-fetch to see new status or updated roles
            fetchData();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to downgrade user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpgradeToAdmin = async (userId: string) => {
        try {
            setActionLoading(999999);
            await import('../api/admin').then(m => m.upgradeUserToAdmin(userId));
            setSuccessMessage(isRTL ? 'تم ترقية المستخدم لمدير بنجاح' : 'User upgraded to Admin successfully');
            setUsers(prev => prev.map(u => u.UserId === userId ? { ...u, Role: 'Admin' } : u));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to upgrade to Admin');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDowngradeFromAdmin = async (userId: string) => {
        try {
            setActionLoading(999999);
            await import('../api/admin').then(m => m.downgradeFromAdmin(userId));
            setSuccessMessage(isRTL ? 'تم سحب صلاحيات المدير' : 'Admin rights revoked');
            setUsers(prev => prev.map(u => u.UserId === userId ? { ...u, Role: 'Client' } : u));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to downgrade Admin');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateUserInfo = async () => {
        if (!editingUser) return;
        try {
            setActionLoading(999999);
            await import('../api/admin').then(m => m.updateUser(editingUser.UserId, editForm));
            setSuccessMessage(isRTL ? 'تم تحديث البيانات بنجاح' : 'User info updated successfully');
            setUsers(prev => prev.map(u => u.UserId === editingUser.UserId ? { ...u, ...editForm } : u));
            setEditingUser(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setEditForm({
            FullName: user.FullName || '',
            Email: user.Email || '',
            PhoneNumber: user.PhoneNumber || ''
        });
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟' : 'Are you sure you want to permanently delete this user?')) return;
        try {
            setActionLoading(999999);
            await import('../api/admin').then(m => m.deleteUser(userId));
            setSuccessMessage(isRTL ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
            setUsers(prev => prev.filter(u => u.UserId !== userId));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const isSuperAdmin = role === 'SuperAdmin';

    const handleViewBookingsFromAnalytics = (filters: { status?: string; fromDate?: string; toDate?: string; chaletId?: number }) => {
        setBookingFilters(filters);
        setActiveTab('bookings');
    };

    const navItems = [
        { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: <OverviewIcon /> },
        { id: 'bookings', label: isRTL ? 'إدارة الحجوزات' : 'Bookings Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: 'users', label: isRTL ? 'إدارة المستخدمين' : 'Users Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        ...(role === 'SuperAdmin' ? [{ id: 'system_admins', label: isRTL ? 'إدارة المدراء' : 'System Admins', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> }] : []),
        { id: 'requests', label: isRTL ? 'طلبات ترقية المالكين' : 'Owner Requests', icon: <UsersIcon /> },
        { id: 'reviews', label: isRTL ? 'مراجعات قيد الانتظار' : 'Pending Reviews', icon: <ReviewsIcon /> },
        { id: 'featured', label: isRTL ? 'إدارة الشاليهات المميزة' : 'Featured Management', icon: <StarIcon /> },
        ...(role === 'SuperAdmin' ? [{ id: 'deposits', label: isRTL ? 'سجل المدفوعات' : 'Deposits Log', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }] : []),
    ];

    if (loading) {
        return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحميل...' : 'Loading...'} />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Sidebar Overlay (Mobile only) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-72 bg-white border-e border-slate-200 flex flex-col z-40 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0 md:h-screen`}>
                <div className="p-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl shadow-lg shadow-indigo-200 mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-white font-black text-xl tracking-tight">
                                {isRTL ? 'لوحة الإدارة' : 'Admin Hub'}
                            </h1>
                            <p className="text-indigo-100/80 text-xs font-medium mt-1">
                                {isRTL ? 'إدارة محتوى المنصة' : 'Platform Management'}
                            </p>
                        </div>
                        <button
                            className="md:hidden text-white/80 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)]">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id as any);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <span className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}>
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.label}</span>
                                {activeTab === item.id && (
                                    <div className={`ms-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]`} />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-50">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className="text-sm">{isRTL ? 'خروج' : 'Logout'}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-stretch">

                {/* Mobile/Top Header */}
                <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all"
                            title={isRTL ? 'الرئيسية' : 'Home'}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </button>
                        <h2 className="text-base md:text-lg font-black text-slate-800 truncate max-w-[150px] sm:max-w-none">
                            {navItems.find(t => t.id === activeTab)?.label}
                        </h2>
                    </div>
                </header>

                <main className="p-4 md:p-8">
                    {/* Alerts */}
                    {(successMessage || error) && (
                        <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            {successMessage && (
                                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </div>
                                    <span className="font-bold">{successMessage}</span>
                                </div>
                            )}
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </div>
                                    <span className="font-bold">{error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="max-w-6xl mx-auto">

                        {/* --- Overview Tab --- */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                {isSuperAdmin && (
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                                {isRTL ? 'إحصائيات المنصة والأرباح' : 'Platform Analytics & Earnings'}
                                            </h2>
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6" />
                                        </div>
                                        <PlatformAnalyticsComponent onViewBookings={handleViewBookingsFromAnalytics} />
                                    </section>
                                )}
                                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <OverviewStatCard
                                        label={isRTL ? 'طلبات الترقية' : 'Upgrade Requests'}
                                        value={requests.filter(r => r.Status === 'Pending').length}
                                        icon="⏳"
                                        color="amber"
                                        onClick={() => setActiveTab('requests')}
                                    />
                                    <OverviewStatCard
                                        label={isRTL ? 'تم قبولهم' : 'Approved Requests'}
                                        value={requests.filter(r => r.Status === 'Approved').length}
                                        icon="✅"
                                        color="emerald"
                                        onClick={() => setActiveTab('requests')}
                                    />
                                    <OverviewStatCard
                                        label={isRTL ? 'طلبات مرفوضة' : 'Rejected Requests'}
                                        value={requests.filter(r => r.Status === 'Rejected').length}
                                        icon="❌"
                                        color="rose"
                                        onClick={() => setActiveTab('requests')}
                                    />
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <Card className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveTab('bookings')}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg">{isRTL ? 'الحجوزات' : 'Bookings'}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {isRTL ? 'متابعة وتأكيد كافة الحجوزات التي تتم عبر المنصة وتعديل حالاتها.' : 'Track and confirm all platform bookings and manage their statuses.'}
                                        </p>
                                    </Card>

                                    <Card className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveTab('users')}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <UsersIcon />
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg">{isRTL ? 'إدارة المستخدمين' : 'Users Management'}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {isRTL ? 'عرض جميع مستخدمي المنصة وترقية العملاء إلى ملاك أو العكس.' : 'View all platform users and upgrade/downgrade their roles.'}
                                        </p>
                                    </Card>

                                    <Card className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveTab('reviews')}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <ReviewsIcon />
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg">{isRTL ? 'إدارة المراجعات' : 'Manage Reviews'}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {isRTL ? 'قم بمراجعة تقييمات وتعليقات العملاء على الشاليهات وقبولها أو حذفها.' : 'Review and manage customer ratings and comments on chalets.'}
                                        </p>
                                    </Card>

                                    <Card className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveTab('featured')}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                <StarIcon />
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg">{isRTL ? 'الشاليهات المميزة' : 'Featured Chalets'}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {isRTL ? 'تحكم في الشاليهات التي تظهر في الواجهة الرئيسية للموقع كشاليهات مميزة.' : 'Manage chalets that appear on the homepage as featured listings.'}
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* --- Requests Tab --- */}
                        {activeTab === 'requests' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <Card padding="none" className="overflow-hidden border-slate-200">
                                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-slate-800">
                                            {isRTL ? 'طلبات ترقية المالكين' : 'Owner Upgrade Requests'}
                                        </h2>
                                        <Button variant="outline" size="sm" onClick={fetchData}>
                                            {isRTL ? 'تحديث' : 'Refresh'}
                                        </Button>
                                    </div>

                                    {requests.length === 0 ? (
                                        <EmptyState
                                            icon={<span className="text-6xl">📭</span>}
                                            title={isRTL ? 'لا توجد طلبات' : 'No Requests'}
                                            description={isRTL ? 'لا توجد طلبات ترقية حالياً' : 'No owner upgrade requests at the moment'}
                                        />
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-slate-50/50">
                                                        <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المستخدم' : 'User'}</th>
                                                        <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التواصل' : 'Contact'}</th>
                                                        <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</th>
                                                        <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التاريخ' : 'Date'}</th>
                                                        <th className="px-8 py-4 text-end text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {requests.map((request) => (
                                                        <tr key={request.Id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-8 py-5 whitespace-nowrap">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                                                                        {request.FullName?.charAt(0) || request.Username?.charAt(0) || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-slate-900">{request.FullName}</p>
                                                                        <p className="text-sm text-slate-400 font-medium">@{request.Username}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 whitespace-nowrap">
                                                                <p className="text-sm font-bold text-slate-700">{request.Email}</p>
                                                                <p className="text-xs text-slate-400 mt-1 font-mono" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>{request.PhoneNumber || '-'}</p>
                                                            </td>
                                                            <td className="px-8 py-5 whitespace-nowrap">
                                                                <StatusBadge status={request.Status} isRTL={isRTL} />
                                                            </td>
                                                            <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                                                                {new Date(request.CreatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                                            </td>
                                                            <td className="px-8 py-5 whitespace-nowrap text-end">
                                                                {(request.Status === 'Pending' || (request.Status === 'ConfirmedByAdmin' && role === 'SuperAdmin')) ? (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            variant="success"
                                                                            size="sm"
                                                                            className="rounded-xl font-black shadow-sm"
                                                                            onClick={() => handleApprove(request.Id)}
                                                                        >
                                                                            {request.Status === 'ConfirmedByAdmin'
                                                                                ? (isRTL ? 'موافقة نهائية' : 'Final Approve')
                                                                                : (role === 'SuperAdmin' ? (isRTL ? 'قبول' : 'Approve') : (isRTL ? 'تحقق' : 'Verify'))
                                                                            }
                                                                        </Button>
                                                                        {request.Status === 'Pending' && (
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50"
                                                                                onClick={() => handleReject(request.Id)}
                                                                            >
                                                                                {isRTL ? 'رفض' : 'Reject'}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ) : request.Status === 'ConfirmedByAdmin' && role !== 'SuperAdmin' ? (
                                                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                                                                        {isRTL ? 'تم التحقق - بانتظار السوبر' : 'Verified - Awaiting SuperAdmin'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-bold text-slate-400 italic">
                                                                        {isRTL ? 'تمت المعالجة' : 'Processed'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {/* --- Reviews Tab --- */}
                        {activeTab === 'reviews' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <PendingReviews />
                            </div>
                        )}

                        {/* --- Featured Tab --- */}
                        {activeTab === 'featured' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <FeaturedChaletsManagement />
                            </div>
                        )}

                        {/* --- Users Tab --- */}
                        {activeTab === 'users' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <Card padding="none" className="overflow-hidden border-slate-200">
                                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-slate-800">
                                            {isRTL ? 'إدارة جميع المستخدمين' : 'Platform Users Management'}
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المستخدم' : 'User'}</th>
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الدور' : 'Role'}</th>
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التواصل' : 'Contact'}</th>
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'تاريخ التسجيل' : 'Joined'}</th>
                                                    <th className="px-8 py-4 text-end text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {users.filter(u => u.Role !== 'SuperAdmin' && (role === 'SuperAdmin' || u.Role !== 'Admin')).map((user) => (
                                                    <tr key={user.UserId} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                                                                    {user.FullName?.charAt(0) || user.Username?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900">{user.FullName}</p>
                                                                    <p className="text-xs text-slate-400">@{user.Username}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.Role === 'SuperAdmin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                user.Role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                    user.Role === 'Owner' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                                }`}>
                                                                {user.Role === 'SuperAdmin' ? (isRTL ? 'مدير نظام' : 'Super Admin') :
                                                                    user.Role === 'Admin' ? (isRTL ? 'مدير' : 'Admin') :
                                                                        user.Role === 'Owner' ? (isRTL ? 'مالك' : 'Owner') :
                                                                            (isRTL ? 'عميل' : 'Client')}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <p className="text-xs font-bold text-slate-700">{user.Email}</p>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                            {new Date(user.CreatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-end">
                                                            <div className="flex justify-end gap-2">
                                                                {role === 'SuperAdmin' && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => openEditModal(user)}
                                                                            className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                                                            title={isRTL ? 'تعديل' : 'Edit'}
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteUser(user.UserId)}
                                                                            className="rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50"
                                                                            title={isRTL ? 'حذف' : 'Delete'}
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {user.Role !== 'Admin' && user.Role !== 'SuperAdmin' && (
                                                                    <Button
                                                                        variant={user.Role === 'Owner' ? 'outline' : 'primary'}
                                                                        size="sm"
                                                                        onClick={() => user.Role === 'Owner' ? handleDowngradeUser(user.UserId) : handleUpgradeUser(user.UserId)}
                                                                        className="rounded-xl font-bold"
                                                                    >
                                                                        {user.Role === 'Owner' ? (isRTL ? 'سحب صلاحية مالك' : 'Downgrade to Client') : (isRTL ? 'ترقية لمالك' : 'Upgrade to Owner')}
                                                                    </Button>
                                                                )}
                                                                {role === 'SuperAdmin' && user.Role === 'Client' && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleUpgradeToAdmin(user.UserId)}
                                                                        className="rounded-xl font-bold border-purple-100 text-purple-600 hover:bg-purple-50"
                                                                    >
                                                                        {isRTL ? 'ترقية لمدير' : 'Make Admin'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* --- Bookings Tab --- */}
                        {activeTab === 'bookings' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <AllBookingsManagement externalFilters={bookingFilters} />
                            </div>
                        )}

                        {/* --- Deposits Log Tab --- */}
                        {activeTab === 'deposits' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <DepositsAuditLog />
                            </div>
                        )}

                        {/* --- System Admins Tab --- */}
                        {activeTab === 'system_admins' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <Card padding="none" className="overflow-hidden border-slate-200">
                                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-slate-800">
                                            {isRTL ? 'إدارة طاقم الإدارة' : 'System Administration Staff'}
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المدير' : 'Admin'}</th>
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التواصل' : 'Contact'}</th>
                                                    <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المنصب' : 'Permission'}</th>
                                                    <th className="px-8 py-4 text-end text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {users.filter(u => u.Role === 'Admin' || u.Role === 'SuperAdmin').map((user) => (
                                                    <tr key={user.UserId} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 ${user.Role === 'SuperAdmin' ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'} rounded-xl flex items-center justify-center font-bold`}>
                                                                    {user.FullName?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900">{user.FullName}</p>
                                                                    <p className="text-xs text-slate-400">@{user.Username}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap uppercase">
                                                            <p className="text-xs font-bold text-slate-700">{user.Email}</p>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.Role === 'SuperAdmin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                                                {user.Role === 'SuperAdmin' ? (isRTL ? 'مدير عام' : 'Full Access') : (isRTL ? 'مدير محتوى' : 'Standard Admin')}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-end">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openEditModal(user)}
                                                                    className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                                                                    title={isRTL ? 'تعديل' : 'Edit'}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </Button>
                                                                {user.Role === 'Admin' && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDowngradeFromAdmin(user.UserId)}
                                                                        className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 font-bold"
                                                                    >
                                                                        {isRTL ? 'إلغاء صلاحية المدير' : 'Revoke Rights'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <h3 className="text-xl font-black">{isRTL ? 'تعديل بيانات المستخدم' : 'Edit User Info'}</h3>
                            <p className="text-indigo-100 text-sm mt-1">@{editingUser.Username}</p>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'الاسم بالكامل' : 'Full Name'}</label>
                                <input
                                    type="text"
                                    value={editForm.FullName}
                                    onChange={(e) => setEditForm({ ...editForm, FullName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
                                <input
                                    type="email"
                                    value={editForm.Email}
                                    onChange={(e) => setEditForm({ ...editForm, Email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                                <input
                                    type="text"
                                    value={editForm.PhoneNumber}
                                    onChange={(e) => setEditForm({ ...editForm, PhoneNumber: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl"
                                onClick={() => setEditingUser(null)}
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 rounded-2xl font-black"
                                onClick={handleUpdateUserInfo}
                                isLoading={actionLoading === 999999}
                            >
                                {isRTL ? 'حفظ التعديلات' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components for better organization ---

const OverviewStatCard = ({ label, value, icon, color, onClick }: any) => {
    const colors: any = {
        amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100'
    };
    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-3xl border text-start transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 ${colors[color]} shadow-md`}
        >
            <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">
                    {icon}
                </div>
                <span className="font-black text-slate-800 text-sm tracking-tight">{label}</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{value}</div>
        </button>
    );
};

const StatusBadge = ({ status, isRTL }: { status: string; isRTL: boolean }) => {
    const config: any = {
        Pending: { bg: 'bg-amber-100/50 text-amber-600 border-amber-200/50', label: isRTL ? 'قيد الانتظار' : 'Pending' },
        ConfirmedByAdmin: { bg: 'bg-indigo-100/50 text-indigo-600 border-indigo-200/50', label: isRTL ? 'بانتظار السوبر أدمن' : 'Awaiting SuperAdmin' },
        DowngradePending: { bg: 'bg-rose-100/50 text-rose-600 border-rose-200/50', label: isRTL ? 'طلب سحب صلاحية' : 'Downgrade Pending' },
        Approved: { bg: 'bg-emerald-100/50 text-emerald-600 border-emerald-200/50', label: isRTL ? 'مقبول' : 'Approved' },
        Rejected: { bg: 'bg-rose-100/50 text-rose-600 border-rose-200/50', label: isRTL ? 'مرفوض' : 'Rejected' }
    };
    const c = config[status] || { bg: 'bg-slate-100 text-slate-600', label: status };
    return (
        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${c.bg}`}>
            {c.label}
        </span>
    );
};

export default AdminDashboardPage;

