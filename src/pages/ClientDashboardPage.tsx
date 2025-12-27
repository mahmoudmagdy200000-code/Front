import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, LoadingSpinner } from '../components/ui';
import { searchBookings } from '../api/bookings';
import { linkPhoneNumberApi } from '../api/auth';
import type { Booking } from '../types/booking';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    MapPin,
    User,
    Mail,
    Phone as PhoneIcon,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

const ClientDashboardPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, role, fullName, email, phoneNumber, updatePhoneNumber } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Linking phone number state
    const [showLinkPhone, setShowLinkPhone] = useState(false);
    const [linkPhoneInput, setLinkPhoneInput] = useState('');
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    // Initial search phone state
    const [searchPhone, setSearchPhone] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/owner/login');
            return;
        }

        if (role === 'Owner') {
            navigate('/owner/dashboard');
            return;
        }

        if (phoneNumber) {
            fetchBookings(phoneNumber);
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, phoneNumber, role, navigate]);

    const fetchBookings = async (phone: string) => {
        try {
            setLoading(true);
            const data = await searchBookings(phone);
            setBookings(data || []);

            // If phone wasn't linked but bookings found, link it
            if (!phoneNumber && data.length > 0) {
                await handleLinkSuccess(phone);
            }
        } catch (err: any) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkSuccess = async (phone: string) => {
        try {
            await linkPhoneNumberApi(phone);
            updatePhoneNumber(phone);
            setShowLinkPhone(false);
        } catch (err) {
            console.error('Failed to link phone in backend', err);
        }
    };

    const handleManualLink = async () => {
        if (!/^01\d{9}$/.test(linkPhoneInput)) {
            setLinkError(isRTL ? 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01' : 'Phone must be 11 digits starting with 01');
            return;
        }

        try {
            setLinkLoading(true);
            setLinkError(null);
            await linkPhoneNumberApi(linkPhoneInput);
            updatePhoneNumber(linkPhoneInput);
            setLinkPhoneInput('');
            setShowLinkPhone(false);
            // Optionally refresh bookings
            fetchBookings(linkPhoneInput);
        } catch (err: any) {
            setLinkError(err.response?.data?.message || 'Failed to link phone');
        } finally {
            setLinkLoading(false);
        }
    };

    const handleSearchBookings = async () => {
        if (!/^01\d{9}$/.test(searchPhone)) {
            setSearchError(isRTL ? 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01' : 'Phone must be 11 digits starting with 01');
            return;
        }

        try {
            setIsSearching(true);
            setSearchError(null);
            const data = await searchBookings(searchPhone);
            setBookings(data || []);

            if (data.length > 0) {
                // Link this phone to account since bookings found
                await handleLinkSuccess(searchPhone);
            } else {
                setSearchError(isRTL ? 'لم يتم العثور على حجوزات لهذا الرقم' : 'No bookings found for this phone number');
            }
        } catch (err: any) {
            setSearchError(err.response?.data?.message || 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const getRemainingTime = (createdAt: string) => {
        const createdDate = new Date(createdAt);
        const expiryDate = new Date(createdDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
        const now = new Date();
        const diff = expiryDate.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        <Clock className="w-3.5 h-3.5" /> {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </span>
                );
            case 'Confirmed':
            case 'Approved':
            case 'Success':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isRTL ? 'مؤكد' : 'Confirmed'}
                    </span>
                );
            case 'Rejected':
            case 'Cancelled':
            case 'AutoCancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <AlertCircle className="w-3.5 h-3.5" /> {isRTL ? 'ملغي' : 'Cancelled'}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        {status}
                    </span>
                );
        }
    };

    if (loading && !isSearching) {
        return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحضير...' : 'Preparing your profile...'} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-inter" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="flex-grow container mx-auto max-w-5xl px-4 py-12 space-y-12">

                {/* 1. USER INFO SECTION (READ-ONLY) */}
                <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                            {fullName?.charAt(0).toUpperCase() || <User className="w-12 h-12" />}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">{fullName || 'User'}</h1>
                                <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <Mail className="w-4 h-4" /> {email}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${phoneNumber ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                    <PhoneIcon className="w-4 h-4" />
                                    <span className="font-bold">{phoneNumber || (isRTL ? 'رقم الهاتف غير مرتبط' : 'Phone not linked')}</span>
                                </div>

                                {!phoneNumber && !showLinkPhone && (
                                    <button
                                        onClick={() => setShowLinkPhone(true)}
                                        className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {isRTL ? 'ربط رقم الهاتف' : 'Link phone now'}
                                    </button>
                                )}
                            </div>

                            {/* Link Phone Inline Form */}
                            {showLinkPhone && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-md">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {isRTL ? 'أدخل رقم هاتفك (11 رقم)' : 'Enter your phone (11 digits)'}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            value={linkPhoneInput}
                                            onChange={(e) => setLinkPhoneInput(e.target.value)}
                                            placeholder="01xxxxxxxxx"
                                            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                            dir="ltr"
                                        />
                                        <Button
                                            onClick={handleManualLink}
                                            isLoading={linkLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                                        >
                                            {isRTL ? 'ربط' : 'Link'}
                                        </Button>
                                    </div>
                                    {linkError && <p className="text-red-600 text-xs mt-2 font-bold">{linkError}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. MY BOOKINGS SECTION */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            {isRTL ? 'حجوزاتي' : 'My Bookings'}
                        </h2>
                    </div>

                    {/* Initial State: No linked phone and no results */}
                    {!phoneNumber && bookings.length === 0 && (
                        <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-gray-200 text-center space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <PhoneIcon className="w-10 h-10" />
                            </div>
                            <div className="max-w-md mx-auto space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isRTL ? 'ابحث عن حجوزاتك' : 'Find your bookings'}
                                </h3>
                                <p className="text-gray-500">
                                    {isRTL
                                        ? 'يرجى إدخال رقم الهاتف المستخدم في الحجز لعرض رحلاتك وربطها بحسابك.'
                                        : 'Please enter the phone number used during booking to find and link your trips.'}
                                </p>
                            </div>

                            <div className="max-w-sm mx-auto space-y-4">
                                <div className="relative">
                                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={searchPhone}
                                        onChange={(e) => setSearchPhone(e.target.value)}
                                        placeholder="01xxxxxxxxx"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                                        dir="ltr"
                                    />
                                </div>
                                <Button
                                    onClick={handleSearchBookings}
                                    isLoading={isSearching}
                                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 uppercase tracking-wide"
                                >
                                    {isRTL ? 'بحث عن الحجوزات' : 'Search Bookings'}
                                </Button>
                                {searchError && <p className="text-red-600 text-sm font-bold">{searchError}</p>}
                            </div>
                        </div>
                    )}

                    {/* 3. BOOKINGS DISPLAY */}
                    {bookings.length > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            {bookings.map((booking) => {
                                const remainingTime = booking.Status === 'Pending' && booking.CreatedAt ? getRemainingTime(booking.CreatedAt) : null;

                                return (
                                    <div key={booking.Id} className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden relative">
                                        {/* Status Strip */}
                                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${booking.Status === 'Pending' ? 'bg-amber-400' :
                                            booking.Status === 'Confirmed' ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />

                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                                            {/* Left: Chalet Title & Status */}
                                            <div className="space-y-4 flex-1">
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(booking.Status)}
                                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                                                        #{booking.BookingReference || booking.Id}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {isRTL ? booking.Chalet?.TitleAr : booking.Chalet?.TitleEn}
                                                    </h3>
                                                    <p className="text-gray-500 font-bold flex items-center gap-1.5 mt-1">
                                                        <MapPin className="w-4 h-4 text-rose-500" />
                                                        {isRTL ? booking.Chalet?.VillageNameAr : booking.Chalet?.VillageNameEn}
                                                    </p>
                                                </div>

                                                {/* 4. BOOKING STATUS LOGIC */}
                                                {booking.Status === 'Pending' && (
                                                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
                                                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                        <div className="text-sm">
                                                            <p className="font-bold text-amber-800">
                                                                {isRTL ? 'يرجى تأكيد الحجز بالإيداع' : 'Please confirm booking by deposit'}
                                                            </p>
                                                            <p className="text-amber-700 mt-1">
                                                                {isRTL
                                                                    ? `يرجى دفع مبلغ التأمين قبل انتهاء الوقت (${remainingTime || 'قريباً'}) لتجنب الإلغاء التلقائي.`
                                                                    : `Complete the deposit payment within (${remainingTime || 'soon'}) to avoid auto-cancellation.`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {booking.Status === 'Confirmed' && (
                                                    <div className="flex flex-wrap gap-4">
                                                        <Button
                                                            onClick={() => navigate(`/chalet/${booking.ChaletId}`)}
                                                            className="h-10 px-6 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm border border-blue-100"
                                                        >
                                                            {isRTL ? 'حجز هذا الشاليه مرة أخرى' : 'Re-book this chalet'}
                                                            <ExternalLink className="w-4 h-4 mr-2 ml-2" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Dates & Price */}
                                            <div className="bg-gray-50 rounded-2xl p-6 min-w-[280px] space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{isRTL ? 'الوصول' : 'Check-in'}</p>
                                                        <p className="font-bold text-gray-900">{new Date(booking.CheckInDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{isRTL ? 'المغادرة' : 'Check-out'}</p>
                                                        <p className="font-bold text-gray-900">{new Date(booking.CheckOutDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 font-medium">{isRTL ? 'إجمالي السعر' : 'Total Price'}</span>
                                                        <span className="font-black text-gray-900">{booking.TotalPrice} {isRTL ? 'ج.م' : 'EGP'}</span>
                                                    </div>
                                                    {booking.Status === 'Confirmed' && (
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-green-600 font-bold">{isRTL ? 'تم دفع العربون' : 'Deposit Paid'}</span>
                                                            <span className="font-bold text-green-700">✓</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty state when phone linked but no bookings */}
                    {phoneNumber && bookings.length === 0 && !loading && (
                        <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <Calendar className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">{isRTL ? 'لا توجد حجوزات حتى الآن' : 'No bookings found'}</h3>
                                <p className="text-gray-500">{isRTL ? 'ابدأ تصفح الشاليهات واحجز رحلتك القادمة!' : 'Start browsing chalets and book your next trip!'}</p>
                            </div>
                            <Button
                                onClick={() => navigate('/')}
                                className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black"
                            >
                                {isRTL ? 'استكشف الشاليهات' : 'Explore Chalets'}
                                <ArrowRight className={`w-5 h-5 mr-2 ml-2 ${isRTL ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ClientDashboardPage;
