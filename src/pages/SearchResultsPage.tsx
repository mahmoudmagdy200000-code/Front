import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getChalets } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import ChaletCard from '../components/ChaletCard';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';

const SearchResultsPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [searchParams, setSearchParams] = useSearchParams();

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');

    // Get params from URL
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        const fetchChalets = async () => {
            try {
                setLoading(true);
                const data = await getChalets(
                    checkIn || undefined,
                    checkOut || undefined,
                    undefined,
                    adults,
                    children
                );
                setChalets(data);
                setError(null);
            } catch (err: any) {
                setError(t('common.error'));
                console.error('Error searching chalets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChalets();
    }, [checkIn, checkOut, adults, children, t]);

    // Auto-scroll to results section after data loads
    useEffect(() => {
        if (!loading) {
            const resultsSection = document.getElementById('results-section');
            if (resultsSection) {
                setTimeout(() => {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [loading]);

    const filteredChalets = chalets.filter(chalet => {
        const title = isRTL ? chalet.TitleAr : chalet.TitleEn;
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesPrice = true;
        if (priceFilter === 'low') matchesPrice = chalet.PricePerNight < 1000;
        else if (priceFilter === 'mid') matchesPrice = chalet.PricePerNight >= 1000 && chalet.PricePerNight < 2000;
        else if (priceFilter === 'high') matchesPrice = chalet.PricePerNight >= 2000;

        return matchesSearch && matchesPrice;
    });

    const handleSearchUpdate = (params: any) => {
        // Update URL params which will trigger useEffect
        const newParams = new URLSearchParams(searchParams);
        if (params.checkIn) newParams.set('checkIn', params.checkIn);
        else newParams.delete('checkIn');

        if (params.checkOut) newParams.set('checkOut', params.checkOut);
        else newParams.delete('checkOut');

        newParams.set('adults', params.adults.toString());
        newParams.set('children', params.children.toString());

        setSearchParams(newParams);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                    const newParams = new URLSearchParams(searchParams);
                    if (q) newParams.set('q', q);
                    else newParams.delete('q');
                    setSearchParams(newParams);
                }}
            />

            <main className="flex-grow">
                {/* Search Form Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-8 border-b border-gray-200">
                    <div className="container mx-auto">
                        <SearchForm
                            initialCheckIn={checkIn}
                            initialCheckOut={checkOut}
                            initialAdults={adults}
                            initialChildren={children}
                            onSearch={handleSearchUpdate}
                        />
                    </div>
                </div>

                {/* Price Filter Section */}
                <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10 shadow-sm">
                    <div className="container mx-auto px-6">
                        <div className="flex justify-center">
                            <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
                                <button
                                    onClick={() => setPriceFilter('all')}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${priceFilter === 'all'
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {isRTL ? 'الكل' : 'All'}
                                </button>
                                <button
                                    onClick={() => setPriceFilter('low')}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${priceFilter === 'low'
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {isRTL ? 'اقتصادي (<1000)' : 'Budget (<1000)'}
                                </button>
                                <button
                                    onClick={() => setPriceFilter('mid')}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${priceFilter === 'mid'
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {isRTL ? 'متوسط (1000-2000)' : 'Mid (1000-2000)'}
                                </button>
                                <button
                                    onClick={() => setPriceFilter('high')}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${priceFilter === 'high'
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {isRTL ? 'فاخر (>2000)' : 'Luxury (>2000)'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div id="results-section" className="px-6 py-12">
                    <div className="container mx-auto">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                {isRTL ? 'نتائج البحث' : 'Search Results'}
                            </h2>
                            <p className="text-gray-600 text-lg">
                                {isRTL
                                    ? `تم العثور على ${filteredChalets.length} شاليه`
                                    : `Found ${filteredChalets.length} chalets`}
                            </p>
                        </div>

                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filteredChalets.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredChalets.map((chalet) => (
                                    <ChaletCard
                                        key={chalet.Id}
                                        chalet={chalet}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && !error && filteredChalets.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    {isRTL ? 'لا توجد شاليهات متاحة' : 'No chalets available'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SearchResultsPage;
