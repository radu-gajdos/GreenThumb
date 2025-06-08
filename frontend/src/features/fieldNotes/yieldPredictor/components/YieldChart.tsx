// src/components/analytics/YieldChart.tsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { PredictionMethod, YieldEvolutionData } from '../interfaces/analitics';
import { ConfidenceLevel, ConfidenceLevelColors, ConfidenceLevelLabels, PredictionMethodLabels } from '../interfaces/analitics';

interface YieldChartProps {
  data: YieldEvolutionData;
  showTrend?: boolean;
  showAverage?: boolean;
  height?: number;
}

/**
 * Get point color based on confidence level
 */
const getPointColor = (dataPoint: any) => {
  if (!dataPoint.confidenceLevel) return "hsl(var(--primary))";
  return ConfidenceLevelColors[dataPoint.confidenceLevel as ConfidenceLevel];
};

/**
 * Custom tooltip for the yield chart with confidence information
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-900 mb-2">{`Anul ${label}`}</p>
        {data.yield !== null ? (
          <>
            <p className="text-primary font-medium mb-2">
              {`Randament: ${data.yield.toLocaleString()} kg/ha`}
            </p>
            
            {/* Confidence Level */}
            {data.confidenceLevel && (
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: ConfidenceLevelColors[data.confidenceLevel as ConfidenceLevel] }}
                ></div>
                <span className="text-sm text-gray-600">
                  Încredere: {ConfidenceLevelLabels[data.confidenceLevel as ConfidenceLevel]}
                </span>
              </div>
            )}
            
            {/* Prediction Method */}
            {data.predictionMethod && (
              <p className="text-xs text-gray-500 mb-2">
                Metodă: {PredictionMethodLabels[data.predictionMethod as PredictionMethod] || data.predictionMethod}
              </p>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">{data.country}</p>
              <p className="text-xs text-gray-600">{data.crop}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 italic">Date indisponibile</p>
        )}
      </div>
    );
  }

  return null;
};

/**
 * YieldChart
 * 
 * Interactive chart component for displaying crop yield evolution over time.
 * Features trend analysis, average lines, confidence levels, and detailed tooltips.
 */
const YieldChart: React.FC<YieldChartProps> = ({ 
  data, 
  showTrend = true, 
  showAverage = true,
  height = 400 
}) => {
  // Prepare chart data - filter out null values for trend calculation
  const chartData = useMemo(() => {
    return data.data.map((point: any) => ({
      ...point,
      displayYield: point.yield || undefined, // undefined won't be plotted
      hasData: point.yield !== null
    }));
  }, [data.data]);

  // Calculate trend line using linear regression
  const trendData = useMemo(() => {
    if (!showTrend) return [];

    const validPoints = data.data.filter(point => point.yield !== null);
    if (validPoints.length < 2) return [];

    // Simple linear regression
    const n = validPoints.length;
    const sumX = validPoints.reduce((sum, point) => sum + point.year, 0);
    const sumY = validPoints.reduce((sum, point) => sum + point.yield!, 0);
    const sumXY = validPoints.reduce((sum, point) => sum + point.year * point.yield!, 0);
    const sumXX = validPoints.reduce((sum, point) => sum + point.year * point.year, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.data.map(point => ({
      year: point.year,
      trend: slope * point.year + intercept
    }));
  }, [data.data, showTrend]);

  // Merge trend data with chart data
  const mergedData = useMemo(() => {
    return chartData.map(point => {
      const trendPoint = trendData.find(t => t.year === point.year);
      return {
        ...point,
        trend: trendPoint?.trend
      };
    });
  }, [chartData, trendData]);

  // Calculate Y-axis domain with some padding
  const yDomain = useMemo(() => {
    const validYields = data.data.filter(point => point.yield !== null).map(point => point.yield!);
    if (validYields.length === 0) return [0, 100];

    const min = Math.min(...validYields);
    const max = Math.max(...validYields);
    const padding = (max - min) * 0.1; // 10% padding

    return [Math.max(0, min - padding), max + padding];
  }, [data.data]);

  // Format Y-axis labels
  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={mergedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="year"
            type="number"
            scale="linear"
            domain={[2000, 2024]}
            tickCount={13}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          
          <YAxis 
            domain={yDomain}
            tickFormatter={formatYAxisLabel}
            tick={{ fontSize: 12 }}
            stroke="#666"
            label={{ 
              value: 'Randament (kg/ha)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {/* Average reference line */}
          {showAverage && (
            <ReferenceLine 
              y={data.averageYield} 
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ 
                value: `Media: ${formatYAxisLabel(data.averageYield)}`, 
                position: "right",
                fontSize: 12
              }}
            />
          )}

          {/* Trend line */}
          {showTrend && trendData.length > 0 && (
            <Line
              type="linear"
              dataKey="trend"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              name="Trend"
              connectNulls={true}
            />
          )}

          {/* Main yield line with confidence-based colors */}
          <Line
            type="monotone"
            dataKey="displayYield"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              const color = getPointColor(payload);
              
              // Return a transparent circle when coordinates are undefined
              if (cx === undefined || cy === undefined) {
                return <circle cx={0} cy={0} r={0} fill="transparent" />;
              }
              
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ 
              r: 6, 
              strokeWidth: 2,
              fill: "#fff"
            }}
            name="Randament"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Enhanced Chart Legend/Info */}
      <div className="mt-4 space-y-3">
        {/* Main legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span>Randament actual</span>
          </div>
          {showTrend && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500" style={{ borderTop: '1px dashed' }}></div>
              <span>Trend general</span>
            </div>
          )}
          {showAverage && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-amber-500" style={{ borderTop: '1px dashed' }}></div>
              <span>Media perioadei</span>
            </div>
          )}
        </div>

        {/* Confidence Level Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
          <span className="font-medium">Nivel încredere predicții:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Înaltă</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medie</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Scăzută</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>F. Scăzută</span>
          </div>
        </div>
      </div>

      {/* Data Quality Indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>
            {data.totalYearsWithData} din 25 ani au date disponibile 
            ({Math.round((data.totalYearsWithData / 25) * 100)}% completitudine)
          </span>
        </div>
      </div>

      {/* Confidence Statistics Summary */}
      {data.highConfidencePoints > 0 || data.mediumConfidencePoints > 0 || 
       data.lowConfidencePoints > 0 || data.veryLowConfidencePoints > 0 ? (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-4 px-4 py-2 bg-blue-50 rounded-lg text-xs">
            <span className="font-medium text-blue-900">Distribuția încrederii:</span>
            {data.highConfidencePoints > 0 && (
              <span className="text-green-700">{data.highConfidencePoints} înaltă</span>
            )}
            {data.mediumConfidencePoints > 0 && (
              <span className="text-yellow-700">{data.mediumConfidencePoints} medie</span>
            )}
            {data.lowConfidencePoints > 0 && (
              <span className="text-orange-700">{data.lowConfidencePoints} scăzută</span>
            )}
            {data.veryLowConfidencePoints > 0 && (
              <span className="text-red-700">{data.veryLowConfidencePoints} f. scăzută</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default YieldChart;