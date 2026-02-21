// pages/explorer/PopularPage.jsx
import { useState, useEffect } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const PopularPage = ({ onAnimeSelect }) => {
    const [anime, setAnime] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch popular anime (using latest as placeholder, replace with actual endpoint)
        const fetchPopular = async () => {
            try {
                const res = await axios.get(`${API_BASE}/latest`);
                // Sort by some popularity metric or just shuffle for now
                const sorted = (Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : []).sort(() => 0.5 - Math.random());
                setAnime(sorted);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopular();
    }, []);

    return (
        <div className="p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Flame size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Popular Now</h2>
                    <p className="text-xs text-gray-500">Most watched this week</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-[7px] skeleton" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {anime.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => onAnimeSelect(item)}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[3/4] rounded-[7px] overflow-hidden mb-2 bg-dark-card">
                                <img
                                    src={item.image || `https://via.placeholder.com/300x400/1a1a1a/ffaf2f?text=${index + 1}`}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Rank Badge */}
                                <div className="absolute top-2 left-2 w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-sm font-bold text-black">#{index + 1}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-xs font-medium text-white">Click to view</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{item.source === 'samehadaku' ? 'Anime' : 'Donghua'}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span className="text-xs text-primary-400">Hot</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PopularPage;
                    
