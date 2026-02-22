import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { addXP, getUser } from '../../utils/userSystem';
import { syncUserNow } from '../../services/firebase';
import { ChevronLeft, MonitorPlay, Download, Share2, ThumbsUp, ThumbsDown, Flag, X, ExternalLink, LayoutGrid, List } from 'lucide-react';
import StreamingDonghuaCommentsSection from '../../components/streaming/donghua/StreamingDonghuaCommentsSection';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const showToast = (text) => {
    const t = document.createElement('div');
    t.className = 'xp-toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 100);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
};

// ─── Ekstrak nomor episode dari berbagai format ───
const getEpNum = (ep, idx) => {
    const n = ep.number ?? ep.episode ?? ep.ep ?? ep.num;
    if (n !== undefined && n !== null && n !== '') return n;
    const t = String(ep.title || '');
    const u = String(ep.url || '');
    const tm = t.match(/episode\s*(\d+(?:\.\d+)?)/i) || t.match(/ep\.?\s*(\d+(?:\.\d+)?)/i) || t.match(/(\d+(?:\.\d+)?)/);
    if (tm) return tm[1];
    const um = u.match(/episode[- _]?(\d+)/i) || u.match(/ep[- _]?(\d+)/i) || u.match(/-0*(\d+)(?:-subtitle|-sub|-end|\/|$)/i);
    if (um) return um[1];
    return idx + 1;
};

const getEpNumFloat = (ep, idx) => parseFloat(String(getEpNum(ep, idx))) || idx;

const formatDate = (d) => {
    if (!d) return null;
    try {
        const dt = new Date(d);
        if (isNaN(dt)) return d;
        return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    } catch { return d; }
};

// ─── Navbar ───
const Navbar = ({ title, episodeTitle, episodeNumber, onBack }) => (
    <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-12 flex items-center px-3" style={{ maxWidth: 480, margin: '0 auto' }}>
        <button onClick={onBack} className="p-1.5 hover:bg-white/8 rounded-full transition-colors mr-2 flex-shrink-0">
            <ChevronLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-tight">{title || 'Donghua'}</p>
            {episodeTitle && <p className="text-[10px] text-gray-500 truncate leading-tight">{episodeTitle}</p>}
        </div>
        {episodeNumber && (
            <span className="flex-shrink-0 ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(250,109,154,0.15)', color: '#fa6d9a' }}>
                EP {episodeNumber}
            </span>
        )}
    </div>
);

// ─── Video Player ───
const VideoPlayer = ({ selectedServer, isLoading, onLoad, onError, playerRef }) => (
    <div className="relative w-full bg-black aspect-video">
        {!selectedServer ? (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <MonitorPlay size={40} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Tidak ada stream tersedia</p>
                </div>
            </div>
        ) : (
            <>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-bg z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-500">Loading player...</p>
                        </div>
                    </div>
                )}
                <iframe
                    ref={playerRef}
                    src={selectedServer.url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                    frameBorder="0"
                    title={selectedServer.server}
                    onLoad={onLoad}
                    onError={onError}
                    sandbox="allow-same-origin allow-scripts allow-presentation allow-top-navigation-by-user-activation"
                />
            </>
        )}
    </div>
);

