const DonghuaCover = ({ image, title, category }) => {
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=333&color=fff&size=600`;

    return (
        <div className="relative w-full h-[50vh]">
            <img
                src={image || fallbackImage}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = fallbackImage;
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-20 left-4">
                <span className="px-3 py-1 bg-primary-400 text-black text-xs font-bold rounded-full">
                    {category}
                </span>
            </div>
        </div>
    );
};

export default DonghuaCover;