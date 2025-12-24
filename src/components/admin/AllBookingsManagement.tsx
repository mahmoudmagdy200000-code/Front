import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBookings } from '../../api/bookings';
import type { Booking } from '../../types/booking';
import { Card, LoadingSpinner, EmptyState } from '../ui';

interface Props {
    externalFilters?: {
        fromDate?: string;
        toDate?: string;
        chaletId?: number;
    };
    onRefresh?: () => void;
}

const AllBookingsManagement = ({ externalFilters }: Props) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterFrom, setFilterFrom] = useState<string>(externalFilters?.fromDate || '');
    const [filterTo, setFilterTo] = useState<string>(externalFilters?.toDate || '');
    const [filterChaletId, setFilterChaletId] = useState<string>(externalFilters?.chaletId?.toString() || '');
    const [filterBookingRef, setFilterBookingRef] = useState<string>('');
    const [presetRange, setPresetRange] = useState<string>('All');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (externalFilters) {
            if (externalFilters.fromDate) setFilterFrom(externalFilters.fromDate);
            if (externalFilters.toDate) setFilterTo(externalFilters.toDate);
            if (externalFilters.chaletId) setFilterChaletId(externalFilters.chaletId.toString());
        }
    }, [externalFilters]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const bookingsData = await getBookings();
            setBookings(bookingsData);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFrom = !filterFrom || new Date(b.CheckInDate) >= new Date(filterFrom);
        const matchesTo = !filterTo || new Date(b.CheckInDate) <= new Date(filterTo);
        const matchesChalet = !filterChaletId || b.ChaletId.toString().includes(filterChaletId);
        const matchesBookingRef = !filterBookingRef ||
            b.Id.toString().includes(filterBookingRef) ||
            b.BookingReference?.toLowerCase().includes(filterBookingRef.toLowerCase());

        return matchesFrom && matchesTo && matchesChalet && matchesBookingRef;
    });

    const sortedBookings = [...filteredBookings].sort((a, b) => {
        const dateA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
        const dateB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.Id - a.Id;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <Card padding="none" className="overflow-hidden border-slate-200">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {isRTL ? 'إدارة جميع الحجوزات' : 'All Bookings Management'}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={presetRange}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPresetRange(val);
                            const today = new Date();
                            const format = (d: Date) => d.toISOString().split('T')[0];
                            if (val === 'Day') {
                                const day = format(today);
                                setFilterFrom(day);
                                setFilterTo(day);
                            } else if (val === 'Week') {
                                const start = format(today);
                                const endDate = new Date();
                                endDate.setDate(today.getDate() + 6);
                                const end = format(endDate);
                                setFilterFrom(start);
                                setFilterTo(end);
                            } else {
                                setFilterFrom('');
                                setFilterTo('');
                            }
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                        <option value="All">{isRTL ? 'الكل' : 'All'}</option>
                        <option value="Day">{isRTL ? 'يوم واحد' : 'Day'}</option>
                        <option value="Week">{isRTL ? 'أسبوع' : 'Week'}</option>
                    </select>

                    <input
                        type="date"
                        value={filterFrom}
                        onChange={(e) => setFilterFrom(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    <input
                        type="date"
                        value={filterTo}
                        onChange={(e) => setFilterTo(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />

                    <input
                        type="text"
                        placeholder={isRTL ? 'رقم الشاليه' : 'Chalet ID'}
                        value={filterChaletId}
                        onChange={(e) => setFilterChaletId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />

                    <input
                        type="text"
                        placeholder={isRTL ? 'رقم الحجز' : 'Booking Ref'}
                        value={filterBookingRef}
                        onChange={(e) => setFilterBookingRef(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            {sortedBookings.length === 0 ? (
                <EmptyState
                    icon={<span className="text-6xl">📅</span>}
                    title={isRTL ? 'لا توجد حجوزات' : 'No Bookings Found'}
                    description={isRTL ? 'لا يوجد حجوزات مطابقة للفلاتر المختارة' : 'No bookings match the selected filters'}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'رقم الحجز' : 'Ref'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'رقم الشاليه' : 'Chalet ID'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التاريخ' : 'Dates'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجمالي' : 'Total'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'العمولة' : 'Commission'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedBookings.map((booking) => (
                                <tr key={booking.Id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                            #{booking.BookingReference || booking.Id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <p className="font-bold text-slate-800 text-sm">
                                            #{booking.ChaletId}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600">{new Date(booking.CheckInDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">→ {new Date(booking.CheckOutDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-sm font-black text-slate-900">{booking.TotalPrice?.toLocaleString()} <span className="text-[10px] text-slate-400 underline decoration-indigo-200 underline-offset-4">{isRTL ? 'ج.م' : 'EGP'}</span></span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-sm font-black text-emerald-600">{booking.PlatformCommissionAmount?.toLocaleString()} <span className="text-[10px] text-emerald-400">{isRTL ? 'ج.م' : 'EGP'}</span></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default AllBookingsManagement;
