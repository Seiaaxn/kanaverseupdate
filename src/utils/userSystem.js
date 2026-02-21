// src/utils/userSystem.js — XP, Levels, Roles, Per-user data

const AUTH_KEY = 'animeplay_auth';
const USERS_KEY = 'animeplay_users';

// ── Helper: sync stats user ke Firebase setelah perubahan ──────────────────
// Import dinamis agar tidak circular dependency
const syncStats = async (user) => {
  try {
    const { syncUserStatsToFirebase, isFirebaseConfigured } = await import('./firebaseSync.js');
    if (!isFirebaseConfigured()) return;
    const histKey = `animeplay_history_${user.id}`;
    const bkKey = `animeplay_bookmarks_${user.id}`;
    const history = JSON.parse(localStorage.getItem(histKey) || '[]');
    const bookmarks = JSON.parse(localStorage.getItem(bkKey) || '[]');
    await syncUserStatsToFirebase(user.id, {
      xp: user.xp || 0,
      bookmarkCount: bookmarks.length,
      historyCount: history.length,
      recentHistory: history.slice(0, 5),
      username: user.username,
      role: user.role || 'user',
      avatar: user.avatar || null,
      avatarIsFile: user.avatarIsFile || false,
      customBadge: user.customBadge || null,
    });
  } catch {}
};

// Tier names for higher levels
const TIER_NAMES = [
  'Bronze','Silver','Gold','Platinum','Diamond','Obsidian',
  'Eternal','Cosmic','Galactic','Universal','Infinity',
];
const TIER_COLORS = [
  ['#cd7f32','#a0522d'],['#c0c0c0','#a8a8a8'],['#ffd700','#ffa500'],
  ['#00f0ff','#0080ff'],['#b9f2ff','#69c0ff'],['#222','#555'],
  ['#ff6ec7','#ff1f8e'],['#7c3aed','#4c1d95'],['#0ea5e9','#0369a1'],
  ['#10b981','#047857'],['#6366f1','#4338ca'],
];

const BASE_LEVEL_DATA = [
  {level:1,name:'Newcomer',minXP:0,color:'#888',gradient:'linear-gradient(135deg,#888,#aaa)'},
  {level:2,name:'Watcher',minXP:200,color:'#6dfabc',gradient:'linear-gradient(135deg,#6dfabc,#6dfae0)'},
  {level:3,name:'Enthusiast',minXP:500,color:'#6daefa',gradient:'linear-gradient(135deg,#6daefa,#6d7cfa)'},
  {level:4,name:'Otaku',minXP:1000,color:'#7c6dfa',gradient:'linear-gradient(135deg,#7c6dfa,#b06dfa)'},
  {level:5,name:'Weeb',minXP:2000,color:'#fa6d9a',gradient:'linear-gradient(135deg,#fa6d9a,#fa6d6d)'},
  {level:6,name:'Veteran',minXP:4000,color:'#fac96d',gradient:'linear-gradient(135deg,#fac96d,#fa9a6d)'},
  {level:7,name:'Legend',minXP:8000,color:'#fff',gradient:'linear-gradient(135deg,#7c6dfa,#fa6d9a,#fac96d)'},
  {level:8,name:'Elite',minXP:15000,color:'#6dfabc',gradient:'linear-gradient(135deg,#6dfabc,#7c6dfa)'},
  {level:9,name:'Master',minXP:25000,color:'#fa6d9a',gradient:'linear-gradient(135deg,#fa6d9a,#7c6dfa)'},
  {level:10,name:'Grandmaster',minXP:40000,color:'#fac96d',gradient:'linear-gradient(135deg,#fac96d,#fa6d9a,#7c6dfa)'},
  {level:11,name:'Champion',minXP:60000,color:'#00f0ff',gradient:'linear-gradient(135deg,#00f0ff,#0080ff)'},
  {level:12,name:'Hero',minXP:85000,color:'#ff6b35',gradient:'linear-gradient(135deg,#ff6b35,#f7931e)'},
  {level:13,name:'Mythic',minXP:120000,color:'#a855f7',gradient:'linear-gradient(135deg,#a855f7,#ec4899)'},
  {level:14,name:'Immortal',minXP:160000,color:'#14b8a6',gradient:'linear-gradient(135deg,#14b8a6,#06b6d4)'},
  {level:15,name:'Celestial',minXP:210000,color:'#f59e0b',gradient:'linear-gradient(135deg,#f59e0b,#ef4444)'},
  {level:16,name:'Divine',minXP:270000,color:'#8b5cf6',gradient:'linear-gradient(135deg,#8b5cf6,#a855f7,#ec4899)'},
  {level:17,name:'Ascendant',minXP:340000,color:'#06b6d4',gradient:'linear-gradient(135deg,#06b6d4,#8b5cf6)'},
  {level:18,name:'Titan',minXP:420000,color:'#ef4444',gradient:'linear-gradient(135deg,#ef4444,#f59e0b,#8b5cf6)'},
  {level:19,name:'Sovereign',minXP:510000,color:'#10b981',gradient:'linear-gradient(135deg,#10b981,#06b6d4,#8b5cf6)'},
  {level:20,name:'Emperor',minXP:620000,color:'#fff',gradient:'linear-gradient(135deg,#ffd700,#ff6b35,#8b5cf6)'},
];

