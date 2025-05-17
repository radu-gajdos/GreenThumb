
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlotDetails from './PlotDetails';
import AIChatPlaceholder from './AIChatPlaceholder';
import { Plot } from '../../interfaces/plot';
import { PlotApi } from '../../api/plot.api';

const PlotPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const plotApi = useMemo(() => new PlotApi(), []);

  useEffect(() => {
    const loadPlot = async () => {
      if (!id) {
        setError('Plot ID is required');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await plotApi.findOne(id);
        setPlot(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadPlot();
  }, [id, plotApi]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Plot details */}
        <div className="w-full lg:w-2/3">
          <PlotDetails plot={plot} />
        </div>
        {/* Right: AI chat placeholder */}
        <div className="w-full lg:w-1/3">
          <AIChatPlaceholder />
        </div>
      </div>
    </div>
  );
};

export default PlotPage;
