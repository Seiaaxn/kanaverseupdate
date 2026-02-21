const StreamingAnimeLoadingState = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-bg to-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading episode...</p>
            </div>
        </div>
    );
};

export default StreamingAnimeLoadingState;