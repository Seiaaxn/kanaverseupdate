import { Star, Tv } from 'lucide-react';

const StreamingDonghuaInfoCard = ({ episodeNumber, donghua }) => {
    if (!donghua) return null;

    return (
        <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3">
                <div className="w-16 h-22 rounded-xl overflow-hidden flex-shrink-0" style={{ height: '88px' }}>
                    <img
                        src={donghua.image}
                        alt={donghua.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(donghua.title?.slice(0, 6) || 'D')}&background=1f0a0a&color=fa6d9a&size=200`;
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-sm font-black text-white leading-tight line-clamp-2">{donghua.title}</h2>
                        {episodeNumber && (
                            <span className="flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-lg text-white"
                                style={{ background: 'linear-gradient(135deg, #fa6d9a, #fa6d6d)' }}>
                                EP {episodeNumber}
                            </span>
                        )}
                    </div>

                    {donghua.rating?.value > 0 && (
                        <div className="flex items-center gap-1 mb-1.5">
                            <Star size={11} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-white">{donghua.rating.value}</span>
                        </div>
                    )}

                    <p className="text-[11px] leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--muted)' }}>
                        {donghua.synopsis || donghua.description || ''}
                    </p>

                    {donghua.genres?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {donghua.genres.slice(0, 3).map((genre, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded-lg font-bold"
                                    style={{ background: 'rgba(250,109,154,0.15)', color: '#fa6d9a' }}>
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
