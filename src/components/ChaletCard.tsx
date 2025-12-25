import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Chalet } from '../types/chalet';
import { getImageUrl } from '../config/api';
import { TreePalm, Bed, BedDouble } from 'lucide-react';

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
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-5 sm:p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight" title={title}>
                        {title}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1.5 font-medium">
                        <TreePalm className="w-4 h-4 text-slate-400 mr-1" />
                        <span className="truncate">{isArabic ? chalet.VillageNameAr : chalet.VillageNameEn}</span>
                    </div>
                </div>

                {/* Specs Section */}
                <div className="flex flex-wrap items-center gap-4 text-slate-500 mb-6 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <Bed className="w-4 h-4 text-slate-400 mr-1" />
                        <span>
                            {chalet.RoomsCount} {isArabic ? 'غرف' : 'Rooms'}
                        </span>
                        <BedDouble className="w-4 h-4 text-slate-400 ml-2" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <span>🚿</span>
                        <span>
                            {chalet.BathroomsCount} {isArabic ? 'حمامات' : 'Baths'}
                        </span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xl font-black text-slate-900 leading-none">
                            {chalet.PricePerNight.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-slate-900 leading-none">
                            {isArabic ? 'جنية' : t('common.sar')}
                        </span>
                        <span className="text-sm text-slate-400 font-medium font-sans leading-none">
                            / {isArabic ? 'ليلة' : 'night'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
