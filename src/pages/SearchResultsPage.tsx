import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChalets } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import ChaletCard from '../components/ChaletCard';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import SearchForm from '../components/SearchForm';
import NoResultsState from '../components/NoResultsState';
const ChaletFilters = lazy(() => import('../components/ChaletFilters'));

const SearchResultsPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [searchParams, setSearchParams] = useSearchParams();

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // Refs for scrolling
    const filterRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Initial scroll to filters on load
    useEffect(() => {
        // We use a small timeout to ensure layout is ready
        const timer = setTimeout(() => {
            filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Get current page from URL or default to 1
    const currentPage = parseInt(searchParams.get('page') || '1');

    // Filter states
    const currentMaxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const currentMinPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const currentVillage = searchParams.get('village') || undefined;

    // Auto-open filter detection
    const autoOpenFilter = searchParams.get('openFilter') as 'price' | 'village' | null;

    // Determine page size based on screen width
    const getPageSize = () => {
        const width = window.innerWidth;
        if (width < 640) return 6; // Mobile
        if (width < 1024) return 9; // Tablet
        return 12; // Desktop
    };

    const [pageSize, setPageSize] = useState(getPageSize());

    useEffect(() => {
        const handleResize = () => {
            setPageSize(getPageSize());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchChalets = async () => {
            try {
                setLoading(true);
                setError(null);

                const checkInDate = searchParams.get('checkIn') || undefined;
                const checkOutDate = searchParams.get('checkOut') || undefined;
                const adults = searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined;
                const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined;
                const villageName = searchParams.get('village') || undefined;

                console.log('🔍 [fetchChalets] villageName from URL:', villageName);
                const result = await getChalets({
                    checkInDate,
                    checkOutDate,
                    minPrice: currentMinPrice,
                    maxPrice: currentMaxPrice,
                    adults,
                    children,
                    villageName,
                    page: currentPage,
                    pageSize: pageSize
                });
                console.log('✅ [fetchChalets] Result:', result);

                setChalets(result.Items);
                setTotalPages(result.TotalPages);
                setTotalCount(result.TotalCount);

            } catch (err: any) {
                setError(t('common.error'));
                console.error('Error fetching chalets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChalets();
    }, [searchParams, pageSize, t]);

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (filters: { min: number | undefined; max: number | undefined; village: string | undefined }) => {
        const newParams = new URLSearchParams(searchParams);

        if (filters.min !== undefined) newParams.set('minPrice', filters.min.toString());
        else newParams.delete('minPrice');

        if (filters.max !== undefined) newParams.set('maxPrice', filters.max.toString());
        else newParams.delete('maxPrice');

        if (filters.village) newParams.set('village', filters.village);
        else newParams.delete('village');

        newParams.set('page', '1'); // Reset to page 1
        setSearchParams(newParams);

        // Scroll to results summary after applying filters with a slight delay for rendering
        setTimeout(() => {
            if (resultsRef.current) {
                const yOffset = -20; // Slight offset for better visibility
                const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 300);
    };

    const handleSearchQuery = (_query: string) => {
        // Implement header search logic if needed
    };

    const handleOpenPriceFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('openFilter', 'price');
        setSearchParams(newParams);
        // Scroll to filters
        setTimeout(() => {
            filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleOpenVillageFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('openFilter', 'village');
        setSearchParams(newParams);
        // Scroll to filters
        setTimeout(() => {
            filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery="" setSearchQuery={handleSearchQuery} />

            <main className="flex-grow">
                <div className="bg-white border-b border-gray-200 px-6 py-8">
                    <div className="container mx-auto">
                        {/* Search Form */}
                        <div className="hidden lg:block">
                            <SearchForm
                                initialCheckIn={searchParams.get('checkIn') || ''}
                                initialCheckOut={searchParams.get('checkOut') || ''}
                                initialAdults={searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : 2}
                                initialChildren={searchParams.get('children') ? parseInt(searchParams.get('children')!) : 0}
                            />
                        </div>

                        {/* Integrated Filters */}
                        <div className="mt-6" ref={filterRef}>
                            <Suspense fallback={<div className="h-12 animate-pulse bg-slate-50 rounded-xl"></div>}>
                                <ChaletFilters
                                    currentMin={currentMinPrice}
                                    currentMax={currentMaxPrice}
                                    currentVillage={currentVillage}
                                    autoOpenFilter={autoOpenFilter}
                                    onFilterChange={handleFilterChange}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-8" ref={resultsRef}>
                    {/* Professional Result Header */}
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight uppercase mb-1">
                            {isRTL ? `أكثر من ${totalCount} إقامة في رأس سدر` : `Over ${totalCount} stays in Ras Sedr`}
                        </h1>
                        <p className="text-2xl font-black text-slate-800">
                            {isRTL ? 'شاليهات متميزة ومراجعة من الضيوف' : 'Highly rated chalets reviewed by guests'}
                        </p>
                    </div>

                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {chalets.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                        {chalets.map((chalet, index) => (
                                            <ChaletCard
                                                key={chalet.Id}
                                                chalet={chalet}
                                                priority={index < 2}
                                                checkIn={searchParams.get('checkIn') || undefined}
                                                checkOut={searchParams.get('checkOut') || undefined}
                                            />
                                        ))}
                                    </div>

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            ) : (
                                <NoResultsState
                                    onResetFilters={() => setSearchParams({})}
                                    onClearPrice={() => {
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.delete('minPrice');
                                        newParams.delete('maxPrice');
                                        setSearchParams(newParams);
                                    }}
                                    onClearVillage={() => {
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.delete('village');
                                        setSearchParams(newParams);
                                    }}
                                    onOpenPriceFilter={handleOpenPriceFilter}
                                    onOpenVillageFilter={handleOpenVillageFilter}
                                    onScrollToSearch={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        // Optional: focus on search form if needed
                                    }}
                                    activeFilters={{
                                        hasDates: !!(searchParams.get('checkIn') && searchParams.get('checkOut')),
                                        hasPrice: !!(searchParams.get('minPrice') || searchParams.get('maxPrice')),
                                        hasVillage: !!searchParams.get('village')
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SearchResultsPage;
