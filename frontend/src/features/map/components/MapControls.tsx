import React, { useState } from 'react';
import { Layers, Eye, EyeOff, RotateCcw } from 'lucide-react';

export type MapLayerType = 'satellite' | 'street' | 'terrain';

interface MapControlsProps {
    currentLayer: MapLayerType;
    onLayerChange: (layer: MapLayerType) => void;
    showPlots: boolean;
    onTogglePlots: () => void;
    onResetView: () => void;
    plotsCount: number;
    className?: string;
}

const MapControls: React.FC<MapControlsProps> = ({
    currentLayer,
    onLayerChange,
    showPlots,
    onTogglePlots,
    onResetView,
    plotsCount,
    className = ''
}) => {
    const [showLayerMenu, setShowLayerMenu] = useState(false);

    const layerOptions = [
        { type: 'satellite' as MapLayerType, label: 'Satelit', icon: '🛰️', description: 'Imagini din satelit' },
        { type: 'street' as MapLayerType, label: 'Stradă', icon: '🗺️', description: 'Harta stradală' },
    ];

    return (
        <div className={`absolute top-4 right-4 z-[1000] flex gap-2 ${className}`}>
            {/* Selectare tip hartă */}
            <div className="relative">
                <button
                    onClick={() => setShowLayerMenu(!showLayerMenu)}
                    className={`bg-white border border-gray-200 rounded-lg p-2 shadow-md hover:shadow-lg transition group ${showLayerMenu ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                        }`}
                    title="Schimbă tipul de hartă"
                >
                    <Layers className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </button>

                {showLayerMenu && (
                    <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setShowLayerMenu(false)} />
                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[160px] overflow-hidden">
                            <div className="p-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                                    Tip hartă
                                </p>
                                {layerOptions.map((option) => (
                                    <button
                                        key={option.type}
                                        onClick={() => {
                                            onLayerChange(option.type);
                                            setShowLayerMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-start space-x-3 rounded-md ${currentLayer === option.type
                                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        <span className="text-base mt-0.5">{option.icon}</span>
                                        <div>
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-xs text-gray-500">{option.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>


            <button
                onClick={onTogglePlots}
                className={`bg-white border border-gray-200 rounded-lg p-2 shadow-md hover:shadow-lg transition group relative ${showPlots ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                    }`}
                title={showPlots ? 'Ascunde terenurile' : 'Arată terenurile'}
            >
                {showPlots ? (
                    <Eye className="w-5 h-5 text-blue-600" />
                ) : (
                    <EyeOff className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                )}

            </button>


            {/* Resetare vizualizare */}
            <button
                onClick={onResetView}
                className="bg-white border border-gray-200 rounded-lg p-2 shadow-md hover:shadow-lg transition group"
                title="Resetează vizualizarea"
            >
                <RotateCcw className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
        </div>
    );
};

export default MapControls;
