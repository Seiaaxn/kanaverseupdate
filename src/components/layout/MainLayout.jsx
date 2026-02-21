import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Heart, Search, User } from 'lucide-react';
import { getUser } from '../../utils/userSystem';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home, path: '/', color: '#7c6dfa' },
    { id: 'explore', label: 'Jelajah', icon: Compass, path: '/explore', color: '#6daefa' },
    { id: 'search', label: 'Cari', icon: Search, path: '/search', color: '#6dfabc' },
    { id: 'mylist', label: 'List', icon: Heart, path: '/mylist', color: '#fa6d9a' },
    { id: 'profile', label: 'Profil', icon: User, path: '/profile', color: '#fac96d' },
];

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = getUser();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>
            <Outlet />
            <nav className="fixed bottom-0 left-0 right-0 z-50 glass pb-safe" style={{ borderTop: '1px solid var(--border)', maxWidth: '480px', margin: '0 auto' }}>
                <div className="flex justify-around items-center" style={{ height: '60px' }}>
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button key={item.id} onClick={() => navigate(item.path)}
                                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative">
                                {active && (
                                    <div className="nav-indicator" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                                )}
                                <div className="relative">
                                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8}
                                        style={{ color: active ? item.color : 'var(--muted)', filter: active ? `drop-shadow(0 0 6px ${item.color}88)` : 'none', transition: 'all 0.2s' }} />
                                    {item.id === 'profile' && user && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: '#6dfabc', borderColor: 'var(--bg)' }} />
                                    )}
                                </div>
                                <span className="text-[9px] font-bold" style={{ color: active ? item.color : 'var(--muted)', transition: 'color 0.2s' }}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;

                                      
