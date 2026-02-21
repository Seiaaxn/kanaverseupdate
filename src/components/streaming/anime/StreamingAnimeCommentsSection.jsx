import { useState, useMemo, useEffect } from 'react';
import { ThumbsUp, Send, ArrowUpDown, MessageCircle, Reply, X, CornerDownRight, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLevelInfo, ROLES, getStoredUsers } from '../../../utils/userSystem';
import {
  isFirebaseConfigured,
  fetchCommentsFromFirebase,
  saveCommentToFirebase,
  updateLikeInFirebase,
  pollComments,
  fetchUserStatsFromFirebase,
} from '../../../services/firebase';

const COMMENTS_KEY = 'animeplay_comments';
const AUTH_KEY = 'animeplay_auth';

const getUser = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; } };

const loadLocal = (key) => {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
    return (all[key] || []).map(c => ({ ...c, createdAt: new Date(c.createdAt) }));
  } catch { return []; }
};

const saveLocal = (key, comments) => {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
    all[key] = comments.map(c => ({ ...c, createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt }));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  } catch {}
};

const timeAgo = (date) => {
  const diff = Date.now() - (date instanceof Date ? date.getTime() : new Date(date).getTime());
  if (isNaN(diff)) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja'; if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
};

const AdminName = ({ name }) => {
  const colors = ['#ff4444', '#ff8800', '#ffdd00', '#00cc44', '#00aaff', '#8844ff', '#ff44cc'];
  return (
    <span className="font-bold text-xs" style={{ display: 'inline-flex', gap: '0' }}>
      {name.split('').map((ch, i) => (
        <span key={i} style={{ color: colors[i % colors.length], animation: `rainbow ${colors.length * 0.15}s linear ${i * 0.15}s infinite` }}>{ch}</span>
      ))}
    </span>
  );
};

// ── Avatar: foto profil / emoji / inisial ──────────────────────────────────
const Avatar = ({ user, size = 7 }) => {
  const isAdmin = user?.role === 'admin';
  const isMod = user?.role === 'mod';
  const px = size * 4;
  const bg = isAdmin ? 'linear-gradient(135deg,#7c6dfa,#fa6d9a)'
    : isMod ? 'linear-gradient(135deg,#6dfabc,#6daefa)'
    : 'rgba(124,109,250,0.18)';
  return (
    <div style={{ width: px, height: px, minWidth: px, background: bg }}
      className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
      {(user?.avatarFile || (user?.avatarIsFile && user?.avatar)) ? (
        <img src={user.avatarFile || user.avatar} className="w-full h-full object-cover" alt="" />
      ) : user?.avatar && !user?.avatarIsFile ? (
        <span style={{ fontSize: px * 0.46, lineHeight: 1 }}>{user.avatar}</span>
      ) : (
        <span className="font-bold text-white" style={{ fontSize: px * 0.38 }}>
          {((user?.name || user?.username || '?').charAt(0)).toUpperCase()}
        </span>
      )}
    </div>
  );
};

