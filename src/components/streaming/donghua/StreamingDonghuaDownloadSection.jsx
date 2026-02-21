import { Download, ExternalLink } from 'lucide-react';

const StreamingDonghuaDownloadSection = ({ downloads = [] }) => {
    if (!downloads || downloads.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Download size={18} className="text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Download</h3>
            </div>

            <div className="space-y-4">
                {downloads.map((dl, idx) => (
                    <div key={idx} className="bg-dark-surface rounded-xl border border-dark-border p-3">
                        <h4 className="text-xs font-medium text-gray-400 mb-2">{dl.title}</h4>
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
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-dark-card rounded text-xs text-gray-300 hover:text-primary-400 transition-colors"
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
        </div>
    );
};

export default StreamingDonghuaDownloadSection;