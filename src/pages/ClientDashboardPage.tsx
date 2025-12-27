import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, LoadingSpinner } from '../components/ui';
import { searchBookings } from '../api/bookings';
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
    Phone as PhoneIcon
} from 'lucide-react';

const ClientDashboardPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { role, fullName, email, phoneNumber } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
    }, [phoneNumber, email]);

    const fetchMyBookings = async () => {
        const query = phoneNumber || email;
        if (!query) return;

        try {
            const data = await searchBookings(query);
            setBookings(data || []);
        } catch (err: any) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Clock className="w-3.5 h-3.5" /> {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </span>
                );
            case 'Confirmed':
            case 'Approved':
            case 'Success':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isRTL ? 'مؤكد' : 'Confirmed'}
                    </span>
                );
            case 'Rejected':
            case 'Cancelled':
            case 'AutoCancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <AlertCircle className="w-3.5 h-3.5" /> {isRTL ? 'ملغي' : 'Cancelled'}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {status}
                    </span>
                );
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحميل...' : 'Loading...'} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="flex-grow">
                {/* Profile Header Section */}
                <div className="bg-white border-b border-gray-200 px-6 py-12">
                    <div className="container mx-auto max-w-4xl">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {fullName?.charAt(0).toUpperCase() || <User className="w-10 h-10" />}
                            </div>

                            {/* User Info */}
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    {isRTL ? 'أهلاً،' : 'Hello,'} {fullName || email?.split('@')[0]}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-gray-500 text-sm">
                                    {email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-4 h-4" /> {email}
                                        </span>
                                    )}
                                    {phoneNumber && (
                                        <span className="flex items-center gap-1.5">
                                            <PhoneIcon className="w-4 h-4" /> {phoneNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="px-6 py-12">
                    <div className="container mx-auto max-w-4xl">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                {isRTL ? 'حجوزاتي' : 'My Bookings'}
                            </h2>
                            {bookings.length > 0 && (
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                    {bookings.length} {isRTL ? 'حجز' : 'bookings'}
                                </span>
                            )}
                        </div>

                        {/* Bookings List */}
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.Id}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Booking Info */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {isRTL ? booking.Chalet?.TitleAr : booking.Chalet?.TitleEn}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {isRTL ? booking.Chalet?.VillageNameAr : booking.Chalet?.VillageNameEn}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(booking.Status)}
                                                </div>

                                                {/* Booking Details */}
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-gray-400">{isRTL ? 'رقم الحجز:' : 'Ref:'}</span>
                                                        <span className="font-semibold text-blue-600 mr-1 ml-1">{booking.BookingReference}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">{isRTL ? 'من:' : 'From:'}</span>
                                                        <span className="font-medium mr-1 ml-1">
                                                            {new Date(booking.CheckInDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">{isRTL ? 'إلى:' : 'To:'}</span>
                                                        <span className="font-medium mr-1 ml-1">
                                                            {new Date(booking.CheckOutDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    {booking.TotalPrice && (
                                                        <div>
                                                            <span className="text-gray-400">{isRTL ? 'السعر:' : 'Price:'}</span>
                                                            <span className="font-bold text-gray-900 mr-1 ml-1">{booking.TotalPrice} {isRTL ? 'ج.م' : 'EGP'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <Link
                                                to={`/chalet/${booking.ChaletId}`}
                                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all text-sm shrink-0"
                                            >
                                                {isRTL ? 'عرض الشاليه' : 'View Chalet'}
                                                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {isRTL ? 'لا توجد حجوزات' : 'No bookings yet'}
                                </h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                    {isRTL
                                        ? 'لم نجد أي حجوزات مرتبطة بحسابك. ابدأ رحلتك الآن!'
                                        : "We couldn't find any bookings linked to your account. Start your journey now!"}
                                </p>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    {isRTL ? 'احجز شاليهك الآن' : 'Book Your Chalet Now'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ClientDashboardPage;
