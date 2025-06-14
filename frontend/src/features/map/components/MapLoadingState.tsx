import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapLoadingStateProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  message,
  subMessage,
  className = ''
}) => {
  const { t } = useTranslation();

  const displayMessage = message || t('mapLoadingState.message');
  const displaySubMessage = subMessage || t('mapLoadingState.subMessage');

  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000] backdrop-blur-sm ${className}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg max-w-sm w-full mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Animated map icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <MapPin className="w-12 h-12 text-blue-400 opacity-75" />
            </div>
            <MapPin className="w-12 h-12 text-blue-600 relative z-10" />
          </div>

          {/* Loading spinner */}
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <div className="text-left">
              <p className="text-gray-900 font-medium">{displayMessage}</p>
              <p className="text-gray-500 text-sm">{displaySubMessage}</p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLoadingState;
