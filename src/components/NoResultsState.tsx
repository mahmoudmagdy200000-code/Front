import { useTranslation } from 'react-i18next';

interface NoResultsStateProps {
    onResetFilters: () => void;
    onClearPrice?: () => void;
    onClearVillage?: () => void;
    onOpenPriceFilter?: () => void;  // New: Open price filter
    onOpenVillageFilter?: () => void; // New: Open village filter
    activeFilters: {
        hasDates: boolean;
        hasPrice: boolean;
        hasVillage: boolean;
    };
    onScrollToSearch: () => void;
}

const NoResultsState = ({
    onResetFilters,
    onClearPrice,
    onClearVillage,
    onOpenPriceFilter,
    onOpenVillageFilter,
    activeFilters,
    onScrollToSearch
}: NoResultsStateProps) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div className="max-w-4xl mx-auto py-16 px-6 text-center">
            {/* Animated Icon */}
            <div className="relative mb-8 inline-block">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                <div className="relative bg-white p-8 rounded-full shadow-2xl border border-blue-50">
                    <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-4">
                {isRTL ? 'لم نجد ما يطابق بحثك تماماً' : 'No exact matches found'}
            </h2>
            <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto font-medium">
                {isRTL
                    ? 'جرب تعديل بعض الفلاتر للحصول على نتائج أكثر، أو ابحث في تواريخ بديلة.'
                    : 'Try adjusting your filters to find more results, or search with different dates.'}
            </p>

            {/* Smart Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {/* Dates Suggestion */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">{isRTL ? 'تغيير المواعيد' : 'Change Dates'}</h4>
                    <p className="text-xs text-slate-400 mb-4">{isRTL ? 'ربما تكون هذه المواعيد محجوزة بالكامل' : 'Maybe these dates are fully booked'}</p>
                    <button
                        onClick={onScrollToSearch}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4"
                    >
                        {isRTL ? 'تعديل التاريخ' : 'Edit dates'}
                    </button>
                </div>

                {/* Price Suggestion */}
                {activeFilters.hasPrice && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{isRTL ? 'توسيع الميزانية' : 'Widen Budget'}</h4>
                        <p className="text-xs text-slate-400 mb-4">{isRTL ? 'عرض الشاليهات بكافة الأسعار' : 'Show chalets at all prices'}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClearPrice}
                                className="flex-1 text-xs font-bold text-green-600 hover:text-green-700 underline decoration-2 underline-offset-4"
                            >
                                {isRTL ? 'إزالة الفلتر' : 'Clear filter'}
                            </button>
                            {onOpenPriceFilter && (
                                <button
                                    onClick={onOpenPriceFilter}
                                    className="flex-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4"
                                >
                                    {isRTL ? 'تعديل السعر' : 'Adjust price'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Location Suggestion */}
                {activeFilters.hasVillage && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{isRTL ? 'البحث بكل القرى' : 'Try all Locations'}</h4>
                        <p className="text-xs text-slate-400 mb-4">{isRTL ? 'ابحث في كل قرى رأس سدر' : 'Search in all Ras Sedr villages'}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClearVillage}
                                className="flex-1 text-xs font-bold text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-4"
                            >
                                {isRTL ? 'عرض الكل' : 'Show all'}
                            </button>
                            {onOpenVillageFilter && (
                                <button
                                    onClick={onOpenVillageFilter}
                                    className="flex-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4"
                                >
                                    {isRTL ? 'تغيير القرية' : 'Change village'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Back to all button */}
            <button
                onClick={onResetFilters}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all hover:shadow-xl active:scale-95"
            >
                {isRTL ? 'إعادة ضبط كافة الفلاتر' : 'Reset All Filters'}
            </button>
        </div>
    );
};

export default NoResultsState;
