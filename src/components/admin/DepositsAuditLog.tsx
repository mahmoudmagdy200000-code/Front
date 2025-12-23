import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDeposits } from '../../api/bookings';
import { Card, LoadingSpinner, EmptyState, Button } from '../ui';

const DepositsAuditLog = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            const data = await getDeposits();
            setDeposits(data);
        } catch (error) {
            console.error('Failed to fetch deposits:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Card padding="none" className="overflow-hidden border-slate-200">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {isRTL ? 'سجل تأكيد الحجوزات (المدفوعات)' : 'Booking Confirmation Audit Log'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {isRTL ? 'عرض كافة العربونات المسجلة بواسطة طاقم الإدارة' : 'View all deposits recorded by the administration staff'}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDeposits}>
                    {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
            </div>

            {deposits.length === 0 ? (
                <EmptyState
                    icon={<span className="text-6xl">💸</span>}
                    title={isRTL ? 'لا توجد مدفوعات' : 'No Deposits Recorded'}
                    description={isRTL ? 'لم يتم تسجيل أي عمليات تأكيد بحوالات حتى الآن' : 'No deposit confirmations have been recorded yet'}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'التاريخ' : 'Date'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'مرجع الحجز' : 'Booking Ref'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'رقم التحويل' : 'Ref Number'}</th>
                                <th className="px-8 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'بواسطة' : 'Recorded By'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {deposits.map((deposit) => (
                                <tr key={deposit.Id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-xs font-bold text-slate-600">
                                            {new Date(deposit.CreatedAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                                            {deposit.BookingReference}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-sm font-black text-emerald-600">
                                            {deposit.Amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">EGP</span>
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-xs font-mono font-bold text-slate-700">
                                            {deposit.ReferenceNumber}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {deposit.AdminUsername.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-slate-800">@{deposit.AdminUsername}</span>
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

export default DepositsAuditLog;
