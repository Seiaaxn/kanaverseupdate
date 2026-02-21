const DonghuaErrorState = ({ error, onGoBack }) => {
    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Donghua</h2>
                <p className="text-gray-400 mb-4">{error || 'Donghua not found'}</p>
                <button
                    onClick={onGoBack}
                    className="px-6 py-2 bg-primary-400 text-black rounded-lg font-semibold hover:bg-primary-500 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default DonghuaErrorState;