import { forwardRef } from 'react';
import { MonitorPlay } from 'lucide-react';

const StreamingDonghuaVideoPlayer = forwardRef(({
    selectedServer,
    isLoading,
    onLoad,
    onError
}, ref) => {
    if (!selectedServer) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <MonitorPlay size={40} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No stream available</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-bg z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-gray-500">Loading player...</p>
                    </div>
                </div>
            )}

            {selectedServer.hasAds && (
                <div className="absolute top-2 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <div className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5"
                        style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308' }}>
                        ⚠️ Server ini mengandung iklan
                    </div>
                </div>
            )}

            <iframe
                ref={ref}
                src={selectedServer.url}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                frameBorder="0"
                title={selectedServer.server}
                onLoad={onLoad}
                onError={onError}
                sandbox="allow-same-origin allow-scripts allow-presentation allow-top-navigation-by-user-activation"
            />
        </>
    );
});

StreamingDonghuaVideoPlayer.displayName = 'StreamingDonghuaVideoPlayer';

export default StreamingDonghuaVideoPlayer;
        
