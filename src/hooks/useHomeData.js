// src/hooks/useHomeData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

// Bersihkan URL episode donghua → URL halaman utama
const cleanDonghuaUrl = (url) => {
  if (!url) return url;
  let clean = url.replace(/\/+$/, '');
  if (clean.includes('-episode-')) clean = clean.split('-episode-')[0];
  return clean + '/';
};

// Bersihkan title "Episode X Subtitle Indonesia"
const cleanDonghuaTitle = (title) => {
  if (!title) return title;
  return title.replace(/\s+Episode\s+\d+.*$/i, '').trim();
};

// Parse response API yang formatnya tidak konsisten
const parseList = (raw, keys = ['data', 'anime', 'donghua', 'movies', 'results']) => {
  if (Array.isArray(raw)) return raw;
  for (const k of keys) {
    if (Array.isArray(raw?.[k])) return raw[k];
  }
  return [];
};

export const useHomeData = () => {
  const [animeData, setAnimeData] = useState([]);
  const [donghuaData, setDonghuaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [animeRes, donghuaRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/anime/latest`),
          axios.get(`${API_BASE}/donghua/latest-release`),
        ]);

        if (animeRes.status === 'fulfilled') {
          const list = parseList(animeRes.value.data);
          // Tandai eksplisit sebagai anime agar routing di HomePage benar
          setAnimeData(list.map(item => ({ ...item, _category: 'anime' })));
        }

        if (donghuaRes.status === 'fulfilled') {
          const raw = parseList(donghuaRes.value.data);
          const cleaned = raw
            .map(item => ({
              ...item,
              title: cleanDonghuaTitle(item.title),
              url: cleanDonghuaUrl(item.url),
              _originalUrl: item.url,  // simpan URL episode asli
              _category: 'donghua',    // tandai eksplisit sebagai donghua
            }))
            .filter((item, i, arr) => arr.findIndex(x => x.url === item.url) === i);
          setDonghuaData(cleaned);
        }
      } catch (err) {
        console.error('useHomeData error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { animeData, donghuaData, loading };
};
