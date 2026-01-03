import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Chalet } from '../types/chalet';
import { getImageUrl } from '../config/api';
import { TreePalm, Bed } from 'lucide-react';

export interface ChaletCardProps {
    chalet: Chalet;
    checkIn?: string;
    checkOut?: string;
    priority?: boolean;
}

const ChaletCard = ({ chalet, checkIn, checkOut, priority }: ChaletCardProps) => {
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

    return (
        <div
            onClick={handleViewDetails}
            className="soft-card group cursor-pointer overflow-hidden flex flex-col h-full"
        >
            {/* Image Section - aspect-[4/3] for all cards */}
            <div className="relative aspect-[4/3] sm:aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
                {displayImage ? (
                    <img
                        src={getImageUrl(displayImage)}
                        alt={title}
                        width={800}
                        height={600}
                        loading="lazy"
                        fetchPriority={priority ? "high" : "low"}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/800x600/f8fafc/64748b?text=Chalet+Image';
                            e.currentTarget.onerror = null;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <span className="text-4xl text-slate-200">🏘️</span>
                    </div>
                )}


            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-5 sm:p-6">
                <div className="mb-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight" title={title}>
                            {title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <TreePalm className="w-3.5 h-3.5 text-blue-500/60" />
                        <span className="truncate">{isArabic ? chalet.VillageNameAr : chalet.VillageNameEn}</span>
                    </div>
                </div>

                {/* Specs Section - Premium pill style */}
                <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100/50">
                        <Bed className="w-3.5 h-3.5 opacity-60" />
                        <span>{chalet.RoomsCount || 3} {isArabic ? 'غرف' : 'Rooms'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100/50">
                        <span className="text-xs">🚿</span>
                        <span>{chalet.BathroomsCount || 2} {isArabic ? 'حمامات' : 'Baths'}</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{isArabic ? 'السعر لليلة' : 'Price per night'}</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-slate-900 leading-none">
                                {chalet.PricePerNight.toLocaleString()}
                            </span>
                            <span className="text-sm font-black text-blue-600 leading-none">
                                {isArabic ? 'جنية' : t('common.sar')}
                            </span>
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <svg className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
