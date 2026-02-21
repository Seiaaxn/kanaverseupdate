// src/hooks/useDetailData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';
const SAMEHADAKU_BASE = 'https://v1.samehadaku.how';
const ANICHIN_BASE = 'https://anichin.moe';

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

        const decodedUrl = decodeURIComponent(id);
        console.log('Decoded URL:', decodedUrl);
        
        // Build full URL if needed
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
        
        console.log('Full URL:', fullUrl);

        // Different endpoints for anime and donghua
        const endpoint = category === 'anime'
          ? `${API_BASE}/anime/detail?url=${encodeURIComponent(fullUrl)}`
          : `${API_BASE}/donghua/detail?url=${encodeURIComponent(fullUrl)}`;

        console.log('Fetching from:', endpoint);

        const response = await axios.get(endpoint);
        console.log('Response:', response.data);
        
        if (response.data) {
          if (category === 'anime') {
            setDetail(transformAnimeData(response.data));
          } else {
            setDetail(transformDonghuaData(response.data));
          }
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to load detail data');
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

// Transform function untuk Anime (Samehadaku)
const transformAnimeData = (data) => {
  return {
    title: data.title || 'Unknown Title',
    image: data.image || '',
    description: data.description || '',
    episodes: Array.isArray(data.episodes) ? data.episodes : [],
    info: data.info || {},
    source: data.source || 'samehadaku',
    category: 'anime',
    
    // Parse info dari anime
    status: data.info?.status || (data.info?.released?.includes('to ?') ? 'Ongoing' : 'Completed'),
    type: data.info?.type || 'TV',
    totalEpisodes: data.episodes?.length || 0,
    released: data.info?.released || '',
    
    // Alternative titles
    altTitles: data.info?.synonyms_noble_reincarnation 
      ? [data.info.synonyms_noble_reincarnation] 
      : [],
    
    rating: null,
    genres: []
  };
};

// Transform function untuk Donghua (Anichin)
const transformDonghuaData = (data) => {
  // Data dari Anichin punya struktur: { success: true, data: { ... } }
  const donghua = data.data || data;
  
  console.log('Donghua data:', donghua); // Debug
  console.log('Episodes:', donghua.episodes); // Debug episodes
  
  return {
    title: donghua.title || 'Unknown Title',
    image: donghua.image || '',
    description: donghua.description || donghua.synopsis || '',
    synopsis: donghua.synopsis || donghua.description || '',
    episodes: Array.isArray(donghua.episodes) ? donghua.episodes : [], // PASTIKAN INI ARRAY
    info: donghua.info || {},
    genres: Array.isArray(donghua.genres) ? donghua.genres : [],
    characters: Array.isArray(donghua.characters) ? donghua.characters : [],
    stats: donghua.stats || {},
    source: donghua.source || 'anichin',
    category: 'donghua',
    
    // Alternative titles
    altTitles: Array.isArray(donghua.altTitles) ? donghua.altTitles : [],
    
    // Rating dengan struktur lengkap
    rating: donghua.rating || null,
    
    // Info detail dari donghua.info
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
    
    // Stats
    followers: donghua.stats?.followers || 0
  };
};

export default useDetailData;

  
