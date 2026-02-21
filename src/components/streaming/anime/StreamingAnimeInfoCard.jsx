import { useState } from "react";

const StreamingAnimeInfoCard = ({ anime, episodeNumber }) => {
    const [expanded, setExpanded] = useState(false);

    if (!anime) return null;

    return (
        <div className="mb-6">
            <div className="flex items-start gap-4">
                <div className="flex-1">

                    {/* Episode Badge */}
                    {episodeNumber && (
                        <div className="mb-2">
                            <span className="rounded text-[10px] font-bold">
                                Episode {episodeNumber}
                            </span>
                        </div>
                    )}

                    <h2 className="text-lg font-bold text-white mb-1 line-clamp-2">
                        {anime.title}
                    </h2>

                    {/* Sinopsis */}
                    <p
                        onClick={() => setExpanded(!expanded)}
                        className={`text-sm text-gray-400 mb-1 cursor-pointer text-justify transition-all duration-300 ${expanded ? "" : "line-clamp-2"
                            }`}
                    >
                        {anime.synopsis || "No synopsis available."}
                    </p>

                    {expanded && (
                        <button
                            onClick={() => setExpanded(false)}
                            className="text-xs text-primary-400 hover:underline"
                        >
                            Show less
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StreamingAnimeInfoCard;
