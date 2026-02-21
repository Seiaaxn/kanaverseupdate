// src/components/home/ContinueWatching.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Play, Trash2 } from 'lucide-react';

const ContinueWatching = ({
    history = [],
    isLoading = false,
    onContinue,
    onRemove,
    onClearAll
}) => {
    const [showOptions, setShowOptions] = useState(false);

    const formatEpisode = (item) => {
        if (!item.episode) return "EP 1";

        let episodeValue = item.episode;

        if (typeof episodeValue === "object") {
            episodeValue = episodeValue.title || "";
        }

        const hasEpisodeText = /(episode|ep)/i.test(
            item.title || episodeValue
        );

        return hasEpisodeText
            ? episodeValue
            : `EP ${episodeValue}`;
    };

    // 🔥 SKELETON LOADING
    if (isLoading) {
        return (
            <section className="px-4 mt-6">
                <div className="flex items-center space-x-2 mb-3">
                    <div className="h-4 w-36 bg-gray-600 rounded animate-pulse" />
                </div>

                <div className="flex gap-3 overflow-x-auto hide-scrollbar overflow-y-hidden -mx-4 px-4 pb-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="shrink-0 w-44 relative rounded-[10px] overflow-hidden border border-dark-border"
                        >
                            <div className="relative aspect-[16/10] bg-dark-surface animate-pulse">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                <div className="absolute bottom-2 left-2 right-2 space-y-2">
                                    <div className="h-3 w-16 bg-gray-600 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-600 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!history.length) return null;

    return (
        <section className="px-4 mt-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <h2 className="text-base font-medium text-white">
                        Continue Watching
                    </h2>
                </div>

                <Link
                    to="/history"
                    className="text-xs text-primary-400 flex items-center space-x-1"
                >
                    <span>See All</span>
                    <ChevronRight size={14} />
                </Link>
            </div>

            {showOptions && (
                <div className="mb-3 p-2 bg-dark-surface rounded-lg border border-dark-border">
                    <button
                        onClick={onClearAll}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={14} />
                        <span>Clear All History</span>
                    </button>
                </div>
            )}

            <div className="flex overflow-x-auto hide-scrollbar gap-3 -mx-4 px-4 pb-2">
                {history.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onContinue(item)}
                        className="shrink-0 w-44 group relative rounded-[10px] overflow-hidden border border-dark-border hover:border-primary-400/50 transition-all cursor-pointer"
                    >
                        <div className="relative aspect-[16/10]">
                            <img
                                src={
                                    item.image ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        item.title
                                    )}&background=333&color=fff&size=300`
                                }
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={26} className="text-white fill-white" />
                            </div>

                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-xs text-primary-400 font-semibold line-clamp-1">
                                    {formatEpisode(item)}
                                </p>
                                <h4 className="text-sm font-semibold text-white line-clamp-1">
                                    {item.title}
                                </h4>
                            </div>

                            <button
                                onClick={(e) => onRemove(e, item.id)}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 size={14} className="text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ContinueWatching;
