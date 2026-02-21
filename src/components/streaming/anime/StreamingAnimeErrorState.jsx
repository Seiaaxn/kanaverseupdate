import { AlertCircle } from 'lucide-react';

const StreamingAnimeErrorState = ({ error, onGoHome }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-bg to-black flex items-center justify-center">
            <div className="text-center max-w-md px-4">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Error Loading Episode</h2>
                <p className="text-gray-400 mb-4">{error || 'Unknown error'}</p>
                <button
                    onClick={onGoHome}
                    className="px-6 py-2 bg-primary-400 text-black rounded-lg font-semibold hover:bg-primary-500 transition"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default StreamingAnimeErrorState;