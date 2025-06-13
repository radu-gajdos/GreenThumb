/**
 * Dashboard types and interfaces
 */

export interface DashboardStats {
  totalPlots: number;
  totalArea: number;
  activeActions: number;
  completedActions: number;
  upcomingActions: number;
  averageYield?: number;
  topPerformingPlot?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'action_created' | 'action_completed' | 'plot_created' | 'ai_conversation' | 'yield_prediction';
  title: string;
  description: string;
  timestamp: Date;
  plotName?: string;
  plotId?: string;
  actionType?: string;
  icon?: string;
}

export interface PlotSummary {
  id: string;
  name: string;
  size: number;
  soilType: string;
  topography: string;
  activeActionsCount: number;
  completedActionsCount: number;
  lastActivity?: Date;
  yieldPrediction?: number;
  status: 'active' | 'planning' | 'harvested' | 'fallow';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  windSpeed: number;
  location: string;
}

export interface ActionsSummary {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  upcomingThisWeek: number;
  overdueCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivityItem[];
  plotsSummary: PlotSummary[];
  actionsSummary: ActionsSummary;
  weather?: WeatherData;
  loading: boolean;
  error: string | null;
}