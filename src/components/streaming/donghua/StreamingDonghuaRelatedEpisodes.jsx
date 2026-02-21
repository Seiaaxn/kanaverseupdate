import { Film } from 'lucide-react';

const StreamingDonghuaRelatedEpisodes = ({ episodes = [], onEpisodeClick }) => {
    if (!episodes || episodes.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Film size={18} className="text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Related Episodes</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {episodes.map((ep, idx) => (
                    <button
                        key={idx}
                        onClick={() => onEpisodeClick(ep)}
                        className="p-3 bg-dark-surface border border-dark-border rounded-xl text-left hover:border-primary-400/30 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-dark-card flex items-center justify-center text-xs font-bold text-gray-500">
                                {ep.number || idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300 truncate">
                                    {ep.title}
                                </p>
                                {ep.info && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {ep.info}
                                    </p>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StreamingDonghuaRelatedEpisodes;