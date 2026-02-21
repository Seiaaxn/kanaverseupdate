// ============================================================
// Firebase Configuration untuk Komentar Real-time
// ============================================================
// CARA SETUP:
// 1. Buka https://console.firebase.google.com
// 2. Klik "Add project" → isi nama → klik Continue sampai selesai
// 3. Di dashboard, klik ikon "</>" (Web) untuk daftarkan app
// 4. Isi nama app → klik "Register app" → copy firebaseConfig
// 5. Di sidebar kiri, klik "Build" → "Realtime Database"
// 6. Klik "Create Database" → pilih lokasi → pilih "Start in test mode" → Enable
// 7. Copy URL database (bentuk: https://nama-project-default-rtdb.firebaseio.com)
// 8. Ganti nilai di bawah dengan config kamu
// ============================================================

const FIREBASE_DB_URL = 'https://kanaverse-b7d4e-default-rtdb.firebaseio.com';
// Contoh: 'https://nama-project-default-rtdb.firebaseio.com'

// ── Cek apakah Firebase sudah dikonfigurasi ────────────────────────────────
export const isFirebaseConfigured = () =>
  FIREBASE_DB_URL && !FIREBASE_DB_URL.includes('GANTI_DENGAN');

// ── Encode key aman untuk Firebase path ───────────────────────────────────
const encodeKey = (str) =>
  encodeURIComponent(str)
    .replace(/\./g, '%2E')
    .replace(/~/g, '%7E')
    .replace(/%/g, '_');

