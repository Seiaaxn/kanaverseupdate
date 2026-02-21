import { Flag, Film, Monitor, Calendar } from 'lucide-react';

const AnimeDetailsTab = ({
    description,
    status,
    type,
    totalEpisodes,
    released,
    genres = []
}) => {
    return (
        <div className="space-y-6">
            {/* Synopsis */}
            <div>
                <h3 className="text-white font-semibold mb-2">Synopsis</h3>
                <p className="text-gray-400 text-sm leading-relaxed text-justify">
                    {description || 'No synopsis available.'}
                </p>
            </div>

            {/* Information Grid */}
            <div>
                <h3 className="text-white font-semibold mb-3">Information</h3>
                <div className="grid grid-cols-2 gap-3">
                    {status && (
                        <div className="flex items-center gap-2 text-sm">
                            <Flag size={14} className="text-gray-500" />
                            <span className="text-gray-400">Status:</span>
                            <span className="text-white ml-auto">{status}</span>
                        </div>
                    )}
                    {type && (
                        <div className="flex items-center gap-2 text-sm">
                            <Film size={14} className="text-gray-500" />
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white ml-auto">{type}</span>
                        </div>
                    )}
                    {totalEpisodes > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Monitor size={14} className="text-gray-500" />
                            <span className="text-gray-400">Episodes:</span>
                            <span className="text-white ml-auto">{totalEpisodes}</span>
                        </div>
                    )}
                    {released && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-gray-400">Released:</span>
                            <span className="text-white ml-auto">{released}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
                <div>
                    <h3 className="text-white font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                        {genres.map((genre, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimeDetailsTab;