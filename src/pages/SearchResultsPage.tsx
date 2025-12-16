import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChalets } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import ChaletCard from '../components/ChaletCard';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import SearchForm from '../components/SearchForm';
import BudgetFilter from '../components/BudgetFilter';

const SearchResultsPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [searchParams, setSearchParams] = useSearchParams();

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // Get current page from URL or default to 1
    const currentPage = parseInt(searchParams.get('page') || '1');

    // Filter states
    const currentMaxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const currentMinPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined; // Add MinPrice

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

                const result = await getChalets({
                    checkInDate,
                    checkOutDate,
                    minPrice: currentMinPrice, // Pass minPrice
                    maxPrice: currentMaxPrice,
                    adults,
                    children,
                    page: currentPage,
                    pageSize: pageSize
                });

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

    const handlePriceFilterChange = (min: number | undefined, max: number | undefined) => {
        const newParams = new URLSearchParams(searchParams);

        if (min !== undefined) newParams.set('minPrice', min.toString());
        else newParams.delete('minPrice');

        if (max !== undefined) newParams.set('maxPrice', max.toString());
        else newParams.delete('maxPrice');

        newParams.set('page', '1'); // Reset to page 1
        setSearchParams(newParams);
    };

    const handleSearchQuery = (_query: string) => {
        // Implement header search logic if needed
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

                        {/* Budget Filter */}
                        <div className="mt-6">
                            <BudgetFilter
                                currentMin={currentMinPrice}
                                currentMax={currentMaxPrice}
                                onPriceFilterChange={handlePriceFilterChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-8">
                    {/* Centered Title and Count */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-blue-600">{totalCount} {isRTL ? 'شاليه تم العثور عليه' : 'Chalets Found'}</span>
                        </h1>
                        <div className="h-1 w-24 bg-blue-500 mx-auto mt-3 rounded-full"></div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {chalets.map((chalet) => (
                                            <ChaletCard key={chalet.Id} chalet={chalet} />
                                        ))}
                                    </div>

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500 text-lg">
                                        {isRTL ? 'لا توجد شاليهات تطابق بحثك' : 'No chalets found matching your criteria.'}
                                    </p>
                                    <button
                                        onClick={() => setSearchParams({})}
                                        className="mt-4 text-blue-600 hover:underline"
                                    >
                                        {isRTL ? 'عرض كل الشاليهات' : 'View all chalets'}
                                    </button>
                                </div>
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
