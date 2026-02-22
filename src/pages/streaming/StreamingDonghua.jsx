import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import { addXP, getUser } from '../../utils/userSystem';
import { syncUserNow } from '../../services/firebase';

const showXPToast = (amount, extra = '') => {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.textContent = `⚡ +${amount} XP${extra}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2800);
};

import {
    StreamingAnimeNavbar,
    StreamingAnimeVideoPlayer,
    StreamingAnimeServerSelector,
    StreamingAnimeInfoCard,
    StreamingAnimeEpisodesGrid,
    StreamingAnimeErrorState,
    StreamingAnimeCommentsSection
} from '../../components/streaming/anime';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

// Ekstrak nomor episode dari URL Anichin:
// https://anichin.moe/judul-episode-3-subtitle-indonesia/ → 3
const extractEpNumFromUrl = (url = '') => {
    const m = url.match(/episode[- _]?(\d+)/i)
        || url.match(/-(\d+)-subtitle/i)
        || url.match(/-(\d+)-sub/i)
        || url.match(/-(\d+)\/?$/);
    return m ? parseInt(m[1], 10) : null;
};

// Ekstrak nomor dari berbagai field
const getEpNumber = (ep, idx) => {
    if (ep == null) return idx + 1;
    const n = ep.number ?? ep.episode ?? ep.ep;
    if (n != null && n !== '') return typeof n === 'number' ? n : (parseFloat(n) || idx + 1);
    const fromUrl = extractEpNumFromUrl(ep.url || '');
    if (fromUrl != null) return fromUrl;
    const t = String(ep.title || '');
    const tm = t.match(/episode\s*(\d+)/i) || t.match(/ep\.?\s*(\d+)/i) || t.match(/(\d+)/);
    if (tm) return parseInt(tm[1], 10);
    return idx + 1;
};

// Cek apakah URL adalah episode dari donghua yang SAMA
// Bandingkan base path (tanpa -episode-N-subtitle-*)
const isSameDonghua = (urlA, urlB) => {
    try {
        const hostA = new URL(urlA).hostname;
        const hostB = new URL(urlB).hostname;
        if (hostA !== hostB) return false;
        // Ambil slug dasar (sebelum -episode-)
        const baseA = urlA.replace(/-episode-\d+.*$/i, '').replace(/\/$/, '');
        const baseB = urlB.replace(/-episode-\d+.*$/i, '').replace(/\/$/, '');
        return baseA === baseB;
    } catch { return false; }
};

// Normalisasi + deduplikasi + sort episodes
const normalizeEpisodes = (eps, currentUrl) => {
    if (!Array.isArray(eps) || eps.length === 0) return [];
    
    // Filter hanya episode dari donghua yang sama
    const filtered = eps.filter(ep => {
        if (!ep?.url) return false;
        return isSameDonghua(ep.url, currentUrl);
    });

    // Set nomor episode
    const withNum = filtered.map((ep, idx) => ({
        ...ep,
        number: getEpNumber(ep, idx),
    }));

    // Deduplikasi berdasarkan URL
    const seen = new Set();
    const deduped = withNum.filter(ep => {
        if (seen.has(ep.url)) return false;
        seen.add(ep.url);
        return true;
    });

    // Sort ascending ep 1 → dst
    return deduped.sort((a, b) => a.number - b.number);
};

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
            if (result) {
                showXPToast(100, result.leveledUp ? ` 🎉 Level ${result.newLevel}!` : ' (nonton 20 menit)');
                syncUserNow();
            }
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
                setLoading(true);
                setError(null);

                // Coba /donghua/episode dulu, fallback ke /donghua/watch
                let data = null;
                for (const endpoint of [
                    `${API_BASE}/donghua/episode?url=${encodeURIComponent(episodeUrl)}`,
                    `${API_BASE}/donghua/watch?url=${encodeURIComponent(episodeUrl)}`,
                ]) {
                    try {
                        const res = await axios.get(endpoint);
                        if (res.data?.success && res.data?.data) {
                            data = res.data.data;
                            break;
                        }
                    } catch { /* coba endpoint berikutnya */ }
                }

                if (!data) { setError('Gagal memuat episode'); return; }

                setEpisodeData(data);
                const streams = data.streams || [];
                const best = streams.find(s => !s.hasAds) || streams[0] || null;
                setSelectedServer(best);
                if (best) setIsIframeLoading(true);

            } catch (err) {
                console.error('Error fetching donghua episode:', err);
                setError('Gagal memuat data episode');
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [episodeUrl]);

    const handleBack = () => { stopWatchTimer(); navigate(-1); };
    const handleServerChange = (server) => { stopWatchTimer(); setSelectedServer(server); setIsIframeLoading(true); };
    const handleGoHome = () => navigate('/');

    const handleEpisodeClick = (ep) => {
        if (!ep?.url) return;
        // Pastikan episode dari donghua yang sama
        if (!isSameDonghua(ep.url, episodeUrl)) return;
        stopWatchTimer();
        setEpisodeData(null);
        setSelectedServer(null);
        setError(null);
        setLoading(true);
        navigate(`/donghua/watch?url=${encodeURIComponent(ep.url)}`);
    };

    if (loading) return (
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

    if (error || !episodeData) return <StreamingAnimeErrorState error={error} onGoHome={handleGoHome} />;

    const { currentEpisode, donghua, streams, downloads } = episodeData;

    const rawEps = episodeData.episodes || episodeData.allEpisodes || episodeData.relatedEpisodes || [];
    const episodes = normalizeEpisodes(rawEps, episodeUrl);

    const animeCompat = donghua ? {
        title: donghua.title,
        synopsis: donghua.synopsis || donghua.description || '',
        image: donghua.image,
        genres: donghua.genres,
        rating: donghua.rating,
    } : null;

    const currentEpNumber = currentEpisode
        ? getEpNumber(currentEpisode, 0)
        : extractEpNumFromUrl(episodeUrl) || 1;

    return (
        <div className="min-h-screen bg-dark-bg">
            <StreamingAnimeNavbar
                title={donghua?.title}
                episodeTitle={currentEpisode?.title}
                episodeNumber={currentEpNumber}
                onBack={handleBack}
            />

            <div className="pt-12">
                <StreamingAnimeVideoPlayer
                    ref={iframeRef}
                    selectedServer={selectedServer}
                    isLoading={isIframeLoading}
                    onLoad={() => { setIsIframeLoading(false); startWatchTimer(); }}
                    onError={() => setIsIframeLoading(false)}
                />
            </div>

            <div className="px-4 py-4">
                <StreamingAnimeInfoCard
                    episodeNumber={currentEpNumber}
                    anime={animeCompat}
                />

                <StreamingAnimeServerSelector
                    streams={streams || []}
                    selectedServer={selectedServer}
                    downloads={downloads || []}
                    onServerSelect={handleServerChange}
                />

                <StreamingAnimeEpisodesGrid
                    episodes={episodes}
                    currentEpisodeNumber={currentEpNumber}
                    onEpisodeClick={handleEpisodeClick}
                />

                <StreamingAnimeCommentsSection episodeUrl={episodeUrl} />
            </div>
        </div>
    );
};

export default StreamingDonghua;
