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
        <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-64 bg-gray-100 overflow-hidden">
                {displayImage ? (
                    <img
                        src={getImageUrl(displayImage)}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400/1e293b/ffffff?text=No+Image';
                            e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-6xl">🏖️</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm bg-opacity-90">
                    {isArabic ? 'متاح' : 'Available'}
                </div>

                {/* Image Count Badge */}
                {imageCount > 0 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {imageCount}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">ID: {chalet.Id}</p>
                    <p className="text-gray-500 text-sm line-clamp-2">
                        {description}
                    </p>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {chalet.PricePerNight} <span className="text-sm font-medium text-gray-500">{t('common.sar')}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleViewDetails}
                        className="px-6 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 font-semibold text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transform hover:-translate-y-0.5"
                    >
                        {isArabic ? 'التفاصيل' : 'Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
