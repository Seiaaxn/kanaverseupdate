// pages/explorer/GenrePage.jsx - with Anime/Donghua genre separation
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, Star } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const ANIME_GENRES = [
  {name:'Fantasy',value:'fantasy'},{name:'Action',value:'action'},{name:'Adventure',value:'adventure'},
  {name:'Comedy',value:'comedy'},{name:'Shounen',value:'shounen'},{name:'School',value:'school'},
  {name:'Romance',value:'romance'},{name:'Drama',value:'drama'},{name:'Supernatural',value:'supernatural'},
  {name:'Isekai',value:'isekai'},{name:'Sci-Fi',value:'sci-fi'},{name:'Seinen',value:'seinen'},
  {name:'Reincarnation',value:'reincarnation'},{name:'Super Power',value:'super-power'},
  {name:'Historical',value:'historical'},{name:'Mystery',value:'mystery'},{name:'Harem',value:'harem'},
  {name:'Slice of Life',value:'slice-of-life'},{name:'Sports',value:'sports'},{name:'Ecchi',value:'ecchi'},
  {name:'Mecha',value:'mecha'},{name:'Psychological',value:'psychological'},{name:'Thriller',value:'thriller'},
  {name:'Military',value:'military'},{name:'Josei',value:'josei'},{name:'Shoujo',value:'shoujo'},
  {name:'Demons',value:'demons'},{name:'Magic',value:'magic'},{name:'Horror',value:'horror'},
  {name:'Game',value:'game'},{name:'Music',value:'music'},{name:'Vampire',value:'vampire'},
];

const DONGHUA_GENRES = [
  {name:'Action',value:'action'},{name:'Fantasy',value:'fantasy'},{name:'Adventure',value:'adventure'},
  {name:'Romance',value:'romance'},{name:'Martial Arts',value:'martial-arts'},{name:'Comedy',value:'comedy'},
  {name:'Cultivation',value:'cultivation'},{name:'Historical',value:'historical'},
  {name:'School',value:'school'},{name:'Drama',value:'drama'},{name:'Isekai',value:'isekai'},
  {name:'Supernatural',value:'supernatural'},{name:'Slice of Life',value:'slice-of-life'},
  {name:'Horror',value:'horror'},{name:'Sci-Fi',value:'sci-fi'},{name:'Demons',value:'demons'},
];

