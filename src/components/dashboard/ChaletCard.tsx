// Fixed build error: Restored missing imports
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Chalet } from '../../types/chalet';

interface ChaletCardProps {
    chalet: Chalet;
    onEdit: (chalet: Chalet) => void;
    onDelete: (id: number) => void;
}

import { getImageUrl } from '../../config/api';

const ChaletCard = ({ chalet, onEdit, onDelete }: ChaletCardProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isArabic = i18n.language === 'ar';

    const [imgError, setImgError] = useState(false);

    // Reset error state when chalet changes
    useEffect(() => {
        setImgError(false);
    }, [chalet.Id]);

    // Helper for safe description truncation (although line-clamp handles visual truncation)
    const getDescription = () => {
        const desc = isArabic ? chalet.DescriptionAr : chalet.DescriptionEn;
        return desc || '';
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col h-full relative">
            {/* Image Section - aspect-ratio 16/9 for mobile, fixed height for desktop */}
            <div className="relative aspect-[16/9] md:h-48 w-full bg-gray-100 overflow-hidden">
                {chalet.Images && chalet.Images.length > 0 && !imgError ? (
                    <img
                        src={getImageUrl(chalet.Images.find(i => i.IsPrimary)?.ImageUrl || chalet.Images[0].ImageUrl)}
                        alt={isArabic ? chalet.TitleAr : chalet.TitleEn}
                        width={400}
                        height={300}
                        loading="lazy"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400 font-medium">{isArabic ? 'بدون صورة' : 'No Image'}</span>
                    </div>
                )}

                {/* ID Badge - Absolute positioned relative to image container */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm z-10 border border-gray-100/50">
                    #{chalet.Id}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-3 md:p-4">
                {/* Header: Title & Description */}
                <div className="mb-4 flex-grow">
                    <div className="min-h-[1.5rem]">
                        <h3 className="text-lg font-semibold text-gray-900 mb-0.5 line-clamp-1" title={isArabic ? chalet.TitleAr : chalet.TitleEn}>
                            {isArabic ? chalet.TitleAr : chalet.TitleEn}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <span>📍</span>
                        <span className="truncate">{isArabic ? chalet.VillageNameAr : chalet.VillageNameEn}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mt-2">
                        {getDescription()}
                    </p>
                </div>

                {/* Specs Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-4 min-h-[1.25rem]">
                    <div className="flex items-center gap-1.5" title={isArabic ? 'غرف' : 'Rooms'}>
                        <span className="text-sm">🚪</span>
                        <span className="font-medium">{chalet.RoomsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={isArabic ? 'حمامات' : 'Bathrooms'}>
                        <span className="text-sm">🚿</span>
                        <span className="font-medium">{chalet.BathroomsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={isArabic ? 'البالغين' : 'Adults'}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{chalet.AdultsCapacity}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={isArabic ? 'الأطفال' : 'Children'}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">{chalet.ChildrenCapacity}</span>
                    </div>
                </div>

                {/* Earnings Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-4 mt-1">
                    <div className="bg-slate-100/50 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-tight">{isArabic ? 'أرباح الشهر' : 'Monthly E.'}</span>
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-sm font-black text-slate-700">{(chalet.MonthlyEarnings || 0).toLocaleString()}</span>
                            <span className="text-[8px] text-slate-400 font-bold tracking-tighter">EGP</span>
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/30 flex flex-col gap-0.5">
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-tight">{isArabic ? 'حجوزات قادمة' : 'Upcoming B.'}</span>
                        <span className="text-sm font-black text-blue-600">{chalet.UpcomingBookingsCount || 0}</span>
                    </div>
                </div>

                {/* Price Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t('common.sar')}</span>
                        <span className="text-xl font-bold text-blue-600 leading-tight">
                            {chalet.PricePerNight}
                            <span className="text-sm text-gray-400 font-normal ml-1">/{isArabic ? 'ليلة' : 'night'}</span>
                        </span>
                    </div>

                    <button
                        onClick={() => navigate(`/owner/dashboard/chalet/${chalet.Id}`)}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        {isArabic ? 'الحجوزات' : 'Bookings'}
                    </button>
                </div>

                {/* Edit/Delete Actions - Enhanced */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => onEdit(chalet)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border border-indigo-100 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-indigo-100"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('dashboard.edit')}
                    </button>

                    <button
                        onClick={() => onDelete(chalet.Id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-rose-100"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t('dashboard.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