// ── Modal profil user ──────────────────────────────────────────────────────
// commentData berisi avatarFile & avatar langsung dari komentar (sudah tersimpan di Firebase)
const UserProfileModal = ({ userId, onClose, commentData }) => {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null); // data dari Firebase
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1. Coba dari localStorage (perangkat sendiri / akun sendiri)
      const localUser = getStoredUsers().find(u => u.id === userId);
      if (localUser) {
        setProfile(localUser);
        try {
          const h = JSON.parse(localStorage.getItem(`animeplay_history_${userId}`) || '[]');
          setHistory(h.slice(0, 5));
          const bk = JSON.parse(localStorage.getItem(`animeplay_bookmarks_${userId}`) || '[]');
          setStats({ xp: localUser.xp || 0, bookmarkCount: bk.length, historyCount: h.length });
        } catch {}
      }

      // 2. Ambil dari Firebase untuk data terkini (termasuk profil orang lain)
      if (isFirebaseConfigured()) {
        const remote = await fetchUserStatsFromFirebase(userId);
        if (remote) {
          // Merge: Firebase adalah sumber kebenaran untuk stats
          setStats({
            xp: remote.xp || 0,
            bookmarkCount: remote.bookmarkCount || 0,
            historyCount: remote.historyCount || 0,
          });
          if (remote.recentHistory?.length) setHistory(remote.recentHistory.slice(0, 5));
          // Jika tidak ada di localStorage (profil orang lain), set dari Firebase
          if (!localUser) {
            setProfile({
              username: remote.username || commentData?.name || 'User',
              role: remote.role || commentData?.role || 'user',
              xp: remote.xp || 0,
              avatar: remote.avatar || commentData?.avatar || null,
              avatarIsFile: remote.avatarIsFile || !!commentData?.avatarFile,
              avatarFile: commentData?.avatarFile || null,
              customBadge: remote.customBadge || null,
            });
          } else {
            // Update xp dari Firebase untuk akurasi
            setProfile(p => ({ ...p, xp: remote.xp ?? p?.xp ?? 0, customBadge: remote.customBadge ?? p?.customBadge }));
          }
        } else if (!localUser && commentData) {
          // Firebase belum dikonfigurasi / user belum sync — fallback ke commentData
          setProfile({
            username: commentData.name,
            role: commentData.role || 'user',
            xp: 0,
            avatar: commentData.avatar,
            avatarIsFile: !!commentData.avatarFile,
            avatarFile: commentData.avatarFile,
          });
        }
      } else if (!localUser && commentData) {
        setProfile({
          username: commentData.name,
          role: commentData.role || 'user',
          xp: 0,
          avatar: commentData.avatar,
          avatarIsFile: !!commentData.avatarFile,
          avatarFile: commentData.avatarFile,
        });
      }

      setLoading(false);
    };
    load();
  }, [userId]);

  if (!profile && !loading) return null;
  if (!profile) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="p-6 rounded-3xl" style={{ background: 'var(--surface)' }}>
        <p className="text-xs text-white animate-pulse">Memuat profil...</p>
      </div>
    </div>
  );

  const xpToShow = stats?.xp ?? profile.xp ?? 0;
  const levelData = getLevelInfo(xpToShow).current;
  const roleInfo = ROLES[profile.role || 'user'] || ROLES.user;
  // Untuk tampilan stats, gunakan data Firebase jika ada, fallback localStorage
  const bookmarkCount = stats?.bookmarkCount ?? 0;
  const historyCount = stats?.historyCount ?? history.length;

  // Foto profil: prioritaskan avatarFile dari komentar, lalu profile.avatar jika avatarIsFile
  const photoSrc = commentData?.avatarFile || profile.avatarFile || (profile.avatarIsFile ? profile.avatar : null);
  const emojiAvatar = !photoSrc ? (commentData?.avatar || (!profile.avatarIsFile ? profile.avatar : null)) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-sm p-5 rounded-3xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Profil User</p>
          <button onClick={onClose} style={{ color: 'var(--muted)' }}><X size={16} /></button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: levelData.gradient }}>
            {photoSrc
              ? <img src={photoSrc} className="w-full h-full object-cover" alt="" />
              : emojiAvatar
              ? <div className="w-full h-full flex items-center justify-center text-3xl">{emojiAvatar}</div>
              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{profile.username?.charAt(0)?.toUpperCase() || '?'}</div>
            }
          </div>
          <div>
            <p className="font-bold text-white text-base">{profile.username}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className={`level-badge ${roleInfo.className} text-[10px]`}>{roleInfo.icon} {roleInfo.label}</span>
              <span className="level-badge text-[10px]" style={{ background: levelData.gradient, color: 'white' }}>Lv.{levelData.level} {levelData.name}</span>
              {(profile.customBadge || profile.customBadgeData) && (() => {
                // Support badge preset maupun badge kustom buatan admin
                const BADGES = [
                  {id:'early',label:'Early Bird',icon:'🐣',color:'#fac96d',bg:'rgba(250,201,109,0.15)'},
                  {id:'og',label:'OG Member',icon:'🏅',color:'#ffd700',bg:'rgba(255,215,0,0.15)'},
                  {id:'verified',label:'Verified',icon:'✅',color:'#6dfabc',bg:'rgba(109,250,188,0.15)'},
                  {id:'otaku',label:'True Otaku',icon:'🎌',color:'#7c6dfa',bg:'rgba(124,109,250,0.15)'},
                  {id:'legend',label:'Legend',icon:'⚡',color:'#fa6d9a',bg:'rgba(250,109,154,0.15)'},
                  {id:'creator',label:'Creator',icon:'🎨',color:'#f59e0b',bg:'rgba(245,158,11,0.15)'},
                  {id:'tester',label:'Beta Tester',icon:'🧪',color:'#06b6d4',bg:'rgba(6,182,212,0.15)'},
                  {id:'supporter',label:'Supporter',icon:'💎',color:'#a855f7',bg:'rgba(168,85,247,0.15)'},
                  {id:'fire',label:'Hot',icon:'🔥',color:'#f97316',bg:'rgba(249,115,22,0.15)'},
                  {id:'star',label:'Star',icon:'🌟',color:'#ffd700',bg:'rgba(255,215,0,0.12)'},
                  {id:'champion',label:'Champion',icon:'🏆',color:'#00f0ff',bg:'rgba(0,240,255,0.12)'},
                ];
                const bd = profile.customBadgeData || BADGES.find(b => b.id === profile.customBadge);
                return bd && bd.id ? (
                  <span className="level-badge text-[10px]" style={{background:bd.bg,color:bd.color}}>{bd.icon} {bd.label}</span>
                ) : null;
              })()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Total XP', value: xpToShow.toLocaleString(), color: '#7c6dfa' },
            { label: 'My List', value: bookmarkCount, color: '#fa6d9a' },
            { label: 'Ditonton', value: historyCount, color: '#fac96d' },
          ].map(s => (
            <div key={s.label} className="p-2 rounded-xl text-center" style={{ background: 'var(--card)' }}>
              <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
        {history.length > 0 && (
          <div>
            <p className="text-[10px] font-bold mb-2" style={{ color: 'var(--muted)' }}>HISTORY TERBARU</p>
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--card)' }}>
                  {h.image && <img src={h.image} className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">{h.title}</p>
                    <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{h.episodeTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Satu item komentar ─────────────────────────────────────────────────────
const CommentItem = ({ c, user, allComments, onLike, onReply, onReplyRemove, activeReplies = [], depth = 0 }) => {
  const replyActive = activeReplies.includes(c.id);
  const role = c.role || 'user';
  const roleInfo = ROLES[role] || ROLES.user;
  const isAdmin = role === 'admin';
  const isMod = role === 'mod';
  const [showProfile, setShowProfile] = useState(false);
  const replies = allComments.filter(r => r.parentId === c.id);
  const avatarUser = { avatarFile: c.avatarFile || null, avatar: c.avatar || null, avatarIsFile: !!c.avatarFile, name: c.name, role: c.role };
  return (
    <>
      {showProfile && c.userId && <UserProfileModal userId={c.userId} onClose={() => setShowProfile(false)} commentData={c} />}
      <div className={`flex gap-2.5 ${depth > 0 ? 'ml-8 mt-2' : 'mt-0'}`}>
        <button onClick={() => c.userId && setShowProfile(true)} className="flex-shrink-0 mt-0.5">
          <Avatar user={avatarUser} size={7} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {isAdmin ? <AdminName name={c.name} /> : isMod
              ? <span className="text-xs font-bold" style={{ color: '#6dfabc' }}>{c.name}</span>
              : <span className="text-xs font-bold text-white">{c.name}</span>}
            {(isAdmin || isMod) && <span className={`level-badge ${roleInfo.className} text-[8px] py-0`}>{roleInfo.icon} {roleInfo.label}</span>}
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{timeAgo(c.createdAt)}</span>
          </div>
          {c.replyTo && (
            <p className="text-[10px] mb-0.5 flex flex-wrap gap-1" style={{ color: 'var(--muted)' }}>
              ↩ {c.replyTo.split(', ').map((name, i) => (
                <span key={i} className="font-semibold" style={{color:'#a78bfa'}}>@{name}</span>
              ))}
            </p>
          )}
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text,#ddd)' }}>{c.comment}</p>
          <div className="flex items-center gap-3 mt-1">
            <button onClick={() => onLike(c.id)}
              className={`flex items-center gap-1 text-[10px] transition-colors ${user && (c.likedBy || []).includes(user.id) ? 'text-primary-400' : 'text-gray-600 hover:text-gray-400'}`}>
              <ThumbsUp size={11} />{c.likes > 0 && c.likes}
            </button>
            {depth === 0 && !replyActive && (
              <button onClick={() => onReply(c)}
                className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-primary-400 transition-colors">
                <Reply size={11} />Reply
              </button>
            )}
            {depth === 0 && replyActive && (
              <button onClick={() => onReplyRemove(c.id)}
                className="flex items-center gap-1 text-[10px] transition-colors" style={{color:'#7c6dfa'}}>
                <Reply size={11} />Balas ✓ <X size={9}/>
              </button>
            )}
          </div>
        </div>
      </div>
      {replies.map(r => <CommentItem key={r.id} c={r} user={user} allComments={allComments} onLike={onLike} onReply={onReply} onReplyRemove={onReplyRemove} activeReplies={activeReplies} depth={depth + 1} />)}
    </>
  );
};

// ── Komponen utama ─────────────────────────────────────────────────────────
const StreamingAnimeCommentsSection = ({ episodeUrl }) => {
  const navigate = useNavigate();
  const user = getUser();
  const episodeKey = episodeUrl || 'default';
  const dbActive = isFirebaseConfigured();

  const [comments, setComments] = useState(() => loadLocal(episodeKey));
  const [newComment, setNewComment] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [replyTo, setReplyTo] = useState(null);       // satu aktif untuk input
  const [replyToList, setReplyToList] = useState([]); // semua yang di-mention
  const [isOnline, setIsOnline] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!dbActive) return;
    let stop = null;
    (async () => {
      const remote = await fetchCommentsFromFirebase(episodeKey);
      if (remote !== null) { setComments(remote); setIsOnline(true); saveLocal(episodeKey, remote); }
      stop = pollComments(episodeKey, (updated) => { setComments(updated); saveLocal(episodeKey, updated); setIsOnline(true); }, 8000);
    })();
    return () => { if (stop) stop(); };
  }, [episodeKey]);

  const topLevel = useMemo(() =>
    [...comments.filter(c => !c.parentId)].sort((a, b) =>
      sortNewest ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
    ), [comments, sortNewest]);

  const handleAdd = async () => {
    if (!newComment.trim() || !user || sending) return;
    setSending(true);
    // Gabungkan semua mention @name di depan komentar
    const mentions = replyToList.length > 0
      ? replyToList.map(r => `@${r.name}`).join(' ') + ' '
      : '';
    const comment = {
      id: Date.now(),
      name: user.username || 'User',
      userId: user.id,
      role: user.role || 'user',
      avatar: !user.avatarIsFile ? user.avatar : null,
      avatarFile: user.avatarIsFile ? user.avatar : null,
      comment: mentions + newComment.trim(),
      createdAt: new Date(),
      likes: 0, likedBy: [],
      parentId: replyTo?.id || null,
      replyTo: replyToList.length > 0 ? replyToList.map(r => r.name).join(', ') : null,
      mentions: replyToList.map(r => r.userId).filter(Boolean),
    };
    const updated = [comment, ...comments];
    setComments(updated); saveLocal(episodeKey, updated);
    setNewComment(''); setReplyTo(null); setReplyToList([]);
    if (dbActive) { const ok = await saveCommentToFirebase(episodeKey, comment); if (!ok) setIsOnline(false); }
    setSending(false);
  };

  const handleLike = async (id) => {
    if (!user) return;
    const updated = comments.map(c => {
      if (c.id !== id) return c;
      const likedBy = c.likedBy || []; const already = likedBy.includes(user.id);
      return { ...c, likes: already ? c.likes - 1 : c.likes + 1, likedBy: already ? likedBy.filter(u => u !== user.id) : [...likedBy, user.id] };
    });
    setComments(updated); saveLocal(episodeKey, updated);
    if (dbActive) { const uc = updated.find(c => c.id === id); await updateLikeInFirebase(episodeKey, id, uc); }
  };

  const meAvatar = user ? {
    avatarFile: user.avatarIsFile ? user.avatar : null,
    avatar: !user.avatarIsFile ? user.avatar : null,
    avatarIsFile: user.avatarIsFile,
    name: user.username,
    role: user.role,
  } : null;

  return (
    <div className="mb-8 mt-4">
      <style>{`@keyframes rainbow{0%,100%{filter:hue-rotate(0deg)}50%{filter:hue-rotate(180deg)}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={15} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-white">
            Comments {comments.length > 0 && <span className="text-gray-500 font-normal">({comments.length})</span>}
          </h3>
          {dbActive && (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: isOnline ? 'rgba(110,250,188,0.1)' : 'rgba(255,100,100,0.1)', color: isOnline ? '#6dfabc' : '#fa6d6d' }}>
              {isOnline ? <Wifi size={9} /> : <WifiOff size={9} />}{isOnline ? 'Live' : 'Offline'}
            </span>
          )}
        </div>
        {comments.length > 0 && (
          <button onClick={() => setSortNewest(!sortNewest)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowUpDown size={13} />{sortNewest ? 'Newest' : 'Oldest'}
          </button>
        )}
      </div>

      {/* Input komentar */}
      {user ? (
        <div className="mb-5">
          {replyToList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(124,109,250,0.08)', border: '1px solid rgba(124,109,250,0.15)' }}>
              <CornerDownRight size={11} className="text-primary-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-400">Balas:</span>
              {replyToList.map(r => (
                <span key={r.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(124,109,250,0.2)', color: '#a78bfa' }}>
                  @{r.name}
                  <button onClick={() => { setReplyToList(prev => prev.filter(x => x.id !== r.id)); if (replyTo?.id === r.id) setReplyTo(null); }}
                    className="hover:text-white ml-0.5"><X size={9}/></button>
                </span>
              ))}
              <button onClick={() => { setReplyTo(null); setReplyToList([]); }} className="ml-auto text-[10px]" style={{color:'var(--muted)'}}>Hapus semua</button>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Avatar user={meAvatar} size={8} />
            <div className="flex-1 flex items-center gap-2 bg-dark-card border border-white/8 rounded-xl px-3 py-2 focus-within:border-white/15 transition-colors">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAdd()}
                placeholder={replyToList.length > 0 ? `Balas ${replyToList.map(r=>r.name).join(', ')}...` : 'Tulis komentar...'}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none" />
              <button onClick={handleAdd} disabled={!newComment.trim() || sending}
                className="p-1.5 rounded-lg bg-primary-400 text-black hover:bg-primary-300 transition-colors disabled:opacity-30 flex-shrink-0">
                <Send size={13} />
              </button>
            </div>
          </div>
          {!dbActive && (
            <p className="text-[10px] mt-1.5 ml-10" style={{ color: 'var(--muted)' }}>
              ⚠️ Mode lokal — isi FIREBASE_DB_URL di <code>src/services/firebase.js</code> agar sinkron antar HP
            </p>
          )}
        </div>
      ) : (
        <button onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 bg-dark-card border border-white/8 rounded-xl py-3 text-sm text-gray-400 hover:border-white/15 mb-5 transition-all">
          <MessageCircle size={15} /> Login untuk berkomentar
        </button>
      )}

      {/* List komentar */}
      {topLevel.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={28} className="text-gray-800 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevel.map(c => (
            <CommentItem key={c.id} c={c} user={user} allComments={comments} onLike={handleLike} onReply={(c) => {
              setReplyTo({ id: c.id, name: c.name });
              setReplyToList(prev => prev.find(r => r.id === c.id) ? prev : [...prev, { id: c.id, name: c.name, userId: c.userId }]);
            }}
            onReplyRemove={(id) => {
              setReplyToList(prev => prev.filter(r => r.id !== id));
              if (replyTo?.id === id) setReplyTo(null);
            }}
            activeReplies={replyToList.map(r => r.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamingAnimeCommentsSection;

