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
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-50/50 p-3 md:p-4 mb-6 w-full max-w-5xl mx-auto transition-all relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-100/40 transition-colors" />

            <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

                {/* Sea-themed Label Section */}
                <div className="flex items-center gap-3 text-blue-900 shrink-0 mb-1 lg:mb-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl shadow-md shadow-blue-100 text-white transform group-hover:rotate-6 transition-transform">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                            <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-base tracking-tight leading-none mb-1">{isRTL ? 'خيارات البحث' : 'Search Filters'}</h3>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">{isRTL ? 'تخصيص العرض' : 'Custom View'}</p>
                    </div>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleApply} className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-end gap-3">

                    {/* Village Dropdown */}
                    <div className="relative flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            {isRTL ? 'القرية' : 'Village'}
                        </label>
                        <div className="relative group/select">
                            <select
                                value={village}
                                onChange={(e) => setVillage(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-700 text-sm appearance-none`}
                            >
                                <option value="">{isRTL ? 'كل القرى' : 'All Villages'}</option>
                                {VILLAGES.map((v) => (
                                    <option key={v.en} value={v.en}>
                                        {isRTL ? v.ar : v.en}
                                    </option>
                                ))}
                            </select>
                            <div className={`absolute inset-y-0 ${isRTL ? 'right-2.5' : 'left-2.5'} flex items-center pointer-events-none text-blue-500/50 group-focus-within/select:text-blue-500 transition-colors`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Min Price */}
                    <div className="relative flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            {isRTL ? 'أقل سعر' : 'Min Price'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0"
                                value={min}
                                onChange={(e) => setMin(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-3 pl-8' : 'pl-3 pr-8'} py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-700 text-sm`}
                            />
                            <span className={`absolute inset-y-0 ${isRTL ? 'left-2' : 'right-2'} flex items-center text-gray-300 text-[10px] font-black`}>EGP</span>
                        </div>
                    </div>

                    {/* Max Price */}
                    <div className="relative flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            {isRTL ? 'أعلى سعر' : 'Max Price'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="∞"
                                value={max}
                                onChange={(e) => setMax(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-3 pl-8' : 'pl-3 pr-8'} py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-700 text-sm`}
                            />
                            <span className={`absolute inset-y-0 ${isRTL ? 'left-2' : 'right-2'} flex items-center text-gray-300 text-[10px] font-black`}>EGP</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <button
                            type="submit"
                            className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-100 active:scale-95 flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {isRTL ? 'تطبيق' : 'Apply'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title={isRTL ? 'مسح' : 'Clear'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChaletFilters;
