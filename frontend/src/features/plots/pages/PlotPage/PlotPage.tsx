/**
 * PlotPage.tsx
 *
 * Displays the full details of a single plot alongside an AI chat interface.
 * - Fetches plot data by ID from the URL params
 * - Shows loading spinner, error, or “not found” messages as needed
 * - Once loaded, renders:
 *    • PlotDetails (left)  
 *    • AIChat (right)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlotDetails from './PlotDetails';
import AIChat from './AiChat';
import { Plot } from '../../interfaces/plot';
import { PlotApi } from '../../api/plot.api';

const PlotPage: React.FC = () => {
  const { t } = useTranslation();

  /** Extract the plot ID from the route parameters */
  const { id } = useParams<{ id: string }>();

  /** Holds the fetched Plot object, or null if not loaded/found */
  const [plot, setPlot] = useState<Plot | null>(null);
  /** Loading indicator for the API call */
  const [loading, setLoading] = useState<boolean>(true);
  /** Any error message from fetching the plot */
  const [error, setError] = useState<string | null>(null);

  /**
   * Memoized API client instance so we don't recreate on every render
   */
  const plotApi = useMemo(() => new PlotApi(), []);

  /**
   * Effect: runs when component mounts or `id` changes.
   * - If no `id`, sets error from translations and stops loading.
   * - Otherwise, calls plotApi.findOne(id) to fetch data.
   * - On success, stores Plot in state; on failure, sets error message.
   */
  useEffect(() => {
    const loadPlot = async () => {
      if (!id) {
        // If URL has no ID, show “no ID provided” error
        setError(t('plotPage.error.noId'));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await plotApi.findOne(id);
        setPlot(data);
        setError(null);
      } catch (err) {
        // Display either the thrown Error message or a generic “unknown” message
        setError(err instanceof Error ? err.message : t('plotPage.error.unknown'));
      } finally {
        setLoading(false);
      }
    };

    loadPlot();
  }, [id, plotApi, t]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-6xl mt-10"
        role="alert"
      >
        <p className="font-bold">{t('plotPage.error.title')}</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
        >
          {t('plotPage.error.retry')}
        </button>
      </div>
    );
  }

  // --- Not Found State (no plot data) ---
  if (!plot) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mx-auto max-w-6xl mt-10"
        role="alert"
      >
        <p className="font-bold">{t('plotPage.notFound.title')}</p>
        <p>{t('plotPage.notFound.message')}</p>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Plot details */}
        <div className="w-full lg:w-2/4">
          <PlotDetails plot={plot} />
        </div>

        {/* Right column: AI chat focused on this plot */}
        <div className="w-full h-[80vh] lg:w-2/4">
          <AIChat plot={plot} />
        </div>
      </div>
    </div>
  );
};

export default PlotPage;
