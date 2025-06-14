import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapErrorStateProps {
  error: string;
  onRetry: () => void;
  errorType?: 'network' | 'data' | 'permission' | 'unknown';
  className?: string;
}

const MapErrorState: React.FC<MapErrorStateProps> = ({
  error,
  onRetry,
  errorType = 'unknown',
  className = "",
}) => {
  const { t } = useTranslation();

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return <Wifi className="w-12 h-12 text-red-400" />;
      case 'data':
        return <MapPin className="w-12 h-12 text-red-400" />;
      case 'permission':
        return <AlertTriangle className="w-12 h-12 text-amber-400" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-400" />;
    }
  };

  const getErrorTitle = () => {
    return t(`mapErrorState.${errorType}.title`);
  };

  const getErrorDescription = () => {
    return t(`mapErrorState.${errorType}.description`);
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000] backdrop-blur-sm ${className}`}>
      <div className="bg-white rounded-xl border border-red-200 p-8 shadow-lg max-w-md w-full mx-4 text-center">
        {/* Error icon */}
        <div className="mb-6">
          {getErrorIcon()}
        </div>

        {/* Error content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {getErrorTitle()}
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              {getErrorDescription()}
            </p>
            {error && (
              <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border">
                {t("mapErrorState.technicalDetails")}: {error}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={onRetry}
              className="bg-primary hover:bg-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t("mapErrorState.tryAgain")}</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {t("mapErrorState.reloadPage")}
            </button>
          </div>

          {/* Help text */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {t("mapErrorState.supportNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapErrorState;
