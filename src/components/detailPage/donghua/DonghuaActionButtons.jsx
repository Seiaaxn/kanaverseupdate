import { Play, Bookmark } from 'lucide-react';

const DonghuaActionButtons = ({ onWatchNow, onBookmark, bookmarked }) => {
    return (
        <div className="flex gap-3 mb-6">
            <button
                onClick={onWatchNow}
                className="flex-1 bg-primary-400 text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-500 transition"
            >
                <Play size={18} fill="currentColor" />
                <span>Watch Now</span>
            </button>
            <button
                onClick={onBookmark}
                className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg hover:border-primary-400/50 transition"
            >
                <Bookmark
                    size={18}
                    className={bookmarked ? 'fill-primary-400 text-primary-400' : 'text-gray-300'}
                />
            </button>
        </div>
    );
};

export default DonghuaActionButtons;