// ─── Info Card ───
const InfoCard = ({ donghua, episodeNumber }) => {
    const [expanded, setExpanded] = useState(false);
    if (!donghua) return null;
    return (
        <div className="mb-4">
            {episodeNumber && (
                <p className="text-[10px] font-bold mb-1" style={{ color: '#fa6d9a' }}>Episode {episodeNumber}</p>
            )}
            <h2 className="text-lg font-bold text-white mb-1 line-clamp-2">{donghua.title}</h2>
            {(donghua.synopsis || donghua.description) && (
                <p onClick={() => setExpanded(!expanded)}
                    className={`text-sm text-gray-400 mb-1 cursor-pointer text-justify transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
                    {donghua.synopsis || donghua.description}
                </p>
            )}
            {expanded && (
                <button onClick={() => setExpanded(false)} className="text-xs text-primary-400 hover:underline">Tutup</button>
            )}
        </div>
    );
};

// ─── Action Bar (Server + Download) ───
const ActionBar = ({ streams = [], selectedServer, onServerSelect, downloads = [] }) => {
    const [sheet, setSheet] = useState(null); // null | 'server' | 'download'
    const [animate, setAnimate] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    useEffect(() => {
        if (sheet) setTimeout(() => setAnimate(true), 10);
        else setAnimate(false);
    }, [sheet]);

    const close = () => setSheet(null);

    const Btn = ({ icon, label, onClick, active }) => (
        <button onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${active ? 'bg-primary-400/15 text-primary-400' : 'bg-dark-surface text-gray-400 hover:bg-dark-card hover:text-white'}`}>
            {icon}<span className="text-sm font-medium">{label}</span>
        </button>
    );

    return (
        <>
            <div className="mb-6 overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-3 min-w-max">
                    <Btn icon={<ThumbsUp size={18} />} label="Like" active={liked} onClick={() => { setLiked(!liked); if (disliked) setDisliked(false); }} />
                    <Btn icon={<ThumbsDown size={18} />} label="Dislike" active={disliked} onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }} />
                    <Btn icon={<MonitorPlay size={18} />} label={selectedServer?.server || 'Server'} onClick={() => { close(); setSheet('server'); }} />
                    <Btn icon={<Download size={18} />} label="Download" onClick={() => { close(); setSheet('download'); }} />
                    <Btn icon={<Share2 size={18} />} label="Share" onClick={() => { if (navigator.share) navigator.share({ title: document.title, url: location.href }); }} />
                    <Btn icon={<Flag size={18} />} label="Report" />
                </div>
            </div>

            {sheet && (
                <div className="fixed inset-0 z-50 flex items-end">
                    <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`} onClick={close} />
                    <div className={`relative w-full bg-dark-surface rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto transition-all duration-300 ease-out ${animate ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">{sheet === 'server' ? 'Pilih Server' : 'Download'}</h3>
                            <button onClick={close}><X size={20} className="text-gray-400" /></button>
                        </div>

                        {sheet === 'server' && streams.map((s, i) => (
                            <button key={i} onClick={() => { onServerSelect(s); close(); }}
                                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all duration-200 flex items-center justify-between ${selectedServer?.url === s.url ? 'bg-primary-400/15 text-white' : 'bg-dark-card text-gray-400'}`}>
                                <span>{s.server || `Server ${i + 1}`}</span>
                                {s.hasAds && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308' }}>ADS</span>}
                            </button>
                        ))}

                        {sheet === 'download' && (!downloads?.length ? (
                            <p className="text-center text-gray-400 py-8">Tidak ada download tersedia</p>
                        ) : downloads.map((dl, i) => (
                            <div key={i} className="bg-dark-card rounded-xl border border-dark-border p-3 mb-3">
                                <h4 className="text-xs font-medium text-gray-400 mb-2">{dl.format}</h4>
                                {dl.qualities?.map((q, qi) => (
                                    <div key={qi} className="flex items-start gap-2 mb-2">
                                        <span className="text-xs font-bold text-primary-400 w-16">{q.quality}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {q.links?.map((link, li) => (
                                                <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-dark-surface rounded text-xs text-gray-300 hover:text-primary-400 transition-colors">
                                                    <ExternalLink size={10} />{link.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )))}
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Episodes Grid ───
const EpisodesGrid = ({ episodes = [], currentEpisodeUrl, currentEpisodeNumber, onEpisodeClick }) => {
    const [viewMode, setViewMode] = useState('horizontal');
    const scrollRef = useRef(null);

    const sorted = useMemo(() => [...episodes].sort((a, b) => {
        return getEpNumFloat(a, episodes.indexOf(a)) - getEpNumFloat(b, episodes.indexOf(b));
    }), [episodes]);

    const isCurrent = (ep, idx) => {
        if (currentEpisodeUrl && ep.url) return ep.url === currentEpisodeUrl;
        return String(getEpNum(ep, idx)) === String(currentEpisodeNumber);
    };

    // Validasi domain sama
    const isSameDomain = (url) => {
        if (!currentEpisodeUrl || !url) return true;
        try { return new URL(currentEpisodeUrl).hostname === new URL(url).hostname; } catch { return true; }
    };

    useEffect(() => {
        if (viewMode !== 'horizontal') return;
        const active = scrollRef.current?.querySelector('[data-active="true"]');
        if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, [currentEpisodeNumber, viewMode]);

    if (!episodes.length) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Episodes <span className="text-gray-500 text-xs ml-1">({episodes.length})</span></h3>
                <button onClick={() => setViewMode(v => v === 'horizontal' ? 'grid' : 'horizontal')} className="p-2 transition">
                    {viewMode === 'horizontal' ? <LayoutGrid size={16} className="text-gray-400" /> : <List size={16} className="text-gray-400" />}
                </button>
            </div>

            {viewMode === 'horizontal' && (
                <div ref={scrollRef} className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {sorted.map((ep, idx) => {
                        const num = getEpNum(ep, idx);
                        const active = isCurrent(ep, idx);
                        const valid = isSameDomain(ep.url);
                        return (
                            <button key={idx} data-active={active}
                                onClick={() => valid && !active && onEpisodeClick(ep)}
                                disabled={!valid}
                                className={`px-3 py-2 whitespace-nowrap rounded-xl text-left transition-all flex-shrink-0 ${active ? 'bg-primary-400/20 border border-primary-400/50' : 'bg-dark-surface border border-dark-border hover:border-primary-400/30'}`}
                                style={{ opacity: !valid ? 0.4 : 1 }}>
                                <p className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>Episode {num}</p>
                                {ep.date && <p className="text-xs text-gray-500 mt-1">{formatDate(ep.date)}</p>}
                            </button>
                        );
                    })}
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid grid-cols-3 gap-3">
                    {sorted.map((ep, idx) => {
                        const num = getEpNum(ep, idx);
                        const active = isCurrent(ep, idx);
                        const valid = isSameDomain(ep.url);
                        return (
                            <button key={idx}
                                onClick={() => valid && !active && onEpisodeClick(ep)}
                                disabled={!valid}
                                className={`p-3 rounded-xl text-left transition-all ${active ? 'bg-primary-400/20 border border-primary-400/50' : 'bg-dark-surface border border-dark-border hover:border-primary-400/30'}`}
                                style={{ opacity: !valid ? 0.4 : 1 }}>
                                <p className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>Episode {num}</p>
                                {ep.date && <p className="text-xs text-gray-500 mt-1">{formatDate(ep.date)}</p>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Loading Skeleton ───
const LoadingState = () => (
    <div className="min-h-screen bg-dark-bg">
        <div className="h-12 glass border-b border-white/5 flex items-center px-4">
            <div className="w-6 h-6 bg-dark-card rounded animate-pulse" />
            <div className="ml-3 w-40 h-4 bg-dark-card rounded animate-pulse" />
        </div>
        <div className="w-full aspect-video bg-dark-surface animate-pulse" />
        <div className="px-4 py-4 space-y-3">
            <div className="h-5 w-3/4 bg-dark-card rounded animate-pulse" />
            <div className="h-4 w-full bg-dark-card rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-dark-card rounded animate-pulse" />
        </div>
    </div>
);

// ─── Error State ───
const ErrorState = ({ error, onGoHome }) => (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-4">😢</div>
        <h2 className="text-lg font-bold text-white mb-2">Gagal memuat</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">{error || 'Episode tidak ditemukan'}</p>
        <button onClick={onGoHome} className="px-6 py-3 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #fa6d9a, #fa6d6d)' }}>Kembali ke Beranda</button>
    </div>
);

// ─── Main Page ───
const StreamingDonghua = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const episodeUrl = new URLSearchParams(location.search).get('url');

    const [episodeData, setEpisodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedServer, setSelectedServer] = useState(null);
    const [isIframeLoading, setIsIframeLoading] = useState(false);

    const iframeRef = useRef(null);
    const xpTimerRef = useRef(null);

    const startWatchTimer = useCallback(() => {
        if (!getUser()) return;
        if (xpTimerRef.current) clearInterval(xpTimerRef.current);
        xpTimerRef.current = setInterval(() => {
            const result = addXP(100, 'Menonton donghua 20 menit');
            if (result) { showToast(`⚡ +100 XP${result.leveledUp ? ` 🎉 Level ${result.newLevel}!` : ' (nonton 20 menit)'}`); syncUserNow(); }
        }, 20 * 60 * 1000);
    }, []);

    const stopWatchTimer = useCallback(() => {
        if (xpTimerRef.current) { clearInterval(xpTimerRef.current); xpTimerRef.current = null; }
    }, []);

    useEffect(() => { return () => stopWatchTimer(); }, [stopWatchTimer]);

    useEffect(() => {
        if (!episodeUrl) { setError('No episode URL provided'); setLoading(false); return; }
        const fetch = async () => {
            try {
                setLoading(true); setError(null);
                const res = await axios.get(`${API_BASE}/donghua/episode?url=${encodeURIComponent(episodeUrl)}`);
                if (res.data.success) {
                    setEpisodeData(res.data.data);
                    const streams = res.data.data.streams || [];
                    const best = streams.find(s => !s.hasAds) || streams[0] || null;
                    setSelectedServer(best);
                    if (best) { setIsIframeLoading(true); if (best.hasAds) setTimeout(() => showToast('⚠️ Server tanpa iklan tidak tersedia'), 1000); }
                } else { setError(res.data.error || 'Gagal memuat episode'); }
            } catch { setError('Gagal memuat data episode'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [episodeUrl]);

    const handleBack = () => { stopWatchTimer(); navigate(-1); };
    const handleServerChange = (s) => { stopWatchTimer(); setSelectedServer(s); setIsIframeLoading(true); };

    const handleEpisodeClick = (ep) => {
        if (!ep?.url) return;
        // Cegah navigasi ke domain lain
        try {
            if (new URL(episodeUrl).hostname !== new URL(ep.url).hostname) return;
        } catch { /* ignore */ }
        stopWatchTimer();
        setEpisodeData(null); setSelectedServer(null); setError(null); setLoading(true);
        navigate(`/donghua/watch?url=${encodeURIComponent(ep.url)}`);
    };

    if (loading) return <LoadingState />;
    if (error || !episodeData) return <ErrorState error={error} onGoHome={() => navigate('/')} />;

    const { currentEpisode, donghua, streams, downloads } = episodeData;
    const episodes = episodeData.episodes || episodeData.allEpisodes || episodeData.relatedEpisodes || episodeData.episodeList || [];

    return (
        <div className="min-h-screen bg-dark-bg">
            <Navbar
                title={donghua?.title}
                episodeTitle={currentEpisode?.title}
                episodeNumber={currentEpisode?.number || getEpNum(currentEpisode || {}, 0)}
                onBack={handleBack}
            />

            <div className="pt-12">
                <VideoPlayer
                    playerRef={iframeRef}
                    selectedServer={selectedServer}
                    isLoading={isIframeLoading}
                    onLoad={() => { setIsIframeLoading(false); startWatchTimer(); }}
                    onError={() => setIsIframeLoading(false)}
                />
            </div>

            <div className="px-4 py-4">
                <InfoCard donghua={donghua} episodeNumber={currentEpisode?.number || getEpNum(currentEpisode || {}, 0)} />

                <ActionBar
                    streams={streams || []}
                    selectedServer={selectedServer}
                    onServerSelect={handleServerChange}
                    downloads={downloads || []}
                />

                <EpisodesGrid
                    episodes={episodes}
                    currentEpisodeUrl={episodeUrl}
                    currentEpisodeNumber={currentEpisode?.number}
                    onEpisodeClick={handleEpisodeClick}
                />

                <StreamingDonghuaCommentsSection episodeUrl={episodeUrl} />
            </div>
        </div>
    );
};

export default StreamingDonghua;
