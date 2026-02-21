import { ChevronLeft, Bookmark, Share2 } from 'lucide-react';

const AnimeHeader = ({ title, bookmarked, onGoBack, onBookmark, onShare }) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-dark-surface/80 backdrop-blur-lg border-b border-dark-border">
            <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center">
                    <button
                        onClick={onGoBack}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <h1 className="ml-2 text-lg font-semibold text-white line-clamp-1">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBookmark}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <Bookmark
                            size={20}
                            className={bookmarked ? 'fill-primary-400 text-primary-400' : 'text-gray-300'}
                        />
                    </button>
                    <button
                        onClick={onShare}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <Share2 size={20} className="text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnimeHeader;