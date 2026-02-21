import { useState, useEffect } from "react";
import {
    ThumbsUp,
    ThumbsDown,
    Download,
    Share2,
    Flag,
    MonitorPlay,
    X,
    ExternalLink
} from "lucide-react";

const StreamingAnimeActionBar = ({
    streams = [],
    selectedServer,
    onServerSelect,
    downloads = [] // Tambahkan prop downloads
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen || isDownloadOpen) {
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
        }
    }, [isOpen, isDownloadOpen]);

    const closeAllSheets = () => {
        setIsOpen(false);
        setIsDownloadOpen(false);
    };

    return (
        <>
            {/* Horizontal Scroll Action Bar */}
            <div className="mb-6 overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-3 min-w-max">

                    <ActionButton
                        icon={<ThumbsUp size={18} />}
                        label="Like"
                        active={liked}
                        onClick={() => {
                            setLiked(!liked);
                            if (disliked) setDisliked(false);
                        }}
                    />

                    <ActionButton
                        icon={<ThumbsDown size={18} />}
                        label="Dislike"
                        active={disliked}
                        onClick={() => {
                            setDisliked(!disliked);
                            if (liked) setLiked(false);
                        }}
                    />

                    <ActionButton
                        icon={<MonitorPlay size={18} />}
                        label={selectedServer?.server || "Quality"}
                        onClick={() => {
                            closeAllSheets();
                            setIsOpen(true);
                        }}
                    />

                    <ActionButton
                        icon={<Download size={18} />}
                        label="Download"
                        onClick={() => {
                            closeAllSheets();
                            setIsDownloadOpen(true);
                        }}
                    />

                    <ActionButton
                        icon={<Share2 size={18} />}
                        label="Share"
                    />

                    <ActionButton
                        icon={<Flag size={18} />}
                        label="Report"
                    />
                </div>
            </div>

            {/* Bottom Sheet - Quality Selector */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end">
                    {/* Overlay */}
                    <div
                        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
                        onClick={closeAllSheets}
                    />

                    {/* Sheet */}
                    <div
                        className={`relative w-full bg-dark-surface rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto transition-all duration-300 ease-out ${animate
                            ? "translate-y-0 opacity-100"
                            : "translate-y-full opacity-0"
                            }`}
                    >
                        <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">
                                Select Quality
                            </h3>
                            <button onClick={closeAllSheets}>
                                <X size={20} className="text-gray-400 hover:text-white transition" />
                            </button>
                        </div>

                        {streams.map((server, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    onServerSelect(server);
                                    closeAllSheets();
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${selectedServer?.url === server.url
                                    ? "bg-primary-400/15 text-white"
                                    : "bg-dark-card text-gray-400 hover:bg-dark-card/70"
                                    }`}
                            >
                                {server.server || `Server ${idx + 1}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Sheet - Download Section */}
            {isDownloadOpen && (
                <div className="fixed inset-0 z-50 flex items-end">
                    {/* Overlay */}
                    <div
                        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
                        onClick={closeAllSheets}
                    />

                    {/* Sheet */}
                    <div
                        className={`relative w-full bg-dark-surface rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto transition-all duration-300 ease-out ${animate
                            ? "translate-y-0 opacity-100"
                            : "translate-y-full opacity-0"
                            }`}
                    >
                        <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Download size={20} className="text-primary-400" />
                                <h3 className="text-white font-semibold">Download</h3>
                            </div>
                            <button onClick={closeAllSheets}>
                                <X size={20} className="text-gray-400 hover:text-white transition" />
                            </button>
                        </div>

                        {!downloads || downloads.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">No downloads available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {downloads.map((dl, idx) => (
                                    <div key={idx} className="bg-dark-card rounded-xl border border-dark-border p-3">
                                        <h4 className="text-xs font-medium text-gray-400 mb-2">{dl.format}</h4>
                                        <div className="space-y-2">
                                            {dl.qualities.map((quality, qIdx) => (
                                                <div key={qIdx} className="flex items-start gap-2">
                                                    <span className="text-xs font-bold text-primary-400 w-16">{quality.quality}</span>
                                                    <div className="flex-1 flex flex-wrap gap-2">
                                                        {quality.links.map((link, lIdx) => (
                                                            <a
                                                                key={lIdx}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-dark-surface rounded text-xs text-gray-300 hover:text-primary-400 transition-colors"
                                                            >
                                                                <ExternalLink size={10} />
                                                                {link.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

/* Reusable Action Button */
const ActionButton = ({ icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200
        ${active
                ? "bg-primary-400/15 text-primary-400"
                : "bg-dark-surface text-gray-400 hover:bg-dark-card hover:text-white"
            }`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);

export default StreamingAnimeActionBar;