import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Edit2, Check, X, ChevronRight, Camera, Users, Shield, Star, Zap, Award, Trophy, Plus, Minus } from 'lucide-react';
import { getUser, updateUser, getStoredUsers, updateUserById, getLevelInfo, LEVELS, ROLES, getUserBookmarks, getUserHistory, generateLevel } from '../utils/userSystem';
import { syncUserNow, syncSpecificUser } from '../services/firebase';

// ── Badge kustom dengan pilihan warna ──────────────────────────────────────
const BADGE_COLORS = [
  { label: 'Ungu',    color: '#a855f7', bg: 'rgba(168,85,247,0.18)'  },
  { label: 'Pink',    color: '#fa6d9a', bg: 'rgba(250,109,154,0.18)' },
  { label: 'Biru',    color: '#6daefa', bg: 'rgba(109,174,250,0.18)' },
  { label: 'Hijau',   color: '#6dfabc', bg: 'rgba(109,250,188,0.18)' },
  { label: 'Kuning',  color: '#fac96d', bg: 'rgba(250,201,109,0.18)' },
  { label: 'Emas',    color: '#ffd700', bg: 'rgba(255,215,0,0.18)'   },
  { label: 'Merah',   color: '#ef4444', bg: 'rgba(239,68,68,0.18)'   },
  { label: 'Cyan',    color: '#06b6d4', bg: 'rgba(6,182,212,0.18)'   },
  { label: 'Putih',   color: '#ffffff', bg: 'rgba(255,255,255,0.10)' },
  { label: 'Orange',  color: '#f97316', bg: 'rgba(249,115,22,0.18)'  },
];

const BADGE_ICONS = ['🏅','⭐','💎','👑','⚡','🎌','🧪','🎨','🐣','🔥','🌙','🦋','🎖️','🏆','✨','🦄','🌟','💫','🎯','🚀'];

