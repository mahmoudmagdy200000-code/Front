import { useState } from 'react';
import type { ChaletImage } from '../types/chalet';
import { getImageUrl } from '../config/api';

interface AirbnbGalleryProps {
    images: ChaletImage[];
}

const AirbnbGallery = ({ images }: AirbnbGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-slate-200 flex items-center justify-center rounded-2xl overflow-hidden">
                <span className="text-4xl text-slate-400">🏖️</span>
            </div>
        );
    }

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    // Full Screen Gallery View
    if (showAll) {
        return (
            <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 md:px-8 py-4 flex items-center justify-between border-b border-slate-100">
                    <button
                        onClick={() => setShowAll(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex gap-4">
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-sm font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 8.684m0 0a3 3 0 110 2.684m0-2.684l6.632-3.316m-6.632 6l6.632 3.316m0 0a3 3 0 110-2.684"></path></svg>
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-sm font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Images List */}
                <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
                    {images.map((img, idx) => (
                        <div key={img.Id} className="w-full bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                            <img
                                src={getImageUrl(img.ImageUrl)}
                                alt={`Gallery ${idx}`}
                                width={1200}
                                height={800}
                                className="w-full h-auto object-contain hover:scale-[1.01] transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative group w-full aspect-[16/9] md:aspect-[21/9] bg-slate-900 overflow-hidden md:rounded-3xl">
            {/* Main Image */}
            <img
                src={getImageUrl(images[currentIndex].ImageUrl)}
                alt="Chalet"
                width={1920}
                height={1080}
                fetchPriority="high"
                className="w-full h-full object-cover transition-all duration-500 cursor-pointer"
                onClick={() => setShowAll(true)}
                onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/1200x600/1e293b/ffffff?text=Image+Not+Found';
                    e.currentTarget.onerror = null;
                }}
            />

            {/* Navigation Overlay */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                        <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                        <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Floating Photo Index (Bottom Right) */}
            <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold rounded-lg pointer-events-none border border-white/10">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Show all photos button */}
            <button
                onClick={() => setShowAll(true)}
                className="absolute bottom-6 left-6 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 text-sm font-bold rounded-xl flex items-center gap-2 shadow-xl backdrop-blur-sm transition-transform active:scale-95 z-20"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Show all photos
            </button>
        </div>
    );
};

export default AirbnbGallery;
