/**
 * PlotPage.tsx
 *
 * Renders the page for a single plot, identified by the URL `:id` param.
 * Handles:
 *  - Fetching plot data on mount or when `id` changes
 *  - Displaying loading spinner while fetching
 *  - Showing error or "not found" messages
 *  - Rendering PlotDetails and an AI chat placeholder side by side
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlotDetails from './PlotDetails';
import AIChatPlaceholder from './AIChatPlaceholder';
import { Plot } from '../../interfaces/plot';
import { PlotApi } from '../../api/plot.api';

const PlotPage: React.FC = () => {
  /** Extract the `id` route param (string or undefined) */
  const { id } = useParams<{ id: string }>();

  /** Holds the fetched plot data, or `null` if not yet loaded or absent */
  const [plot, setPlot] = useState<Plot | null>(null);
  /** Loading indicator while data is being fetched */
  const [loading, setLoading] = useState<boolean>(true);
  /** Error message to display if fetch fails */
  const [error, setError] = useState<string | null>(null);

  /**
   * Memoized API client instance.
   * Ensures we don’t recreate PlotApi on every render.
   */
  const plotApi = useMemo(() => new PlotApi(), []);

  /**
   * Effect: when `id` changes, fetch the corresponding plot.
   * Sets loading, error, and plot state appropriately.
   */
  useEffect(() => {
    const loadPlot = async () => {
      try {
        if (!id) {
          // Guard against missing param
          throw new Error('Plot ID is required');
        }

        setLoading(true);
        const data = await plotApi.findOne(id);
        setPlot(data);
        setError(null);
      } catch (err) {
        // Capture and display any error
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Failed to load plot:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlot();
  }, [id, plotApi]);

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
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Not Found State ---
  if (!plot) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mx-auto max-w-6xl mt-10"
        role="alert"
      >
        <p className="font-bold">Plot Not Found</p>
        <p>The requested plot information could not be found.</p>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Plot details */}
        <div className="w-full lg:w-2/3">
          <PlotDetails plot={plot} />
        </div>

        {/* Right: AI chat integration placeholder */}
        <div className="w-full lg:w-1/3">
          <AIChatPlaceholder />
        </div>
      </div>
    </div>
  );
};

export default PlotPage;
