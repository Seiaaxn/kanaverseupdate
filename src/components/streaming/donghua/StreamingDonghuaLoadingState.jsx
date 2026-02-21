import { ChevronLeft } from 'lucide-react';

const StreamingDonghuaLoadingState = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-bg to-black">
            {/* Navbar skeleton */}
            <div className="sticky top-0 z-50 bg-dark-surface/95 backdrop-blur-sm border-b border-dark-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center h-16">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center">
                                <ChevronLeft size={18} className="text-gray-500" />
                            </div>
                            <span className="text-sm font-medium hidden sm:block">Back</span>
                        </button>

                        <div className="flex-1 mx-4">
                            <div className="h-5 w-48 bg-dark-card rounded animate-pulse mb-1" />
                            <div className="h-4 w-32 bg-dark-card rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Video player skeleton */}
            <div className="relative w-full bg-black aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-dark-bg">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading donghua episode...</p>
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Server selector skeleton */}
                <div className="mb-6">
                    <div className="h-4 w-24 bg-dark-card rounded animate-pulse mb-3" />
                    <div className="w-full sm:w-72 h-12 bg-dark-card rounded-xl animate-pulse" />
                </div>

                {/* Info card skeleton */}
                <div className="mb-6 bg-dark-surface rounded-xl border border-dark-border p-4">
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-28 rounded-lg bg-dark-card animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-6 w-3/4 bg-dark-card rounded animate-pulse" />
                            <div className="h-4 w-32 bg-dark-card rounded animate-pulse" />
                            <div className="h-4 w-full bg-dark-card rounded animate-pulse" />
                            <div className="h-4 w-2/3 bg-dark-card rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Related episodes skeleton */}
                <div className="mb-6">
                    <div className="h-4 w-32 bg-dark-card rounded animate-pulse mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-dark-card rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreamingDonghuaLoadingState;