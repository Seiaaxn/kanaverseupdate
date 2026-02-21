import { SkipBack, SkipForward } from 'lucide-react';

const StreamingAnimeNavigationButtons = ({
    onPrev,
    onNext,
    onAllEpisodes,
    hasPrev,
    hasNext,
    allEpisodesUrl
}) => {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${hasPrev
                        ? 'bg-dark-surface border border-dark-border text-white hover:bg-primary-400 hover:text-black hover:border-primary-400'
                        : 'bg-dark-surface/50 border border-dark-border/50 text-gray-600 cursor-not-allowed'
                    }`}
            >
                <SkipBack size={18} />
                <span>Previous</span>
            </button>

            <a
                href={allEpisodesUrl}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm font-medium text-white hover:bg-primary-400 hover:text-black hover:border-primary-400 transition-all text-center"
            >
                All Episodes
            </a>

            <button
                onClick={onNext}
                disabled={!hasNext}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${hasNext
                        ? 'bg-dark-surface border border-dark-border text-white hover:bg-primary-400 hover:text-black hover:border-primary-400'
                        : 'bg-dark-surface/50 border border-dark-border/50 text-gray-600 cursor-not-allowed'
                    }`}
            >
                <span>Next</span>
                <SkipForward size={18} />
            </button>
        </div>
    );
};

export default StreamingAnimeNavigationButtons;