import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChaletById } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import BookingForm from '../components/BookingForm';
import ImageGallery from '../components/ImageGallery';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ChaletDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const [chalet, setChalet] = useState<Chalet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isArabic = i18n.language === 'ar';

    // Get dates from URL
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';

    useEffect(() => {
        const fetchChalet = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await getChaletById(parseInt(id));
                setChalet(data);
                setError(null);
            } catch (err) {
                setError(t('common.error'));
                console.error('Error fetching chalet:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChalet();
    }, [id, t]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-300">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !chalet) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl">{error || t('common.error')}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {t('common.backToHome')}
                    </button>
                </div>
            </div>
        );
    }

    const title = isArabic ? chalet.TitleAr : chalet.TitleEn;
    const description = isArabic ? chalet.DescriptionAr : chalet.DescriptionEn;

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="bg-gray-900 shadow-lg border-b border-gray-700">
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('common.backToHome')}
                    </button>
                    <LanguageSwitcher />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <ImageGallery images={chalet.Images || []} />
                    </div>

                    {/* Details */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {title}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    {isArabic ? `رقم الشاليه: ${chalet.Id}` : `Chalet ID: ${chalet.Id}`}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-300 mb-2">{t('chalet.description')}</h2>
                            <p className="text-gray-400 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl font-bold text-blue-400">
                                {chalet.PricePerNight} {t('common.sar')}
                            </span>
                            <span className="text-gray-400 ml-2">/ night</span>
                        </div>

                        {/* Booking Form */}
                        <BookingForm
                            chaletId={chalet.Id}
                            pricePerNight={chalet.PricePerNight}
                            initialCheckIn={checkIn}
                            initialCheckOut={checkOut}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChaletDetailPage;
