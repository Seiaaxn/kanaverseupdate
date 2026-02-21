// src/components/home/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const NOTIF_KEY = 'animeplay_notifications';

const defaultNotifications = [
    {
        id: 1,
        title: 'New Episode Available',
        message: 'Demon Slayer Season 4 - Episode 12 is now streaming.',
        time: '2 minutes ago',
        read: false,
        type: 'episode'
    },
    {
        id: 2,
        title: 'Trending Now',
        message: 'Solo Leveling is trending #1 today.',
        time: '1 hour ago',
        read: false,
        type: 'trending'
    },
    {
        id: 3,
        title: 'New Donghua Added',
        message: 'Battle Through the Heavens Season 6 has been added.',
        time: '3 hours ago',
        read: true,
        type: 'new'
    },
];

const getNotifications = () => {
    try {
        const saved = localStorage.getItem(NOTIF_KEY);
        return saved ? JSON.parse(saved) : defaultNotifications;
    } catch {
        return defaultNotifications;
    }
};

const saveNotifications = (notifs) => {
    try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    } catch {}
};

const Header = ({ scrolled }) => {
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState(getNotifications);
    const panelRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        };
        if (showNotifs) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showNotifs]);

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        saveNotifications(updated);
    };

    const markRead = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        saveNotifications(updated);
    };

    const removeNotif = (id) => {
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        saveNotifications(updated);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            scrolled ? 'glass border-b border-white/5' : 'bg-gradient-to-b from-black/70 to-transparent'
        }`}>
            <div className="flex items-center justify-between px-4" style={{ height: '52px' }}>
                <div className="flex items-center gap-1">
                    <span className="text-base font-bold tracking-tight">
                        <span className="text-white">kana</span>
                        <span className="text-primary-400">verse</span>
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Link to="/search" className="p-2 hover:bg-white/8 rounded-full transition-colors">
                        <Search size={18} className="text-gray-400" />
                    </Link>

                    <div className="relative" ref={panelRef}>
                        <button
                            onClick={() => setShowNotifs(v => !v)}
                            className="p-2 hover:bg-white/8 rounded-full transition-colors relative"
                        >
                            <Bell size={18} className={`transition-colors ${showNotifs ? 'text-primary-400' : 'text-gray-400'}`} />
                            {unreadCount > 0 && (
                                <span className="notification-dot" />
                            )}
                        </button>

                        {showNotifs && (
                            <div className="absolute right-0 top-full mt-2 w-80 glass-strong border border-white/8 rounded-xl overflow-hidden animate-fade-in shadow-2xl">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                    <span className="text-sm font-semibold text-white">Notifications</span>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            <Check size={12} />
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500 text-sm">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => markRead(notif.id)}
                                                className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-white/4 last:border-0 ${
                                                    notif.read ? 'hover:bg-white/3' : 'bg-primary-400/5 hover:bg-primary-400/8'
                                                }`}
                                            >
                                                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary-400'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-medium mb-0.5 ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-600 mt-1">{notif.time}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeNotif(notif.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all flex-shrink-0"
                                                >
                                                    <X size={12} className="text-gray-500" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
