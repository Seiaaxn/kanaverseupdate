// src/hooks/useDetailData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';
const SAMEHADAKU_BASE = 'https://v1.samehadaku.how';
const ANICHIN_BASE = 'https://anichin.moe';

const api = axios.create({ timeout: 20000 });

// Bersihkan URL donghua dari episode suffix
const cleanDonghuaDetailUrl = (url) => {
  if (!url) return url;
  let clean = url.replace(/\/+$/, '');
  if (clean.includes('-episode-')) clean = clean.split('-episode-')[0];
  return clean + '/';
};

// Bangun URL episode pertama dari URL detail
// Contoh: https://anichin.moe/beyond-times-gaze/ -> https://anichin.moe/beyond-times-gaze-episode-1-subtitle-indonesia/
const buildEpisodeUrl = (detailUrl, epNum = 1) => {
  const base = detailUrl.replace(/\/+$/, '');
  const slug = base.split('/').pop();
  return `${base.replace(slug, '')}${slug}-episode-${epNum}-subtitle-indonesia/`;
};

// Coba fetch detail dari endpoint /donghua/detail
const tryFetchDetail = async (url) => {
  const base = url.replace(/\/+$/, '');
  const variants = [base + '/', base];
  
  for (const u of variants) {
    try {
      const res = await api.get(`${API_BASE}/donghua/detail?url=${encodeURIComponent(u)}`);
      const data = res.data;
      const payload = data?.data || data;
      // Longgarkan validasi: terima apapun yang punya title atau episodes
      if (payload && (payload.title || Array.isArray(payload.episodes))) {
        return { data, url: u, source: 'detail' };
      }
    } catch (_) {}
  }
  return null;
};

// Fallback: ambil info dari endpoint /donghua/episode
const tryFetchFromEpisode = async (detailUrl) => {
  const base = detailUrl.replace(/\/+$/, '');
  const slug = base.split('/').pop();
  const domain = base.substring(0, base.lastIndexOf('/') + 1);
  
  // Coba berbagai format URL episode
  const epVariants = [
    `${domain}${slug}-episode-1-subtitle-indonesia/`,
    `${domain}${slug}-episode-1/`,
    `${base}-episode-1-subtitle-indonesia/`,
    `${base}-episode-1/`,
  ];

  for (const epUrl of epVariants) {
    try {
      const res = await api.get(`${API_BASE}/donghua/episode?url=${encodeURIComponent(epUrl)}`);
      const data = res.data;
      if (data?.success && data?.data) {
        return { data: data.data, url: detailUrl, source: 'episode' };
      }
    } catch (_) {}
  }
  return null;
};

// Transform data dari episode endpoint -> format detail
const transformFromEpisode = (epData, sourceUrl) => {
  const donghua = epData.donghua || {};
  const episodes = epData.episodes || [];
  const currentEp = epData.currentEpisode || {};

  return {
    url: donghua.url || sourceUrl,
    title: donghua.title || currentEp.title?.replace(/\s*Episode\s*\d+.*/i, '').trim() || 'Unknown Title',
    image: donghua.image || donghua.thumbnail || '',
    description: donghua.description || donghua.synopsis || '',
    synopsis: donghua.synopsis || donghua.description || '',
    episodes: Array.isArray(episodes) ? episodes : [],
    info: donghua.info || {},
    genres: Array.isArray(donghua.genres) ? donghua.genres : [],
    characters: [],
    stats: donghua.stats || {},
    source: 'anichin',
    category: 'donghua',
    altTitles: [],
    rating: donghua.rating || null,
    status: donghua.status || donghua.info?.status || 'Unknown',
    type: donghua.type || donghua.info?.type || 'ONA',
    studio: donghua.studio || donghua.info?.studio || '',
    network: donghua.network || '',
    released: donghua.released || donghua.info?.released || '',
    duration: donghua.duration || donghua.info?.duration || '',
    season: '',
    country: donghua.country || 'China',
    totalEpisodes: episodes.length || 0,
    fansub: '',
    postedBy: '',
    postedOn: '',
    updatedOn: '',
    followers: 0,
  };
};

