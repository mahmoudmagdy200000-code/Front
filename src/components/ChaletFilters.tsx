import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VILLAGES } from '../config/villages';

interface ChaletFiltersProps {
    onFilterChange: (filters: { min: number | undefined; max: number | undefined; village: string | undefined }) => void;
    currentMin?: number;
    currentMax?: number;
    currentVillage?: string;
}

const ChaletFilters: React.FC<ChaletFiltersProps> = ({ onFilterChange, currentMin, currentMax, currentVillage }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [min, setMin] = useState<string>(currentMin?.toString() || '');
    const [max, setMax] = useState<string>(currentMax?.toString() || '');
    const [village, setVillage] = useState<string>(currentVillage || '');

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
    };

    const handleReset = () => {
        setMin('');
        setMax('');
        setVillage('');
        onFilterChange({ min: undefined, max: undefined, village: undefined });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-50/50 p-4 md:p-6 mb-8 w-full max-w-6xl mx-auto transition-all relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-100/40 transition-colors" />

            <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">

                {/* Sea-themed Label Section */}
                <div className="flex items-center gap-4 text-blue-900 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-200 text-white transform group-hover:rotate-6 transition-transform">
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                            <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                            <path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-xl tracking-tight">{isRTL ? 'خيارات الفلترة' : 'Search Filters'}</h3>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{isRTL ? 'خصص بحثك' : 'Customize Results'}</p>
                    </div>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleApply} className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-end gap-4">

                    {/* Village Dropdown */}
                    <div className="relative flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            {isRTL ? 'القرية' : 'Village'}
                        </label>
                        <div className="relative group/select">
                            <select
                                value={village}
                                onChange={(e) => setVillage(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-700 appearance-none`}
                            >
                                <option value="">{isRTL ? 'كل القرى' : 'All Villages'}</option>
                                {VILLAGES.map((v) => (
                                    <option key={v.en} value={v.en}>
                                        {isRTL ? v.ar : v.en}
                                    </option>
                                ))}
                            </select>
                            <div className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center pointer-events-none text-blue-500/50 group-focus-within/select:text-blue-500 transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <div className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gray-300`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Min Price */}
                    <div className="relative flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            {isRTL ? 'أقل سعر' : 'Min Price'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0"
                                value={min}
                                onChange={(e) => setMin(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-700`}
                            />
                            <span className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center text-gray-300 text-xs font-black`}>EGP</span>
                        </div>
                    </div>

                    {/* Max Price */}
                    <div className="relative flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            {isRTL ? 'أعلى سعر' : 'Max Price'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="∞"
                                value={max}
                                onChange={(e) => setMax(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-gray-700`}
                            />
                            <span className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center text-gray-300 text-xs font-black`}>EGP</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isRTL ? 'تطبيق' : 'Apply'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-2 border-transparent hover:border-red-100"
                            title={isRTL ? 'مسح الكل' : 'Clear All'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChaletFilters;
