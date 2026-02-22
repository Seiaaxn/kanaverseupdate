import { Play, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

const extractNum = (ep, idx) => {
    const n = ep.number ?? ep.episode;
    if (n !== undefined && n !== null) return parseFloat(n) || idx;
    const match = String(ep.title || '').match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : idx;
};

const DonghuaEpisodesTab = ({ episodes = [], onEpisodeSelect }) => {
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
                    style={{ background: 'rgba(250,109,154,0.15)', color: '#fa6d9a', border: '1px solid rgba(250,109,154,0.2)' }}>
                    <ArrowUpDown size={11} />
                    {sortOrder === 'latest' ? 'Terbaru ↓' : 'Terlama ↑'}
                </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {sorted.map((ep, idx) => {
                    const num = extractNum(ep, idx);
                    const title = ep.title || `Episode ${num}`;
                    const date = ep.date || ep.releaseDate || '';
                    const hasSub = ep.hasSubtitle || false;
                    return (
                        <button key={`${num}-${idx}`} onClick={() => onEpisodeSelect(ep)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-97"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                                style={{ background: 'rgba(250,109,154,0.15)', color: '#fa6d9a' }}>
                                {num}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold text-white line-clamp-1">{title}</p>
                                    {hasSub && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: 'rgba(109,250,188,0.2)', color: '#6dfabc' }}>SUB</span>}
                                </div>
                                {date && <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{date}</p>}
                            </div>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(250,109,154,0.1)' }}>
                                <Play size={11} className="ml-0.5" style={{ color: '#fa6d9a' }} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DonghuaEpisodesTab;
