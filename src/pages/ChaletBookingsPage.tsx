import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DayPicker } from 'react-day-picker';
import { arSA, enUS } from 'date-fns/locale';
import 'react-day-picker/style.css';
import '../styles/datepicker.css';

import { getBookings, updateBookingStatus } from '../api/bookings';
import { getChalets } from '../api/chalets';
import type { Booking } from '../types/booking';
import type { Chalet } from '../types/chalet';
import BookingsHeader from '../components/BookingsHeader';

const ChaletBookingsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [chalet, setChalet] = useState<Chalet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(parseInt(id));
        }
    }, [id]);

    const fetchData = async (chaletId: number) => {
        try {
            setLoading(true);
            const [allBookings, allChalets] = await Promise.all([
                getBookings(),
                getChalets()
            ]);

            // Filter bookings for this chalet
            const chaletBookings = allBookings.filter(b => b.ChaletId === chaletId);
            setBookings(chaletBookings);

            // Find the chalet details
            const foundChalet = allChalets.find(c => c.Id === chaletId);
            setChalet(foundChalet || null);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isDateBooked = (date: Date) => {
        return bookings.some(booking => {
            if (booking.Status === 'Cancelled') return false;
            const checkIn = new Date(booking.CheckInDate);
            const checkOut = new Date(booking.CheckOutDate);
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            return d >= checkIn && d < checkOut;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!chalet) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Chalet not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir={isArabic ? 'rtl' : 'ltr'}>
            <BookingsHeader />
            <main className="w-full overflow-y-auto">
                <div className="px-6 py-6 space-y-8">
                    {/* Bookings Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{isArabic ? 'قائمة الحجوزات' : 'Bookings List'}</h2>
                            <span className="text-sm text-gray-500">
                                {isArabic ? `${bookings.length} حجز` : `${bookings.length} booking(s)`}
                            </span>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
                                        <tr>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'رقم الحجز' : 'Reference'}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'الهاتف' : 'Phone'}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'الوصول' : 'Check-in'}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'المغادرة' : 'Check-out'}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'السعر' : 'Price'}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'العمولة (5%)' : 'Commission (5%)'}
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                {isArabic ? 'الحالة' : 'Status'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-gray-500 font-medium">{isArabic ? 'لا توجد حجوزات' : 'No bookings found'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            [...bookings]
                                                .sort((a, b) => new Date(a.CheckInDate).getTime() - new Date(b.CheckInDate).getTime())
                                                .map((booking) => {
                                                    const price = booking.TotalPrice || 0;
                                                    const deposit = price * 0.05;
                                                    return (
                                                        <tr key={booking.Id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <span className="text-sm font-bold text-blue-600">
                                                                    #{booking.BookingReference || booking.Id}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <span className="text-sm text-gray-700 font-medium" dir="ltr">
                                                                    {booking.UserPhoneNumber || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <span className="text-sm text-gray-700">
                                                                    {new Date(booking.CheckInDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <span className="text-sm text-gray-700">
                                                                    {new Date(booking.CheckOutDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <span className="text-sm font-bold text-green-600">
                                                                    {price.toLocaleString()} {isArabic ? 'جنيه' : 'EGP'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                                                    {deposit.toLocaleString()} {isArabic ? 'جنيه' : 'EGP'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <select
                                                                    value={booking.Status}
                                                                    onChange={async (e) => {
                                                                        try {
                                                                            const newStatus = e.target.value;
                                                                            await updateBookingStatus(booking.Id, newStatus);
                                                                            setBookings(bookings.map(b =>
                                                                                b.Id === booking.Id ? { ...b, Status: newStatus } : b
                                                                            ));
                                                                        } catch (error) {
                                                                            console.error('Error updating status:', error);
                                                                            alert(t('common.error'));
                                                                        }
                                                                    }}
                                                                    className={`px-4 py-2 text-xs rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 font-semibold shadow-sm ${booking.Status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                                        booking.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    <option value="Pending">{isArabic ? 'معلق' : 'Pending'}</option>
                                                                    <option value="Confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                                                                    <option value="Cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Calendar Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {isArabic ? 'تقويم التوافر' : 'Availability Calendar'}
                        </h2>
                        <div className="bg-white rounded-lg shadow-md p-6 flex justify-center border border-gray-200" dir={isArabic ? 'rtl' : 'ltr'}>
                            <DayPicker
                                mode="default"
                                modifiers={{
                                    booked: (date) => isDateBooked(date)
                                }}
                                modifiersClassNames={{
                                    booked: 'bg-red-100 text-red-600 font-bold hover:bg-red-200'
                                }}
                                locale={isArabic ? arSA : enUS}
                                dir={isArabic ? 'rtl' : 'ltr'}
                                showOutsideDays
                                styles={{
                                    head_cell: { width: '40px' },
                                    cell: { width: '40px' },
                                    day: { width: '40px', height: '40px' },
                                    nav_button: { color: '#2563eb' }
                                }}
                            />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ChaletBookingsPage;
