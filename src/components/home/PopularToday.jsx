// src/components/home/PopularToday.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Flame } from 'lucide-react';
import axios from 'axios';

const PopularTodaySection = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularToday();
    }, []);

    const fetchPopularToday = async () => {
        try {
            const response = await axios.get('https://anime-api-iota-beryl.vercel.app/api/donghua/popular-today');
            if (response.data.success) setItems(response.data.data);
        } catch (err) {
            console.error('Error fetching popular today:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        let itemUrl = item.url;
        if (!itemUrl) return;
        itemUrl = itemUrl.replace(/\/+$/, '');
        if (itemUrl.includes('-episode-')) {
            itemUrl = itemUrl.split('-episode-')[0];
        }
        navigate(`/detail/donghua/${encodeURIComponent(itemUrl)}`);
    };

    if (loading) {
        return (
            <section className="px-4 py-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-5 bg-dark-card rounded-full animate-pulse" />
                        <div className="w-32 h-5 bg-dark-card rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-none w-32">
                            <div className="aspect-[3/4] rounded-lg bg-dark-card animate-pulse mb-1.5" />
                            <div className="h-3 w-3/4 bg-dark-card rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!items.length) return null;

    return (
        <section className="px-4 py-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/20">
                        Popular
                    </span>
                    <h2 className="text-sm font-semibold text-white">Trending Donghua</h2>
                </div>
                <button className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-primary-400 transition-colors">
                    See All <ChevronRight size={13} />
                </button>
            </div>

            {/* Horizontal Scroll */}
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                {items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleItemClick(item)}
                        className="group flex-none w-32 cursor-pointer anime-card"
                    >
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-dark-card">
                            <img
                                src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0, 8))}&background=1a1a1a&color=555&size=300`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0, 8))}&background=1a1a1a&color=555&size=300`;
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Rank badge */}
                            <div className="absolute top-1.5 left-1.5">
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-500/80 text-white text-[9px] font-bold rounded">
                                    <Flame size={8} /> #{index + 1}
                                </span>
                            </div>

                            {/* Episode */}
                            {item.episode && (
                                <div className="absolute bottom-1.5 left-1.5">
                                    <span className="px-1.5 py-0.5 bg-black/80 text-orange-300 text-[9px] font-semibold rounded">
                                        {item.episode}
                                    </span>
                                </div>
                            )}

                            {/* Play hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="w-9 h-9 bg-orange-400/90 rounded-full flex items-center justify-center">
                                    <Play size={16} className="text-black ml-0.5" fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xs font-medium text-gray-300 line-clamp-2 group-hover:text-white transition-colors leading-tight">
                            {item.title}
                        </h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PopularTodaySection;

  
