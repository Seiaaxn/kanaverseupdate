// src/services/api.js
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

// Fetch latest berdasarkan feed (urutan terbaru)
export const fetchLatestFeed = async (page = 1) => {
  try {
    const res = await axios.get(`${API_BASE}/latest/feed?page=${page}`);
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching latest feed:', error);
    return [];
  }
};

// Fetch latest biasa (A-Z) - tapi kita pake feed untuk sorting
export const fetchLatest = async (page = 1) => {
  try {
    const res = await axios.get(`${API_BASE}/latest?page=${page}`);
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching latest:', error);
    return [];
  }
};

// Fetch anime latest
export const fetchAnimeLatest = async (page = 1) => {
  try {
    const res = await axios.get(`${API_BASE}/anime/latest?page=${page}`);
    return res.data || [];
  } catch (error) {
    console.error('Error fetching anime latest:', error);
    return [];
  }
};

// Fetch donghua latest
export const fetchDonghuaLatest = async (page = 1) => {
  try {
    const res = await axios.get(`${API_BASE}/donghua/latest?page=${page}`);
    return res.data || [];
  } catch (error) {
    console.error('Error fetching donghua latest:', error);
    return [];
  }
};

// Search
export const searchAnime = async (query) => {
  try {
    const res = await axios.get(`${API_BASE}/anime/search?q=${encodeURIComponent(query)}`);
    return res.data || [];
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};

// Get detail
export const getAnimeDetail = async (url) => {
  try {
    const res = await axios.get(`${API_BASE}/anime/detail?url=${encodeURIComponent(url)}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};

export const getDonghuaDetail = async (url) => {
  try {
    const res = await axios.get(`${API_BASE}/donghua/detail?url=${encodeURIComponent(url)}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
};

// Get watch links
export const getAnimeWatch = async (url) => {
  try {
    const res = await axios.get(`${API_BASE}/anime/watch?url=${encodeURIComponent(url)}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching watch links:', error);
    return null;
  }
};

export const getDonghuaWatch = async (url) => {
  try {
    const res = await axios.get(`${API_BASE}/donghua/watch?url=${encodeURIComponent(url)}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching watch links:', error);
    return null;
  }
};
      
