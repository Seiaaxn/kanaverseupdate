import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, Heart, LogIn, Filter } from 'lucide-react';
import { getUser, getUserBookmarks, toggleUserBookmark } from '../utils/userSystem';

const MyListPage = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [bookmarks, setBookmarks] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => { setBookmarks(getUserBookmarks()); }, []);

    const remove = (url) => {
        toggleUserBookmark({ url });
        setBookmarks(getUserBookmarks());
    };

    const clearAll = () => {
        if (confirm('Hapus semua bookmark?')) {
            try { localStorage.removeItem(`animeplay_bookmarks_${user?.id || 'guest'}`); } catch {}
            setBookmarks([]);
        }
    };

    const filtered = bookmarks.filter(b => {
        if (filter === 'all') return true;
        return filter === 'anime' ? b.category === 'anime' : b.category === 'donghua';
    });

    if (!user) return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24" style={{ background: 'var(--bg)' }}>
            <div className="text-5xl mb-4 animate-float">❤️</div>
            <h2 className="text-lg font-black text-white mb-2">Login untuk lihat My List</h2>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--muted)' }}>Simpan anime favorit per akun</p>
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
                    <h1 className="text-sm font-bold text-white">❤️ My List</h1>
                    {bookmarks.length > 0 && (
                        <button onClick={clearAll} className="p-2 rounded-xl" style={{ color: '#fa6d9a' }}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                <div className="px-4 pb-3 flex gap-2">
                    {[['all', 'Semua'], ['anime', 'Anime'], ['donghua', 'Donghua']].map(([id, label]) => (
                        <button key={id} onClick={() => setFilter(id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={filter === id
                                ? { background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', color: 'white' }
                                : { background: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 px-6">
                    <div className="text-6xl mb-4 animate-float">🎌</div>
                    <h3 className="text-lg font-black text-white mb-2">
                        {bookmarks.length === 0 ? 'My List kosong' : `Tidak ada ${filter}`}
                    </h3>
                    <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
                        {bookmarks.length === 0 ? 'Tandai anime favorit kamu!' : `Belum ada ${filter} di My List`}
                    </p>
                </div>
            ) : (
                <div className="px-4 py-4">
                    <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted)' }}>{filtered.length} tersimpan</p>
                    <div className="grid grid-cols-2 gap-3">
                        {filtered.map(item => (
                            <div key={item.url} className="rounded-2xl overflow-hidden animate-fade-in relative" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                <button onClick={() => navigate(`/detail/${item.category}/${encodeURIComponent(item.url)}`)} className="w-full">
                                    <div className="relative aspect-[3/4]">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover"
                                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=12121f&color=7c6dfa&size=400`; }} />
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,7,17,0.9), transparent 50%)' }} />
                                        <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-lg"
                                            style={{ background: item.category === 'donghua' ? '#fa6d6d' : '#7c6dfa', color: 'white' }}>
                                            {item.category === 'donghua' ? 'Donghua' : 'Anime'}
                                        </span>
                                        <p className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white line-clamp-2 text-left">{item.title}</p>
                                    </div>
                                </button>
                                <button onClick={() => remove(item.url)}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(250,109,154,0.8)' }}>
                                    <Trash2 size={12} className="text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListPage;
