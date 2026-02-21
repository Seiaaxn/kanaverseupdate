const AnimeTabs = ({ activeTab, onTabChange, episodeCount }) => {
    return (
        <div className="flex gap-4 border-b border-dark-border mb-6">
            <button
                onClick={() => onTabChange('episodes')}
                className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'episodes'
                        ? 'text-primary-400 border-b-2 border-primary-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
            >
                Episodes ({episodeCount})
            </button>
            <button
                onClick={() => onTabChange('details')}
                className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'details'
                        ? 'text-primary-400 border-b-2 border-primary-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
            >
                Details
            </button>
        </div>
    );
};

export default AnimeTabs;