import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, Clock, ChevronLeft, LogIn } from 'lucide-react';
import { getUser, getUserHistory, removeFromUserHistory, clearUserHistory } from '../utils/userSystem';

const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Baru saja';
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}j lalu`;
    return `${Math.floor(h / 24)}h lalu`;
};

const HistoryPage = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [history, setHistory] = useState([]);

    useEffect(() => { setHistory(getUserHistory()); }, []);

    const handleRemove = (id) => { setHistory(removeFromUserHistory(id)); };
    const handleClear = () => { if (confirm('Hapus semua history?')) { clearUserHistory(); setHistory([]); } };

    const handleWatch = (item) => {
        const path = item.category === 'donghua' ? '/donghua/watch' : '/anime/watch';
        navigate(`${path}?url=${encodeURIComponent(item.episodeUrl)}`);
    };

    if (!user) return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24" style={{ background: 'var(--bg)' }}>
            <div className="text-5xl mb-4 animate-float">📺</div>
            <h2 className="text-lg font-black text-white mb-2">Login untuk lihat history</h2>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--muted)' }}>History tontonan disimpan per akun</p>
            <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)' }}>
                <LogIn size={16} /> Masuk Sekarang
            </button>
        </div>
    );

    return (
        <div className="min-h-screen pb-28" style={{ background: 'var(--bg)' }}>
            <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="px-4 flex items-center justify-between" style={{ height: '52px' }}>
                    <h1 className="text-sm font-bold text-white">📺 History Tontonan</h1>
                    {history.length > 0 && (
                        <button onClick={handleClear} className="p-2 rounded-xl" style={{ color: '#fa6d9a' }}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </header>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 px-6">
                    <div className="text-6xl mb-4 animate-float">🎬</div>
                    <h3 className="text-lg font-black text-white mb-2">Belum ada history</h3>
                    <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>Mulai nonton anime atau donghua untuk mengumpulkan XP!</p>
                </div>
            ) : (
                <div className="px-4 py-4 space-y-3">
                    <p className="text-xs font-bold" style={{ color: 'var(--muted)' }}>{history.length} tontonan tercatat</p>
                    {history.map(item => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-2xl animate-fade-in" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover"
                                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=12121f&color=7c6dfa&size=200`; }} />
                                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,109,250,0.8)' }}>
                                        <Play size={10} className="text-white ml-0.5" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#7c6dfa' }}>{item.episodeTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={10} style={{ color: 'var(--muted)' }} />
                                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{timeAgo(item.lastWatched)}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                                        style={{ background: item.category === 'donghua' ? 'rgba(250,109,109,0.15)' : 'rgba(124,109,250,0.15)', color: item.category === 'donghua' ? '#fa6d6d' : '#7c6dfa' }}>
                                        {item.category === 'donghua' ? 'Donghua' : 'Anime'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0">
                                <button onClick={() => handleWatch(item)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,109,250,0.15)', color: '#7c6dfa' }}>
                                    <Play size={13} className="ml-0.5" />
                                </button>
                                <button onClick={() => handleRemove(item.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(250,109,154,0.1)', color: '#fa6d9a' }}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
