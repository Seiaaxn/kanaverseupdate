import { Heart } from 'lucide-react';

const DonghuaInfoBadges = ({
    status,
    type,
    totalEpisodes,
    duration,
    released,
    country,
    followers
}) => {
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
            {duration && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {duration}
                </span>
            )}
            {released && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {released}
                </span>
            )}
            {country && country !== 'China' && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border">
                    {country}
                </span>
            )}
            {followers > 0 && (
                <span className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border flex items-center gap-1">
                    <Heart size={12} className="text-red-400" />
                    {followers} Followers
                </span>
            )}
        </div>
    );
};

export default DonghuaInfoBadges;