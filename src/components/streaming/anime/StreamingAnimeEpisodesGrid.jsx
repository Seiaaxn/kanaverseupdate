import { useState, useEffect, useRef, useMemo } from "react";
import { LayoutGrid, List, ArrowUpDown } from "lucide-react";

const StreamingAnimeEpisodesGrid = ({
    episodes = [],
    currentEpisodeNumber,
    onEpisodeClick
}) => {
    const [viewMode, setViewMode] = useState("horizontal");
    const [isAsc, setIsAsc] = useState(true); // true = ep 1 → atas
    const scrollRef = useRef(null);

    // Format date → 18 Jan 26
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit"
        });
    };

    // Sorting only affects horizontal mode
    const sortedEpisodes = useMemo(() => {
        if (viewMode !== "horizontal") return episodes;

        const sorted = [...episodes].sort((a, b) => {
            const numA = a.number || 0;
            const numB = b.number || 0;
            return isAsc ? numA - numB : numB - numA;
        });

        return sorted;
    }, [episodes, isAsc, viewMode]);

    // Auto scroll ke episode aktif
    useEffect(() => {
        if (viewMode !== "horizontal") return;

        const activeElement = scrollRef.current?.querySelector(
            `[data-active="true"]`
        );

        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest"
            });
        }
    }, [currentEpisodeNumber, viewMode, isAsc]);

    if (!episodes || episodes.length === 0) return null;

    return (
        <div className="mb-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                    Episodes
                </h3>

                <div className="flex items-center gap-2">

                    {/* Sort Button */}
                    {/* {viewMode === "horizontal" && (
                        <button
                            onClick={() => setIsAsc(!isAsc)}
                            className="p-2 rounded-lg bg-dark-surface hover:bg-dark-card transition"
                        >
                            <ArrowUpDown
                                size={16}
                                className={`transition ${isAsc
                                        ? "text-primary-400"
                                        : "text-gray-400"
                                    }`}
                            />
                        </button>
                    )} */}

                    {/* View Toggle */}
                    <button
                        onClick={() =>
                            setViewMode(
                                viewMode === "horizontal"
                                    ? "grid"
                                    : "horizontal"
                            )
                        }
                        className="p-2 transition"
                    >
                        {viewMode === "horizontal" ? (
                            <LayoutGrid size={16} className="text-gray-400" />
                        ) : (
                            <List size={16} className="text-gray-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* HORIZONTAL */}
            {viewMode === "horizontal" && (
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
                >
                    {sortedEpisodes.map((ep, idx) => {
                        const episodeNumber = ep.number || idx + 1;
                        const isCurrent =
                            episodeNumber === currentEpisodeNumber;

                        return (
                            <button
                                key={idx}
                                data-active={isCurrent}
                                onClick={() => onEpisodeClick(ep)}
                                className={` px-3 py-2 whitespace-nowrap rounded-xl text-left transition-all ${isCurrent
                                        ? "bg-primary-400/20 border border-primary-400/50"
                                        : "bg-dark-surface border border-dark-border hover:border-primary-400/30"
                                    }`}
                            >
                                <p
                                    className={`text-sm font-medium ${isCurrent
                                            ? "text-white"
                                            : "text-gray-300"
                                        }`}
                                >
                                    Episode {episodeNumber}
                                </p>

                                {ep.date && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(ep.date)}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* GRID (tetap original order) */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {episodes.map((ep, idx) => {
                        const episodeNumber = ep.number || idx + 1;
                        const isCurrent =
                            episodeNumber === currentEpisodeNumber;

                        return (
                            <button
                                key={idx}
                                onClick={() => onEpisodeClick(ep)}
                                className={`p-3 rounded-xl text-left transition-all ${isCurrent
                                        ? "bg-primary-400/20 border border-primary-400/50"
                                        : "bg-dark-surface border border-dark-border hover:border-primary-400/30"
                                    }`}
                            >
                                <p
                                    className={`text-sm font-medium ${isCurrent
                                            ? "text-white"
                                            : "text-gray-300"
                                        }`}
                                >
                                    Episode {episodeNumber}
                                </p>

                                {ep.date && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(ep.date)}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StreamingAnimeEpisodesGrid;
