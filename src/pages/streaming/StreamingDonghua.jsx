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

// Ekstrak nomor episode dari berbagai format
const getEpNumber = (ep, idx) => {
    const n = ep.number ?? ep.episode ?? ep.ep;
    if (n !== undefined && n !== null && n !== '') return typeof n === 'number' ? n : parseFloat(n) || (idx + 1);
    const t = String(ep.title || '');
    const u = String(ep.url || '');
    const tm = t.match(/episode\s*(\d+(?:\.\d+)?)/i) || t.match(/ep\.?\s*(\d+(?:\.\d+)?)/i) || t.match(/^(\d+(?:\.\d+)?)/);
    if (tm) return parseFloat(tm[1]);
    const um = u.match(/episode[- _]?(\d+)/i) || u.match(/ep[- _]?(\d+)/i) || u.match(/-0*(\d+)(?:-subtitle|-sub|-end|\/|$)/i);
    if (um) return parseFloat(um[1]);
    return idx + 1;
};

// Normalisasi episodes agar punya field number + deduplikasi
const normalizeEpisodes = (episodes, currentUrl) => {
    if (!Array.isArray(episodes)) return [];
    // Tetapkan number ke setiap episode
    const withNum = episodes.map((ep, idx) => ({
        ...ep,
        number: getEpNumber(ep, idx),
    }));
    // Deduplikasi berdasarkan URL
    const seen = new Set();
    return withNum.filter(ep => {
        if (!ep.url) return false;
        if (seen.has(ep.url)) return false;
        seen.add(ep.url);
        return true;
    });
};

const StreamingDonghua = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const episodeUrl = searchParams.get('url');

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
        const fetchEpisodeDetail = async () => {
            if (!episodeUrl) { setError('No episode URL provided'); setLoading(false); return; }
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE}/donghua/episode?url=${encodeURIComponent(episodeUrl)}`);
                if (response.data.success) {
                    setEpisodeData(response.data.data);
                    const streams = response.data.data.streams || [];
                    const best = streams.find(s => !s.hasAds) || streams[0] || null;
                    setSelectedServer(best);
                    if (best) setIsIframeLoading(true);
                } else {
                    setError(response.data.error || 'Failed to load episode');
                }
            } catch (err) {
                console.error('Error fetching donghua episode:', err);
                setError('Failed to load episode data');
            } finally {
                setLoading(false);
            }
        };
        fetchEpisodeDetail();
    }, [episodeUrl]);

    const handleBack = () => { stopWatchTimer(); navigate(-1); };
    const handleServerChange = (server) => { stopWatchTimer(); setSelectedServer(server); setIsIframeLoading(true); };
    const handleGoHome = () => navigate('/');

    const handleEpisodeClick = (ep) => {
        if (!ep?.url) return;
        // Cegah navigasi ke domain berbeda (donghua lain)
        try {
            const currentHost = new URL(episodeUrl).hostname;
            const targetHost = new URL(ep.url).hostname;
            if (currentHost !== targetHost) return;
        } catch { /* abaikan error parsing URL */ }
        stopWatchTimer();
        setEpisodeData(null);
        setSelectedServer(null);
        setError(null);
        setLoading(true);
        navigate(`/donghua/watch?url=${encodeURIComponent(ep.url)}`);
    };

    if (loading) {
        return (
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
    }

    if (error || !episodeData) {
        return <StreamingAnimeErrorState error={error} onGoHome={handleGoHome} />;
    }

    const { currentEpisode, donghua, streams, downloads } = episodeData;

    // Normalisasi episodes: hapus duplikat, tetapkan nomor dari URL/title
    const rawEpisodes = episodeData.episodes || episodeData.allEpisodes || episodeData.relatedEpisodes || [];
    const episodes = normalizeEpisodes(rawEpisodes, episodeUrl);

    // Buat objek anime-compatible dari data donghua
    const animeCompat = donghua ? {
        title: donghua.title,
        synopsis: donghua.synopsis || donghua.description || '',
        image: donghua.image,
        genres: donghua.genres,
        rating: donghua.rating,
    } : null;

    // Nomor episode saat ini
    const currentEpNumber = currentEpisode?.number
        ?? getEpNumber(currentEpisode || {}, 0);

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
