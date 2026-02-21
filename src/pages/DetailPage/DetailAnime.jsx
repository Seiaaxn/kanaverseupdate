import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetailData } from '../../hooks/useDetailData';
import { addToUserHistory, toggleUserBookmark, isBookmarked, addXP } from '../../utils/userSystem';
import { ChevronLeft, Bookmark, Share2, Play, Clock, Tv, Calendar } from 'lucide-react';
import AnimeEpisodesTab from '../../components/detailPage/anime/AnimeEpisodesTab';

const DetailAnime = () => {
    const navigate = useNavigate();
    const { detail, loading, error } = useDetailData();
    const [activeTab, setActiveTab] = useState('episodes');
    const [bookmarked, setBookmarked] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        if (detail?.url) setBookmarked(isBookmarked(detail.url));
    }, [detail]);

    const handleWatch = (episode) => {
        if (!detail || !episode) return;
        addToUserHistory({ title: detail.title, image: detail.image, url: detail.url || window.location.href, category: 'anime' },
            { title: episode.title, url: episode.url, episode: episode.number || episode.episode });
        // XP for watching
        const result = addXP(50, 'Episode ditonton');
        if (result) {
            const toast = document.createElement('div');
            toast.className = 'xp-toast';
            toast.textContent = `⚡ +50 XP${result.leveledUp ? ` 🎉 Level ${result.newLevel}!` : ''}`;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
        }
        navigate(`/anime/watch?url=${encodeURIComponent(episode.url)}`);
    };

    const handleBookmark = () => {
        if (!detail) return;
        const now = toggleUserBookmark({ title: detail.title, image: detail.image, url: detail.url, category: 'anime' });
        setBookmarked(now);
    };

    const handleShare = () => { if (navigator.share) navigator.share({ title: detail?.title, url: window.location.href }); };

    if (loading) return (
        <div className="min-h-screen animate-pulse" style={{ background: 'var(--bg)' }}>
            <div className="h-72" style={{ background: 'var(--card)' }} />
            <div className="px-4 pt-4 space-y-3">
                <div className="h-7 rounded-2xl w-3/4" style={{ background: 'var(--card)' }} />
                <div className="h-4 rounded-2xl w-1/2" style={{ background: 'var(--card)' }} />
                <div className="h-12 rounded-2xl mt-4" style={{ background: 'var(--card)' }} />
            </div>
        </div>
    );

    if (error || !detail) return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
            <div className="text-5xl mb-4">😢</div>
            <h2 className="text-lg font-bold text-white mb-2">Gagal memuat</h2>
            <p className="text-sm mb-6 text-center" style={{ color: 'var(--muted)' }}>{error || 'Anime tidak ditemukan'}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)' }}>Kembali</button>
        </div>
    );

    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(detail.title)}&background=12121f&color=7c6dfa&size=600`;
    const firstEp = detail.episodes?.[0];

    return (
        <div className="min-h-screen pb-8" style={{ background: 'var(--bg)' }}>
            {/* Fixed header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 h-14" style={{ maxWidth: '480px', margin: '0 auto', background: 'linear-gradient(to bottom, rgba(7,7,17,0.95), transparent)' }}>
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ChevronLeft size={20} className="text-white" />
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handleBookmark} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Bookmark size={16} style={{ fill: bookmarked ? '#7c6dfa' : 'transparent', color: bookmarked ? '#7c6dfa' : 'white' }} />
                    </button>
                    <button onClick={handleShare} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Share2 size={16} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Hero */}
            <div className="relative h-72 overflow-hidden">
                <img src={detail.image || fallback} alt={detail.title}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)} onError={e => { e.target.src = fallback; setImgLoaded(true); }} />
                {!imgLoaded && <div className="absolute inset-0 animate-pulse" style={{ background: 'var(--surface)' }} />}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(7,7,17,0.3) 0%, transparent 40%, rgba(7,7,17,0.85) 75%, #070711 100%)' }} />
                <div className="absolute top-16 left-4">
                    <span className="px-2.5 py-1 text-xs font-black rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #7c6dfa, #b06dfa)' }}>ANIME</span>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 -mt-8 relative z-10">
                <div className="flex gap-3 mb-4">
                    <div className="w-20 flex-shrink-0 -mt-12">
                        <div className="w-20 h-28 rounded-2xl overflow-hidden shadow-2xl" style={{ border: '2px solid rgba(124,109,250,0.3)' }}>
                            <img src={detail.image || fallback} alt={detail.title} className="w-full h-full object-cover" onError={e => { e.target.src = fallback; }} />
                        </div>
                    </div>
                    <div className="flex-1 pt-1 min-w-0">
                        <h1 className="text-lg font-black text-white leading-tight mb-1 line-clamp-2">{detail.title}</h1>
                        {detail.altTitles?.length > 0 && <p className="text-xs line-clamp-1" style={{ color: 'var(--muted)' }}>{detail.altTitles[0]}</p>}
                        {detail.genres?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {detail.genres.slice(0, 3).map((g, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold rounded-lg" style={{ background: 'rgba(124,109,250,0.15)', color: '#7c6dfa' }}>{g}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* XP Info */}
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-2xl" style={{ background: 'rgba(124,109,250,0.1)', border: '1px solid rgba(124,109,250,0.2)' }}>
                    <span className="text-sm">⚡</span>
                    <p className="text-xs font-bold" style={{ color: '#7c6dfa' }}>+50 XP per episode yang ditonton!</p>
                </div>

                {/* Stats */}
                <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
                    {[detail.status && { icon: <div className="w-1.5 h-1.5 rounded-full" style={{ background: detail.status.toLowerCase().includes('ongoing') ? '#6dfabc' : '#888' }} />, label: detail.status, color: '#6dfabc' },
                      detail.type && { icon: <Tv size={11} />, label: detail.type, color: '#6daefa' },
                      detail.totalEpisodes && { icon: <Clock size={11} />, label: `${detail.totalEpisodes} Ep`, color: '#b06dfa' },
                      detail.released && { icon: <Calendar size={11} />, label: detail.released, color: '#fac96d' },
                    ].filter(Boolean).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: s.color }}>
                            {s.icon}<span className="text-xs font-bold text-white">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Watch Button */}
                <button onClick={() => firstEp && handleWatch(firstEp)}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm text-white mb-5 active:scale-98 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c6dfa, #b06dfa)', boxShadow: '0 8px 24px rgba(124,109,250,0.35)' }}>
                    <Play size={18} fill="currentColor" /> Tonton Sekarang
                </button>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    {[['episodes', `Episode (${detail.episodes?.length || 0})`], ['details', 'Detail']].map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all"
                            style={activeTab === tab ? { background: 'linear-gradient(135deg, #7c6dfa, #b06dfa)', color: 'white' } : { color: 'var(--muted)' }}>
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'episodes' && <AnimeEpisodesTab episodes={detail.episodes} onEpisodeSelect={handleWatch} />}

                {activeTab === 'details' && (
                    <div className="space-y-4">
                        {detail.description && (
                            <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Sinopsis</p>
                                <p className="text-sm leading-relaxed" style={{ color: '#c8c8d8' }}>{detail.description}</p>
                            </div>
                        )}
                        <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Informasi</p>
                            <div className="space-y-2.5">
                                {[['Status', detail.status], ['Tipe', detail.type], ['Total Episode', detail.totalEpisodes], ['Rilis', detail.released]].filter(([, v]) => v).map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
                                        <span className="text-xs font-bold text-white">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {detail.genres?.length > 0 && (
                            <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Genre</p>
                                <div className="flex flex-wrap gap-2">
                                    {detail.genres.map((g, i) => (
                                        <span key={i} className="px-3 py-1.5 text-xs font-bold rounded-xl" style={{ background: 'rgba(124,109,250,0.15)', color: '#7c6dfa', border: '1px solid rgba(124,109,250,0.2)' }}>{g}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailAnime;
                
