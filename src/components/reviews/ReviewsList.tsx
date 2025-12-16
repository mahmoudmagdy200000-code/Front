import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getChaletReviews } from '../../api/reviews';
import type { Review } from '../../types/review';
import ReviewForm from './ReviewForm';

interface ReviewsListProps {
    chaletId: number;
}

const ReviewsList = ({ chaletId }: ReviewsListProps) => {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const fetchReviews = async () => {
        try {
            const data = await getChaletReviews(chaletId);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [chaletId]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.Rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
            {/* Reviews Header & Stats */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isArabic ? 'التقييمات والمراجعات' : 'Ratings & Reviews'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {reviews.length} {isArabic ? 'تقييم' : 'reviews'}
                    </p>
                </div>

                {reviews.length > 0 && (
                    <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
                        <span className="text-3xl font-bold text-yellow-500">{averageRating}</span>
                        <div className="flex flex-col">
                            <div className="text-yellow-400 text-sm tracking-widest">
                                {'★'.repeat(Math.round(Number(averageRating)))}
                                <span className="text-slate-200">
                                    {'★'.repeat(5 - Math.round(Number(averageRating)))}
                                </span>
                            </div>
                            <span className="text-xs text-yellow-700 font-medium">
                                {isArabic ? 'متوسط التقييم' : 'Average Rating'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <span className="text-4xl block mb-2">🏷️</span>
                            <p className="text-slate-500 font-medium">
                                {isArabic ? 'لا توجد تقييمات بعد. كن أول من يقيم!' : 'No reviews yet. Be the first to review!'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(showAll ? reviews : reviews.slice(0, 3)).map((review) => (
                                <div key={review.Id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                {review.ReviewerName ? review.ReviewerName.charAt(0) : 'G'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-sm">
                                                    {review.ReviewerName || (isArabic ? 'زائر' : 'Guest')}
                                                </h4>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(review.CreatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {'★'.repeat(review.Rating)}
                                            <span className="text-slate-200">
                                                {'★'.repeat(5 - review.Rating)}
                                            </span>
                                        </div>
                                    </div>
                                    {review.Comment && (
                                        <p className="text-slate-600 text-sm leading-relaxed mt-2 pl-10">
                                            {review.Comment}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {reviews.length > 3 && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {showAll ? (
                                        <>
                                            {isArabic ? 'عرض أقل' : 'Show less'}
                                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </>
                                    ) : (
                                        <>
                                            {isArabic ? `عرض كل الـ ${reviews.length} تقييمات` : `See all ${reviews.length} reviews`}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Review Form Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <ReviewForm chaletId={chaletId} onReviewAdded={fetchReviews} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsList;
