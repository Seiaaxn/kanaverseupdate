import { useState } from 'react';
import { MonitorPlay, ChevronDown } from 'lucide-react';

const StreamingDonghuaServerSelector = ({
    streams = [],
    selectedServer,
    onServerSelect
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!streams || streams.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <MonitorPlay size={18} className="text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Video Server</h3>
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full sm:w-72 flex items-center justify-between px-4 py-3 bg-dark-surface border border-dark-border rounded-xl hover:border-primary-400/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <MonitorPlay size={18} className="text-primary-400" />
                        <span className="text-sm font-medium text-white">
                            {selectedServer?.server || 'Select Server'}
                        </span>
                        {selectedServer?.hasAds && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-[10px] font-bold">
                                ADS
                            </span>
                        )}
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 sm:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 sm:w-72 mt-2 bg-dark-surface border border-dark-border rounded-xl overflow-hidden z-50 shadow-xl max-h-96 overflow-y-auto">
                            {streams.map((server, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onServerSelect(server);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-dark-card transition-colors ${selectedServer?.url === server.url
                                            ? 'bg-primary-400/10 border-l-2 border-primary-400'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <MonitorPlay size={16} className={selectedServer?.url === server.url ? 'text-primary-400' : 'text-gray-500'} />
                                        <span className={`text-sm ${selectedServer?.url === server.url ? 'text-white font-medium' : 'text-gray-400'}`}>
                                            {server.server}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {server.hasAds && (
                                            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-[10px] font-bold">
                                                ADS
                                            </span>
                                        )}
                                        {selectedServer?.url === server.url && (
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StreamingDonghuaServerSelector;