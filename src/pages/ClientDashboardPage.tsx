import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, LoadingSpinner } from '../components/ui';
import { searchBookings } from '../api/bookings';
import type { Booking } from '../types/booking';
import {
    Calendar,
    Home,
    LogOut,
    ShieldCheck,
    MapPin,
    Clock,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    DollarSign,
    LayoutDashboard,
    User,
    Mail,
    Phone
} from 'lucide-react';

const ClientDashboardPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { role, fullName, email, logout, phoneNumber } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    // Redirect if not a Client
    useEffect(() => {
        if (role === 'Owner') {
            navigate('/owner/dashboard');
        } else if (role === 'Admin') {
            navigate('/admin/owner-requests');
        }
    }, [role, navigate]);

    // Initial data fetch
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchMyBookings();
            setLoading(false);
        };
        init();
    }, []);

    const fetchMyBookings = async () => {
        const query = phoneNumber || email;
        if (!query) return;

        try {
            setBookingsLoading(true);
            const data = await searchBookings(query);
            setBookings(data || []);
        } catch (err: any) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </span>
                );
            case 'Confirmed':
            case 'Approved':
            case 'Success':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isRTL ? 'مؤكد' : 'Confirmed'}
                    </span>
                );
            case 'Rejected':
            case 'Cancelled':
            case 'AutoCancelled':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> {isRTL ? 'ملغي' : 'Cancelled'}
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                        {status}
                    </span>
                );
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحضير...' : 'Preparing...'} />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Transparent Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-800 hidden sm:block">
                                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl h-10 px-4 group"
                        >
                            <ArrowLeft className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180 mr-2 group-hover:translate-x-1' : 'ml-2 group-hover:-translate-x-1'}`} />
                            {isRTL ? 'الرجوع' : 'Back'}
                        </Button>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-100"
                            title={isRTL ? 'تسجيل الخروج' : 'Logout'}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
                {/* Welcome & Profile Section */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-60"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-200">
                                {fullName?.charAt(0) || <User className="w-12 h-12" />}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-[#F8FAFC]">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-5">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tightest">
                                    {isRTL ? 'أهلاً بك،' : 'Welcome back,'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{fullName || email?.split('@')[0]}</span>
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-slate-500 font-bold text-sm">
                                    <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-default">
                                        <Mail className="w-4 h-4" /> {email}
                                    </span>
                                    {phoneNumber && (
                                        <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-default">
                                            <Phone className="w-4 h-4" /> {phoneNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0">
                            <div className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                {isRTL ? 'حساب موثق' : 'Verified Client'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content: Bookings */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                                <Calendar className="w-8 h-8 text-blue-600" />
                                {isRTL ? 'رحلاتي القادمة' : 'My Upcoming Trips'}
                            </h2>
                            {bookings.length > 0 && (
                                <span className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-black shadow-sm">
                                    {bookings.length} {isRTL ? 'حجز' : 'Bookings'}
                                </span>
                            )}
                        </div>

                        {bookingsLoading ? (
                            <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm border-dashed">
                                <LoadingSpinner text={isRTL ? 'جاري العثور على رحلاتك...' : 'Finding your trips...'} />
                            </div>
                        ) : bookings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.Id}
                                        className="bg-white border border-slate-200/60 rounded-[2.5rem] p-6 sm:p-8 transition-all hover:border-blue-400/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] group relative overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* Thumbnail */}
                                            <div className="w-full md:w-56 h-40 rounded-3xl overflow-hidden bg-slate-100 flex-shrink-0 relative shadow-inner">
                                                {booking.Chalet?.ImageUrl ? (
                                                    <img src={booking.Chalet.ImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Home className="w-12 h-12" /></div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    {getStatusBadge(booking.Status)}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                            {isRTL ? booking.Chalet?.TitleAr : booking.Chalet?.TitleEn}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mt-2">
                                                            <MapPin className="w-4 h-4 text-rose-500" />
                                                            {isRTL ? booking.Chalet?.VillageNameAr : booking.Chalet?.VillageNameEn}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6 border-y border-slate-100 mt-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'رقم الحجز' : 'Booking Ref'}</p>
                                                            <p className="text-sm font-black text-blue-600">{booking.BookingReference}</p>
                                                        </div>
                                                        <div className="space-y-1 text-center sm:text-left">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'تاريخ الوصول' : 'Check-In'}</p>
                                                            <p className="text-sm font-black text-slate-700">{new Date(booking.CheckInDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</p>
                                                        </div>
                                                        <div className="space-y-1 text-right sm:text-left hidden sm:block">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'تاريخ المغادرة' : 'Check-Out'}</p>
                                                            <p className="text-sm font-black text-slate-700">{new Date(booking.CheckOutDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-xs font-bold text-slate-400 italic">
                                                            {isRTL ? 'تم الحجز في: ' : 'Booked on: '}
                                                            {booking.CreatedAt ? new Date(booking.CreatedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : '-'}
                                                        </span>
                                                        <button
                                                            onClick={() => navigate(`/chalet/${booking.ChaletId}`)}
                                                            className="flex items-center gap-2 text-blue-600 font-black text-sm group/btn"
                                                        >
                                                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                                            <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 bg-white border border-slate-200/60 border-dashed rounded-[3rem] text-center px-10 shadow-sm">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <Calendar className="w-12 h-12 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{isRTL ? 'لا توجد رحلات حالياً' : 'No trips found'}</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
                                    {isRTL
                                        ? 'لم تجد أي حجوزات مرتبطة بحسابك؟ تأكد من رقم الهاتف أو ابدأ بحجز شاليهك الأول الآن!'
                                        : "We couldn't find any bookings. Start your journey by exploring our premium chalets!"}
                                </p>
                                <Button onClick={() => navigate('/')} variant="primary" className="h-14 px-10 rounded-2xl shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 font-black">
                                    {isRTL ? 'تصفح الشاليهات المتاحة' : 'Browse Available Chalets'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Section: Perks & Experience */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Elite Status Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                    <Sparkles className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xl font-black text-white">{isRTL ? 'عضوية RSR المميزة' : 'Premium RSR Member'}</h4>
                                    <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                        {isRTL
                                            ? 'استمتع بخدمة عملاء مخصصة وأسعار حصرية على أفضل شاليهات رأس سدر.'
                                            : 'Enjoy dedicated priority support and exclusive member prices on Ras Sedr finest stays.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Exclusive Benefits */}
                        <div className="bg-white rounded-[3rem] border border-slate-200/60 p-10 space-y-8 shadow-sm">
                            <h4 className="text-xl font-black text-slate-900">{isRTL ? 'مزايا الحجز معنا' : 'Booking Benefits'}</h4>
                            <div className="space-y-6">
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110"><DollarSign className="w-6 h-6" /></div>
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-800 text-sm">{isRTL ? 'أقل الأسعار' : 'Best Prices'}</p>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{isRTL ? 'نضمن لك أفضل قيمة مقابل السعر.' : 'We ensure you get the best value for your stay.'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110"><LayoutDashboard className="w-6 h-6" /></div>
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-800 text-sm">{isRTL ? 'إدارة سهلة' : 'Easy Management'}</p>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{isRTL ? 'تتبع رحلاتك وتواصل مع الملاك بسهولة.' : 'Track your trips and reach owners effortlessly.'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110"><Building2 className="w-6 h-6" /></div>
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-800 text-sm">{isRTL ? 'دعم مستمر' : '24/7 Support'}</p>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{isRTL ? 'فريقنا متاح لمساعدتك طوال الوقت.' : 'Our team is here to help you around the clock.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .tracking-tightest { letter-spacing: -0.05em; }
            `}</style>
        </div>
    );
};

export default ClientDashboardPage;
