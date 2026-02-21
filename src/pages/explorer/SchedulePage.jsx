// pages/explorer/SchedulePage.jsx
import { useState, useEffect } from 'react';
import { Calendar, Clock, Tv, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const days = [
  { id:'monday', label:'Mon' },{ id:'tuesday', label:'Tue' },{ id:'wednesday', label:'Wed' },
  { id:'thursday', label:'Thu' },{ id:'friday', label:'Fri' },{ id:'saturday', label:'Sat' },{ id:'sunday', label:'Sun' },
];

const SchedulePage = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(()=>{
    const dayMap=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return dayMap[new Date().getDay()];
  });
  const [animeSchedule, setAnimeSchedule] = useState({});
  const [donghuaSchedule, setDonghuaSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(()=>{
    (async()=>{
      try {
        setLoading(true);
        const [ar,dr] = await Promise.all([
          axios.get(`${API_BASE}/anime/schedule`).catch(()=>({data:{data:{}}})),
          axios.get(`${API_BASE}/donghua/schedule`).catch(()=>({data:{data:{}}})),
        ]);
        setAnimeSchedule(ar.data.data||{});
        setDonghuaSchedule(dr.data.data||{});
      } catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  },[]);

  const handleItemClick = (item) => {
    const url = item.url || item.link;
    if (!url) return;
    const category = item.type === 'donghua' ? 'donghua' : 'anime';
    navigate(`/detail/${category}/${encodeURIComponent(url.replace(/\/+$/,''))}`);
  };

  const getCurrentSchedule = () => {
    const al = (animeSchedule[activeDay]||[]).map(i=>({...i,type:'anime'}));
    const dl = (donghuaSchedule[activeDay]||[]).map(i=>({...i,type:'donghua'}));
    if (activeTab==='anime') return al;
    if (activeTab==='donghua') return dl;
    return [...al,...dl].sort((a,b)=>(a.time||'00:00').localeCompare(b.time||'00:00'));
  };

  const currentSchedule = getCurrentSchedule();

  return (
    <div className="animate-fade-in">
      <div className="sticky top-[15px] z-30 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-primary-400"/> Release Schedule
          </h2>
          <span className="text-xs text-gray-500 capitalize">{activeDay}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {days.map(day=>{
            const isActive=activeDay===day.id;
            return (
              <button key={day.id} onClick={()=>setActiveDay(day.id)}
                className={`flex flex-col items-center min-w-[50px] p-2 rounded-xl transition-all ${isActive?'bg-primary-400 text-black':'bg-dark-surface text-gray-400 hover:bg-dark-card border border-dark-border'}`}>
                <span className="text-xs font-medium">{day.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          {[{id:'all',label:'All',icon:Calendar},{id:'anime',label:'Anime',icon:Tv},{id:'donghua',label:'Donghua',icon:Flame}].map(tab=>{
            const Icon=tab.icon; const isA=activeTab===tab.id;
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isA?'bg-primary-400/20 text-primary-400 border border-primary-400/50':'bg-dark-surface text-gray-400 border border-dark-border'}`}>
                <Icon size={12}/><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_,i)=>(
              <div key={i} className="flex gap-3 p-3 bg-dark-surface rounded-xl border border-dark-border">
                <div className="w-16 h-20 rounded-lg skeleton shrink-0"/>
                <div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded skeleton"/><div className="h-3 w-1/2 rounded skeleton"/></div>
              </div>
            ))}
          </div>
        ) : currentSchedule.length > 0 ? (
          <div className="space-y-3">
            {currentSchedule.map((item,index)=>(
              <div key={index} onClick={()=>handleItemClick(item)}
                className="group flex gap-3 p-3 bg-dark-surface rounded-xl border border-dark-border hover:border-primary-400/50 transition-all cursor-pointer">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-dark-card">
                  <img src={item.image||`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.slice(0,2))}&background=1a1a2e&color=7c6dfa&size=100`}
                    alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white">▶</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-primary-300 transition-colors">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${item.type==='anime'?'bg-blue-500/20 text-blue-400':'bg-red-500/20 text-red-400'}`}>
                      {item.type==='anime'?'ANIME':'DONGHUA'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.genre||''}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1 text-primary-400 font-medium"><Clock size={12}/>{item.time||'TBA'}</span>
                    {item.score&&<span>★ {item.score}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="text-gray-600 mx-auto mb-4"/>
            <p className="text-gray-500">No releases scheduled for {activeDay}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
                                                         
