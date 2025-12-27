import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VILLAGES } from '../config/villages';

interface ChaletFiltersProps {
    onFilterChange: (filters: { min: number | undefined; max: number | undefined; village: string | undefined }) => void;
    currentMin?: number;
    currentMax?: number;
    currentVillage?: string;
    autoOpenFilter?: 'price' | 'village' | null; // Auto-open specific filter
}

const ChaletFilters: React.FC<ChaletFiltersProps> = ({ onFilterChange, currentMin, currentMax, currentVillage, autoOpenFilter }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [min, setMin] = useState<string>(currentMin?.toString() || '');
    const [max, setMax] = useState<string>(currentMax?.toString() || '');
    const [village, setVillage] = useState<string>(currentVillage || '');
    const [isOpen, setIsOpen] = useState(false);

    // Auto-open filter if specified
    useEffect(() => {
        if (autoOpenFilter) {
            setIsOpen(true);
            // Scroll to filters section smoothly
            setTimeout(() => {
                const filterElement = document.querySelector('[data-filter-section]');
                if (filterElement) {
                    filterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [autoOpenFilter]);

    // Clean up openFilter param after use (only on mount)
    useEffect(() => {
        if (autoOpenFilter) {
            // Remove the openFilter param after a short delay to allow the filter to open
            const timer = setTimeout(() => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.delete('openFilter');
                window.history.replaceState({}, '', currentUrl.toString());
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []); // Empty deps - only run once on mount

    // Sync with props if they change externally
    useEffect(() => {
        setMin(currentMin?.toString() || '');
        setMax(currentMax?.toString() || '');
        setVillage(currentVillage || '');
    }, [currentMin, currentMax, currentVillage]);

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        const minVal = min ? parseInt(min) : undefined;
        const maxVal = max ? parseInt(max) : undefined;
        onFilterChange({ min: minVal, max: maxVal, village: village || undefined });
        if (window.innerWidth < 1024) setIsOpen(false); // Close on mobile after apply
    };

    const handleReset = () => {
        setMin('');
        setMax('');
        setVillage('');
        onFilterChange({ min: undefined, max: undefined, village: undefined });
    };

    const hasActiveFilters = !!(min || max || village);

    return (
        <div className="w-full max-w-5xl mx-auto mb-6" data-filter-section>
            <div className={`bg-white rounded-[1.5rem] shadow-xl shadow-blue-900/5 border border-blue-50/50 transition-all duration-500 overflow-hidden ${isOpen ? 'ring-2 ring-blue-500/20' : ''}`}>

                {/* Header / Toggle Button (Mobile & Desktop) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 flex items-center justify-between group relative overflow-hidden transition-colors hover:bg-slate-50/50"
                >
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-100/40 transition-colors" />

                    <div className="relative z-10 flex items-center gap-3 text-blue-900 shrink-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br transition-all duration-500 flex items-center justify-center text-xl shadow-md ${isOpen ? 'from-blue-600 to-indigo-600 rotate-6 scale-110' : 'from-blue-500 to-cyan-400'} text-white`}>
                            <svg className="w-5 h-5 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 3H2l8 9v6l4 2V12L22 3z" />
                                {hasActiveFilters && !isOpen && (
                                    <circle cx="20" cy="4" r="3" fill="#ef4444" stroke="white" strokeWidth="2" />
                                )}
                            </svg>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-base tracking-tight leading-none mb-1">
                                {isRTL ? 'خيارات التصفية' : 'Search Filters'}
                            </h3>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">
                                {isOpen ? (isRTL ? 'إغلاق الإعدادات' : 'Close Settings') : (isRTL ? 'تخصيص عرض النتائج' : 'Customize Results')}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        {hasActiveFilters && !isOpen && (
                            <span className="hidden sm:inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-tighter animate-pulse">
                                {isRTL ? 'فلاتر مفعلة' : 'Active Filters'}
                            </span>
                        )}
                        <div className={`w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 bg-blue-50' : ''}`}>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </button>

                {/* Filter Form (Animated Reveal) */}
                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50/20">
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleApply} className="flex flex-col md:flex-row items-end gap-4">

                                {/* Location Group */}
                                <div className="flex-1 w-full space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">
                                        {isRTL ? 'المنطقة / القرية' : 'Location / Village'}
                                    </label>
                                    <div className="relative group/field">
                                        <select
                                            value={village}
                                            onChange={(e) => setVillage(e.target.value)}
                                            className={`soft-input w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3.5 font-bold text-slate-700 text-sm appearance-none cursor-pointer`}
                                        >
                                            <option value="">{isRTL ? 'كل قرى رأس سدر' : 'All of Ras Sedr'}</option>
                                            {VILLAGES.map((v) => (
                                                <option key={v.en} value={v.en}>
                                                    {isRTL ? v.ar : v.en}
                                                </option>
                                            ))}
                                        </select>
                                        <div className={`absolute inset-y-0 ${isRTL ? 'right-3.5' : 'left-3.5'} flex items-center pointer-events-none text-blue-500/50 group-hover/field:text-blue-500 transition-colors`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Range Group */}
                                <div className="flex-[1.5] w-full grid grid-cols-2 gap-3 items-end">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">
                                            {isRTL ? 'السعر الأدنى' : 'Min Price'}
                                        </label>
                                        <div className="relative group/field">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={min}
                                                onChange={(e) => setMin(e.target.value)}
                                                className={`soft-input w-full ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3.5 font-bold text-slate-700 text-sm`}
                                            />
                                            <span className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center text-slate-300 text-[9px] font-black`}>EGP</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">
                                            {isRTL ? 'السعر الأقصى' : 'Max Price'}
                                        </label>
                                        <div className="relative group/field">
                                            <input
                                                type="number"
                                                placeholder="∞"
                                                value={max}
                                                onChange={(e) => setMax(e.target.value)}
                                                className={`soft-input w-full ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3.5 font-bold text-slate-700 text-sm`}
                                            />
                                            <span className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center text-slate-300 text-[9px] font-black`}>EGP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Group */}
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <button
                                        type="submit"
                                        className="flex-grow md:flex-none px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                    >
                                        {isRTL ? 'تطبيق' : 'Apply'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="p-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 flex items-center justify-center"
                                        title={isRTL ? 'إعادة تعيين' : 'Reset'}
                                    >
                                        <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChaletFilters;
