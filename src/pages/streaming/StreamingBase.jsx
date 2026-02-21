// src/pages/Streaming/StreamingBase.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Play, Pause, Volume2, VolumeX, Maximize,
    SkipBack, SkipForward, MonitorPlay,
    AlertCircle, ChevronLeft, Film,
} from 'lucide-react';
import { addToHistory, updateProgress, getEpisodeProgress } from '../../utils/history';

export const useStreamingBase = (anime, currentEpisode, episodes) => {
    const navigate = useNavigate();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [savedProgress, setSavedProgress] = useState(0);

    const videoRef = useRef(null);
    const iframeRef = useRef(null);
    const playerContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const hasSeekedToProgress = useRef(false);

    const currentEpisodeIndex = episodes.findIndex(ep => ep.url === currentEpisode.url);
    const hasNext = currentEpisodeIndex < episodes.length - 1;
    const hasPrev = currentEpisodeIndex > 0;

    // Load saved progress
    useEffect(() => {
        if (anime && currentEpisode) {
            const progress = getEpisodeProgress(anime.url, currentEpisode.url);
            setSavedProgress(progress);
            hasSeekedToProgress.current = false;
        }
    }, [anime, currentEpisode]);

    // Save to history
    useEffect(() => {
        if (anime && currentEpisode) {
            const existingProgress = getEpisodeProgress(anime.url, currentEpisode.url);
            addToHistory(anime, currentEpisode, existingProgress);
        }
    }, [anime, currentEpisode]);

    // Seek to saved progress
    useEffect(() => {
        const video = videoRef.current;
        if (video && savedProgress > 0 && !hasSeekedToProgress.current) {
            const handleLoadedMetadata = () => {
                if (video.duration) {
                    const seekTime = (savedProgress / 100) * video.duration;
                    video.currentTime = seekTime;
                    setCurrentTime(seekTime);
                    hasSeekedToProgress.current = true;
                }
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);

            if (video.readyState >= 1) {
                handleLoadedMetadata();
            }

            return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
    }, [savedProgress]);

    // Progress tracking
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const startProgressTracking = () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }

            progressIntervalRef.current = setInterval(() => {
                if (video.duration && video.currentTime && !video.paused) {
                    const progress = Math.floor((video.currentTime / video.duration) * 100);

                    if (Math.abs(progress - savedProgress) >= 1) {
                        updateProgress(anime.url, currentEpisode.url, progress);
                        setSavedProgress(progress);
                    }
                }
            }, 3000);
        };

        const stopProgressTracking = () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };

        video.addEventListener('play', startProgressTracking);
        video.addEventListener('pause', stopProgressTracking);

        const handleBeforeUnload = () => {
            if (video.duration && video.currentTime) {
                const progress = Math.floor((video.currentTime / video.duration) * 100);
                updateProgress(anime.url, currentEpisode.url, progress);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            video.removeEventListener('play', startProgressTracking);
            video.removeEventListener('pause', stopProgressTracking);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            stopProgressTracking();

            if (video.duration && video.currentTime) {
                const progress = Math.floor((video.currentTime / video.duration) * 100);
                updateProgress(anime.url, currentEpisode.url, progress);
            }
        };
    }, [anime, currentEpisode, savedProgress]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (iframeRef.current) {
                iframeRef.current.requestFullscreen();
            } else {
                playerContainerRef.current?.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration || 0;
            setCurrentTime(current);
            setDuration(total);
        }
    }, []);

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);

            if (videoRef.current.duration) {
                const progress = Math.floor((time / videoRef.current.duration) * 100);
                updateProgress(anime.url, currentEpisode.url, progress);
                setSavedProgress(progress);
            }
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleVideoError = (e) => {
        console.error('Video error:', e);
    };

    return {
        // Refs
        videoRef,
        iframeRef,
        playerContainerRef,

        // State
        isPlaying,
        isMuted,
        showControls,
        currentTime,
        duration,
        isFullscreen,
        savedProgress,
        hasNext,
        hasPrev,
        currentEpisodeIndex,

        // Handlers
        togglePlay,
        toggleMute,
        toggleFullscreen,
        handleTimeUpdate,
        handleSeek,
        handleMouseMove,
        handleBack,
        handleVideoError,
        formatTime,

        // Setters
        setIsPlaying,
        setShowControls
    };
};