import { ChevronLeft } from 'lucide-react';

const StreamingAnimeNavbar = ({ title, episodeTitle, episodeNumber, onBack }) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-12 flex items-center px-3">
            <button
                onClick={onBack}
                className="p-1.5 hover:bg-white/8 rounded-full transition-colors mr-2 flex-shrink-0"
            >
                <ChevronLeft size={18} className="text-gray-400" />
            </button>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{title || 'Anime'}</p>
                {episodeTitle && (
                    <p className="text-[10px] text-gray-500 truncate leading-tight">{episodeTitle}</p>
                )}
            </div>

            {episodeNumber && (
                <span className="flex-shrink-0 ml-2 text-[10px] font-semibold px-2 py-0.5 bg-primary-400/15 text-primary-400 rounded-full">
                    EP {episodeNumber}
                </span>
            )}
        </div>
    );
};

export default StreamingAnimeNavbar;
