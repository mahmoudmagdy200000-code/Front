import { useState, useEffect } from 'react';
import type { ChaletImage } from '../types/chalet';
import { getImageUrl } from '../config/api';

interface ImageGalleryProps {
    images: ChaletImage[];
    autoPlayInterval?: number; // milliseconds
}

const ImageGallery = ({ images, autoPlayInterval = 4000 }: ImageGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Auto-play slideshow
    useEffect(() => {
        if (!isPlaying || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isPlaying, images.length, autoPlayInterval]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-96 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center rounded-lg">
                <span className="text-white text-6xl">🏖️</span>
            </div>
        );
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsPlaying(false); // Pause auto-play when user manually navigates
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsPlaying(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const currentImage = images[currentIndex];

    return (
        <div className="w-full">
            {/* Main Image Display */}
            <div className="relative w-full h-96 md:h-[500px] bg-black rounded-lg overflow-hidden group">
                {/* Image */}
                <img
                    src={getImageUrl(currentImage.ImageUrl)}
                    alt={`Slide ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-700"
                    key={currentImage.Id}
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/800x600/1e293b/ffffff?text=Image+Not+Found';
                        e.currentTarget.onerror = null;
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Previous image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Next image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Play/Pause Button */}
                {images.length > 1 && (
                    <button
                        onClick={togglePlayPause}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {images.map((image, index) => (
                        <button
                            key={image.Id}
                            onClick={() => goToSlide(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                ? 'ring-4 ring-blue-500 scale-110'
                                : 'ring-2 ring-gray-700 hover:ring-blue-400 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={getImageUrl(image.ImageUrl)}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/200x200/1e293b/ffffff?text=No+Image';
                                    e.currentTarget.onerror = null;
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {images.length > 1 && isPlaying && (
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                            animation: `progress ${autoPlayInterval}ms linear infinite`,
                        }}
                    ></div>
                </div>
            )}

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .scrollbar-thin::-webkit-scrollbar {
                    height: 6px;
                }
                .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
                    background-color: #4B5563;
                    border-radius: 3px;
                }
                .scrollbar-track-gray-800::-webkit-scrollbar-track {
                    background-color: #1F2937;
                }
            `}</style>
        </div>
    );
};

export default ImageGallery;
