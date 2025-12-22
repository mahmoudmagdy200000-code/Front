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
    const description = isArabic ? chalet.DescriptionAr : chalet.DescriptionEn;

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
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            {/* Image Section */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
                {displayImage ? (
                    <img
                        src={getImageUrl(displayImage)}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400/1e293b/ffffff?text=No+Image';
                            e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-3xl sm:text-6xl">🏖️</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm backdrop-blur-sm bg-opacity-90">
                    {isArabic ? 'متاح' : 'Available'}
                </div>

                {/* ID Badge */}
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-md text-[10px] font-mono shadow-sm backdrop-blur-sm">
                    #{chalet.Id}
                </div>

                {/* Image Count Badge */}
                {imageCount > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {imageCount}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-3 sm:p-5">
                <div className="mb-2 sm:mb-4">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={title}>
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 h-8 sm:h-10 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Spacer to push bottom section down */}
                <div className="flex-grow"></div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">{t('common.sar')} / {isArabic ? 'ليلة' : 'night'}</span>
                        <span className="text-lg sm:text-2xl font-black text-gray-900 leading-none">
                            {chalet.PricePerNight}
                        </span>
                    </div>

                    <button
                        onClick={handleViewDetails}
                        className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-bold text-xs sm:text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 active:scale-95"
                    >
                        {isArabic ? 'التفاصيل' : 'Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
