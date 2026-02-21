// src/components/home/HeroSlider.jsx
import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';

const HeroSlider = ({ items = [], onAnimeSelect, autoPlayInterval = 4000, loading = false }) => {
    const sliderRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const handleScroll = () => {
        const slider = sliderRef.current;
        if (!slider) return;
        const index = Math.round(slider.scrollLeft / slider.clientWidth);
        setCurrentIndex(index);
    };

    const scrollToIndex = (index) => {
        const slider = sliderRef.current;
        if (!slider) return;
        slider.scrollTo({ left: index * slider.clientWidth, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!items.length || isHovered || loading) return;
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % items.length;
            scrollToIndex(nextIndex);
        }, autoPlayInterval);
        return () => clearInterval(interval);
    }, [currentIndex, items.length, isHovered, autoPlayInterval, loading]);

    if (loading) {
        return (
            <section className="relative w-full">
                <div className="w-full bg-dark-surface animate-pulse" style={{height: '42vw', maxHeight: '220px'}}>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="w-14 h-4 bg-dark-card rounded-full mb-2" />
                        <div className="w-2/3 h-6 bg-dark-card rounded mb-3" />
                        <div className="w-20 h-8 bg-dark-card rounded-lg" />
                    </div>
                </div>
            </section>
        );
    }

    if (!items.length) return null;

    return (
        <section
            className="relative w-full overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => onAnimeSelect(item)}
                        className="snap-center shrink-0 w-screen relative cursor-pointer"
                        style={{height: '42vw', maxHeight: '220px'}}
                    >
                        <img
                            src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=1a1a1a&color=444&size=600`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                        {/* Gradient overlay - minimalist */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className="text-[9px] font-semibold text-primary-400 uppercase tracking-wider">
                                {item.source === 'samehadaku' || item.type === 'Anime' ? 'Anime' : 'Donghua'}
                            </span>
                            <h1 className="text-base font-bold text-white mt-1 mb-2 line-clamp-1">
                                {item.title}
                            </h1>
                            <button className="flex items-center gap-1.5 bg-primary-400 text-black text-xs font-semibold px-3 py-1.5 rounded-lg">
                                <Play size={11} fill="currentColor" />
                                Watch Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-4 right-4 flex gap-1">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        className={`rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? 'w-4 h-1.5 bg-primary-400'
                                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;
