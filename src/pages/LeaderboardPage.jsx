import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Crown, Medal, Star, ChevronLeft, RefreshCw, Flame } from 'lucide-react';
import { getUser, getLevelInfo, ROLES, generateLevel } from '../utils/userSystem';
import { fetchLeaderboard, isFirebaseConfigured } from '../services/firebase';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

const getRankStyle = (rank) => {
  if (rank === 1) return { bg: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0f00', icon: '👑' };
  if (rank === 2) return { bg: 'linear-gradient(135deg,#c0c0c0,#888)', color: '#111', icon: '🥈' };
  if (rank === 3) return { bg: 'linear-gradient(135deg,#cd7f32,#8b4513)', color: '#fff', icon: '🥉' };
  return { bg: 'var(--card)', color: 'var(--muted)', icon: `#${rank}` };
};

const Avatar = ({ user, size = 10 }) => {
  const px = size * 4;
  const isAdmin = user?.role === 'admin';
  const isMod = user?.role === 'mod';
  const bg = isAdmin ? 'linear-gradient(135deg,#7c6dfa,#fa6d9a)'
    : isMod ? 'linear-gradient(135deg,#6dfabc,#6daefa)'
    : 'rgba(124,109,250,0.2)';
  return (
    <div style={{ width: px, height: px, minWidth: px, background: bg }}
      className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
      {(user?.avatarFile || (user?.avatarIsFile && user?.avatar)) ? (
        <img src={user.avatarFile || user.avatar} className="w-full h-full object-cover" alt="" />
      ) : user?.avatar && !user?.avatarIsFile ? (
        <span style={{ fontSize: px * 0.45 }}>{user.avatar}</span>
      ) : (
        <span className="font-black text-white" style={{ fontSize: px * 0.38 }}>
          {(user?.username || '?').charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const now = new Date();
  const [tab, setTab] = useState('monthly'); // 'monthly' | 'alltime'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastReset, setLastReset] = useState(null);
  const [myRank, setMyRank] = useState(null);

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  useEffect(() => {
    loadLeaderboard();
  }, [tab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const data = await fetchLeaderboard(tab === 'monthly' ? monthKey : 'alltime');
        if (data) {
          const sorted = Object.values(data)
            .sort((a, b) => (b.xp || 0) - (a.xp || 0))
            .slice(0, 50);
          setEntries(sorted);
          if (currentUser) {
            const rank = sorted.findIndex(e => e.userId === currentUser.id) + 1;
            setMyRank(rank > 0 ? rank : null);
          }
          setLastReset(data._resetAt || null);
          setLoading(false);
          return;
        }
      }
      // Fallback: local users
      const users = JSON.parse(localStorage.getItem('animeplay_users') || '[]');
      const sorted = users
        .map(u => ({ userId: u.id, username: u.username, xp: u.xp || 0, role: u.role || 'user', avatar: u.avatar, avatarIsFile: u.avatarIsFile }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 50);
      setEntries(sorted);
      if (currentUser) {
        const rank = sorted.findIndex(e => e.userId === currentUser.id) + 1;
        setMyRank(rank > 0 ? rank : null);
      }
    } catch (e) {
      console.warn('Leaderboard error:', e);
    }
    setLoading(false);
  };

  // Hitung sisa waktu sampai reset bulan depan
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysLeft = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="px-4 flex items-center gap-3" style={{ height: '52px' }}>
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl" style={{ color: 'var(--muted)' }}>
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-sm font-bold text-white flex-1">🏆 Leaderboard</h1>
          <button onClick={loadLeaderboard} className="p-1.5 rounded-xl" style={{ color: 'var(--muted)' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Tab */}
        <div className="flex gap-2 mb-4 p-1 rounded-2xl" style={{ background: 'var(--card)' }}>
          {[
            { key: 'monthly', label: `🗓️ ${monthLabel}` },
            { key: 'alltime', label: '⭐ All Time' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === t.key ? 'linear-gradient(135deg,#7c6dfa,#fa6d9a)' : 'transparent',
                color: tab === t.key ? 'white' : 'var(--muted)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Info reset */}
        {tab === 'monthly' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
            style={{ background: 'rgba(250,109,154,0.08)', border: '1px solid rgba(250,109,154,0.15)' }}>
            <Flame size={13} style={{ color: '#fa6d9a' }} />
            <p className="text-[11px]" style={{ color: '#fa6d9a' }}>
              Reset otomatis setiap awal bulan · Sisa <span className="font-black">{daysLeft} hari</span>
            </p>
          </div>
        )}

        {/* Posisi saya */}
        {myRank && currentUser && (
          <div className="flex items-center gap-3 p-3 rounded-2xl mb-4"
            style={{ background: 'rgba(124,109,250,0.12)', border: '1px solid rgba(124,109,250,0.2)' }}>
            <span className="text-lg font-black" style={{ color: '#7c6dfa', minWidth: 28 }}>#{myRank}</span>
            <Avatar user={{ ...currentUser, avatarFile: currentUser.avatarIsFile ? currentUser.avatar : null }} size={9} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.username}</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Posisi kamu bulan ini</p>
            </div>
            <span className="text-xs font-black" style={{ color: '#7c6dfa' }}>
              {(currentUser.xp || 0).toLocaleString()} XP
            </span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--card)' }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={40} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
            <p className="text-sm font-bold text-white mb-1">Leaderboard Kosong</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {isFirebaseConfigured() ? 'Belum ada data bulan ini' : 'Setup Firebase untuk leaderboard antar user'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Top 3 special */}
            {entries.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Urutan: 2nd, 1st, 3rd */}
                {[entries[1], entries[0], entries[2]].map((entry, i) => {
                  if (!entry) return <div key={i} />;
                  const ranks = [2, 1, 3];
                  const rank = ranks[i];
                  const rs = getRankStyle(rank);
                  const lv = getLevelInfo(entry.xp || 0).current;
                  return (
                    <div key={entry.userId}
                      className={`flex flex-col items-center p-3 rounded-2xl ${rank === 1 ? 'scale-105' : ''}`}
                      style={{ background: 'var(--card)', border: `1px solid var(--border)`, position: 'relative' }}>
                      <span className="text-xl mb-1">{rs.icon}</span>
                      <Avatar user={entry} size={10} />
                      <p className="text-[10px] font-bold text-white mt-1.5 truncate w-full text-center">{entry.username}</p>
                      <span className="level-badge text-[8px] mt-1" style={{ background: lv.gradient, color: 'white' }}>
                        Lv.{lv.level}
                      </span>
                      <p className="text-[10px] font-black mt-1" style={{ color: rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32' }}>
                        {(entry.xp || 0).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rank 4+ */}
            {entries.slice(3).map((entry, i) => {
              const rank = i + 4;
              const lv = getLevelInfo(entry.xp || 0).current;
              const roleInfo = ROLES[entry.role || 'user'] || ROLES.user;
              const isMe = currentUser?.id === entry.userId;
              const bd = entry.customBadgeData || null;
              return (
                <div key={entry.userId}
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                  style={{
                    background: isMe ? 'rgba(124,109,250,0.12)' : 'var(--card)',
                    border: isMe ? '1px solid rgba(124,109,250,0.3)' : '1px solid var(--border)',
                  }}>
                  <span className="text-sm font-black w-7 text-center" style={{ color: 'var(--muted)' }}>#{rank}</span>
                  <Avatar user={entry} size={8} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-white truncate">{entry.username}</p>
                      {isMe && <span className="text-[9px] px-1 rounded" style={{ background: 'rgba(124,109,250,0.3)', color: '#7c6dfa' }}>Kamu</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <span className="level-badge text-[8px] py-0" style={{ background: lv.gradient, color: 'white' }}>Lv.{lv.level}</span>
                      {(entry.role === 'admin' || entry.role === 'mod' || entry.role === 'vip') && (
                        <span className={`level-badge ${roleInfo.className} text-[8px] py-0`}>{roleInfo.icon}</span>
                      )}
                      {bd && <span className="level-badge text-[8px] py-0" style={{ background: bd.bg, color: bd.color }}>{bd.icon}</span>}
                    </div>
                  </div>
                  <p className="text-xs font-black" style={{ color: '#7c6dfa' }}>
                    {(entry.xp || 0).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

              
