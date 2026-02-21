// Re-export dari firebase.js agar bisa diimport dinamis dari userSystem.js
// tanpa menyebabkan circular dependency
export { syncUserStatsToFirebase, isFirebaseConfigured } from '../services/firebase.js';
