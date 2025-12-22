import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BudgetFilterProps {
    onPriceFilterChange: (min: number | undefined, max: number | undefined) => void;
    currentMin?: number;
    currentMax?: number;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({ onPriceFilterChange, currentMin, currentMax }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [min, setMin] = useState<string>(currentMin?.toString() || '');
    const [max, setMax] = useState<string>(currentMax?.toString() || '');

    // Sync with props if they change externally
    useEffect(() => {
        setMin(currentMin?.toString() || '');
        setMax(currentMax?.toString() || '');
    }, [currentMin, currentMax]);

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        const minVal = min ? parseInt(min) : undefined;
        const maxVal = max ? parseInt(max) : undefined;
        onPriceFilterChange(minVal, maxVal);
    };

    const handleReset = () => {
        setMin('');
        setMax('');
        onPriceFilterChange(undefined, undefined);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-6 mb-8 w-full max-w-4xl mx-auto transition-all hover:shadow-xl hover:shadow-gray-100/80">
            <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${isRTL ? 'font-sans' : ''}`}>

                {/* Label Section */}
                <div className="flex items-center gap-3 text-gray-800 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl shadow-sm">
                        💰
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{isRTL ? 'الميزانية' : 'Budget'}</h3>
                        <p className="text-xs text-gray-400 font-medium">{isRTL ? 'السعر لليلة واحدة' : 'Price per night'}</p>
                    </div>
                </div>

                {/* Inputs Section - Symmetric */}
                <form onSubmit={handleApply} className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 w-full md:w-auto">

                    {/* Min Input */}
                    <div className="relative w-full sm:w-48 group">
                        <span className={`absolute inset-y-0 ${isRTL ? 'right-4' : 'left-4'} flex items-center text-gray-400 text-xs font-bold tracking-wider uppercase pointer-events-none group-focus-within:text-blue-500 transition-colors`}>
                            {isRTL ? 'من' : 'MIN'}
                        </span>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={min}
                            onChange={(e) => setMin(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-700 text-center placeholder-gray-300`}
                        />
                    </div>

                    {/* Symmetric Separator */}
                    <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-300 font-bold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" /></svg>
                    </div>

                    {/* Max Input */}
                    <div className="relative w-full sm:w-48 group">
                        <span className={`absolute inset-y-0 ${isRTL ? 'right-4' : 'left-4'} flex items-center text-gray-400 text-xs font-bold tracking-wider uppercase pointer-events-none group-focus-within:text-blue-500 transition-colors`}>
                            {isRTL ? 'إلى' : 'MAX'}
                        </span>
                        <input
                            type="number"
                            min="0"
                            placeholder="∞"
                            value={max}
                            onChange={(e) => setMax(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-700 text-center placeholder-gray-300`}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                            type="submit"
                            className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isRTL ? 'تطبيق' : 'Apply'}
                            {!isRTL && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                            {isRTL && <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                        </button>

                        {(min || max) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                title={isRTL ? 'إعادة تعيين' : 'Reset'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetFilter;