export const MAX_LEVEL = 999999;

export const generateLevel = (level) => {
  if (level <= 20) return BASE_LEVEL_DATA[level-1];
  const tierIdx = Math.min(Math.floor((level-21)/100), TIER_NAMES.length-1);
  const [c1,c2] = TIER_COLORS[tierIdx];
  const minXP = Math.floor(620000 + Math.pow(level-20,1.8)*5000);
  return {level, name:`${TIER_NAMES[tierIdx]} ${level}`, minXP, color:c1, gradient:`linear-gradient(135deg,${c1},${c2})`};
};

export const LEVELS = Array.from({length:100},(_,i)=>generateLevel(i+1));

export const getLevelInfo = (xp) => {
  let levelNum = 1;
  for (let i=LEVELS.length-1;i>=0;i--) {
    if (xp>=LEVELS[i].minXP){levelNum=LEVELS[i].level;break;}
  }
  if (levelNum===100 && xp>=LEVELS[99].minXP) {
    let lo=100,hi=MAX_LEVEL;
    while(lo<hi){const mid=Math.floor((lo+hi+1)/2);if(generateLevel(mid).minXP<=xp)lo=mid;else hi=mid-1;}
    levelNum=Math.min(lo,MAX_LEVEL);
  }
  const current=generateLevel(levelNum);
  const next=levelNum<MAX_LEVEL?generateLevel(levelNum+1):null;
  const xpInLevel=xp-current.minXP;
  const xpToNext=next?next.minXP-current.minXP:0;
  const progress=next?Math.min((xpInLevel/xpToNext)*100,100):100;
  return {current,next,xpInLevel,xpToNext,progress};
};

export const ROLES = {
  admin:{label:'Admin',className:'role-admin',icon:'👑'},
  mod:{label:'Mod',className:'role-mod',icon:'🍃'},
  vip:{label:'VIP',className:'role-vip',icon:'⭐'},
  user:{label:'User',className:'role-user',icon:'👤'},
};

export const ADMIN_NAME_COLORS = ['#ff0000','#ff4500','#ff8c00','#ffd700','#00ff00','#00ffff','#0080ff','#8000ff','#ff00ff','#ff69b4'];

