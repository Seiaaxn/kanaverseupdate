// src/components/home/AnimeMovie.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Star, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 menit

const AnimeMovieSection = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnimeMovies = useCallback(async () => {
    try {
      setLoading(true);
      // Coba endpoint satu per satu sampai dapat data
      const endpoints = [
        `${API_BASE}/anime-movie`,
        `${API_BASE}/anime/movies`,
        `${API_BASE}/anime/genre/movie?page=1`,
      ];
      let list = [];
      for (const url of endpoints) {
        try {
          const res = await axios.get(url);
          const raw = res.data;
          const data = raw?.success
            ? raw.data
            : Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.anime)
            ? raw.anime
            : [];
          if (Array.isArray(data) && data.length > 0) {
            list = data;
            break;
          }
        } catch {}
      }
      if (list.length > 0) {
        setMovies(list);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('AnimeMovie fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimeMovies();
    // Auto-refresh setiap 5 menit
    const interval = setInterval(fetchAnimeMovies, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAnimeMovies]);

  const handleMovieClick = (movie) => {
    const url = movie.url || movie.link;
    if (!url) return;
    navigate(`/detail/anime/${encodeURIComponent(url.replace(/\/+$/, ''))}`);
  };

  if (loading) {
    return (
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-5 bg-dark-card rounded-full animate-pulse" />
            <div className="w-28 h-5 bg-dark-card rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] rounded-lg bg-dark-card animate-pulse mb-1.5" />
              <div className="h-3 w-3/4 bg-dark-card rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!movies.length) return null;

  return (
    <section className="px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
            Movie
          </span>
          <h2 className="text-sm font-semibold text-white">Anime Movies</h2>
          {lastUpdated && (
            <span className="text-[9px] text-gray-600">
              {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnimeMovies}
            className="p-1 text-gray-600 hover:text-gray-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={() => navigate('/all-movies')}
            className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-primary-400 transition-colors"
          >
            See All <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {movies.slice(0, 9).map((movie, index) => (
          <div
            key={index}
            onClick={() => handleMovieClick(movie)}
            className="group cursor-pointer anime-card"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-dark-card">
              <img
                src={movie.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title?.slice(0, 8) || 'M')}&background=1a1a1a&color=555&size=300`}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title?.slice(0, 8) || 'M')}&background=1a1a1a&color=555&size=300`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-1.5 left-1.5">
                <span className="px-1.5 py-0.5 bg-purple-500/80 text-white text-[9px] font-bold rounded">Movie</span>
              </div>
              {movie.score && movie.score !== 'N/A' && (
                <div className="absolute bottom-1.5 left-1.5">
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/80 text-yellow-400 text-[9px] font-semibold rounded">
                    <Star size={8} fill="currentColor" /> {movie.score}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-9 h-9 bg-primary-400/90 rounded-full flex items-center justify-center">
                  <Play size={16} className="text-black ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-300 line-clamp-2 group-hover:text-white transition-colors leading-tight">
              {movie.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnimeMovieSection;
    
