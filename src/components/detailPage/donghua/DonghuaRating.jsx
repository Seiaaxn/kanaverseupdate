import { Star } from 'lucide-react';

const DonghuaRating = ({ rating }) => {
    if (!rating || !rating.value) return null;

    const ratingValue = rating.value || 0;
    const ratingPercentage = rating.percentage || ratingValue * 10 || 0;

    return (
        <div>
            <h3 className="text-white font-semibold mb-2">Rating</h3>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <Star size={20} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold text-lg">{ratingValue}</span>
                </div>
                <div className="flex-1 h-2 bg-dark-surface rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${ratingPercentage}%` }}
                    />
                </div>
                {rating.votes > 0 && (
                    <span className="text-xs text-gray-500">
                        ({rating.votes} votes)
                    </span>
                )}
            </div>
        </div>
    );
};

export default DonghuaRating;