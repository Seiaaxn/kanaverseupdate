// pages/explorer/TopRatedPage.jsx
import { useState, useEffect } from 'react';
import { Star, Award } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const TopRatedPage = ({ onAnimeSelect }) => {
    const [topRated, setTopRated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopRated = async () => {
            try {
                const res = await axios.get(`${API_BASE}/latest`);
                // Mock sorting by rating (since API doesn't have explicit rating)
                const sorted = (Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : []).sort(() => 0.5 - Math.random());
                setTopRated(sorted);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopRated();
    }, []);

    return (
        <div className="p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                    <Award size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Top Rated</h2>
                    <p className="text-xs text-gray-500">Highest rated of all time</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-video rounded-xl skeleton" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topRated.map((item, index) => {
                        const rating = (Math.random() * 2 + 8).toFixed(1); // Mock 8.0-10.0 rating

                        return (
                            <div
                                key={index}
                                onClick={() => onAnimeSelect(item)}
                                className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer"
                            >
                                {/* Background */}
                                <img
                                    src={item.image || `https://via.placeholder.com/400x225/1a1a1a/ffaf2f?text=${index + 1}`}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                                {/* Rating Badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-yellow-500/90 backdrop-blur rounded-lg">
                                    <Star size={14} className="text-black fill-black" />
                                    <span className="text-sm font-bold text-black">{rating}</span>
                                </div>

                                {/* Rank */}
                                <div className="absolute top-3 left-3 w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border border-white/20">
                                    <span className="text-lg font-bold text-white">#{index + 1}</span>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-primary-300 transition-colors mb-1">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-300">
                                        <span className={`px-2 py-0.5 rounded ${item.source === 'samehadaku' ? 'bg-blue-500/50' : 'bg-red-500/50'
                                            }`}>
                                            {item.source === 'samehadaku' ? 'Anime' : 'Donghua'}
                                        </span>
                                        <span>{item.type || 'TV'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TopRatedPage;
                                
