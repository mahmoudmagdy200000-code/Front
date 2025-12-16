import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addReview } from '../../api/reviews';

interface ReviewFormProps {
    chaletId: number;
    onReviewAdded: () => void;
}

const ReviewForm = ({ chaletId, onReviewAdded }: ReviewFormProps) => {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await addReview({
                ChaletId: chaletId,
                Rating: rating,
                Comment: comment.trim() || undefined,
                ReviewerName: reviewerName.trim() || undefined
            });

            if (result.Status === 'Pending') {
                setSuccessMessage(isArabic
                    ? 'تم إرسال تقييمك بنجاح، وسيظهر بعد المراجعة.'
                    : 'Your review has been submitted successfully and will appear after moderation.');
            } else {
                setSuccessMessage(isArabic
                    ? 'تم نشر تقييمك بنجاح!'
                    : 'Your review has been published successfully!');
                onReviewAdded();
            }

            // Reset form
            setRating(5);
            setComment('');
            setReviewerName('');

        } catch (err: any) {
            console.error(err);
            setError(isArabic ? 'حدث خطأ أثناء إرسال التقييم.' : 'An error occurred while submitting your review.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100" dir={isArabic ? 'rtl' : 'ltr'}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
                {isArabic ? 'أضف تقييمك' : 'Add Your Review'}
            </h3>

            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isArabic ? 'التقييم' : 'Rating'}
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {isArabic ? 'الاسم (اختياري)' : 'Name (Optional)'}
                    </label>
                    <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {isArabic ? 'التعليق (اختياري)' : 'Comment (Optional)'}
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                        placeholder={isArabic ? 'شاركنا تجربتك...' : 'Share your experience...'}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        {isArabic
                            ? 'التعليقات تخضع للمراجعة قبل النشر.'
                            : 'Comments are subject to moderation before publishing.'}
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100 transform hover:-translate-y-0.5"
                    >
                        {submitting ? (isArabic ? 'جاري الإرسال...' : 'Submitting...') : (isArabic ? 'إرسال التقييم' : 'Submit Review')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
