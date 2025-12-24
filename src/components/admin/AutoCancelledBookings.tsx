import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBookings } from '../../api/bookings';
import type { Booking } from '../../types/booking';
import { Card, LoadingSpinner, EmptyState } from '../ui';

const AutoCancelledBookings = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getBookings();
            // Filter only AutoCancelled bookings from the last 24 hours or just all of them sorted by date
            const autoCancelled = data.filter(b => b.Status === 'AutoCancelled');
            setBookings(autoCancelled);
        } catch (error) {
            console.error('Failed to fetch auto-cancelled bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Card padding="none" className="overflow-hidden border-rose-200 shadow-lg shadow-rose-50">
            <div className="px-8 py-6 bg-gradient-to-r from-rose-50 to-white border-b border-rose-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-rose-800">
                        {isRTL ? 'حجوزات ملغاة تلقائياً' : 'Auto-Cancelled Bookings'}
                    </h2>
                    <p className="text-xs text-rose-600 font-bold mt-1 uppercase tracking-wider">
                        {isRTL ? 'الحجوزات التي تجاوزت 4 ساعات دون تأكيد' : 'Bookings that exceeded 4 hours without confirmation'}
                    </p>
                </div>
                <div className="bg-rose-100 text-rose-700 px-4 py-1 rounded-full text-xs font-black">
                    {bookings.length} {isRTL ? 'حالة' : 'Cases'}
                </div>
            </div>

            {bookings.length === 0 ? (
                <EmptyState
                    icon={<span className="text-6xl">✨</span>}
                    title={isRTL ? 'لا توجد حالات حالياً' : 'No cases currently'}
                    description={isRTL ? 'جميع الحجوزات المعلقة تمت معالجتها أو لم تتجاوز المهلة بعد.' : 'All pending bookings are within the time limit or have been processed.'}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المرجع' : 'Ref'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الشاليه' : 'Chalet'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المستأجر' : 'Guest'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'وقت الحجز' : 'Booked At'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'وقت الإلغاء المتوقع' : 'Expiry'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bookings.map((booking) => {
                                const bookedAt = new Date(booking.CreatedAt || '');
                                const expiryAt = new Date(bookedAt.getTime() + 4 * 60 * 60 * 1000);

                                return (
                                    <tr key={booking.Id} className="hover:bg-rose-50/30 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                                                #{booking.BookingReference || booking.Id}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <p className="font-bold text-slate-800 text-sm">
                                                {isRTL ? booking.Chalet?.TitleAr : booking.Chalet?.TitleEn}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <p className="text-sm font-bold text-slate-700" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>{booking.UserPhoneNumber}</p>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {bookedAt.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {bookedAt.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                                {expiryAt.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default AutoCancelledBookings;
