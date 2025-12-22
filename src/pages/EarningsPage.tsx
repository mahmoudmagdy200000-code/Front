import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import { getEarningsDetails, getEarningsSummary, type EarningsDetails, type EarningsSummary, type EarningsQueryParams } from '../api/earnings';
import { getMyChalets } from '../api/chalets';
import type { Chalet } from '../types/chalet';

const EarningsPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isArabic = i18n.language === 'ar';

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<EarningsSummary | null>(null);
    const [details, setDetails] = useState<EarningsDetails[]>([]);
    const [myChalets, setMyChalets] = useState<Chalet[]>([]);
    const [filters, setFilters] = useState<EarningsQueryParams>({
        status: '',
        chaletId: undefined,
        fromDate: '',
        toDate: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchDetails();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [summaryData, chaletsData] = await Promise.all([
                getEarningsSummary(),
                getMyChalets()
            ]);
            setSummary(summaryData);
            setMyChalets(chaletsData);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async () => {
        try {
            const data = await getEarningsDetails(filters);
            setDetails(data);
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-md border border-emerald-100">{isArabic ? 'مكتمل' : 'Completed'}</span>;
            case 'Pending':
                return <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-md border border-amber-100">{isArabic ? 'قيد الانتظار' : 'Pending'}</span>;
            case 'Confirmed':
                return <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md border border-blue-100">{isArabic ? 'مؤكد' : 'Confirmed'}</span>;
            default:
                return <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[11px] font-bold rounded-md border border-gray-100">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans relative isolate pb-20" dir={isArabic ? 'rtl' : 'ltr'}>
            <DashboardHeader />

            <main className="container mx-auto px-4 md:px-6 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/owner/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
                >
                    <svg className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {isArabic ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {isArabic ? 'الأرباح والعوائد' : 'Earnings & Revenue'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isArabic ? 'تتبع أداء استثماراتك وحجوزاتك' : 'Track your investment performance and bookings'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 animate-pulse">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
                    </div>
                ) : (
                    <>
                        {/* KPI Summary Cards */}
                        {summary && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider z-10 block mb-1">{isArabic ? 'إجمالي الأرباح' : 'Total Earnings'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-3xl font-black text-slate-800">{summary.TotalEarnings.toLocaleString()}</span>
                                        <span className="text-xs text-slate-300 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider z-10 block mb-1">{isArabic ? 'أرباح متوقعة' : 'Upcoming Earnings'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-3xl font-black text-indigo-600">{summary.UpcomingEarnings.toLocaleString()}</span>
                                        <span className="text-xs text-slate-300 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider z-10 block mb-1">{isArabic ? 'أرباح محصلة' : 'Completed Earnings'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-3xl font-black text-emerald-600">{summary.CompletedEarnings.toLocaleString()}</span>
                                        <span className="text-xs text-slate-300 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider z-10 block mb-1">{isArabic ? 'إجمالي العمولات' : 'Total Commissions'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-3xl font-black text-rose-500">{summary.TotalCommission.toLocaleString()}</span>
                                        <span className="text-xs text-slate-300 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">{isArabic ? 'الشاليه' : 'Chalet'}</label>
                                    <select
                                        value={filters.chaletId || ''}
                                        onChange={(e) => setFilters({ ...filters, chaletId: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
                                    >
                                        <option value="">{isArabic ? 'الكل' : 'All Chalets'}</option>
                                        {myChalets.map(c => (
                                            <option key={c.Id} value={c.Id}>{isArabic ? c.TitleAr : c.TitleEn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">{isArabic ? 'الحالة' : 'Status'}</label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
                                    >
                                        <option value="">{isArabic ? 'الكل' : 'All Statuses'}</option>
                                        <option value="Pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
                                        <option value="Confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                                        <option value="Completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">{isArabic ? 'من تاريخ' : 'From Date'}</label>
                                    <input
                                        type="date"
                                        value={filters.fromDate}
                                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">{isArabic ? 'إلى تاريخ' : 'To Date'}</label>
                                    <input
                                        type="date"
                                        value={filters.toDate}
                                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-start">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</th>
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الشاليه' : 'Chalet'}</th>
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الليالي' : 'Nights'}</th>
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الإجمالي' : 'Total'}</th>
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'العمولة' : 'Comm.'}</th>
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest text-blue-600">{isArabic ? 'صافي الربح' : 'Net'}</th>
                                        <th className="px-6 py-4 text-start text-[11px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الحالة' : 'Status'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {details.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">
                                                {isArabic ? 'لا توجد بيانات لهذه الفلاتر' : 'No data found for these filters'}
                                            </td>
                                        </tr>
                                    ) : (
                                        details.map((item) => (
                                            <tr key={item.BookingId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-700">{new Date(item.Date).toLocaleDateString(isArabic ? 'ar' : 'en')}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-800">{item.ChaletName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-slate-600">{item.Nights}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-700">{item.TotalPrice.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-rose-400">{item.Commission.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-blue-600">{item.NetEarnings.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(item.Status)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="lg:hidden flex flex-col gap-4">
                            {details.length === 0 ? (
                                <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-slate-300 text-slate-400 font-medium">
                                    {isArabic ? 'لا توجد بيانات' : 'No data found'}
                                </div>
                            ) : (
                                details.map((item) => (
                                    <div key={item.BookingId} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{new Date(item.Date).toLocaleDateString(isArabic ? 'ar' : 'en')}</span>
                                                <h3 className="font-bold text-slate-800 leading-none">{item.ChaletName}</h3>
                                            </div>
                                            {getStatusBadge(item.Status)}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'الليالي' : 'Nights'}</span>
                                                <span className="font-bold text-slate-700">{item.Nights}</span>
                                            </div>
                                            <div className="flex flex-col text-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'الإجمالي' : 'Total'}</span>
                                                <span className="font-bold text-slate-700">{item.TotalPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col text-end">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'العمولة' : 'Comm.'}</span>
                                                <span className="font-bold text-rose-400">{item.Commission.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl">
                                            <span className="text-xs font-bold text-blue-800">{isArabic ? 'صافي الربح' : 'Net Earnings'}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-black text-blue-600">{item.NetEarnings.toLocaleString()}</span>
                                                <span className="text-[9px] font-black text-blue-300 uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default EarningsPage;