// ── GET komentar dari Firebase ─────────────────────────────────────────────
export const fetchCommentsFromFirebase = async (episodeKey) => {
  if (!isFirebaseConfigured()) return null;
  try {
    const key = encodeKey(episodeKey);
    const res = await fetch(`${FIREBASE_DB_URL}/comments/${key}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return [];
    return Object.values(data)
      .map(c => ({ ...c, createdAt: new Date(c.createdAt) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.warn('Firebase fetch error:', e);
    return null;
  }
};

// ── POST komentar baru ke Firebase ────────────────────────────────────────
export const saveCommentToFirebase = async (episodeKey, comment) => {
  if (!isFirebaseConfigured()) return false;
  try {
    const key = encodeKey(episodeKey);
    const commentData = {
      ...comment,
      createdAt: comment.createdAt instanceof Date
        ? comment.createdAt.toISOString()
        : comment.createdAt,
    };
    const res = await fetch(
      `${FIREBASE_DB_URL}/comments/${key}/${comment.id}.json`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      }
    );
    return res.ok;
  } catch (e) {
    console.warn('Firebase save error:', e);
    return false;
  }
};

// ── UPDATE likes di Firebase ───────────────────────────────────────────────
export const updateLikeInFirebase = async (episodeKey, commentId, updatedComment) => {
  if (!isFirebaseConfigured()) return false;
  try {
    const key = encodeKey(episodeKey);
    const res = await fetch(
      `${FIREBASE_DB_URL}/comments/${key}/${commentId}.json`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likes: updatedComment.likes,
          likedBy: updatedComment.likedBy,
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.warn('Firebase like error:', e);
    return false;
  }
};

// ── Polling real-time setiap N detik ──────────────────────────────────────
export const pollComments = (episodeKey, callback, intervalMs = 8000) => {
  if (!isFirebaseConfigured()) return null;
  const poll = async () => {
    const comments = await fetchCommentsFromFirebase(episodeKey);
    if (comments !== null) callback(comments);
  };
  poll();
  const id = setInterval(poll, intervalMs);
  return () => clearInterval(id);
};

// ── Simpan stats user ke Firebase ─────────────────────────────────────────
// Dipanggil setiap kali XP / bookmark / history berubah
export const syncUserStatsToFirebase = async (userId, stats) => {
  if (!isFirebaseConfigured() || !userId) return false;
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/users/${userId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xp: stats.xp || 0,
        bookmarkCount: stats.bookmarkCount || 0,
        historyCount: stats.historyCount || 0,
        recentHistory: (stats.recentHistory || []).slice(0, 5),
        username: stats.username || '',
        role: stats.role || 'user',
        avatar: stats.avatar || null,
        avatarIsFile: stats.avatarIsFile || false,
        customBadge: stats.customBadge || null,
        customBadgeData: stats.customBadgeData || null,
        updatedAt: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Firebase syncUserStats error:', e);
    return false;
  }
};

// ── Ambil stats user dari Firebase (untuk lihat profil orang lain) ─────────
export const fetchUserStatsFromFirebase = async (userId) => {
  if (!isFirebaseConfigured() || !userId) return null;
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/users/${userId}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('Firebase fetchUserStats error:', e);
    return null;
  }
};

// ── Helper terpusat: panggil ini setelah XP / bookmark / history berubah ──
export const syncUserNow = async () => {
  if (!isFirebaseConfigured()) return;
  try {
    const AUTH_KEY = 'animeplay_auth';
    const user = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    if (!user?.id) return;
    const history = JSON.parse(localStorage.getItem(`animeplay_history_${user.id}`) || '[]');
    const bookmarks = JSON.parse(localStorage.getItem(`animeplay_bookmarks_${user.id}`) || '[]');
    const stats = {
      xp: user.xp || 0,
      bookmarkCount: bookmarks.length,
      historyCount: history.length,
      recentHistory: history.slice(0, 5),
      username: user.username || '',
      role: user.role || 'user',
      avatar: user.avatar || null,
      avatarIsFile: user.avatarIsFile || false,
      customBadge: user.customBadge || null,
      customBadgeData: user.customBadgeData || null,
    };
    await syncUserStatsToFirebase(user.id, stats);
    // Simpan ke leaderboard bulanan + all-time
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await saveToLeaderboard(user.id, stats, monthKey);
  } catch (e) {
    console.warn('syncUserNow error:', e);
  }
};

// ── Leaderboard bulanan & all-time ────────────────────────────────────────

// Simpan entry leaderboard (dipanggil dari syncUserNow)
export const saveToLeaderboard = async (userId, stats, monthKey) => {
  if (!isFirebaseConfigured() || !userId) return;
  try {
    const entry = {
      userId,
      username: stats.username || '',
      xp: stats.xp || 0,
      role: stats.role || 'user',
      avatar: stats.avatar || null,
      avatarIsFile: stats.avatarIsFile || false,
      customBadge: stats.customBadge || null,
      customBadgeData: stats.customBadgeData || null,
      updatedAt: new Date().toISOString(),
    };
    // Simpan ke leaderboard bulan ini
    await fetch(`${FIREBASE_DB_URL}/leaderboard/${monthKey}/${userId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    // Simpan ke leaderboard all-time
    await fetch(`${FIREBASE_DB_URL}/leaderboard/alltime/${userId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (e) {
    console.warn('saveToLeaderboard error:', e);
  }
};

// Ambil leaderboard (monthKey = 'YYYY-MM' atau 'alltime')
export const fetchLeaderboard = async (monthKey) => {
  if (!isFirebaseConfigured()) return null;
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/leaderboard/${monthKey}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('fetchLeaderboard error:', e);
    return null;
  }
};

// ── Sync stats user spesifik (untuk admin yang ubah user lain) ────────────
export const syncSpecificUser = async (userId) => {
  if (!isFirebaseConfigured() || !userId) return;
  try {
    const USERS_KEY = 'animeplay_users';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const history = JSON.parse(localStorage.getItem(`animeplay_history_${userId}`) || '[]');
    const bookmarks = JSON.parse(localStorage.getItem(`animeplay_bookmarks_${userId}`) || '[]');
    const stats = {
      xp: user.xp || 0,
      bookmarkCount: bookmarks.length,
      historyCount: history.length,
      recentHistory: history.slice(0, 5),
      username: user.username || '',
      role: user.role || 'user',
      avatar: user.avatar || null,
      avatarIsFile: user.avatarIsFile || false,
      customBadge: user.customBadge || null,
      customBadgeData: user.customBadgeData || null,
    };
    await syncUserStatsToFirebase(userId, stats);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await saveToLeaderboard(userId, stats, monthKey);
  } catch (e) {
    console.warn('syncSpecificUser error:', e);
  }
};

    
