import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChaletById } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import BookingForm from '../components/BookingForm';
import AirbnbGallery from '../components/AirbnbGallery';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isBookingVisible, setIsBookingVisible] = useState(false);
    const bookingRef = useRef<HTMLDivElement>(null);

    const isRTL = i18n.language === 'ar';

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
            } finally {
                setLoading(false);
            }
        };
        fetchChalet();
    }, [id, t]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const toggleBooking = () => {
        setIsBookingVisible(!isBookingVisible);
        if (!isBookingVisible) {
            setTimeout(() => {
                bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !chalet) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <HomeHeader searchQuery={searchQuery} setSearchQuery={handleSearch} />
                <div className="flex-grow flex items-center justify-center">
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-full">
                        {t('common.backToHome')}
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const title = isRTL ? chalet.TitleAr : chalet.TitleEn;
    const description = isRTL ? chalet.DescriptionAr : chalet.DescriptionEn;
    const villageName = isRTL ? chalet.VillageNameAr : chalet.VillageNameEn;

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={handleSearch} />

            <main className="flex-grow">
                {/* Hero Section - Airbnb Style */}
                <div className="container mx-auto md:px-4 md:py-6">
                    <div className="hidden md:flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-sm font-semibold underline hover:bg-slate-50 px-2 py-1 rounded-md">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 8.684m0 0a3 3 0 110 2.684m0-2.684l6.632-3.316m-6.632 6l6.632 3.316m0 0a3 3 0 110-2.684"></path></svg>
                                {isRTL ? 'مشاركة' : 'Share'}
                            </button>
                            <button className="flex items-center gap-2 text-sm font-semibold underline hover:bg-slate-50 px-2 py-1 rounded-md">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                {isRTL ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <AirbnbGallery images={chalet.Images || []} />
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Info (Title/Rating/Location) */}
                            <section>
                                <h1 className="text-3xl font-black text-slate-900 mb-2 md:hidden">{title}</h1>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 font-medium">
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-900 font-bold">★ 4.9</span>
                                        <span className="text-slate-400">·</span>
                                        <button className="underline font-bold decoration-2 underline-offset-4 hover:text-blue-600 transition-colors">
                                            {isRTL ? '12 تقييم' : '12 reviews'}
                                        </button>
                                    </div>
                                    <span className="text-slate-400 hidden sm:inline">·</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-blue-600 font-bold font-mono">📍</span>
                                        <span className="font-bold underline cursor-pointer">{villageName}</span>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Host info / Highlights (Minimalist) */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {isRTL ? `شاليه كامل بواسطة مالك موثق` : `Entire chalet hosted by a verified owner`}
                                    </h2>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                        <span>{chalet.AdultsCapacity + chalet.ChildrenCapacity} guests</span>
                                        <span>·</span>
                                        <span>{chalet.RoomsCount} bedrooms</span>
                                        <span>·</span>
                                        <span>{chalet.RoomsCount} beds</span>
                                        <span>·</span>
                                        <span>{chalet.BathroomsCount} baths</span>
                                    </div>
                                </div>
                                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg">
                                    {villageName.charAt(0)}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Features Row - Airbnb Style Icons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                                    <span className="text-2xl">🚪</span>
                                    <span className="text-sm font-bold text-slate-900">{chalet.RoomsCount} {isRTL ? 'غرف' : 'Rooms'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                                    <span className="text-2xl">🚿</span>
                                    <span className="text-sm font-bold text-slate-900">{chalet.BathroomsCount} {isRTL ? 'حمامات' : 'Baths'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                                    <span className="text-2xl">👩‍👩‍👧</span>
                                    <span className="text-sm font-bold text-slate-900">{chalet.AdultsCapacity} {isRTL ? 'كبار' : 'Adults'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                                    <span className="text-2xl">👶</span>
                                    <span className="text-sm font-bold text-slate-900">{chalet.ChildrenCapacity} {isRTL ? 'أطفال' : 'Children'}</span>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Description with Read More */}
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('chalet.description')}</h3>
                                <div className={`relative ${!isDescExpanded ? 'max-h-[7.5rem] overflow-hidden' : ''}`}>
                                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                                        {description}
                                    </p>
                                    {!isDescExpanded && (
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                                    className="mt-4 flex items-center gap-1 font-bold text-slate-900 underline underline-offset-4 decoration-2 hover:text-blue-600 transition-colors"
                                >
                                    {isDescExpanded ? (isRTL ? 'عرض أقل' : 'Show less') : (isRTL ? 'اقرأ المزيد' : 'Read more')}
                                    <svg className={`w-4 h-4 transition-transform ${isDescExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Reviews */}
                            <section className="pt-4">
                                <div className="flex items-center gap-2 mb-8">
                                    <span className="text-2xl font-bold text-slate-900">★ 4.9</span>
                                    <span className="text-2xl text-slate-200">·</span>
                                    <span className="text-2xl font-bold text-slate-900">12 {isRTL ? 'تقييم' : 'reviews'}</span>
                                </div>
                                <ReviewsList chaletId={chalet.Id} />
                            </section>
                        </div>

                        {/* Right Column: Desktop Booking Widget */}
                        <div className="hidden lg:block">
                            <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-slate-100 ring-1 ring-slate-100">
                                <div className="mb-6">
                                    <span className="text-2xl font-black text-slate-900">{chalet.PricePerNight} {t('common.sar')}</span>
                                    <span className="text-slate-500 ml-1">night</span>
                                </div>
                                <BookingForm
                                    chaletId={chalet.Id}
                                    pricePerNight={chalet.PricePerNight}
                                    initialCheckIn={checkIn}
                                    initialCheckOut={checkOut}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Booking Section (Expandable) */}
            <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 transition-all duration-500 ease-in-out ${isBookingVisible ? 'h-[80vh] overflow-y-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]' : 'h-24'}`}>
                {isBookingVisible && (
                    <div className="sticky top-0 right-0 left-0 flex justify-center p-4 bg-white z-10">
                        <button onClick={() => setIsBookingVisible(false)} className="w-12 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"></button>
                    </div>
                )}

                <div className="container mx-auto px-6 h-full flex flex-col">
                    {!isBookingVisible ? (
                        <div className="h-full flex items-center justify-between">
                            <div>
                                <span className="text-xl font-black text-slate-900 block">{chalet.PricePerNight} {t('common.sar')}</span>
                                <span className="text-xs text-slate-500 font-bold underline">{isRTL ? 'ليلة واحدة' : 'night'}</span>
                            </div>
                            <button
                                onClick={toggleBooking}
                                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-wider"
                            >
                                {isRTL ? 'احجز الآن' : 'Book Now'}
                            </button>
                        </div>
                    ) : (
                        <div className="pb-12 pt-4" ref={bookingRef}>
                            <div className="mb-8 text-center px-4">
                                <h3 className="text-2xl font-black text-slate-900">{isRTL ? 'أكد حجزك' : 'Book Your Stay'}</h3>
                                <p className="text-slate-500 text-sm mt-1">{villageName} · ★ 4.9</p>
                            </div>
                            <BookingForm
                                chaletId={chalet.Id}
                                pricePerNight={chalet.PricePerNight}
                                initialCheckIn={checkIn}
                                initialCheckOut={checkOut}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Footer />
            <div className="h-24 lg:hidden"></div> {/* Spacer for sticky bar */}
        </div>
    );
};

export default ChaletDetailPage;
