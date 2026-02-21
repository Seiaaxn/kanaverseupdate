import { Star } from 'lucide-react';

const StreamingDonghuaInfoCard = ({ donghua }) => {
    if (!donghua) return null;

    return (
        <div className="mb-6 bg-dark-surface rounded-xl border border-dark-border p-4">
            <div className="flex items-start gap-4">
                {/* Poster */}
                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={donghua.image}
                        alt={donghua.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(donghua.title?.slice(0, 10))}&background=333&color=fff&size=200`;
                        }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-1">{donghua.title}</h2>

                    {/* Rating */}
                    {donghua.rating?.value > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-white">{donghua.rating.value}</span>
                            {donghua.rating.votes > 0 && (
                                <span className="text-xs text-gray-500">({donghua.rating.votes} votes)</span>
                            )}
                        </div>
                    )}

                    {/* Sinopsis */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {donghua.synopsis || 'No synopsis available.'}
                    </p>

                    {/* Genres */}
                    {donghua.genres?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {donghua.genres.map((genre, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-dark-card rounded-full text-gray-300">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StreamingDonghuaInfoCard;