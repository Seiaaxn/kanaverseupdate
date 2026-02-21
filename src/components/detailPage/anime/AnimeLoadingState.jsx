import { ChevronLeft } from 'lucide-react';

const AnimeLoadingState = ({ onGoBack }) => {
    return (
        <div className="min-h-screen bg-dark-bg">
            <div className="fixed top-0 left-0 right-0 z-50 bg-dark-surface/80 backdrop-blur-lg border-b border-dark-border">
                <div className="flex items-center px-4 h-14">
                    <button onClick={onGoBack} className="p-2 hover:bg-white/10 rounded-full transition">
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div className="ml-2 h-5 w-48 bg-dark-card rounded animate-pulse" />
                </div>
            </div>

            <div className="pt-14">
                <div className="relative w-full h-[50vh] bg-dark-surface animate-pulse" />
                <div className="px-4 -mt-20 relative z-10">
                    <div className="flex items-end gap-4 mb-4">
                        <div className="w-24 h-32 rounded-lg bg-dark-card animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-8 w-3/4 bg-dark-card rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-dark-card rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-dark-card rounded-full animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeLoadingState;