import { useState } from 'react';
import { Film, LayoutGrid, List } from 'lucide-react';

const StreamingDonghuaRelatedEpisodes = ({ episodes = [], currentEpisodeNumber, onEpisodeClick }) => {
    const [viewMode, setViewMode] = useState('scroll');

    if (!episodes || episodes.length === 0) return null;

    const getNum = (ep, idx) => {
        const n = ep.number ?? ep.episode;
        if (n !== undefined && n !== null) return n;
        const match = String(ep.title || '').match(/\d+/);
        return match ? match[0] : idx + 1;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            if (isNaN(d)) return dateStr;
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
        } catch { return dateStr; }
    };

    const isCurrent = (ep) => {
        const num = ep.number ?? ep.episode;
        return num !== undefined && String(num) === String(currentEpisodeNumber);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Film size={16} style={{ color: '#7c6dfa' }} />
                    <h3 className="text-sm font-bold text-white">Episodes</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(124,109,250,0.15)', color: '#7c6dfa' }}>
                        {episodes.length}
                    </span>
                </div>
                <button
                    onClick={() => setViewMode(v => v === 'scroll' ? 'grid' : 'scroll')}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-95"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    {viewMode === 'scroll'
                        ? <LayoutGrid size={14} style={{ color: '#7c6dfa' }} />
                        : <List size={14} style={{ color: '#7c6dfa' }} />}
                </button>
            </div>

            {/* Scroll horizontal cards */}
            {viewMode === 'scroll' && (
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {episodes.map((ep, idx) => {
                        const num = getNum(ep, idx);
                        const date = formatDate(ep.date || ep.releaseDate || ep.info);
                        const active = isCurrent(ep);
                        return (
                            <button
                                key={idx}
                                onClick={() => onEpisodeClick(ep)}
                                className="flex-shrink-0 flex flex-col justify-between p-3 rounded-2xl text-left transition-all active:scale-95"
                                style={{
                                    width: '110px',
                                    minHeight: '70px',
                                    background: active ? 'rgba(124,109,250,0.2)' : 'var(--card)',
                                    border: active ? '1.5px solid rgba(124,109,250,0.6)' : '1px solid var(--border)',
                                }}>
                                <p className="text-sm font-bold text-white leading-tight">Episode {num}</p>
                                {date && (
                                    <p className="text-[10px] mt-1.5"
                                        style={{ color: active ? 'rgba(124,109,250,0.8)' : 'var(--muted)' }}>
                                        {date}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Grid angka */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                    {episodes.map((ep, idx) => {
                        const num = getNum(ep, idx);
                        const active = isCurrent(ep);
                        return (
                            <button
                                key={idx}
                                onClick={() => onEpisodeClick(ep)}
                                className="aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95"
                                style={{
                                    background: active ? 'rgba(124,109,250,0.25)' : 'var(--card)',
                                    border: active ? '1.5px solid rgba(124,109,250,0.6)' : '1px solid var(--border)',
                                    color: active ? '#7c6dfa' : 'white',
                                }}>
                                {num}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StreamingDonghuaRelatedEpisodes;
                    
