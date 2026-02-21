import {
    Flag, Film, Monitor, Users, Globe,
    Calendar, Clock, CalendarClock, Award,
    User, Heart
} from 'lucide-react';
import DonghuaRating from './DonghuaRating';

const DonghuaDetailsTab = ({
    description,
    status,
    type,
    totalEpisodes,
    studio,
    network,
    released,
    duration,
    season,
    country,
    fansub,
    postedBy,
    postedOn,
    updatedOn,
    genres = [],
    rating
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
                    {studio && studio !== 'Unknown' && (
                        <div className="flex items-center gap-2 text-sm">
                            <Users size={14} className="text-gray-500" />
                            <span className="text-gray-400">Studio:</span>
                            <span className="text-white ml-auto">{studio}</span>
                        </div>
                    )}
                    {network && (
                        <div className="flex items-center gap-2 text-sm">
                            <Globe size={14} className="text-gray-500" />
                            <span className="text-gray-400">Network:</span>
                            <span className="text-white ml-auto">{network}</span>
                        </div>
                    )}
                    {released && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-gray-400">Released:</span>
                            <span className="text-white ml-auto">{released}</span>
                        </div>
                    )}
                    {duration && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-500" />
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-auto">{duration}</span>
                        </div>
                    )}
                    {season && (
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarClock size={14} className="text-gray-500" />
                            <span className="text-gray-400">Season:</span>
                            <span className="text-white ml-auto">{season}</span>
                        </div>
                    )}
                    {country && (
                        <div className="flex items-center gap-2 text-sm">
                            <Flag size={14} className="text-gray-500" />
                            <span className="text-gray-400">Country:</span>
                            <span className="text-white ml-auto">{country}</span>
                        </div>
                    )}
                    {fansub && (
                        <div className="flex items-center gap-2 text-sm col-span-2">
                            <Award size={14} className="text-gray-500" />
                            <span className="text-gray-400">Fansub:</span>
                            <span className="text-white ml-auto">{fansub}</span>
                        </div>
                    )}
                    {postedBy && (
                        <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-gray-500" />
                            <span className="text-gray-400">Posted:</span>
                            <span className="text-white ml-auto">{postedBy}</span>
                        </div>
                    )}
                    {postedOn && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-gray-400">Posted on:</span>
                            <span className="text-white ml-auto">{postedOn}</span>
                        </div>
                    )}
                    {updatedOn && (
                        <div className="flex items-center gap-2 text-sm col-span-2">
                            <Clock size={14} className="text-gray-500" />
                            <span className="text-gray-400">Updated:</span>
                            <span className="text-white ml-auto">{updatedOn}</span>
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
                                className="px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300 border border-dark-border hover:border-primary-400/50 transition cursor-pointer"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating */}
            <DonghuaRating rating={rating} />
        </div>
    );
};

export default DonghuaDetailsTab;