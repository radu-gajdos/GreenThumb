import { useState, useEffect, useMemo } from 'react';
import { PlotApi } from '@/features/plots/api/plot.api';
import { DashboardData, DashboardStats, RecentActivityItem, PlotSummary, ActionsSummary } from '../types/dashboard';
import { Plot } from '@/features/plots/interfaces/plot';
import { transformActionToCalendarEvent } from '@/features/calendar/utils/transform';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalPlots: 0,
      totalArea: 0,
      activeActions: 0,
      completedActions: 0,
      upcomingActions: 0,
    },
    recentActivity: [],
    plotsSummary: [],
    actionsSummary: {
      byType: {},
      byStatus: {},
      upcomingThisWeek: 0,
      overdueCount: 0,
    },
    todayEvents: [],
    loading: true,
    error: null,
  });

  const plotApi = useMemo(() => new PlotApi(), []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const plots: Plot[] = await plotApi.findAll();

        const stats = calculateStats(plots);
        const recentActivity = generateRecentActivity(plots);
        const plotsSummary = createPlotsSummary(plots);
        const actionsSummary = calculateActionsSummary(plots);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const todayEvents = plots.flatMap(plot => {
          return (plot.actions || [])
            .filter(action => {
              const date = new Date(action.date);
              return date >= todayStart && date < todayEnd;
            })
            .map(action => transformActionToCalendarEvent(action, plot));
        });

        setData({
          stats,
          recentActivity,
          plotsSummary,
          actionsSummary,
          todayEvents,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Nu s-au putut încărca datele pentru dashboard',
        }));
      }
    };

    loadDashboardData();
  }, [plotApi]);

  return data;
};

const calculateStats = (plots: Plot[]): DashboardStats => {
  const totalArea = plots.reduce((sum, plot) => sum + plot.size, 0);

  let activeActions = 0;
  let completedActions = 0;
  let upcomingActions = 0;

  plots.forEach(plot => {
    if (plot.actions) {
      plot.actions.forEach(action => {
        if (action.status === 'completed') {
          completedActions++;
        } else if (action.status === 'in_progress') {
          activeActions++;
        } else if (action.status === 'planned') {
          upcomingActions++;
        }
      });
    }
  });

  const topPerformingPlot = plots
    .map(plot => ({
      name: plot.name,
      completedCount: plot.actions?.filter(a => a.status === 'completed').length || 0
    }))
    .sort((a, b) => b.completedCount - a.completedCount)[0]?.name;

  return {
    totalPlots: plots.length,
    totalArea,
    activeActions,
    completedActions,
    upcomingActions,
    topPerformingPlot,
  };
};

const generateRecentActivity = (plots: Plot[]): RecentActivityItem[] => {
  const activities: RecentActivityItem[] = [];

  plots.forEach(plot => {
    activities.push({
      id: `plot-${plot.id}`,
      type: 'plot_created',
      title: 'Teren adăugat',
      description: `Terenul "${plot.name}" a fost creat`,
      timestamp: new Date(plot.createdAt),
      plotName: plot.name,
      plotId: plot.id,
    });
  });

  plots.forEach(plot => {
    if (plot.actions) {
      plot.actions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(action => {
          activities.push({
            id: `action-${action.id}`,
            type: action.status === 'completed' ? 'action_completed' : 'action_created',
            title: action.status === 'completed' ? 'Acțiune completată' : 'Acțiune creată',
            description: `${action.type} pentru "${plot.name}"`,
            timestamp: new Date(action.createdAt),
            plotName: plot.name,
            plotId: plot.id,
            actionType: action.type,
          });
        });
    }
  });

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);
};

const createPlotsSummary = (plots: Plot[]): PlotSummary[] => {
  return plots.map(plot => {
    const actions = plot.actions || [];
    const activeActionsCount = actions.filter(a => a.status === 'in_progress').length;
    const completedActionsCount = actions.filter(a => a.status === 'completed').length;

    const lastActivity = actions.length > 0
      ? new Date(Math.max(...actions.map(a => new Date(a.createdAt).getTime())))
      : new Date(plot.createdAt);

    let status: 'active' | 'planning' | 'harvested' | 'fallow' = 'planning';
    if (activeActionsCount > 0) {
      status = 'active';
    } else if (completedActionsCount > 0) {
      const recentHarvestAction = actions.find(a =>
        a.type.toLowerCase().includes('harvest') && a.status === 'completed'
      );
      status = recentHarvestAction ? 'harvested' : 'active';
    }

    return {
      id: plot.id,
      name: plot.name,
      size: plot.size,
      soilType: plot.soilType || 'Nespecificat',
      topography: plot.topography || 'Nespecificat',
      activeActionsCount,
      completedActionsCount,
      lastActivity,
      status,
    };
  });
};

const calculateActionsSummary = (plots: Plot[]): ActionsSummary => {
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let upcomingThisWeek = 0;
  let overdueCount = 0;

  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  plots.forEach(plot => {
    if (plot.actions) {
      plot.actions.forEach(action => {
        byType[action.type] = (byType[action.type] || 0) + 1;
        byStatus[action.status] = (byStatus[action.status] || 0) + 1;

        if (action.date) {
          const scheduledDate = new Date(action.date);
          if (scheduledDate >= now && scheduledDate <= oneWeekFromNow) {
            upcomingThisWeek++;
          }

          if (scheduledDate < now && action.status !== 'completed') {
            overdueCount++;
          }
        }
      });
    }
  });

  return {
    byType,
    byStatus,
    upcomingThisWeek,
    overdueCount,
  };
};