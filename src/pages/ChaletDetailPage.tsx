import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChaletById } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import BookingForm from '../components/BookingForm';
import ImageGallery from '../components/ImageGallery';

import ReviewsList from '../components/reviews/ReviewsList';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';



const ChaletDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const [chalet, setChalet] = useState<Chalet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(''); // State for Header

    const isRTL = i18n.language === 'ar';

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

    // Handle search from header (redirect to home with query)
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Optional: debounce and navigate to home if user types
        // if (query) navigate(`/?search=${query}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !chalet) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <HomeHeader searchQuery={searchQuery} setSearchQuery={handleSearch} />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🏠</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || t('common.error')}</h2>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                        >
                            {t('common.backToHome')}
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const title = isRTL ? chalet.TitleAr : chalet.TitleEn;
    const description = isRTL ? chalet.DescriptionAr : chalet.DescriptionEn;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={handleSearch} />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Breadcrumb / Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <svg className={`w-5 h-5 transform group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">{t('common.backToHome')}</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images & Description (Takes 2/3 width on large screens) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                            <ImageGallery images={chalet.Images || []} />
                        </div>

                        {/* Title & Stats */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    {title}
                                </h1>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    #{chalet.Id}
                                </span>
                            </div>

                            {/* Capacity Info */}
                            <div className="flex items-center gap-6 text-gray-600 py-4 border-y border-gray-100 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">👨‍👩‍👧‍👦</span>
                                    <span className="font-medium">
                                        {chalet.AdultsCapacity} {isRTL ? 'كبار' : 'Adults'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">👶</span>
                                    <span className="font-medium">
                                        {chalet.ChildrenCapacity} {isRTL ? 'أطفال' : 'Children'}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                                {t('chalet.description')}
                            </h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                {description}
                            </p>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span>⭐</span>
                                {isRTL ? 'تقييمات الضيوف' : 'Guest Reviews'}
                            </h2>
                            <ReviewsList chaletId={chalet.Id} />
                        </div>
                    </div>

                    {/* Right Column: Booking Form (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-100 ring-1 ring-blue-50">
                                <div className="mb-6 flex items-baseline justify-between">
                                    <div>
                                        <span className="text-3xl font-bold text-blue-600 block">
                                            {chalet.PricePerNight} {t('common.sar')}
                                        </span>
                                        <span className="text-gray-500 text-sm font-medium">/{isRTL ? 'ليلة' : 'Night'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-3 py-1 rounded-full text-sm">
                                        <span>★</span>
                                        <span>4.9</span>
                                    </div>
                                </div>

                                <BookingForm
                                    chaletId={chalet.Id}
                                    pricePerNight={chalet.PricePerNight}
                                    initialCheckIn={checkIn}
                                    initialCheckOut={checkOut}
                                />
                            </div>

                            {/* Trust Badges */}
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                                <h3 className="text-blue-900 font-bold mb-2">{isRTL ? 'حجز آمن 100%' : '100% Secure Booking'}</h3>
                                <p className="text-blue-700 text-sm">
                                    {isRTL
                                        ? 'نضمن لك أفضل سعر وحجز مؤكد فوراً.'
                                        : 'We guarantee the best price and instant confirmation.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ChaletDetailPage;