// Transform data dari detail endpoint
const transformDonghuaData = (data, sourceUrl = '') => {
  const donghua = data?.data || data;
  return {
    url: donghua.url || sourceUrl,
    title: donghua.title || 'Unknown Title',
    image: donghua.image || '',
    description: donghua.description || donghua.synopsis || '',
    synopsis: donghua.synopsis || donghua.description || '',
    episodes: Array.isArray(donghua.episodes) ? donghua.episodes : [],
    info: donghua.info || {},
    genres: Array.isArray(donghua.genres) ? donghua.genres : [],
    characters: Array.isArray(donghua.characters) ? donghua.characters : [],
    stats: donghua.stats || {},
    source: donghua.source || 'anichin',
    category: 'donghua',
    altTitles: Array.isArray(donghua.altTitles) ? donghua.altTitles : [],
    rating: donghua.rating || null,
    status: donghua.info?.status || 'Unknown',
    type: donghua.info?.type || 'ONA',
    studio: donghua.info?.studio || '',
    network: donghua.info?.network || '',
    released: donghua.info?.released || '',
    duration: donghua.info?.duration || '',
    season: donghua.info?.season || '',
    country: donghua.info?.country || 'China',
    totalEpisodes: donghua.info?.totalEpisodes || donghua.episodes?.length || 0,
    fansub: donghua.info?.fansub || '',
    postedBy: donghua.info?.postedBy || '',
    postedOn: donghua.info?.postedOn || '',
    updatedOn: donghua.info?.updatedOn || '',
    followers: donghua.stats?.followers || 0,
  };
};

export const useDetailData = () => {
  const { category, id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setDetail(null);

        const decodedUrl = decodeURIComponent(id);

        // Build full URL
        let fullUrl = decodedUrl;
        if (!decodedUrl.startsWith('http')) {
          if (category === 'anime') {
            fullUrl = decodedUrl.startsWith('/')
              ? `${SAMEHADAKU_BASE}${decodedUrl}`
              : `${SAMEHADAKU_BASE}/${decodedUrl}`;
          } else {
            fullUrl = decodedUrl.startsWith('/')
              ? `${ANICHIN_BASE}${decodedUrl}`
              : `${ANICHIN_BASE}/${decodedUrl}`;
          }
        }

        if (category === 'donghua') {
          // Clean episode URL
          fullUrl = cleanDonghuaDetailUrl(fullUrl);

          // Coba 1: endpoint /donghua/detail
          let result = await tryFetchDetail(fullUrl);

          // Coba 2: fallback ke /donghua/episode jika detail gagal
          if (!result) {
            result = await tryFetchFromEpisode(fullUrl);
            if (result) {
              setDetail(transformFromEpisode(result.data, result.url));
              return;
            }
          }

          if (result) {
            setDetail(transformDonghuaData(result.data, result.url));
          } else {
            setError('Gagal memuat data donghua. Silakan coba lagi.');
          }

        } else {
          // Anime
          const endpoint = `${API_BASE}/anime/detail?url=${encodeURIComponent(fullUrl)}`;
          const response = await api.get(endpoint);
          if (response.data) {
            setDetail(transformAnimeData(response.data));
          } else {
            throw new Error('Data anime tidak ditemukan');
          }
        }

      } catch (err) {
        const msg =
          err.code === 'ECONNABORTED'
            ? 'Koneksi timeout, silakan coba lagi'
            : err.response?.data?.message || err.message || 'Gagal memuat data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (category && id) fetchDetail();
  }, [category, id]);

  return { detail, loading, error };
};

// Transform untuk Anime
const transformAnimeData = (data) => ({
  title: data.title || 'Unknown Title',
  image: data.image || '',
  description: data.description || '',
  episodes: Array.isArray(data.episodes) ? data.episodes : [],
  info: data.info || {},
  source: data.source || 'samehadaku',
  category: 'anime',
  status: data.info?.status || (data.info?.released?.includes('to ?') ? 'Ongoing' : 'Completed'),
  type: data.info?.type || 'TV',
  totalEpisodes: data.episodes?.length || 0,
  released: data.info?.released || '',
  altTitles: data.info?.synonyms_noble_reincarnation ? [data.info.synonyms_noble_reincarnation] : [],
  rating: null,
  genres: [],
});

export default useDetailData;
  
