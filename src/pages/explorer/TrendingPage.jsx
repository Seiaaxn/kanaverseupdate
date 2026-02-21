// pages/explorer/TrendingPage.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const TrendingPage = ({ onAnimeSelect }) => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Using shuffle endpoint for trending effect
                const res = await axios.get(`${API_BASE}/latest/shuffle`);
                setTrending(Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    return (
        <div className="p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Trending</h2>
                    <p className="text-xs text-gray-500">Rising in popularity</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-dark-surface rounded-xl border border-dark-border">
                            <div className="w-24 h-32 rounded-lg skeleton shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-3/4 rounded skeleton" />
                                <div className="h-4 w-1/2 rounded skeleton" />
                                <div className="h-3 w-1/3 rounded skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {trending.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => onAnimeSelect(item)}
                            className="group flex gap-3 p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-primary-400/50 transition-all cursor-pointer"
                        >
                            {/* Rank */}
                            <div className="flex flex-col items-center justify-center w-12 shrink-0">
                                <span className="text-2xl font-bold text-gray-600 group-hover:text-primary-400 transition-colors">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                                    <ArrowUpRight size={12} />
                                    <span>+{Math.floor(Math.random() * 50) + 10}%</span>
                                </div>
                            </div>

                            {/* Thumbnail */}
                            <div className="relative w-24 h-32 sm:w-32 sm:h-40 rounded-lg overflow-hidden shrink-0 bg-dark-card">
                                <img
                                    src={item.image || `https://via.placeholder.com/150x200/1a1a1a/ffaf2f?text=${index + 1}`}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2 group-hover:text-primary-300 transition-colors mb-2">
                                    {item.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-3">
                                    <span className={`px-2 py-0.5 rounded ${item.source === 'samehadaku' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {item.source === 'samehadaku' ? 'Anime' : 'Donghua'}
                                    </span>
                                    <span>{item.type || 'TV'}</span>
                                    {item.episode && <span>EP {item.episode}</span>}
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2">
                                    Click to watch now and see why it's trending!
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrendingPage;

