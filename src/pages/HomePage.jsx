// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/home/Header';
import HeroSlider from '../components/home/HeroSlider';
import { useHomeData } from '../hooks/useHomeData';
import AnimeMovie from '../components/home/AnimeMovie';
import PopularTodaySection from '../components/home/PopularToday';
import ContentSection from '../components/home/ContentSection';

const HomePage = () => {
  const navigate = useNavigate();
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { animeData, donghuaData, loading } = useHomeData();

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Deteksi kategori item dengan andal
  const getCategory = (item) => {
    if (item._category) return item._category;
    if (item.source === 'anichin') return 'donghua';
    if (item.source === 'samehadaku') return 'anime';
    const url = item.url || item.link || '';
    if (url.includes('anichin') || url.includes('kuramanime') || url.includes('nontondonghua')) return 'donghua';
    return 'anime';
  };

  const handleItemSelect = (item) => {
    const category = getCategory(item);
    let itemUrl = item.url || item.link;
    if (!itemUrl) return;
    itemUrl = itemUrl.replace(/\/+$/, '');
    navigate(`/detail/${category}/${encodeURIComponent(itemUrl)}`);
  };

  const getHeroItems = () => {
    if (loading) return [];
    const combined = [
      ...(Array.isArray(animeData) ? animeData.slice(0, 3) : []),
      ...(Array.isArray(donghuaData) ? donghuaData.slice(0, 2) : []),
    ];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header scrolled={headerScrolled} />
      <div style={{ paddingTop: '52px' }}>
        <HeroSlider
          items={getHeroItems()}
          onAnimeSelect={handleItemSelect}
          autoPlayInterval={4000}
          loading={loading}
        />

        <ContentSection
          title="Latest Anime"
          label="Anime"
          labelColor="blue"
          items={animeData}
          loading={loading}
          onItemClick={handleItemSelect}
          seeAllPath="/all-anime"
        />

        <div className="mx-4 border-t border-white/5 my-1" />

        <ContentSection
          title="Latest Donghua"
          label="Donghua"
          labelColor="red"
          items={donghuaData}
          loading={loading}
          onItemClick={handleItemSelect}
          seeAllPath="/all-donghua"
        />

        <div className="mx-4 border-t border-white/5 my-1" />
        <PopularTodaySection />
        <div className="mx-4 border-t border-white/5 my-1" />
        <AnimeMovie />
        <div className="h-6" />
      </div>
    </div>
  );
};

export default HomePage;
        
