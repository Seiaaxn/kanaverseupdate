import StreamingDonghuaCommentsSection from '../../components/streaming/donghua/StreamingDonghuaCommentsSection';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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
            if (!episodeUrl) {
                setError('No episode URL provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE}/donghua/episode?url=${encodeURIComponent(episodeUrl)}`);

                if (response.data.success) {
                    setEpisodeData(response.data.data);
                    const streams = response.data.data.streams || [];
                    // Prefer server without ads
                    const noAdsServer = streams.find(s => !s.hasAds);
                    const firstServer = noAdsServer || streams[0] || null;
                    setSelectedServer(firstServer);
                    if (firstServer) setIsIframeLoading(true);
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
        if (ep?.url) { stopWatchTimer(); navigate(`/donghua/watch?url=${encodeURIComponent(ep.url)}`); }
    };

    if (loading) return <StreamingDonghuaLoadingState />;
    if (error || !episodeData) return <StreamingDonghuaErrorState error={error} onGoHome={handleGoHome} />;

    const { currentEpisode, donghua, episodes, streams } = episodeData;

    return (
        <div className="min-h-screen bg-dark-bg">
            <StreamingDonghuaNavbar
                title={donghua?.title}
                episodeTitle={currentEpisode?.title}
                episodeNumber={currentEpisode?.number}
                onBack={handleBack}
            />

            {/* Video Player */}
            <div className="pt-12 relative w-full bg-black aspect-video">
                <StreamingDonghuaVideoPlayer
                    ref={iframeRef}
                    selectedServer={selectedServer}
                    isLoading={isIframeLoading}
                    onLoad={() => { setIsIframeLoading(false); startWatchTimer(); }}
                    onError={() => setIsIframeLoading(false)}
                />
            </div>

            {/* Content */}
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
                    onEpisodeClick={handleEpisodeClick}
                />

                <StreamingDonghuaCommentsSection episodeUrl={episodeUrl} />
            </div>
        </div>
    );
};

export default StreamingDonghua;

            
