import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Image } from "lucide-react";
import useHomes from "../hooks/useHome";

export const HeroBanner = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageLoadError, setImageLoadError] = useState({});
  const { home, loading, error } = useHomes();

  const heroData = home?.[0] || {};
  const images = heroData.heroBanners || []; 
  const titles = heroData.titles || [];
  const subtitles = heroData.subtitles || [];

  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images]);

  const nextSlide = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleImageError = (index) => {
    setImageLoadError((prev) => ({ ...prev, [index]: true }));
  };

  if (loading) {
    return (
      <div className="relative w-full h-[640px] flex items-center justify-center bg-gray-200 animate-pulse">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[640px] flex flex-col items-center justify-center bg-gray-100">
        <AlertCircle className="text-red-500 h-12 w-12 animate-bounce" />
        <h3 className="text-xl font-semibold text-gray-800 mt-4">Failed to load banner</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[640px] flex flex-col items-center justify-center bg-gray-100">
        <Image className="text-gray-400 h-16 w-16 animate-pulse" />
        <h3 className="text-xl font-semibold text-gray-700 mt-4">No banner images available</h3>
        <p className="text-gray-500">Please add banner images in the admin panel</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[640px] overflow-hidden">
      {images.map((image, index) => (
        <div 
          key={index} 
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            currentImage === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {!imageLoadError[index] ? (
            <img 
              src={image} 
              alt={`Slide ${index + 1}`} 
              className="w-full h-full object-cover" 
              onError={() => handleImageError(index)}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-5 flex flex-col items-center justify-center text-white text-center px-4">
            <h2 className="text-5xl font-bold">{titles[index] || ""}</h2>
            <p className="text-2xl">{subtitles[index] || ""}</p>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-opacity duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-opacity duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentImage === index ? "bg-white scale-125 shadow-lg" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
