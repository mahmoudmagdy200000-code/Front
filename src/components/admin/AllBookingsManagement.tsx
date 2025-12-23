import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBookings, updateBookingStatus } from '../../api/bookings';
import { getChalets } from '../../api/chalets';
import type { Booking } from '../../types/booking';
import type { Chalet } from '../../types/chalet';
import { Button, Card, LoadingSpinner, EmptyState } from '../ui';

interface Props {
    externalFilters?: {
        status?: string;
        fromDate?: string;
        toDate?: string;
        chaletId?: number;
    };
}

const AllBookingsManagement = ({ externalFilters }: Props) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>(externalFilters?.status === 'All' ? 'All' : externalFilters?.status || 'All');
    const [filterFrom, setFilterFrom] = useState<string>(externalFilters?.fromDate || '');
    const [filterTo, setFilterTo] = useState<string>(externalFilters?.toDate || '');
    const [filterChalet, setFilterChalet] = useState<number | undefined>(externalFilters?.chaletId);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (externalFilters) {
            if (externalFilters.status) setFilterStatus(externalFilters.status === 'All' ? 'All' : externalFilters.status);
            if (externalFilters.fromDate) setFilterFrom(externalFilters.fromDate);
            if (externalFilters.toDate) setFilterTo(externalFilters.toDate);
            if (externalFilters.chaletId) setFilterChalet(externalFilters.chaletId);
        }
    }, [externalFilters]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [bookingsData, chaletsData] = await Promise.all([
                getBookings(),
                getChalets({ page: 1, pageSize: 1000 })
            ]);
            setBookings(bookingsData);
            setChalets(chaletsData.Items);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            setActionLoading(id);
            await updateBookingStatus(id, newStatus);
            setBookings(prev => prev.map(b => b.Id === id ? { ...b, Status: newStatus } : b));
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'All' || b.Status === filterStatus;
        const matchesFrom = !filterFrom || new Date(b.CheckInDate) >= new Date(filterFrom);
        const matchesTo = !filterTo || new Date(b.CheckInDate) <= new Date(filterTo);
        const matchesChalet = !filterChalet || b.ChaletId === filterChalet;
        return matchesStatus && matchesFrom && matchesTo && matchesChalet;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Card padding="none" className="overflow-hidden border-slate-200">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {isRTL ? 'إدارة جميع الحجوزات' : 'All Bookings Management'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {isRTL ? 'عرض وتعديل حالات الحجز للمنصة بالكامل' : 'View and manage booking statuses for the entire platform'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="date"
                        value={filterFrom}
                        onChange={(e) => setFilterFrom(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder={isRTL ? 'من' : 'From'}
                    />
                    <input
                        type="date"
                        value={filterTo}
                        onChange={(e) => setFilterTo(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder={isRTL ? 'إلى' : 'To'}
                    />
                    <select
                        value={filterChalet || ''}
                        onChange={(e) => setFilterChalet(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                        <option value="">{isRTL ? 'جميع الشاليهات' : 'All Chalets'}</option>
                        {chalets.map(c => (
                            <option key={c.Id} value={c.Id}>{isRTL ? c.TitleAr : c.TitleEn}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                        <option value="All">{isRTL ? 'الكل' : 'All'}</option>
                        <option value="Pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="Confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
                        <option value="Cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
                    </select>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
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
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المرجع' : 'Ref'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الشاليه' : 'Chalet'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المستأجر' : 'Guest'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التاريخ' : 'Dates'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجمالي' : 'Total'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</th>
                                <th className="px-8 py-4 text-end text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.Id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                            #{booking.BookingReference || booking.Id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <p className="font-bold text-slate-800 text-sm">
                                            {(() => {
                                                const chalet = chalets.find(c => c.Id === booking.ChaletId);
                                                return isRTL ? chalet?.TitleAr : chalet?.TitleEn || 'Chalet ID: ' + booking.ChaletId;
                                            })()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-700" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>{booking.UserPhoneNumber}</p>
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
                                        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyles(booking.Status)}`}>
                                            {isRTL ? (booking.Status === 'Pending' ? 'معلق' : booking.Status === 'Confirmed' ? 'مؤكد' : 'ملغي') : booking.Status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-end">
                                        <div className="flex justify-end gap-2">
                                            {booking.Status === 'Pending' && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="rounded-xl px-4"
                                                    onClick={() => handleStatusChange(booking.Id, 'Confirmed')}
                                                    isLoading={actionLoading === booking.Id}
                                                >
                                                    {isRTL ? 'تأكيد' : 'Confirm'}
                                                </Button>
                                            )}
                                            {booking.Status !== 'Cancelled' && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="rounded-xl px-4"
                                                    onClick={() => handleStatusChange(booking.Id, 'Cancelled')}
                                                    isLoading={actionLoading === booking.Id}
                                                >
                                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                                </Button>
                                            )}
                                            {booking.Status === 'Cancelled' && (
                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Inactive</span>
                                            )}
                                        </div>
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
