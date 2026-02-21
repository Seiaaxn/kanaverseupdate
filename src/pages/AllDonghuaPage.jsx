// src/pages/AllDonghuaPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

// Bersihkan URL episode → URL halaman utama donghua
const cleanDonghuaUrl = (url) => {
  if (!url) return url;
  let clean = url.replace(/\/+$/, '');
  if (clean.includes('-episode-')) clean = clean.split('-episode-')[0];
  return clean + '/';
};

const cleanDonghuaTitle = (title) => {
  if (!title) return title;
  return title.replace(/\s+Episode\s+\d+.*$/i, '').trim();
};

const AllDonghuaPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDonghua = useCallback(async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);

      let rawList = [];
      // Coba beberapa endpoint
      const endpoints = [
        `${API_BASE}/donghua/latest-release?page=${pageNum}`,
        `${API_BASE}/donghua/latest?page=${pageNum}`,
      ];
      for (const url of endpoints) {
        try {
          const res = await axios.get(url);
          const raw = res.data;
          const data = Array.isArray(raw) ? raw
            : Array.isArray(raw?.data) ? raw.data
            : Array.isArray(raw?.donghua) ? raw.donghua
            : [];
          if (data.length > 0) { rawList = data; break; }
        } catch {}
      }

      // Bersihkan URL & title, tandai sebagai donghua
      const list = rawList
        .map(item => ({
          ...item,
          title: cleanDonghuaTitle(item.title),
          url: cleanDonghuaUrl(item.url),
          _category: 'donghua',
        }))
        .filter((item, i, arr) => arr.findIndex(x => x.url === item.url) === i);

      if (pageNum === 1) setItems(list); else setItems(prev => [...prev, ...list]);
      setHasMore(list.length >= 12);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchDonghua(1); }, []);

  const handleLoadMore = () => { const n = page + 1; setPage(n); fetchDonghua(n); };

  // Klik donghua → /detail/donghua/...
  const handleClick = (item) => {
    const url = item.url || item.link;
    if (!url) return;
    navigate(`/detail/donghua/${encodeURIComponent(url.replace(/\/+$/, ''))}`);
  };

  const filtered = search
    ? items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      <header className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur border-b border-dark-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-dark-card flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-base font-bold text-white flex-1">All Donghua</h1>
      </header>
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donghua..."
            className="w-full pl-9 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-sm text-white outline-none placeholder-gray-600" />
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-3 gap-2.5 px-4">
          {[...Array(18)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] rounded-lg bg-dark-card animate-pulse mb-2" />
              <div className="h-3 w-3/4 bg-dark-card rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 px-4">
            {filtered.map((item, i) => (
              <div key={i} onClick={() => handleClick(item)} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-dark-card">
                  <img
                    src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0, 4) || 'D')}&background=1a1a1a&color=555&size=300`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0, 4) || 'D')}&background=1a1a1a&color=555&size=300`; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-500/80 text-white">DONGHUA</span>
                  </div>
                  {item.episode && (
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 bg-black/80 text-red-300 text-[9px] font-semibold rounded">EP {item.episode}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 bg-red-500/90 rounded-full flex items-center justify-center">
                      <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xs font-medium text-gray-300 line-clamp-2 group-hover:text-white transition-colors leading-tight">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
          {hasMore && !search && (
            <div className="flex justify-center mt-6 px-4">
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-card border border-dark-border text-sm text-white hover:border-red-400/50 transition-all disabled:opacity-50">
                {loadingMore ? <><Loader2 size={15} className="animate-spin" />Loading...</> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllDonghuaPage;
              
