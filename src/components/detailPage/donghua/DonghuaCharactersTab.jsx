import { User } from 'lucide-react';

const DonghuaCharactersTab = ({ characters = [] }) => {
    if (!characters || characters.length === 0) return null;

    return (
        <div>
            <h3 className="text-white font-semibold mb-3">Characters</h3>
            <div className="grid grid-cols-2 gap-3">
                {characters.map((char, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg border border-dark-border hover:border-primary-400/50 transition"
                    >
                        {char.image ? (
                            <img
                                src={char.image}
                                alt={char.name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=333&color=fff&size=48`;
                                }}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-400/20 flex items-center justify-center">
                                <User size={20} className="text-primary-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">{char.name}</p>
                            <p className="text-xs text-gray-500">{char.role || 'Character'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonghuaCharactersTab;