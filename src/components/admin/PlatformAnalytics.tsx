import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPlatformAnalytics, type PlatformAnalytics } from '../../api/admin';
import { getChalets } from '../../api/chalets';
import type { Chalet } from '../../types/chalet';
import { Card, Button, LoadingSpinner } from '../ui';

interface Props {
    onViewBookings?: (filters: { status?: string; fromDate?: string; toDate?: string; chaletId?: number }) => void;
}

const PlatformAnalyticsComponent = ({ onViewBookings }: Props) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        chaletId: undefined as number | undefined
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const chaletsData = await getChalets({ page: 1, pageSize: 1000 });
            setChalets(chaletsData.Items);
        } catch (error) {
            console.error('Failed to fetch chalets:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await getPlatformAnalytics(filters);
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: isRTL ? 'إجمالي الحجوزات' : 'Total Bookings',
            value: analytics?.TotalBookings || 0,
            revenue: analytics?.TotalRevenue || 0,
            color: 'bg-indigo-50 text-indigo-600',
            status: 'All'
        },
        {
            label: isRTL ? 'الحجوزات المؤكدة' : 'Confirmed',
            value: analytics?.ConfirmedCount || 0,
            revenue: analytics?.ConfirmedRevenue || 0,
            color: 'bg-emerald-50 text-emerald-600',
            status: 'Confirmed'
        },
        {
            label: isRTL ? 'الحجوزات المعلقة' : 'Pending',
            value: analytics?.PendingCount || 0,
            revenue: analytics?.PendingRevenue || 0,
            color: 'bg-amber-50 text-amber-600',
            status: 'Pending'
        },
        {
            label: isRTL ? 'الحجوزات الملغية' : 'Cancelled',
            value: analytics?.CancelledCount || 0,
            revenue: analytics?.CancelledRevenue || 0,
            color: 'bg-rose-50 text-rose-600',
            status: 'Cancelled'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <Card className="border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'من تاريخ' : 'From Date'}</label>
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'إلى تاريخ' : 'To Date'}</label>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isRTL ? 'الشاليه' : 'Chalet'}</label>
                        <select
                            value={filters.chaletId || ''}
                            onChange={(e) => setFilters({ ...filters, chaletId: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all appearance-none"
                        >
                            <option value="">{isRTL ? 'جميع الشاليهات' : 'All Chalets'}</option>
                            {chalets.map(c => (
                                <option key={c.Id} value={c.Id}>{isRTL ? c.TitleAr : c.TitleEn}</option>
                            ))}
                        </select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setFilters({ fromDate: '', toDate: '', chaletId: undefined })}
                        className="rounded-2xl h-[52px] px-6"
                    >
                        {isRTL ? 'إعادة ضبط' : 'Reset'}
                    </Button>
                </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <Card key={i} className="relative overflow-hidden group border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer" onClick={() => onViewBookings?.({ status: card.status, ...filters })}>
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 opacity-10 ${card.color.split(' ')[0]}`} />
                        <div className="relative z-10 flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                            <div className="flex items-baseline justify-between">
                                <span className={`text-4xl font-black ${card.color.split(' ')[1]}`}>{card.value}</span>
                                <span className="text-xs font-bold text-slate-300">{isRTL ? 'حجز' : 'bookings'}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-sm font-black text-slate-700">
                                    {card.revenue.toLocaleString()} <span className="text-[10px] text-slate-400">{isRTL ? 'ج.م' : 'EGP'}</span>
                                </span>
                                <div className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-all">
                                    {isRTL ? 'عرض التفاصيل' : 'Details'} →
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Platform Commission Special Card */}
            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl shadow-indigo-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">{isRTL ? 'صافي أرباح المنصة (العمولات)' : 'Platform Net Profit (Commissions)'}</p>
                        <h3 className="text-4xl font-black text-white">
                            {analytics?.TotalCommission.toLocaleString()} <span className="text-lg font-bold text-indigo-200">{isRTL ? 'ج.م' : 'EGP'}</span>
                        </h3>
                    </div>
                    <div className="bg-white/10 p-4 rounded-3xl animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </Card>

            {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-3xl">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default PlatformAnalyticsComponent;
