// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    X,
    Loader2,
    Film,
    Tv,
    Star,
    Calendar,
    ChevronLeft
} from 'lucide-react';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const SearchPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Ambil query dari URL parameter
    const searchParams = new URLSearchParams(location.search);
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchType, setSearchType] = useState('anime'); // 'anime' atau 'donghua'
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

    // Debounce query untuk menghindari terlalu banyak request
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Fetch hasil pencarian
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const endpoint = searchType === 'anime'
                    ? `${API_BASE}/anime/search?q=${encodeURIComponent(debouncedQuery)}`
                    : `${API_BASE}/donghua/search?q=${encodeURIComponent(debouncedQuery)}`;

                console.log('Fetching:', endpoint); // Debug
                const response = await axios.get(endpoint);
                console.log('Response:', response.data); // Debug

                // Handle response (bisa array langsung atau object dengan data property)
                let data = [];
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                }

                // Filter out items without title
                data = data.filter(item => item.title && item.title.trim() !== '');

                setResults(data);

                if (data.length === 0) {
                    setError('No results found');
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error('Search error:', err);
                setError(err.response?.data?.error || 'Failed to search. Please try again.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [debouncedQuery, searchType]);

    // Update URL saat query berubah
    useEffect(() => {
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
        } else {
            navigate('/search', { replace: true });
        }
    }, [query, navigate]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Debounce sudah handle, jadi tidak perlu apa-apa
    };

    const handleItemClick = (item) => {
        // Navigasi ke halaman detail berdasarkan source
        const category = item.source === 'samehadaku' || item.source === 'anime' ? 'anime' : 'donghua';
        const encodedUrl = encodeURIComponent(item.url);
        navigate(`/detail/${category}/${encodedUrl}`);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
    };

    // Format title untuk fallback image
    const getInitials = (title) => {
        if (!title) return 'N/A';
        return title.slice(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-dark-bg pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-dark-surface/95 backdrop-blur-sm border-b border-dark-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center h-16 gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-400" />
                        </button>

                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search anime or donghua..."
                                className="w-full h-10 pl-10 pr-10 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
                                autoFocus
                            />
                            <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
                            {query && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Filter Tabs */}
                {query && (
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => setSearchType('anime')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === 'anime'
                                    ? 'bg-primary-400 text-black'
                                    : 'bg-dark-surface text-gray-400 hover:text-white border border-dark-border'
                                }`}
                        >
                            <Tv size={16} />
                            <span>Anime</span>
                        </button>
                        <button
                            onClick={() => setSearchType('donghua')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === 'donghua'
                                    ? 'bg-primary-400 text-black'
                                    : 'bg-dark-surface text-gray-400 hover:text-white border border-dark-border'
                                }`}
                        >
                            <Film size={16} />
                            <span>Donghua</span>
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={40} className="text-primary-400 animate-spin mb-4" />
                        <p className="text-gray-400">Searching for "{query}"...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">😕</div>
                        <p className="text-gray-400 mb-2">{error}</p>
                        <p className="text-sm text-gray-500">Try again with different keywords</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && query && results.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                        <p className="text-gray-500">Try different keywords or check your spelling</p>
                    </div>
                )}

                {/* Results Grid */}
                {!loading && results.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">
                                Search Results ({results.length})
                            </h2>
                            <p className="text-sm text-gray-500">
                                Found for "{query}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {results.map((item, index) => (
                                <div
                                    key={`${item.url}-${index}`}
                                    onClick={() => handleItemClick(item)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-dark-card">
                                        <img
                                            src={item.image || `https://ui-avatars.com/api/?name=${getInitials(item.title)}&background=333&color=fff&size=400`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${getInitials(item.title)}&background=333&color=fff&size=400`;
                                            }}
                                        />

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Source Badge (top left) */}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded ${item.source === 'samehadaku' || item.source === 'anime'
                                                    ? 'bg-blue-500/80'
                                                    : 'bg-red-500/80'
                                                } text-white`}>
                                                {item.source === 'samehadaku' || item.source === 'anime' ? 'Anime' : 'Donghua'}
                                            </span>
                                        </div>

                                        {/* Hover Play Button */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                {searchType === 'anime' ? (
                                                    <Tv size={20} className="text-black" />
                                                ) : (
                                                    <Film size={20} className="text-black" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
                                        {item.title}
                                    </h3>

                                    {/* URL info (optional - bisa dihapus) */}
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {item.url ? new URL(item.url).pathname.split('/').pop() : 'Detail'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