export const getUser = () => {try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null');}catch{return null;}};
export const getStoredUsers = () => {try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]');}catch{return [];}};
export const getUserById = (id) => getStoredUsers().find(u=>u.id===id)||null;

export const updateUser = (updates) => {
  try {
    const user=getUser();if(!user)return null;
    const updated={...user,...updates};
    localStorage.setItem(AUTH_KEY,JSON.stringify(updated));
    const users=getStoredUsers();
    const idx=users.findIndex(u=>u.id===user.id);
    if(idx>=0){users[idx]={...users[idx],...updates};localStorage.setItem(USERS_KEY,JSON.stringify(users));}
    // Sync ke Firebase jika ada perubahan profil (avatar, username, role, xp)
    const profileFields=['avatar','avatarIsFile','username','role','xp','customBadge'];
    if(profileFields.some(k=>k in updates)) syncStats(updated);
    return updated;
  }catch{return null;}
};

export const updateUserById = (userId,updates) => {
  try {
    const users=getStoredUsers();
    const idx=users.findIndex(u=>u.id===userId);
    if(idx<0)return false;
    users[idx]={...users[idx],...updates};
    localStorage.setItem(USERS_KEY,JSON.stringify(users));
    const current=getUser();
    if(current?.id===userId)localStorage.setItem(AUTH_KEY,JSON.stringify({...current,...updates}));
    return true;
  }catch{return false;}
};

export const addXP = (amount,reason='') => {
  const user=getUser();if(!user)return null;
  const newXP=(user.xp||0)+amount;
  const oldLevel=getLevelInfo(user.xp||0).current.level;
  const newLevel=getLevelInfo(newXP).current.level;
  const updated=updateUser({xp:newXP});
  if(updated) syncStats(updated);
  return {newXP,amount,reason,leveledUp:newLevel>oldLevel,newLevel};
};

const getHistoryKey=()=>{const u=getUser();return u?`animeplay_history_${u.id}`:'animeplay_history_guest';};
export const getUserHistory=()=>{try{return JSON.parse(localStorage.getItem(getHistoryKey())||'[]');}catch{return [];}};

export const addToUserHistory=(anime,episode)=>{
  try {
    const key=getHistoryKey();const history=getUserHistory();
    const itemId=`${anime.url}::${episode?.url||anime.url}`;
    const existingIdx=history.findIndex(h=>h.id===itemId);
    const item={id:itemId,title:anime.title,image:anime.image,url:anime.url,category:anime.category||'anime',
      episodeTitle:episode?.title||`Episode ${episode?.episode||1}`,episodeUrl:episode?.url||anime.url,
      episodeNum:episode?.episode||episode?.number||1,lastWatched:new Date().toISOString()};
    if(existingIdx>=0){history[existingIdx]={...history[existingIdx],...item};const u=history.splice(existingIdx,1)[0];history.unshift(u);}
    else history.unshift(item);
    localStorage.setItem(key,JSON.stringify(history.slice(0,100)));
    const u=getUser();if(u)syncStats(u);
  }catch{}
};

export const removeFromUserHistory=(id)=>{
  try{const key=getHistoryKey();const h=getUserHistory().filter(h=>h.id!==id);localStorage.setItem(key,JSON.stringify(h));return h;}catch{return [];}
};
export const clearUserHistory=()=>{try{localStorage.removeItem(getHistoryKey());}catch{}};

const getBookmarkKey=()=>{const u=getUser();return u?`animeplay_bookmarks_${u.id}`:'animeplay_bookmarks_guest';};
export const getUserBookmarks=()=>{try{return JSON.parse(localStorage.getItem(getBookmarkKey())||'[]');}catch{return [];}};
export const toggleUserBookmark=(item)=>{
  try{
    const key=getBookmarkKey();const bookmarks=getUserBookmarks();
    const exists=bookmarks.some(b=>b.url===item.url);
    const updated=exists?bookmarks.filter(b=>b.url!==item.url):[...bookmarks,{...item,addedAt:new Date().toISOString()}];
    localStorage.setItem(key,JSON.stringify(updated));
    const u=getUser();if(u)syncStats(u);
    return !exists;
  }catch{return false;}
};
export const isBookmarked=(url)=>getUserBookmarks().some(b=>b.url===url);

export const isAdmin=()=>getUser()?.role==='admin';
export const isMod=()=>['admin','mod'].includes(getUser()?.role);

export const ensureAdminExists=()=>{
  const users=getStoredUsers();
  if(users.length===1&&!users[0].role){
    users[0].role='admin';localStorage.setItem(USERS_KEY,JSON.stringify(users));
    const s=getUser();if(s&&s.id===users[0].id)localStorage.setItem(AUTH_KEY,JSON.stringify({...s,role:'admin'}));
  }
};

export const initAdminAccount=()=>{
  const users=getStoredUsers();
  if(!users.find(u=>u.id==='admin_super')){
    const adminUser={id:'admin_super',username:'shinlonelyn',email:'admin@kan4verse.com',password:'shin17th',
      joinedAt:new Date().toISOString(),role:'admin',xp:999999,avatar:null,avatarFile:null};
    localStorage.setItem(USERS_KEY,JSON.stringify([adminUser,...users]));
  }
};

    
