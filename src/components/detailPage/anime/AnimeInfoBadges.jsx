const AnimeInfoBadges = ({ status, type, totalEpisodes, released }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {status && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {status}
                </span>
            )}
            {type && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {type}
                </span>
            )}
            {totalEpisodes > 0 && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {totalEpisodes} Episodes
                </span>
            )}
            {released && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {released}
                </span>
            )}
        </div>
    );
};

export default AnimeInfoBadges;