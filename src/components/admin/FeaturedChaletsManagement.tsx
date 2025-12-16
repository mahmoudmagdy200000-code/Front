import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getChalets } from '../../api/chalets';
import { updateChaletFeaturedStatus } from '../../api/admin';
import type { Chalet } from '../../types/chalet';
import { Button, Card, LoadingSpinner } from '../ui';
import Pagination from '../Pagination';

const FeaturedChaletsManagement = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchChalets = async () => {
        try {
            setLoading(true);
            const result = await getChalets({ page, pageSize: 10 });
            setChalets(result.Items);
            setTotalPages(result.TotalPages);
        } catch (error) {
            console.error('Failed to fetch chalets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChalets();
    }, [page]);

    const toggleFeatured = async (chalet: Chalet) => {
        try {
            setUpdatingId(chalet.Id);
            const newStatus = !chalet.IsFeatured;
            await updateChaletFeaturedStatus(chalet.Id, newStatus);

            // Optimistic update
            setChalets(prev => prev.map(c =>
                c.Id === chalet.Id ? { ...c, IsFeatured: newStatus } : c
            ));
        } catch (error) {
            console.error('Failed to update status', error);
            // Could add toast here
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Card padding="none" className="mt-8">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                    <span>🌟</span>
                    {isRTL ? 'إدارة الشاليهات المميزة' : 'Manage Featured Chalets'}
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isRTL ? 'السعر' : 'Price'}
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isRTL ? 'متميز؟' : 'Featured?'}
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isRTL ? 'إجراء' : 'Action'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {chalets.map((chalet) => (
                            <tr key={chalet.Id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {chalet.Id}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {chalet.PricePerNight} {isRTL ? 'ج.م' : 'EGP'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {chalet.IsFeatured ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            {isRTL ? 'مميز' : 'Featured'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                            {isRTL ? 'عادي' : 'Standard'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Button
                                        size="sm"
                                        variant={chalet.IsFeatured ? "outline" : "primary"} // Use outline for "Unfeature" to differ from verify
                                        isLoading={updatingId === chalet.Id}
                                        onClick={() => toggleFeatured(chalet)}
                                    >
                                        {chalet.IsFeatured ? (isRTL ? 'إلغاء التميز' : 'Unfeature') : (isRTL ? 'تميز' : 'Feature')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </Card>
    );
};

export default FeaturedChaletsManagement;
