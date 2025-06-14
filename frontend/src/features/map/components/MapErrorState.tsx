import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, MapPin } from 'lucide-react';

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
  className = ""
}) => {
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
    switch (errorType) {
      case 'network':
        return 'Probleme de conexiune';
      case 'data':
        return 'Eroare la încărcarea datelor';
      case 'permission':
        return 'Acces restricționat';
      default:
        return 'Eroare la încărcarea hărții';
    }
  };

  const getErrorDescription = () => {
    switch (errorType) {
      case 'network':
        return 'Verifică conexiunea la internet și încearcă din nou.';
      case 'data':
        return 'Nu am putut prelua datele terenurilor din baza de date.';
      case 'permission':
        return 'Nu ai permisiunile necesare pentru a accesa această hartă.';
      default:
        return 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.';
    }
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000] backdrop-blur-sm ${className}`}>
      <div className="bg-white rounded-xl border border-red-200 p-8 shadow-lg max-w-md w-full mx-4 text-center">
        {/* Error icon */}
        <div className="mb-6">
          {getErrorIcon()}
          <div className="mx-auto" />
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
                Detalii tehnice: {error}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={onRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Încearcă din nou</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Reîncarcă pagina
            </button>
          </div>

          {/* Help text */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Dacă problema persistă, contactează echipa de suport.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapErrorState;