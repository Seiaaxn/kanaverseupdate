// src/components/home/ContentSection.jsx
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';

const ContentSection = ({
  title, label, labelColor='blue', items=[], loading=false, onItemClick, seeAllPath, limit=9
}) => {
  const navigate = useNavigate();

  const labelClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
    red: 'bg-red-500/20 text-red-400 border border-red-500/20',
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
  };
  const badgeClasses = {
    blue: 'bg-blue-500/80 text-white',
    red: 'bg-red-500/80 text-white',
    yellow: 'bg-yellow-500/80 text-black',
  };

  const getEpisodeInfo = (item) => {
    if (item.episode) return item.episode;
    if (item.info) {
      if (typeof item.info === 'string' && item.info.startsWith('Ep ')) return item.info.replace('Ep ','');
      return item.info;
    }
    return null;
  };

  if (loading) {
    return (
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-5 bg-dark-card rounded-full animate-pulse"/>
            <div className="w-28 h-5 bg-dark-card rounded animate-pulse"/>
          </div>
          <div className="w-16 h-4 bg-dark-card rounded animate-pulse"/>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_,i)=>(
            <div key={i}><div className="aspect-[3/4] rounded-lg bg-dark-card animate-pulse mb-2"/><div className="h-3 w-3/4 bg-dark-card rounded animate-pulse"/></div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const displayItems = items.slice(0, limit);

  const handleSeeAll = () => {
    if (seeAllPath) { navigate(seeAllPath); return; }
    // Default fallback based on label
    if (label === 'Donghua') navigate('/all-donghua');
    else if (label === 'Movie' || label === 'Movies') navigate('/all-movies');
    else navigate('/all-anime');
  };

  return (
    <section className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labelClasses[labelColor]||labelClasses.blue}`}>
            {label}
          </span>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        <button onClick={handleSeeAll} className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-primary-400 transition-colors">
          See All <ChevronRight size={13}/>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {displayItems.map((item,index)=>{
          const episodeInfo=getEpisodeInfo(item);
          return (
            <div key={index} onClick={()=>onItemClick(item)} className="group cursor-pointer anime-card">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 bg-dark-card">
                <img src={item.image||`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0,8))}&background=1a1a1a&color=555&size=300`}
                  alt={item.title} className="w-full h-full object-cover" loading="lazy"
                  onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0,8))}&background=1a1a1a&color=555&size=300`;}}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/>
                <div className="absolute top-1.5 left-1.5">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${badgeClasses[labelColor]||badgeClasses.blue}`}>{label}</span>
                </div>
                {episodeInfo&&(
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="px-1.5 py-0.5 bg-black/80 text-primary-300 text-[9px] font-semibold rounded">EP {episodeInfo}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-9 h-9 bg-primary-400/90 rounded-full flex items-center justify-center">
                    <Play size={16} className="text-black ml-0.5" fill="currentColor"/>
                  </div>
                </div>
              </div>
              <h3 className="text-xs font-medium text-gray-300 line-clamp-2 group-hover:text-white transition-colors leading-tight">{item.title}</h3>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContentSection;
