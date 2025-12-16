import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPendingReviews, updateReviewStatus } from '../../api/reviews';
import type { Review } from '../../types/review';
import { Button, Card, EmptyState, LoadingSpinner } from '../ui';

const PendingReviews = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getPendingReviews();
            setReviews(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, status: 'Approved' | 'Rejected') => {
        try {
            setActionLoading(id);
            await updateReviewStatus(id, { Status: status });
            setReviews(prev => prev.filter(r => r.Id !== id));
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Card padding="none" className="mt-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                    {isRTL ? 'مراجعات قيد الانتظار' : 'Pending Reviews'}
                </h2>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                    {reviews.length} {isRTL ? 'جديد' : 'New'}
                </span>
            </div>

            {reviews.length === 0 ? (
                <EmptyState
                    icon={<span className="text-6xl">📝</span>}
                    title={isRTL ? 'لا توجد مراجعات' : 'No Pending Reviews'}
                    description={isRTL ? 'جميع المراجعات تم التعامل معها' : 'All reviews have been moderated'}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'المراجع' : 'Reviewer'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'التقييم' : 'Rating'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                    {isRTL ? 'التعليق' : 'Comment'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'التاريخ' : 'Date'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'الإجراءات' : 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviews.map((review) => (
                                <tr key={review.Id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                {review.ReviewerName ? review.ReviewerName.charAt(0) : 'G'}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {review.ReviewerName || (isRTL ? 'زائر' : 'Guest')}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            ID: {review.ChaletId} (Chalet)
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex text-yellow-400 text-sm">
                                            {'★'.repeat(review.Rating)}
                                            <span className="text-slate-200">
                                                {'★'.repeat(5 - review.Rating)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 line-clamp-2" title={review.Comment}>
                                            {review.Comment}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(review.CreatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleAction(review.Id, 'Approved')}
                                                isLoading={actionLoading === review.Id}
                                                disabled={actionLoading !== null}
                                            >
                                                {isRTL ? 'قبول' : 'Approve'}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleAction(review.Id, 'Rejected')}
                                                isLoading={actionLoading === review.Id}
                                                disabled={actionLoading !== null}
                                            >
                                                {isRTL ? 'رفض' : 'Reject'}
                                            </Button>
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

export default PendingReviews;
