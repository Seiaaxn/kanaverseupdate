// src/hooks/useDetailData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';
const SAMEHADAKU_BASE = 'https://v1.samehadaku.how';
const ANICHIN_BASE = 'https://anichin.moe';

// Axios instance dengan timeout 15 detik
const api = axios.create({ timeout: 15000 });

// Bersihkan URL donghua dari episode suffix
const cleanDonghuaDetailUrl = (url) => {
  if (!url) return url;
  let clean = url.replace(/\/+$/, '');
  if (clean.includes('-episode-')) {
    clean = clean.split('-episode-')[0];
  }
  return clean + '/';
};

// Coba fetch dengan beberapa URL alternatif
const fetchDonghuaDetail = async (rawUrl) => {
  const base = rawUrl.replace(/\/+$/, '');

  const urlVariants = [
    base + '/',
    base,
  ];

  let lastError = null;

  for (const url of urlVariants) {
    try {
      const endpoint = `${API_BASE}/donghua/detail?url=${encodeURIComponent(url)}`;
      const res = await api.get(endpoint);
      const data = res.data;

      // Validasi: harus ada data bermakna
      const payload = data?.data || data;
      if (
        data &&
        (data.success === true || data.success === undefined) &&
        payload &&
        (payload.title || payload.episodes)
      ) {
        return { data, url };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Semua URL gagal');
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
          fullUrl = cleanDonghuaDetailUrl(fullUrl);
          const { data, url } = await fetchDonghuaDetail(fullUrl);
          setDetail(transformDonghuaData(data, url));
        } else {
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
            ? 'Koneksi timeout, coba lagi'
            : err.response?.data?.message || err.message || 'Gagal memuat data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (category && id) {
      fetchDetail();
    }
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

// Transform untuk Donghua
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
    studio: donghua.info?.studio || 'Unknown',
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

export default useDetailData;
  
