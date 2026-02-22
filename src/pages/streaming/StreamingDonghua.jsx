import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { addXP, getUser } from '../../utils/userSystem';
import { syncUserNow } from '../../services/firebase';
import StreamingDonghuaCommentsSection from '../../components/streaming/donghua/StreamingDonghuaCommentsSection';

import {
    StreamingDonghuaNavbar,
    StreamingDonghuaVideoPlayer,
    StreamingDonghuaServerSelector,
    StreamingDonghuaInfoCard,
    StreamingDonghuaRelatedEpisodes,
    StreamingDonghuaLoadingState,
    StreamingDonghuaErrorState
} from '../../components/streaming/donghua';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const showToast = (text) => {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2800);
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
                showToast(`⚡ +100 XP${result.leveledUp ? ` 🎉 Level ${result.newLevel}!` : ' (nonton 20 menit)'}`);
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

        const fetchEpisode = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_BASE}/donghua/episode?url=${encodeURIComponent(episodeUrl)}`);

                if (response.data.success) {
                    setEpisodeData(response.data.data);
                    const streams = response.data.data.streams || [];
                    const noAdsServer = streams.find(s => !s.hasAds);
                    const firstServer = noAdsServer || streams[0] || null;
                    setSelectedServer(firstServer);
                    if (firstServer) {
                        setIsIframeLoading(true);
                        if (!noAdsServer && firstServer?.hasAds) {
                            setTimeout(() => showToast('⚠️ Server tanpa iklan tidak tersedia'), 1000);
                        }
                    }
                } else {
                    setError(response.data.error || 'Gagal memuat episode');
                }
            } catch (err) {
                console.error('Error fetching episode:', err);
                setError('Gagal memuat data episode');
            } finally {
                setLoading(false);
            }
        };

        fetchEpisode();
    }, [episodeUrl]);

    const handleBack = () => { stopWatchTimer(); navigate(-1); };
    const handleServerChange = (server) => { stopWatchTimer(); setSelectedServer(server); setIsIframeLoading(true); };
    const handleGoHome = () => navigate('/');

    const handleEpisodeClick = (ep) => {
        if (!ep?.url) return;
        // Validasi domain sama agar tidak nyasar ke donghua lain
        try {
            const currentHost = new URL(episodeUrl).hostname;
            const targetHost = new URL(ep.url).hostname;
            if (currentHost !== targetHost) {
                console.warn('Domain berbeda, navigasi dibatalkan');
                return;
            }
        } catch { /* abaikan error parsing */ }

        stopWatchTimer();
        // Reset state dulu agar halaman reload bersih
        setEpisodeData(null);
        setSelectedServer(null);
        setError(null);
        setLoading(true);
        navigate(`/donghua/watch?url=${encodeURIComponent(ep.url)}`);
    };

    if (loading) return <StreamingDonghuaLoadingState />;
    if (error || !episodeData) return <StreamingDonghuaErrorState error={error} onGoHome={handleGoHome} />;

    const { currentEpisode, donghua, streams } = episodeData;
    const episodes = episodeData.episodes
        || episodeData.allEpisodes
        || episodeData.relatedEpisodes
        || episodeData.episodeList
        || [];

    return (
        <div className="min-h-screen bg-dark-bg">
            <StreamingDonghuaNavbar
                title={donghua?.title}
                episodeTitle={currentEpisode?.title}
                episodeNumber={currentEpisode?.number}
                onBack={handleBack}
            />

            <div className="pt-12 relative w-full bg-black aspect-video">
                <StreamingDonghuaVideoPlayer
                    ref={iframeRef}
                    selectedServer={selectedServer}
                    isLoading={isIframeLoading}
                    onLoad={() => { setIsIframeLoading(false); startWatchTimer(); }}
                    onError={() => setIsIframeLoading(false)}
                />
            </div>

            <div className="px-4 py-4">
                <StreamingDonghuaInfoCard
                    episodeNumber={currentEpisode?.number}
                    donghua={donghua}
                />

                <StreamingDonghuaServerSelector
                    streams={streams}
                    selectedServer={selectedServer}
                    onServerSelect={handleServerChange}
                />

                <StreamingDonghuaRelatedEpisodes
                    episodes={episodes}
                    currentEpisodeNumber={currentEpisode?.number}
                    currentEpisodeUrl={episodeUrl}
                    onEpisodeClick={handleEpisodeClick}
                />

                <StreamingDonghuaCommentsSection episodeUrl={episodeUrl} />
            </div>
        </div>
    );
};

export default StreamingDonghua;