const GenrePage = () => {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState('anime'); // 'anime' | 'donghua'
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const genres = contentType === 'anime' ? ANIME_GENRES : DONGHUA_GENRES;

  const fetchByGenre = async (genre, pageNum = 1, reset = true) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      const endpoint = contentType === 'anime'
        ? `${API_BASE}/anime/genre/${genre.value}?page=${pageNum}`
        : `${API_BASE}/donghua/genre/${genre.value}?page=${pageNum}`;
      const res = await axios.get(endpoint);
      const raw = res.data;
      const arr = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.anime) ? raw.anime
        : Array.isArray(raw?.results) ? raw.results
        : [];
      if (reset) setAnimeList(arr); else setAnimeList(prev=>[...prev,...arr]);
      setHasMore(arr.length >= 12);
    } catch(e) {
      console.error(e);
      if (pageNum===1) setAnimeList([]);
      setHasMore(false);
    } finally { setLoading(false); setLoadingMore(false); }
  };

  const fetchAll = async (pageNum=1) => {
    try {
      if (pageNum===1) setLoading(true); else setLoadingMore(true);
      const endpoint = contentType==='anime'
        ? `${API_BASE}/anime/latest?page=${pageNum}`
        : `${API_BASE}/donghua/latest?page=${pageNum}`;
      const res = await axios.get(endpoint);
      const raw2 = res.data;
      const arr = Array.isArray(raw2) ? raw2
        : Array.isArray(raw2?.data) ? raw2.data
        : Array.isArray(raw2?.anime) ? raw2.anime
        : Array.isArray(raw2?.results) ? raw2.results
        : [];
      if (pageNum===1) setAnimeList(arr); else setAnimeList(prev=>[...prev,...arr]);
      setHasMore(arr.length >= 12);
    } catch { setAnimeList([]); setHasMore(false); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(()=>{
    setAnimeList([]); setPage(1); setHasMore(true); setSelectedGenre(null);
    fetchAll(1);
  },[contentType]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre); setPage(1);
    fetchByGenre(genre, 1, true);
  };

  const handleLoadMore = () => {
    const n = page+1; setPage(n);
    if (selectedGenre) fetchByGenre(selectedGenre, n, false);
    else fetchAll(n);
  };

  const handleItemClick = (item) => {
    const url = item.url||item.link; if(!url) return;
    navigate(`/detail/${contentType}/${encodeURIComponent(url.replace(/\/+$/,''))}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Type Toggle */}
      <div className="sticky top-0 z-30 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border">
        <div className="px-4 py-3">
          <div className="flex gap-2 mb-3">
            <button onClick={()=>setContentType('anime')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${contentType==='anime'?'bg-blue-500 text-white':'bg-dark-surface text-gray-400 border border-dark-border'}`}>
              🎌 Anime
            </button>
            <button onClick={()=>setContentType('donghua')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${contentType==='donghua'?'bg-red-500 text-white':'bg-dark-surface text-gray-400 border border-dark-border'}`}>
              🐉 Donghua
            </button>
          </div>

          {/* Genre pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button onClick={()=>{setSelectedGenre(null);setPage(1);fetchAll(1);}}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedGenre?'bg-primary-400 text-black':'bg-dark-surface text-gray-400 border border-dark-border'}`}>
              All
            </button>
            {genres.map(g=>(
              <button key={g.value} onClick={()=>handleGenreSelect(g)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${selectedGenre?.value===g.value?'bg-primary-400 text-black':'bg-dark-surface text-gray-400 border border-dark-border hover:border-primary-400/50'}`}>
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            {selectedGenre?`${selectedGenre.name} ${contentType==='anime'?'Anime':'Donghua'}`:`All ${contentType==='anime'?'Anime':'Donghua'}`}
          </h2>
          {animeList.length>0&&<span className="text-xs text-gray-500">{animeList.length}+ results</span>}
        </div>
      </div>

      <div className="p-4 pt-3">
        {loading && page===1 ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(18)].map((_,i)=>(
              <div key={i}><div className="aspect-[3/4] rounded-lg bg-dark-card animate-pulse mb-2"/><div className="h-3 w-3/4 bg-dark-card rounded animate-pulse"/></div>
            ))}
          </div>
        ) : animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {animeList.map((item,i)=>(
                <div key={i} onClick={()=>handleItemClick(item)} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-dark-card">
                    <img src={item.image||`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0,4)||'?')}&background=1a1a1a&color=555&size=300`}
                      alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy"
                      onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0,4)||'?')}&background=1a1a1a&color=555&size=300`;}}/>
                    {item.score&&item.score!=='N/A'&&(
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded">
                        <Star size={8} className="text-yellow-400 fill-yellow-400"/><span className="text-[10px] text-white">{item.score}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${contentType==='anime'?'bg-blue-500/90':'bg-red-500/90'}`}>
                        <Play size={16} className="text-white ml-0.5" fill="currentColor"/>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xs font-medium text-gray-300 line-clamp-2 group-hover:text-white transition-colors leading-tight">{item.title}</h3>
                  {item.status&&<p className="text-[10px] text-gray-600 mt-0.5">{item.status}</p>}
                </div>
              ))}
            </div>
            {hasMore&&(
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="w-full mt-5 py-3 rounded-xl bg-dark-surface border border-dark-border text-sm text-gray-400 hover:text-white hover:border-primary-400/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loadingMore?<><Loader2 size={15} className="animate-spin"/>Loading...</>:'Load More'}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found</p>
            <button onClick={()=>{setSelectedGenre(null);fetchAll(1);}} className="text-primary-400 text-sm mt-2">Show all</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;

      
