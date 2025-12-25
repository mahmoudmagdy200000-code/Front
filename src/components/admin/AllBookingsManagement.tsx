import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBookings, confirmWithDeposit, updateBookingStatus } from '../../api/bookings';
import type { Booking } from '../../types/booking';
import { Card, LoadingSpinner, EmptyState, Button } from '../ui';
import { useAuth } from '../../context/AuthContext';

interface Props {
    externalFilters?: {
        fromDate?: string;
        toDate?: string;
        chaletId?: number;
    };
    onRefresh?: () => void;
}

const AllBookingsManagement = ({ externalFilters, onRefresh }: Props) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { role } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState<number | null>(null);
    const [confirmData, setConfirmData] = useState({ amount: 0, ref: '' });

    const [filterFrom, setFilterFrom] = useState<string>(externalFilters?.fromDate || '');
    const [filterTo, setFilterTo] = useState<string>(externalFilters?.toDate || '');
    const [filterChaletId, setFilterChaletId] = useState<string>(externalFilters?.chaletId?.toString() || '');
    const [filterBookingRef, setFilterBookingRef] = useState<string>('');
    const [filterPhone, setFilterPhone] = useState<string>('');
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

    const handleConfirmSubmit = async () => {
        if (!showConfirmModal) return;
        try {
            setActionLoading(showConfirmModal);
            await confirmWithDeposit(showConfirmModal, confirmData.amount, confirmData.ref);
            setShowConfirmModal(null);
            setConfirmData({ amount: 0, ref: '' });
            await fetchInitialData();
            if (onRefresh) onRefresh();
        } catch (error) {
            alert(isRTL ? 'فشل تأكيد الحجز' : 'Failed to confirm booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelBooking = async (id: number) => {
        if (!window.confirm(isRTL ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) return;
        try {
            setActionLoading(id);
            await updateBookingStatus(id, 'Cancelled');
            await fetchInitialData();
            if (onRefresh) onRefresh();
        } catch (error) {
            alert(isRTL ? 'فشل إلغاء الحجز' : 'Failed to cancel booking');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFrom = !filterFrom || new Date(b.CheckInDate) >= new Date(filterFrom);
        const matchesTo = !filterTo || new Date(b.CheckInDate) <= new Date(filterTo);
        const matchesChalet = !filterChaletId || b.ChaletId.toString().includes(filterChaletId);
        const matchesPhone = !filterPhone || b.UserPhoneNumber?.includes(filterPhone);
        const matchesBookingRef = !filterBookingRef ||
            b.Id.toString().includes(filterBookingRef) ||
            b.BookingReference?.toLowerCase().includes(filterBookingRef.toLowerCase());

        return matchesFrom && matchesTo && matchesChalet && matchesBookingRef && matchesPhone;
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
                    <input
                        type="text"
                        placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        value={filterPhone}
                        onChange={(e) => setFilterPhone(e.target.value)}
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
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجمالي' : 'Total'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'العمولة' : 'Commission'}</th>
                                <th className="px-8 py-4 text-end text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجراءات' : 'Actions'}</th>
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
                                        <BookingStatusBadge status={booking.Status} isRTL={isRTL} />
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-sm font-black text-slate-900">{booking.TotalPrice?.toLocaleString()} <span className="text-[10px] text-slate-400 underline decoration-indigo-200 underline-offset-4">{isRTL ? 'ج.م' : 'EGP'}</span></span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-sm font-black text-emerald-600">{booking.PlatformCommissionAmount?.toLocaleString()} <span className="text-[10px] text-emerald-400">{isRTL ? 'ج.م' : 'EGP'}</span></span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-end">
                                        {(booking.Status === 'Pending') ? (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    isLoading={actionLoading === booking.Id}
                                                    onClick={() => {
                                                        const start = new Date(booking.CheckInDate);
                                                        const end = new Date(booking.CheckOutDate);
                                                        const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                                                        const oneNightPrice = (booking.TotalPrice || 0) / nights;

                                                        setShowConfirmModal(booking.Id);
                                                        setConfirmData({ amount: oneNightPrice, ref: '' });
                                                    }}
                                                >
                                                    {isRTL ? 'تأكيد' : 'Confirm'}
                                                </Button>
                                                {role === 'SuperAdmin' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        isLoading={actionLoading === booking.Id}
                                                        className="border-rose-100 text-rose-500 hover:bg-rose-50"
                                                        onClick={() => handleCancelBooking(booking.Id)}
                                                    >
                                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400 italic">
                                                {isRTL ? 'لا يوجد إجراء' : 'No Action'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-600 p-6 text-white text-center">
                            <h3 className="text-xl font-black">{isRTL ? 'تأكيد الحجز واستلام العربون' : 'Confirm & Record Deposit'}</h3>
                            <p className="text-emerald-100 text-sm mt-1">{isRTL ? 'يرجى إدخال بيانات التحويل' : 'Please enter payment details'}</p>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'قيمة العربون' : 'Deposit Amount'}</label>
                                <input
                                    type="number"
                                    value={confirmData.amount}
                                    onChange={(e) => setConfirmData({ ...confirmData, amount: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'رقم المرجع / التحويل' : 'Reference Number'}</label>
                                <input
                                    type="text"
                                    value={confirmData.ref}
                                    placeholder={isRTL ? 'مثال: Vodafone Cash - 123456' : 'e.g. Bank Transfer ID'}
                                    onChange={(e) => setConfirmData({ ...confirmData, ref: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl"
                                onClick={() => setShowConfirmModal(null)}
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                            <Button
                                variant="success"
                                className="flex-1 rounded-2xl font-black"
                                onClick={handleConfirmSubmit}
                                disabled={!confirmData.ref || confirmData.amount <= 0}
                            >
                                {isRTL ? 'تأكيد وحفظ' : 'Confirm & Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const BookingStatusBadge = ({ status, isRTL }: { status: string; isRTL: boolean }) => {
    const config: any = {
        Pending: { bg: 'bg-amber-100/50 text-amber-600 border-amber-200/50', label: isRTL ? 'قيد الانتظار' : 'Pending' },
        Confirmed: { bg: 'bg-emerald-100/50 text-emerald-600 border-emerald-200/50', label: isRTL ? 'تم التأكيد' : 'Confirmed' },
        Cancelled: { bg: 'bg-rose-100/50 text-rose-600 border-rose-200/50', label: isRTL ? 'ملغي' : 'Cancelled' },
        Completed: { bg: 'bg-indigo-100/50 text-indigo-600 border-indigo-200/50', label: isRTL ? 'مكتمل' : 'Completed' },
    };
    const c = config[status] || { bg: 'bg-slate-100 text-slate-600', label: status };
    return (
        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${c.bg}`}>
            {c.label}
        </span>
    );
};

export default AllBookingsManagement;
