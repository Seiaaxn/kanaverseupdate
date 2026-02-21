// src/utils/history.js

const HISTORY_KEY = 'anime_watch_history';

// Helper untuk generate unique ID berdasarkan anime + episode
const generateId = (animeUrl, episodeUrl) => {
    return `${animeUrl}::${episodeUrl}`;
};

// Tambah atau update history
export const addToHistory = (anime, episode, progress = 0) => {
    try {
        const history = getHistory();
        
        // Generate ID unik untuk episode spesifik ini
        const itemId = generateId(anime.url, episode?.url || anime.url);
        
        // Cek apakah episode ini sudah ada di history
        const existingIndex = history.findIndex(item => item.id === itemId);

        const episodeNumber =
            typeof episode?.episode === "object"
                ? episode?.episode?.title
                : episode?.episode;

        const episodeTitle =
            typeof episode?.title === "object"
                ? episode?.title?.title
                : episode?.title;
        
        const historyItem = {
        id: itemId,
        title: anime.title,
        episode: episodeNumber || episodeTitle || 'EP 1',
        episodeTitle: episodeTitle || `Episode ${episodeNumber || 1}`,
        episodeUrl: episode?.url || anime.url,
        progress: progress,
        image: anime.image,
        url: anime.url,
        source: anime.source || 'samehadaku',
        category: anime.category || 'anime',
        lastWatched: new Date().toISOString(),
        totalEpisodes: anime.episodes?.length || 0
        };
        
        if (existingIndex >= 0) {
            // Update yang sudah ada - keep progress yang lebih tinggi (jika rewatch)
            const existing = history[existingIndex];
            history[existingIndex] = {
                ...existing,
                progress: Math.max(existing.progress || 0, progress),
                lastWatched: new Date().toISOString()
            };
            
            // Pindahkan ke atas (paling baru)
            const updatedItem = history.splice(existingIndex, 1)[0];
            history.unshift(updatedItem);
        } else {
            // Tambah baru di paling atas
            history.unshift(historyItem);
        }
        
        // Batasi maksimal 50 item
        const limitedHistory = history.slice(0, 50);
        
        // Simpan ke localStorage
        localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
        
        return limitedHistory;
    } catch (error) {
        console.error('Error adding to history:', error);
        return [];
    }
};

// Update progress spesifik untuk episode yang sedang ditonton
export const updateProgress = (animeUrl, episodeUrl, progress) => {
    try {
        const history = getHistory();
        const itemId = generateId(animeUrl, episodeUrl);
        const existingIndex = history.findIndex(item => item.id === itemId);
        
        if (existingIndex >= 0) {
            // Update progress dan timestamp
            history[existingIndex].progress = Math.min(progress, 100); // Max 100%
            history[existingIndex].lastWatched = new Date().toISOString();
            
            // Pindahkan ke atas karena baru diupdate
            const updatedItem = history.splice(existingIndex, 1)[0];
            history.unshift(updatedItem);
            
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
        
        return history;
    } catch (error) {
        console.error('Error updating progress:', error);
        return [];
    }
};

// Ambil progress untuk episode spesifik
export const getEpisodeProgress = (animeUrl, episodeUrl) => {
    try {
        const history = getHistory();
        const itemId = generateId(animeUrl, episodeUrl);
        const item = history.find(item => item.id === itemId);
        return item?.progress || 0;
    } catch {
        return 0;
    }
};

// Ambil semua history
export const getHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
};

// Hapus item dari history
export const removeFromHistory = (id) => {
    try {
        const history = getHistory();
        const filtered = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
        return filtered;
    } catch (error) {
        console.error('Error removing from history:', error);
        return [];
    }
};

// Hapus semua history
export const clearHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return [];
    } catch (error) {
        console.error('Error clearing history:', error);
        return [];
    }
};
                                                
