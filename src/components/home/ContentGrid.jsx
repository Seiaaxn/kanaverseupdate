// src/components/home/ContentGrid.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Film, Tv, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const categories = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'anime', label: 'Anime', icon: Tv },
    { id: 'donghua', label: 'Donghua', icon: Film },
];

const ContentGrid = ({
    items = [],
    loading = false,
    onItemClick,
    activeCategory,
    onCategoryChange,
    limit = 12
}) => {
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState([]);
    const [allLoading, setAllLoading] = useState(false);
    const [allFetched, setAllFetched] = useState(false);
    const fetchInProgress = useRef(false);

    // Fetch data untuk category "all" - hanya SEKALI saat komponen mount
    useEffect(() => {
        if (!allFetched && !fetchInProgress.current) {
            fetchAllItems();
        }
    }, []); // Empty dependency array = sekali saat mount

    const fetchAllItems = async () => {
        if (fetchInProgress.current) return;

        try {
            fetchInProgress.current = true;
            setAllLoading(true);

            const response = await axios.get('https://anime-api-iota-beryl.vercel.app/api/latest/shuffle');

            if (response.data.success) {
                // Bersihkan URL untuk item dari anichin (donghua)
                const cleanedData = response.data.data.map(item => {
                    if (item.source === 'anichin' && item.url) {
                        let cleanUrl = item.url.replace(/\/+$/, '');
                        const urlParts = cleanUrl.split('/');
                        let lastSlug = urlParts[urlParts.length - 1];
                        const cleanSlug = lastSlug.replace(/-episode-\d+(-subtitle-indonesia)?/g, '');
                        urlParts[urlParts.length - 1] = cleanSlug;
                        cleanUrl = urlParts.join('/');

                        return {
                            ...item,
                            originalUrl: item.url,
                            url: cleanUrl
                        };
                    }
                    return item;
                });

                setAllItems(cleanedData);
                setAllFetched(true);
            }
        } catch (err) {
            console.error('Error fetching all items:', err);
        } finally {
            setAllLoading(false);
            fetchInProgress.current = false;
        }
    };

    // Helper untuk mendapatkan info episode dengan aman
    const getEpisodeInfo = (item) => {
        if (item.episode) return item.episode;
        if (item.info) {
            if (typeof item.info === 'string' && item.info.startsWith('Ep ')) {
                return item.info.replace('Ep ', '');
            }
            return item.info;
        }
        if (item.info?.episode) return item.info.episode;
        if (item.latest_episode) return item.latest_episode;
        return null;
    };

    // Helper untuk mendapatkan tipe konten
    const getContentType = (item) => {
        if (item.type) return item.type;
        if (item.info?.type) return item.info.type;
        return item.source === 'samehadaku' ? 'Anime' : 'Donghua';
    };

    // Helper untuk mendapatkan status
    const getStatus = (item) => {
        if (item.status) return item.status;
        if (item.info?.status) return item.info.status;
        return null;
    };

    // Tentukan items yang akan ditampilkan berdasarkan kategori aktif
    const getDisplayItems = () => {
        if (activeCategory === 'all') {
            return allItems.slice(0, limit);
        }
        // Untuk anime/donghua, gunakan props items dari parent
        return items.slice(0, limit);
    };

    // Tentukan loading state berdasarkan kategori
    const isLoading = activeCategory === 'all' ? allLoading : loading;

    const displayItems = getDisplayItems();

    // Jika tidak ada items dan sedang tidak loading, tampilkan pesan
    const showEmptyState = !isLoading && displayItems.length === 0;

    if (isLoading) {
        return (
            <section className="px-4 mt-4 pb-6">
                {/* Tabs skeleton */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {categories.map((_, index) => (
                            <div key={index} className="w-16 h-6 bg-dark-card rounded animate-pulse" />
                        ))}
                    </div>
                    <div className="w-20 h-5 bg-dark-card rounded animate-pulse" />
                </div>

                {/* Grid skeleton */}
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-[3/4] rounded-[7px] bg-dark-card animate-pulse" />
                            <div className="h-4 w-3/4 bg-dark-card rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-dark-card rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (showEmptyState) {
        return (
            <section className="px-4 mt-4 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => onCategoryChange(cat.id)}
                                    className={`flex items-center gap-2 text-base font-medium transition-colors ${isActive
                                            ? 'text-primary-400 border-b-2 border-primary-400 pb-1'
                                            : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => navigate('/explore')}
                        className="flex items-center space-x-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
                    >
                        <span>See All</span>
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="text-center py-12 text-gray-500">
                    <p>No content found for {activeCategory}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 mt-4 pb-6">
            {/* Tabs dan See All button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`flex items-center text-base font-medium transition-colors ${isActive
                                        ? 'text-primary-400 border-b-2 border-primary-400 pb-1'
                                        : 'text-white hover:text-gray-300'
                                    }`}
                            >
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}

                </div>
                <button
                    onClick={() => navigate('/explore')}
                    className="text-xs text-primary-400 flex items-center space-x-1"
                >
                    <span>See All</span>
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Grid konten */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {displayItems.map((item, index) => {
                    const episodeInfo = getEpisodeInfo(item);
                    const contentType = getContentType(item);
                    const status = getStatus(item);
                    const source = item.source === 'samehadaku' ? 'SD' : 'AN';

                    return (
                        <div
                            key={index}
                            onClick={() => onItemClick(item)}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[3/4] rounded-[7px] overflow-hidden mb-2 bg-dark-card">
                                <img
                                    src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0, 10))}&background=333&color=fff&size=400`}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0, 10))}&background=333&color=fff&size=400`;
                                    }}
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                {/* Type Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${contentType === 'Anime'
                                            ? 'bg-blue-500/80 text-white'
                                            : 'bg-red-500/80 text-white'
                                        }`}>
                                        {contentType}
                                    </span>
                                </div>

                                {/* Source Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className="px-2 py-1 bg-black/80 backdrop-blur text-gray-300 text-[10px] font-bold rounded border border-gray-600">
                                        {source}
                                    </span>
                                </div>

                                {/* Status Badge (if exists) */}
                                {status && activeCategory !== 'all' && (
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded ${status === 'Ongoing'
                                                ? 'bg-green-500/80 text-white'
                                                : status === 'Completed'
                                                    ? 'bg-gray-500/80 text-white'
                                                    : 'bg-yellow-500/80 text-white'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>
                                )}

                                {/* Episode Badge */}
                                {episodeInfo && (
                                    <div className="absolute bottom-2 left-2 z-10">
                                        <span className="px-2 py-1 bg-black/80 backdrop-blur text-primary-300 text-[10px] font-bold rounded border border-primary-400/30">
                                            EP {episodeInfo}
                                        </span>
                                    </div>
                                )}

                                {/* Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                    <button className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                        <Play size={24} className="text-black ml-1" fill="currentColor" />
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
                                {item.title}
                            </h3>

                            {/* Additional Info */}
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                {episodeInfo && (
                                    <span>EP {episodeInfo}</span>
                                )}
                                {item.score && (
                                    <span className="flex items-center gap-1">
                                        <span className="text-yellow-400">★</span>
                                        {item.score}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ContentGrid;