const CUSTOM_BADGES = [
  { id: null,        label: 'Tidak Ada',    icon: '—',   color: '#555',    bg: 'rgba(255,255,255,0.04)' },
  { id: 'early',     label: 'Early Bird',   icon: '🐣',  color: '#fac96d', bg: 'rgba(250,201,109,0.15)' },
  { id: 'og',        label: 'OG Member',    icon: '🏅',  color: '#ffd700', bg: 'rgba(255,215,0,0.15)'   },
  { id: 'verified',  label: 'Verified',     icon: '✅',  color: '#6dfabc', bg: 'rgba(109,250,188,0.15)' },
  { id: 'otaku',     label: 'True Otaku',   icon: '🎌',  color: '#7c6dfa', bg: 'rgba(124,109,250,0.15)' },
  { id: 'legend',    label: 'Legend',       icon: '⚡',  color: '#fa6d9a', bg: 'rgba(250,109,154,0.15)' },
  { id: 'creator',   label: 'Creator',      icon: '🎨',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  { id: 'tester',    label: 'Beta Tester',  icon: '🧪',  color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'   },
  { id: 'supporter', label: 'Supporter',    icon: '💎',  color: '#a855f7', bg: 'rgba(168,85,247,0.15)'  },
  { id: 'fire',      label: 'Hot',          icon: '🔥',  color: '#f97316', bg: 'rgba(249,115,22,0.15)'  },
  { id: 'star',      label: 'Star',         icon: '🌟',  color: '#ffd700', bg: 'rgba(255,215,0,0.12)'   },
  { id: 'champion',  label: 'Champion',     icon: '🏆',  color: '#00f0ff', bg: 'rgba(0,240,255,0.12)'   },
];

const AUTH_KEY = 'animeplay_auth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(getUser);
  // Sync ke Firebase saat halaman profil dibuka
  useState(() => { setTimeout(() => syncUserNow(), 300); });
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username||'');
  const [showLogout, setShowLogout] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [editingXP, setEditingXP] = useState(null); // userId
  const [xpInput, setXpInput] = useState('');
  const [editingLevel, setEditingLevel] = useState(null); // userId
  const [levelInput, setLevelInput] = useState('');
  const [editingBadge, setEditingBadge] = useState(null); // userId
  const [badgeTab, setBadgeTab] = useState('preset'); // 'preset' | 'custom'
  const [customBadgeLabel, setCustomBadgeLabel] = useState('');
  const [customBadgeIcon, setCustomBadgeIcon] = useState('🏅');
  const [customBadgeColor, setCustomBadgeColor] = useState(BADGE_COLORS[0]);

  const refreshUser = () => { const u=getUser(); setUser(u); if(u) doSync(u); };

  // Sync stats ke Firebase saat halaman profil dibuka
  const doSync = (u) => {
    if (!u || !isFirebaseConfigured()) return;
    const history = getUserHistory();
    const bookmarks = getUserBookmarks();
    syncUserStatsToFirebase(u.id, {
      xp: u.xp || 0,
      bookmarkCount: bookmarks.length,
      historyCount: history.length,
      recentHistory: history.slice(0, 5),
      username: u.username,
      role: u.role || 'user',
      avatar: u.avatar || null,
      avatarIsFile: u.avatarIsFile || false,
      customBadge: u.customBadge || null,
    });
  };

  const handleSave = () => {
    if (!editUsername.trim()) return;
    const updated = updateUser({ username: editUsername.trim() });
    if (updated) setUser(updated);
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null); setShowLogout(false);
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const updated = updateUser({ avatar: dataUrl, avatarIsFile: true });
      if (updated) setUser(updated);
    };
    reader.readAsDataURL(file);
  };

  const openAdmin = () => { setAllUsers(getStoredUsers()); setShowAdminPanel(true); };

  const handleRoleChange = (userId, newRole) => {
    updateUserById(userId, { role: newRole });
    setAllUsers(getStoredUsers()); refreshUser();
    syncSpecificUser(userId); syncUserNow();
  };

  const handleXPChange = (userId) => {
    const xp = parseInt(xpInput);
    if (isNaN(xp) || xp < 0) return;
    updateUserById(userId, { xp });
    setAllUsers(getStoredUsers()); refreshUser();
    syncSpecificUser(userId); syncUserNow();
    setEditingXP(null); setXpInput('');
  };

  // Set XP langsung dari level yang diinput
  const handleLevelChange = (userId) => {
    const lv = parseInt(levelInput);
    if (isNaN(lv) || lv < 1) return;
    const levelData = generateLevel(Math.min(lv, 999999));
    updateUserById(userId, { xp: levelData.minXP });
    setAllUsers(getStoredUsers()); refreshUser();
    syncSpecificUser(userId); syncUserNow();
    setEditingLevel(null); setLevelInput('');
  };

  const handleBadgeChange = (userId, badgeId) => {
    updateUserById(userId, { customBadge: badgeId, customBadgeData: null });
    setAllUsers(getStoredUsers()); refreshUser(); syncSpecificUser(userId); syncUserNow();
    // Tidak tutup panel agar user bisa melihat perubahan langsung
  };

  const handleCustomBadgeSave = (userId) => {
    if (!customBadgeLabel.trim()) return;
    const badgeData = {
      id: 'custom_' + Date.now(),
      label: customBadgeLabel.trim(),
      icon: customBadgeIcon,
      color: customBadgeColor.color,
      bg: customBadgeColor.bg,
    };
    updateUserById(userId, { customBadge: badgeData.id, customBadgeData: badgeData });
    setAllUsers(getStoredUsers()); refreshUser(); syncSpecificUser(userId); syncUserNow();
    // Tidak tutup panel agar user bisa lihat hasilnya langsung
    setCustomBadgeLabel(''); setCustomBadgeIcon('🏅'); setCustomBadgeColor(BADGE_COLORS[0]);
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{background:'var(--bg)'}}>
        <header className="sticky top-0 z-40 glass" style={{borderBottom:'1px solid var(--border)'}}>
          <div className="px-4 flex items-center" style={{height:'52px'}}>
            <h1 className="text-sm font-bold text-white">Profil</h1>
          </div>
        </header>
        <div className="flex flex-col items-center px-6 pt-16 pb-10">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 text-5xl" style={{background:'var(--card)',border:'2px solid var(--border)'}}>🎌</div>
          <h2 className="text-xl font-black text-white mb-2">Halo, Nakama!</h2>
          <p className="text-sm text-center mb-8 leading-relaxed max-w-xs" style={{color:'var(--muted)'}}>
            Login untuk kumpulkan XP, simpan tontonan, dan jadi bagian komunitas!
          </p>
          <button onClick={()=>navigate('/login')}
            className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
            style={{background:'linear-gradient(135deg,#7c6dfa,#fa6d9a)',boxShadow:'0 8px 24px rgba(124,109,250,0.3)'}}>
            🚀 Masuk / Daftar
          </button>
        </div>
      </div>
    );
  }

  const xpInfo = getLevelInfo(user.xp||0);
  const levelData = xpInfo.current;
  const role = user.role||'user';
  const roleInfo = ROLES[role]||ROLES.user;
  const bookmarkCount = getUserBookmarks().length;
  const historyCount = getUserHistory().length;

  return (
    <div className="min-h-screen pb-28 relative" style={{background:'var(--bg)'}}>
      <div className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
        style={{background:`radial-gradient(ellipse at 50% -20%,${levelData.color}44,transparent 70%)`}}/>

      <header className="sticky top-0 z-40 glass" style={{borderBottom:'1px solid var(--border)'}}>
        <div className="px-4 flex items-center justify-between" style={{height:'52px'}}>
          <h1 className="text-sm font-bold text-white">Profil</h1>
          <div className="flex items-center gap-2">
            {(role==='admin'||role==='mod')&&(
              <button onClick={openAdmin}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{background:'rgba(124,109,250,0.15)',color:'#7c6dfa'}}>
                <Users size={12}/> Admin
              </button>
            )}
            <button onClick={()=>setShowLogout(true)} className="p-2 rounded-xl hover:bg-white/5">
              <LogOut size={16} style={{color:'var(--muted)'}}/>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl" style={{background:levelData.gradient}}>
              {user.avatar && user.avatarIsFile ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover"/>
              ) : user.avatar ? (
                <div className="w-full h-full flex items-center justify-center text-5xl">{user.avatar}</div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🎌</div>
              )}
            </div>
            <button onClick={()=>fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl flex items-center justify-center transition-all active:scale-90"
              style={{background:'var(--card)',border:'2px solid var(--bg)'}}>
              <Camera size={13} style={{color:'var(--muted)'}}/>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile}/>
          </div>

          {editing ? (
            <div className="flex items-center gap-2 mb-2">
              <input value={editUsername} onChange={e=>setEditUsername(e.target.value)}
                className="text-center text-lg font-black text-white bg-transparent outline-none border-b-2 pb-1"
                style={{borderColor:'#7c6dfa',width:'160px'}} autoFocus maxLength={20}/>
              <button onClick={handleSave} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(109,250,188,0.2)',color:'#6dfabc'}}><Check size={14}/></button>
              <button onClick={()=>setEditing(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.05)',color:'var(--muted)'}}><X size={14}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-black text-white">{user.username}</h2>
              <button onClick={()=>{setEditUsername(user.username);setEditing(true);}} style={{color:'var(--muted)'}}><Edit2 size={13}/></button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className={`level-badge ${roleInfo.className}`}>{roleInfo.icon} {roleInfo.label}</span>
            <span className="level-badge" style={{background:levelData.gradient,color:'white'}}>
              Lv.{levelData.level} {levelData.name}
            </span>
            {(user.customBadge || user.customBadgeData) && (() => {
              const bd = user.customBadgeData || CUSTOM_BADGES.find(b => b.id === user.customBadge);
              return bd && bd.id ? (
                <span className="level-badge" style={{background: bd.bg, color: bd.color}}>
                  {bd.icon} {bd.label}
                </span>
              ) : null;
            })()}
          </div>
        </div>

        {/* XP Bar */}
        <div className="p-4 rounded-3xl mb-5" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-white">⚡ {(user.xp||0).toLocaleString()} XP</p>
              <p className="text-[10px] mt-0.5" style={{color:'var(--muted)'}}>
                {xpInfo.next?`${xpInfo.xpInLevel.toLocaleString()} / ${xpInfo.xpToNext.toLocaleString()} XP ke Lv.${xpInfo.next.level}`:'Level Maksimum! 🏆'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold" style={{color:levelData.color}}>{levelData.name}</p>
              {xpInfo.next&&<p className="text-[10px]" style={{color:'var(--muted)'}}>→ Lv.{xpInfo.next.level}</p>}
            </div>
          </div>
          <div className="xp-bar"><div className="xp-fill" style={{width:`${xpInfo.progress}%`}}/></div>
          <div className="flex justify-between mt-2">
            {LEVELS.slice(0,7).map(lv=>(
              <div key={lv.level} className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{background:(user.xp||0)>=lv.minXP?lv.color:'rgba(255,255,255,0.1)'}}/>
                <span className="text-[8px]" style={{color:'var(--muted)'}}>{lv.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {icon:'⚡',label:'Total XP',value:(user.xp||0).toLocaleString(),color:'#7c6dfa'},
            {icon:'❤️',label:'My List',value:bookmarkCount,color:'#fa6d9a'},
            {icon:'📺',label:'Ditonton',value:historyCount,color:'#fac96d'},
          ].map(stat=>(
            <div key={stat.label} className="p-3 rounded-2xl text-center" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <p className="text-base font-black" style={{color:stat.color}}>{stat.value}</p>
              <p className="text-[9px] font-medium" style={{color:'var(--muted)'}}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        {[
          {icon:'❤️',label:'My List',path:'/mylist',color:'#fa6d9a'},
          {icon:'📺',label:'History Tontonan',path:'/history',color:'#fac96d'},
          {icon:'🏆',label:'Leaderboard',path:'/leaderboard',color:'#ffd700'},
        ].map(item=>(
          <button key={item.path} onClick={()=>navigate(item.path)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl mb-2 transition-all active:scale-97"
            style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-semibold flex-1 text-left text-white">{item.label}</span>
            <ChevronRight size={15} style={{color:'var(--muted)'}}/>
          </button>
        ))}

        <button onClick={()=>setShowLogout(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold mt-4 transition-all active:scale-97"
          style={{border:'1px solid rgba(250,109,154,0.2)',color:'#fa6d9a'}}>
          <LogOut size={15}/> Keluar dari Akun
        </button>
      </div>

      {/* Admin Panel */}
      {showAdminPanel&&(
        <div className="fixed inset-0 z-50 flex flex-col" style={{background:'var(--bg)'}}>
          <div className="flex items-center justify-between px-4 py-3 glass" style={{borderBottom:'1px solid var(--border)'}}>
            <h2 className="text-sm font-bold text-white">👑 Admin Panel</h2>
            <button onClick={()=>setShowAdminPanel(false)} style={{color:'var(--muted)'}}><X size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs font-bold mb-3" style={{color:'var(--muted)'}}>SEMUA PENGGUNA ({allUsers.length})</p>
            {allUsers.map(u=>{
              const uXP=getLevelInfo(u.xp||0);const uRole=u.role||'user';
              const uBadge=u.customBadgeData || CUSTOM_BADGES.find(b=>b.id===(u.customBadge||null));
              return (
                <div key={u.id} className="p-4 rounded-2xl" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
                  {/* Header user */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0" style={{background:uXP.current.gradient}}>
                      {u.avatar&&u.avatarIsFile?<img src={u.avatar} className="w-full h-full object-cover"/>:
                       u.avatar?<div className="w-full h-full flex items-center justify-center text-xl">{u.avatar}</div>:
                       <div className="w-full h-full flex items-center justify-center text-xl font-black text-white">{u.username?.charAt(0)?.toUpperCase()||'?'}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{u.username}</p>
                      <p className="text-[10px] truncate" style={{color:'var(--muted)'}}>{u.email}</p>
                    </div>
                    <span className="level-badge text-[9px]" style={{background:uXP.current.gradient,color:'white'}}>
                      Lv.{uXP.current.level}
                    </span>
                  </div>

                  {/* XP Control */}
                  <div className="mb-3 p-2.5 rounded-xl" style={{background:'rgba(250,201,109,0.06)'}}>
                    <p className="text-[10px] font-bold mb-1.5" style={{color:'#fac96d'}}>⚡ XP: {(u.xp||0).toLocaleString()}</p>
                    {/* Quick XP buttons */}
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {[100,500,1000,5000].map(amt=>(
                        <button key={amt} onClick={()=>{updateUserById(u.id,{xp:(u.xp||0)+amt});setAllUsers(getStoredUsers());refreshUser();syncSpecificUser(u.id);syncUserNow();}}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{background:'rgba(109,250,188,0.12)',color:'#6dfabc'}}>
                          +{amt.toLocaleString()}
                        </button>
                      ))}
                      {[100,1000].map(amt=>(
                        <button key={-amt} onClick={()=>{const nx=Math.max(0,(u.xp||0)-amt);updateUserById(u.id,{xp:nx});setAllUsers(getStoredUsers());refreshUser();syncSpecificUser(u.id);syncUserNow();}}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{background:'rgba(250,109,154,0.12)',color:'#fa6d9a'}}>
                          -{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    {editingXP===u.id ? (
                      <div className="flex gap-2">
                        <input type="number" value={xpInput} onChange={e=>setXpInput(e.target.value)} placeholder="Set XP tepat"
                          className="flex-1 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                          style={{background:'rgba(0,0,0,0.3)',border:'1px solid rgba(250,201,109,0.3)'}}/>
                        <button onClick={()=>handleXPChange(u.id)} className="px-2 py-1.5 rounded-lg text-xs font-bold" style={{background:'rgba(250,201,109,0.25)',color:'#fac96d'}}>Set</button>
                        <button onClick={()=>{setEditingXP(null);setXpInput('');}} className="px-2 py-1.5 rounded-lg text-xs" style={{color:'var(--muted)'}}>✕</button>
                      </div>
                    ) : (
                      <button onClick={()=>{setEditingXP(u.id);setXpInput(String(u.xp||0));}}
                        className="px-3 py-1 rounded-lg text-xs font-bold" style={{background:'rgba(250,201,109,0.15)',color:'#fac96d'}}>
                        ✏️ Set XP Tepat
                      </button>
                    )}
                  </div>

                  {/* Level Control */}
                  <div className="mb-3 p-2.5 rounded-xl" style={{background:'rgba(109,250,188,0.06)'}}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold" style={{color:'#6dfabc'}}>
                        🎯 Level: <span style={{color:'white'}}>{uXP.current.level}</span> — <span style={{color:uXP.current.color}}>{uXP.current.name}</span>
                      </p>
                      <span className="text-[9px]" style={{color:'var(--muted)'}}>XP: {(u.xp||0).toLocaleString()}</span>
                    </div>
                    {editingLevel===u.id ? (
                      <div>
                        <p className="text-[9px] mb-1.5" style={{color:'var(--muted)'}}>Level 1–20 = nama unik · Level 21+ = tier (Silver, Gold, dst)</p>
                        <div className="flex gap-2 mb-1.5">
                          <input type="number" value={levelInput} onChange={e=>setLevelInput(e.target.value)}
                            placeholder="Masukkan level (mis: 50)" min="1" max="999999"
                            className="flex-1 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                            style={{background:'rgba(0,0,0,0.3)',border:'1px solid rgba(109,250,188,0.3)'}}/>
                          <button onClick={()=>handleLevelChange(u.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background:'rgba(109,250,188,0.25)',color:'#6dfabc'}}>
                            ✓ Set
                          </button>
                          <button onClick={()=>{setEditingLevel(null);setLevelInput('');}}
                            className="px-2 py-1.5 rounded-lg text-xs" style={{color:'var(--muted)'}}>✕</button>
                        </div>
                        {levelInput && !isNaN(parseInt(levelInput)) && parseInt(levelInput) >= 1 && (
                          <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{background:'rgba(0,0,0,0.2)'}}>
                            <span className="text-[9px]" style={{color:'var(--muted)'}}>Preview:</span>
                            <span className="level-badge text-[9px]" style={{background:generateLevel(Math.min(parseInt(levelInput),999999)).gradient,color:'white'}}>
                              Lv.{Math.min(parseInt(levelInput),999999)} {generateLevel(Math.min(parseInt(levelInput),999999)).name}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={()=>{setEditingLevel(u.id);setLevelInput(String(uXP.current.level));}}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        style={{background:'rgba(109,250,188,0.15)',color:'#6dfabc'}}>
                        🎯 Ubah Level
                      </button>
                    )}
                  </div>

                  {/* Badge Kustom Control */}
                  <div className="mb-3 p-2.5 rounded-xl" style={{background:'rgba(168,85,247,0.06)'}}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold" style={{color:'#a855f7'}}>🏅 Badge Kustom</p>
                      {uBadge?.id && (
                        <span className="level-badge text-[9px]"
                          style={{ background: uBadge.bg, color: uBadge.color }}>
                          {uBadge.icon} {uBadge.label}
                        </span>
                      )}
                    </div>
                    {editingBadge===u.id ? (
                      <div>
                        {/* Tab */}
                        <div className="flex gap-1 mb-2.5">
                          {['preset','custom'].map(tab=>(
                            <button key={tab} onClick={()=>setBadgeTab(tab)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                              style={{
                                background: badgeTab===tab ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)',
                                color: badgeTab===tab ? '#a855f7' : 'var(--muted)'
                              }}>
                              {tab==='preset' ? '📋 Preset' : '✏️ Kustom'}
                            </button>
                          ))}
                        </div>

                        {badgeTab==='preset' ? (
                          /* Preset badges */
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {CUSTOM_BADGES.map(badge=>(
                              <button key={badge.id||'none'} onClick={()=>handleBadgeChange(u.id,badge.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95"
                                style={{
                                  background: badge.bg, color: badge.color,
                                  border: u.customBadge===badge.id && !u.customBadgeData
                                    ? `2px solid ${badge.color}` : '2px solid transparent',
                                  opacity: u.customBadge===badge.id && !u.customBadgeData ? 1 : 0.6,
                                }}>
                                {badge.icon} {badge.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          /* Custom badge builder */
                          <div className="space-y-2">
                            {/* Label */}
                            <div>
                              <p className="text-[9px] mb-1" style={{color:'var(--muted)'}}>Nama Badge</p>
                              <input value={customBadgeLabel} onChange={e=>setCustomBadgeLabel(e.target.value.slice(0,20))}
                                placeholder="mis: Jagoan, Pro, Elite..." maxLength={20}
                                className="w-full rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                                style={{background:'rgba(0,0,0,0.3)',border:'1px solid rgba(168,85,247,0.3)'}}/>
                            </div>
                            {/* Icon picker */}
                            <div>
                              <p className="text-[9px] mb-1" style={{color:'var(--muted)'}}>Pilih Ikon</p>
                              <div className="flex flex-wrap gap-1">
                                {BADGE_ICONS.map(ic=>(
                                  <button key={ic} onClick={()=>setCustomBadgeIcon(ic)}
                                    className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all"
                                    style={{
                                      background: customBadgeIcon===ic ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)',
                                      border: customBadgeIcon===ic ? '1px solid #a855f7' : '1px solid transparent'
                                    }}>
                                    {ic}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Color picker */}
                            <div>
                              <p className="text-[9px] mb-1" style={{color:'var(--muted)'}}>Pilih Warna</p>
                              <div className="flex flex-wrap gap-1.5">
                                {BADGE_COLORS.map(bc=>(
                                  <button key={bc.label} onClick={()=>setCustomBadgeColor(bc)}
                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold transition-all"
                                    style={{
                                      background: bc.bg, color: bc.color,
                                      border: customBadgeColor.label===bc.label ? `2px solid ${bc.color}` : '2px solid transparent'
                                    }}>
                                    {bc.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Preview + Save */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px]" style={{color:'var(--muted)'}}>Preview:</span>
                              <span className="level-badge text-[10px]" style={{background:customBadgeColor.bg,color:customBadgeColor.color}}>
                                {customBadgeIcon} {customBadgeLabel||'Badge'}
                              </span>
                              <button onClick={()=>handleCustomBadgeSave(u.id)}
                                disabled={!customBadgeLabel.trim()}
                                className="ml-auto px-3 py-1 rounded-lg text-[10px] font-bold disabled:opacity-30"
                                style={{background:'rgba(168,85,247,0.3)',color:'#a855f7'}}>
                                Simpan
                              </button>
                            </div>
                          </div>
                        )}
                        <button onClick={()=>setEditingBadge(null)} className="text-[10px] mt-2 block" style={{color:'var(--muted)'}}>✕ Tutup</button>
                      </div>
                    ) : (
                      <button onClick={()=>{setEditingBadge(u.id);setBadgeTab('preset');}}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        style={{background:'rgba(168,85,247,0.15)',color:'#a855f7'}}>
                        🏅 Atur Badge
                      </button>
                    )}
                  </div>

                  {/* Role Control */}
                  {u.id!==user.id&&(
                    <div className="p-2.5 rounded-xl" style={{background:'rgba(124,109,250,0.06)'}}>
                      <p className="text-[10px] font-bold mb-2" style={{color:'#7c6dfa'}}>👤 UBAH ROLE</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          {r:'user',  desc:'Member biasa'},
                          {r:'vip',   desc:'Member spesial'},
                          {r:'mod',   desc:'Moderator chat'},
                          {r:'admin', desc:'Admin penuh'},
                        ].map(({r,desc})=>(
                          <button key={r} onClick={()=>handleRoleChange(u.id,r)}
                            className={`level-badge ${ROLES[r].className} text-[10px] transition-all active:scale-95 flex-col py-2`}
                            style={{
                              opacity:uRole===r?1:0.4,
                              border:uRole===r?`2px solid currentColor`:'2px solid transparent',
                              borderRadius:10, gap:2
                            }}>
                            <span>{ROLES[r].icon} {ROLES[r].label}</span>
                            <span style={{fontSize:8,opacity:0.7}}>{desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {u.id===user.id&&<p className="text-[10px] font-medium mt-1" style={{color:'var(--muted)'}}>👈 Ini kamu</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Logout Confirm */}
      {showLogout&&(
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}}>
          <div className="w-full max-w-sm p-6 rounded-3xl animate-slide-up" style={{background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div className="text-4xl text-center mb-3">👋</div>
            <h3 className="text-base font-black text-white text-center mb-1">Yakin mau keluar?</h3>
            <p className="text-xs text-center mb-5" style={{color:'var(--muted)'}}>XP dan progress kamu tersimpan.</p>
            <div className="flex gap-3">
              <button onClick={()=>setShowLogout(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold" style={{background:'var(--card)',color:'var(--muted)'}}>Batal</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-2xl text-sm font-black text-white" style={{background:'linear-gradient(135deg,#fa6d9a,#fa6d6d)'}}>Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
                          
