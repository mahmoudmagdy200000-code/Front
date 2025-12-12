import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import { getBookingByPhone } from '../api/bookings';
import type { Booking } from '../types/booking';

const BookingsPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [searchQuery, setSearchQuery] = useState(''); // For HomeHeader (not used here but required prop)

    const [phoneNumber, setPhoneNumber] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setSearched(true);
            const data = await getBookingByPhone(phoneNumber);
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(t('common.error'));
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">{t('nav.bookings')}</h1>

                    {/* Search Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('booking.phone')}
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={t('booking.phonePlaceholder')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-300 hover:shadow-xl hover:shadow-blue-400 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                    {isRTL ? 'ابحث الآن' : 'Search Now'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {searched && !loading && bookings.length === 0 && !error && (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('common.noData')}</h3>
                            <p className="text-gray-500">تأكد من رقم الهاتف وحاول مرة أخرى</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div key={booking.Id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {isRTL ? booking.Chalet?.TitleAr : booking.Chalet?.TitleEn}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-mono">
                                                #{booking.BookingReference}
                                            </p>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(booking.Status)}`}>
                                            {booking.Status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{t('booking.checkIn')}</p>
                                            <p className="font-semibold text-gray-800">{formatDate(booking.CheckInDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{t('booking.checkOut')}</p>
                                            <p className="font-semibold text-gray-800">{formatDate(booking.CheckOutDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{t('booking.totalPrice')}</p>
                                            <p className="font-bold text-blue-600 text-lg">
                                                {booking.TotalPrice || 0} {t('common.sar')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingsPage;
