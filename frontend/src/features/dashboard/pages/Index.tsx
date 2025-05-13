// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import PlotEditor from '@/features/PlotEditor';
import PlotMap from '@/features/PlotMap';
import { Plot } from '@/features/plot/interfaces/Plot';
import PlotApi from '@/features/plot/api/plot.api';

const plotApi = new PlotApi();

const Dashboard: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>([]);

  const fetchPlots = () => {
    plotApi.fetchAll((data) => {
      setPlots(data);
    });
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Your Agricultural Plots</h1>
      <PlotEditor onSaved={fetchPlots} />
      <PlotMap plots={plots} />
    </div>
  );
};

export default Dashboard;
