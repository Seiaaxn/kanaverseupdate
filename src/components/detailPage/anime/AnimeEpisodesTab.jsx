import { Play, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

const extractNum = (ep, idx) => {
    const n = ep.number ?? ep.episode;
    if (n !== undefined && n !== null) return parseFloat(n) || idx;
    const match = String(ep.title || '').match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : idx;
};

const AnimeEpisodesTab = ({ episodes = [], onEpisodeSelect }) => {
    const [sortOrder, setSortOrder] = useState('latest');

    const sorted = [...episodes].sort((a, b) => {
        const na = extractNum(a, episodes.indexOf(a));
        const nb = extractNum(b, episodes.indexOf(b));
        return sortOrder === 'latest' ? nb - na : na - nb;
    });

    if (!episodes.length) return (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>Belum ada episode</div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-black text-white">{episodes.length} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Episode</span></p>
                <button onClick={() => setSortOrder(s => s === 'latest' ? 'oldest' : 'latest')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ background: 'rgba(124,109,250,0.15)', color: '#7c6dfa', border: '1px solid rgba(124,109,250,0.2)' }}>
                    <ArrowUpDown size={11} />
                    {sortOrder === 'latest' ? 'Terbaru ↓' : 'Terlama ↑'}
                </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a4a transparent' }}>
                {sorted.map((ep, idx) => {
                    const num = extractNum(ep, idx);
                    const title = ep.title || `Episode ${num}`;
                    const date = ep.date || ep.releaseDate || '';
                    return (
                        <button key={`${num}-${idx}`} onClick={() => onEpisodeSelect(ep)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-97 group"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs transition-all"
                                style={{ background: 'linear-gradient(135deg, rgba(124,109,250,0.2), rgba(176,109,250,0.2))', color: '#7c6dfa' }}>
                                {num}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white line-clamp-1">{title}</p>
                                {date && <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{date}</p>}
                            </div>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: 'rgba(124,109,250,0.1)' }}>
                                <Play size={11} className="ml-0.5" style={{ color: '#7c6dfa' }} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AnimeEpisodesTab;
