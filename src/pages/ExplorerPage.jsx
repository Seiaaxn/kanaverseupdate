// pages/ExplorerPage.jsx
import { useState } from 'react';
import { Grid3X3, CalendarDays, Flame, TrendingUp, Star } from 'lucide-react';
import GenrePage from './explorer/GenrePage';
import SchedulePage from './explorer/SchedulePage';
import PopularPage from './explorer/PopularPage';
import TrendingPage from './explorer/TrendingPage';
import TopRatedPage from './explorer/TopRatedPage';

const ExplorerPage = () => {
  const [activeTab, setActiveTab] = useState('genre');

  const tabs = [
    { id:'genre', label:'Genres', icon:Grid3X3, component:GenrePage },
    { id:'schedule', label:'Schedule', icon:CalendarDays, component:SchedulePage },
    { id:'popular', label:'Popular', icon:Flame, component:PopularPage },
    { id:'trending', label:'Trending', icon:TrendingUp, component:TrendingPage },
    { id:'toprated', label:'Top Rated', icon:Star, component:TopRatedPage },
  ];

  const ActiveComponent = tabs.find(t=>t.id===activeTab)?.component || GenrePage;

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <header className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur border-b border-dark-border">
        <div className="px-4 pt-4 pb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {tabs.map(tab=>{
              const Icon=tab.icon; const isActive=activeTab===tab.id;
              return (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive?'bg-primary-400 text-black shadow-md':'bg-dark-surface text-gray-400 border border-dark-border hover:bg-dark-card hover:text-white'}`}>
                  <Icon size={16}/>{tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-120px)]">
        <ActiveComponent/>
      </main>
    </div>
  );
};

export default ExplorerPage;
