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
            className="flex flex-col h-full bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
        >
            {/* Image Section - aspect-[4/5] for more vertical space/impact */}
            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden shrink-0">
                {displayImage ? (
                    <img
                        src={getImageUrl(displayImage)}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x800/1e293b/ffffff?text=No+Image';
                            e.currentTarget.onerror = null;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-5xl sm:text-8xl">🏖️</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4 bg-white/95 text-blue-600 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black shadow-lg backdrop-blur-md border border-white/20">
                    {isArabic ? 'متاح' : 'Available'}
                </div>

                {/* Image Count */}
                {imageCount > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 border border-white/10">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {imageCount}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-4 sm:p-5">
                <div className="mb-3">
                    <h3 className="text-base sm:text-xl font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight" title={title}>
                        {title}
                    </h3>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 text-slate-500 mb-5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 w-fit">
                    <span className="text-xl">👥</span>
                    <span className="text-xs font-black text-slate-600 tracking-tight">
                        {isArabic ? `${chalet.AdultsCapacity + chalet.ChildrenCapacity} أفراد` : `${chalet.AdultsCapacity + chalet.ChildrenCapacity} Guests`}
                    </span>
                </div>

                {/* Price */}
                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{isArabic ? 'السعر لليلة' : 'Price per night'}</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-black text-blue-600 leading-none">
                                {chalet.PricePerNight.toLocaleString()}
                            </span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{t('common.sar')}</span>
                        </div>
                    </div>

                    {/* Interactive Arrow */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm border border-slate-100 group-hover:border-blue-500">
                        <svg className={`w-6 h-6 transform ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
