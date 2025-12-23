import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Chalet } from '../types/chalet';
import { getImageUrl } from '../config/api';

export interface ChaletCardProps {
    chalet: Chalet;
    checkIn?: string;
    checkOut?: string;
}

const ChaletCard = ({ chalet, checkIn, checkOut }: ChaletCardProps) => {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const isArabic = i18n.language === 'ar';

    const title = isArabic ? chalet.TitleAr : chalet.TitleEn;

    const handleViewDetails = () => {
        const params = new URLSearchParams();
        if (checkIn) params.append('checkIn', checkIn);
        if (checkOut) params.append('checkOut', checkOut);
        const queryString = params.toString();
        navigate(`/chalet/${chalet.Id}${queryString ? `?${queryString}` : ''}`);
    };

    const displayImage = chalet.Images?.find(img => img.IsPrimary)?.ImageUrl
        || chalet.Images?.[0]?.ImageUrl
        || chalet.ImageUrl;
    const imageCount = chalet.Images?.length || 0;

    return (
        <div
            onClick={handleViewDetails}
            className="flex flex-col h-full bg-white rounded-[2rem] border border-transparent hover:border-slate-100 hover:shadow-sm transition-all duration-300 group cursor-pointer overflow-hidden"
        >
            {/* Image Section - aspect-[4/3] flush with top and sides */}
            <div className="relative aspect-square sm:aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
                {displayImage ? (
                    <img
                        src={getImageUrl(displayImage)}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x600/1e293b/ffffff?text=No+Image';
                            e.currentTarget.onerror = null;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-5xl sm:text-6xl">🏖️</span>
                    </div>
                )}

                {/* Status Badge - Absolute overlay top-left with blur */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-white/20">
                    {isArabic ? 'متاح الآن' : 'Available Now'}
                </div>

                {/* Image Count - Bottom-right dark pill */}
                {imageCount > 1 && (
                    <div className="absolute bottom-4 right-4 bg-slate-900/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {imageCount}
                    </div>
                )}
            </div>

            {/* Content Section - Increased whitespace and clean layout */}
            <div className="flex flex-col flex-grow p-5 sm:p-6">
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight" title={title}>
                        {title}
                    </h3>
                    <svg className={`w-5 h-5 text-slate-300 opacity-60 group-hover:opacity-100 group-hover:text-blue-500 transition-all ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </div>

                {/* Capacity - Subtle guest info without gray box */}
                <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-medium">
                        {isArabic ? `${chalet.AdultsCapacity + chalet.ChildrenCapacity} أفراد` : `${chalet.AdultsCapacity + chalet.ChildrenCapacity} Guests`}
                    </span>
                </div>

                {/* Price - Simplified layout */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">
                        {chalet.PricePerNight.toLocaleString()}
                        <span className="text-xs font-bold text-slate-400 ms-1 uppercase tracking-tighter">{t('common.sar')}</span>
                    </span>
                    <span className="text-sm text-slate-400 font-medium font-sans">
                        / {isArabic ? 'ليلة' : 'night'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
