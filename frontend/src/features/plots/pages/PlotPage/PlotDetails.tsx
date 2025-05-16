import React from 'react';
import PlotMap from './PlotMap';
import { Plot } from '../../interfaces/plot';
import ActionsList from './ActionList';

interface PlotDetailsProps {
  /** The Plot object whose details we want to display */
  plot: Plot;
}

/**
 * PlotDetails
 *
 * Renders a detailed view of a single plot, including:
 *  - Title bar with plot name and size
 *  - Map of the plot boundary
 *  - Metadata cards (soil type, topography, owner, creation date)
 *  - Activity log of actions taken on the plot
 */
const PlotDetails: React.FC<PlotDetailsProps> = ({ plot }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header: Plot name on the left, area badge on the right */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{plot.name}</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {/* Display size with two decimals */}
          {plot.size.toFixed(2)} hectares
        </div>
      </div>

      {/* Map rendering of the plot boundary */}
      <div className="mb-6">
        {/* 
          NOTE: PlotMap currently expects a `plots` prop in its signature.
          Here we pass a single boundary; consider renaming or overloading PlotMap
          to accept a `boundary` prop for clarity.
        */}
        <PlotMap boundary={plot.boundary} />
      </div>

      {/* Metadata grid: soil type, topography, owner, creation date */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Soil Type</h3>
          <p className="text-gray-900">
            {plot.soilType || 'Not specified'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Topography</h3>
          <p className="text-gray-900">
            {plot.topography || 'Not specified'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Owner</h3>
          <p className="text-gray-900">
            {plot.owner?.name || '—'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
          <p className="text-gray-900">
            {/* Format creation date in a human‐readable way */}
            {new Date(plot.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Activity log: list of past actions */}
      <ActionsList actions={plot.actions} />
    </div>
  );
};

export default PlotDetails;
