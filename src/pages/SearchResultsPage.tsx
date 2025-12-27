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
import DatePicker from '../components/DatePicker';
import { formatDateToDDMMYYYY, parseDateFromDDMMYYYY } from '../utils/dateUtils';
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

    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | null>(null);

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
                    pageSize: pageSize,
                    sortBy: sortBy || undefined
                });
                console.log('✅ [fetchChalets] Result:', result);

                let items = result.Items;
                // Client-side sort to ensure order if backend doesn't support it fully yet
                if (sortBy === 'price_asc') {
                    items = [...items].sort((a, b) => a.PricePerNight - b.PricePerNight);
                } else if (sortBy === 'price_desc') {
                    items = [...items].sort((a, b) => b.PricePerNight - a.PricePerNight);
                }

                setChalets(items);
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
    }, [searchParams, pageSize, t, sortBy]);

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

    // Date Modal Logic
    const [showDateModal, setShowDateModal] = useState(false);
    const [modalCheckIn, setModalCheckIn] = useState('');
    const [modalCheckOut, setModalCheckOut] = useState('');

    const handleOpenDateFilter = () => {
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        setModalCheckIn(checkIn ? formatDateToDDMMYYYY(checkIn) : '');
        setModalCheckOut(checkOut ? formatDateToDDMMYYYY(checkOut) : '');
        setShowDateModal(true);
    };

    const handleApplyDateChanges = () => {
        const newParams = new URLSearchParams(searchParams);

        if (modalCheckIn) {
            newParams.set('checkIn', parseDateFromDDMMYYYY(modalCheckIn));
        } else {
            newParams.delete('checkIn');
        }

        if (modalCheckOut) {
            newParams.set('checkOut', parseDateFromDDMMYYYY(modalCheckOut));
        } else {
            newParams.delete('checkOut');
        }

        newParams.set('page', '1');
        setSearchParams(newParams);
        setShowDateModal(false);

        setTimeout(() => {
            if (resultsRef.current) {
                const yOffset = -20;
                const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 300);
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
                    {/* Professional Result Header with Sort */}
                    <div className="mb-8 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 tracking-tight uppercase mb-1">
                                {isRTL ? `أكثر من ${totalCount} إقامة في رأس سدر` : `Over ${totalCount} stays in Ras Sedr`}
                            </h1>
                            <p className="text-2xl font-black text-slate-800">
                                {isRTL ? 'شاليهات متميزة ومراجعة من الضيوف' : 'Highly rated chalets reviewed by guests'}
                            </p>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-500 whitespace-nowrap">
                                {isRTL ? 'ترتيب حسب:' : 'Sort by:'}
                            </label>
                            <select
                                value={sortBy || ''}
                                onChange={(e) => setSortBy(e.target.value as any || null)}
                                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none font-bold"
                            >
                                <option value="">{isRTL ? 'المقترح' : 'Recommended'}</option>
                                <option value="price_asc">{isRTL ? 'السعر: من الأقل للأكثر' : 'Price: Low to High'}</option>
                                <option value="price_desc">{isRTL ? 'السعر: من الأكثر للأقل' : 'Price: High to Low'}</option>
                            </select>
                        </div>
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
                                    onOpenDateFilter={handleOpenDateFilter}
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

                {/* Date Filter Modal */}
                {showDateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-visible animate-in fade-in zoom-in duration-300 my-8">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isRTL ? 'تعديل تواريخ الحجز' : 'Modify Booking Dates'}
                                </h3>
                                <button
                                    onClick={() => setShowDateModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px]">
                                <div className="space-y-2 relative">
                                    <DatePicker
                                        label={isRTL ? 'تاريخ الوصول' : 'Check-in'}
                                        value={modalCheckIn}
                                        onChange={(val) => setModalCheckIn(val)}
                                        placeholder="DD/MM/YYYY"
                                        minDate={new Date()}
                                        isRTL={isRTL}
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <DatePicker
                                        label={isRTL ? 'تاريخ المغادرة' : 'Check-out'}
                                        value={modalCheckOut}
                                        onChange={(val) => setModalCheckOut(val)}
                                        placeholder="DD/MM/YYYY"
                                        minDate={modalCheckIn && parseDateFromDDMMYYYY(modalCheckIn) ? new Date(new Date(parseDateFromDDMMYYYY(modalCheckIn)).getTime() + 86400000) : new Date()}
                                        isRTL={isRTL}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                                <button
                                    onClick={() => setShowDateModal(false)}
                                    className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-800 transition-all border border-transparent hover:border-gray-200"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleApplyDateChanges}
                                    disabled={!modalCheckIn || !modalCheckOut}
                                    className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRTL ? 'تحديث البحث' : 'Update Search'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default SearchResultsPage;
