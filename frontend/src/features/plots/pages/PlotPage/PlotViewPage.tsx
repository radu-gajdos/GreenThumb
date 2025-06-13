import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft } from 'lucide-react';
import { Plot } from '../../interfaces/plot';
import { PlotApi } from '../../api/plot.api';
import PlotDetails from './PlotDetails';
import AIChat from './AiChat';

interface PlotViewModalProps {
  /** Whether the modal is open/visible */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** ID of the plot to display */
  plotId: string | null;
}

/**
 * PlotViewModal Component
 * 
 * Modal that displays plot details and AI chat in the main content area.
 * Replaces the main content without affecting sidebar and topbar.
 */
const PlotViewModal: React.FC<PlotViewModalProps> = ({
  isOpen,
  onClose,
  plotId,
}) => {
  const { t } = useTranslation();

  /** Holds the fetched Plot object, or null if not loaded/found */
  const [plot, setPlot] = useState<Plot | null>(null);
  /** Loading indicator for the API call */
  const [loading, setLoading] = useState<boolean>(false);
  /** Any error message from fetching the plot */
  const [error, setError] = useState<string | null>(null);

  /**
   * Memoized API client instance so we don't recreate on every render
   */
  const plotApi = useMemo(() => new PlotApi(), []);

  /**
   * Effect: runs when modal opens or plotId changes.
   * Fetches plot data when modal is opened with a valid plotId.
   */
  useEffect(() => {
    const loadPlot = async () => {
      if (!isOpen || !plotId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await plotApi.findOne(plotId);
        setPlot(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('plotPage.error.unknown'));
        setPlot(null);
      } finally {
        setLoading(false);
      }
    };

    loadPlot();
  }, [isOpen, plotId, plotApi, t]);

  /**
   * Reset state when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      setPlot(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  /**
   * Handle ESC key press to close modal
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {plot ? `${plot.name}` : 'Detalii teren'}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 h-[calc(100vh-180px)] overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center h-full p-6">
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md"
              role="alert"
            >
              <p className="font-bold">{t('plotPage.error.title')}</p>
              <p className="mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                {t('plotPage.error.retry')}
              </button>
            </div>
          </div>
        )}

        {/* Not Found State */}
        {!loading && !error && !plot && (
          <div className="flex justify-center items-center h-full p-6">
            <div
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded max-w-md"
              role="alert"
            >
              <p className="font-bold">{t('plotPage.notFound.title')}</p>
              <p className="mt-2">{t('plotPage.notFound.message')}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && plot && (
          <div className="h-full flex flex-col lg:flex-row">
            {/* Left column: Plot details */}
            <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
              <PlotDetails plot={plot} />
            </div>

            {/* Right column: AI chat */}
            <div className="w-full lg:w-1/2 h-full">
              <div className="h-full p-6">
                <AIChat plot={plot} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotViewModal;