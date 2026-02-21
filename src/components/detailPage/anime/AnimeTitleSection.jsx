const AnimeTitleSection = ({ title, image, altTitles }) => {
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=333&color=fff&size=200`;

    return (
        <div className="flex items-end gap-4 mb-4">
            <div className="w-24 h-32 rounded-lg overflow-hidden shadow-lg border-2 border-dark-border flex-shrink-0">
                <img
                    src={image || fallbackImage}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = fallbackImage;
                    }}
                />
            </div>
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
                {altTitles && altTitles.length > 0 && (
                    <p className="text-sm text-gray-400">{altTitles.join(' • ')}</p>
                )}
            </div>
        </div>
    );
};

export default AnimeTitleSection;