// src/utils/navigation.js
// Helper terpusat untuk navigasi agar URL donghua selalu clean

/**
 * Bersihkan URL donghua dari episode suffix sebelum navigate ke detail page.
 * Contoh: https://anichin.moe/judul-episode-10-sub-indo/ -> https://anichin.moe/judul/
 */
export const cleanDonghuaUrl = (url) => {
  if (!url) return url;
  let clean = url.replace(/\/+$/, '');
  if (clean.includes('-episode-')) {
    clean = clean.split('-episode-')[0];
  }
  return clean;
};

/**
 * Navigate ke detail page dengan URL yang sudah bersih.
 * @param {function} navigate - react-router navigate
 * @param {string} category - 'anime' | 'donghua'
 * @param {string} url - URL mentah (boleh episode URL)
 */
export const navigateToDetail = (navigate, category, url) => {
  if (!url) return;
  let cleanUrl = url.replace(/\/+$/, '');
  if (category === 'donghua') {
    cleanUrl = cleanDonghuaUrl(cleanUrl);
  }
  navigate(`/detail/${category}/${encodeURIComponent(cleanUrl)}`);
};
