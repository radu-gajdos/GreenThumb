import { useState, useEffect, useMemo } from 'react';
import { PlotApi } from '@/features/plots/api/plot.api';
import { Plot } from '@/features/plots/interfaces/plot';
import {
    Action,
    ActiveActionsFilter,
    ActiveActionsSummary
} from '../types/active-actions';

export const useActiveActions = (filter?: ActiveActionsFilter) => {
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const plotApi = useMemo(() => new PlotApi(), []);

    useEffect(() => {
        const loadActiveActions = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load all plots with their actions
                const plots: Plot[] = await plotApi.findAll();

                // Extract active actions and apply filters
                const activeActions = extractActiveActions(plots);
                const filteredActions = applyFilters(activeActions, filter);

                setActions(filteredActions);
            } catch (err) {
                console.error('Error loading active actions:', err);
                setError('Nu s-au putut încărca activitățile active');
            } finally {
                setLoading(false);
            }
        };

        loadActiveActions();
    }, [plotApi, filter]);

    // Calculate summary statistics
    const summary: ActiveActionsSummary = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const allStatuses: Action['status'][] = ['planned', 'in_progress', 'cancelled', 'completed'];

        const byStatus = allStatuses.reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {} as Record<Action['status'], number>);

        // Populate actual counts
        for (const action of actions) {
            byStatus[action.status]++;
        }


        const byType = actions.reduce((acc, action) => {
            acc[action.type] = (acc[action.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const overdueCount = actions.filter(action => {
            const actionDate = new Date(action.date);
            return actionDate < today && action.status !== 'completed';
        }).length;

        const todayCount = actions.filter(action => {
            const actionDate = new Date(action.date);
            return actionDate >= today && actionDate < tomorrow;
        }).length;

        const thisWeekCount = actions.filter(action => {
            const actionDate = new Date(action.date);
            return actionDate >= today && actionDate <= nextWeek;
        }).length;

        return {
            total: actions.length,
            byStatus,
            byType,
            overdueCount,
            todayCount,
            thisWeekCount,
        };
    }, [actions]);

    const updateActionStatus = async (actionId: string, status: Action['status']) => {
        try {
            // Here you would typically make an API call to update the action
            // For now, we'll update the local state
            setActions(prev => prev.map(action =>
                action.id === actionId ? {
                    ...action,
                    status,
                    updatedAt: new Date()
                } : action
            ));
        } catch (err) {
            console.error('Error updating action status:', err);
            throw new Error('Nu s-a putut actualiza statusul acțiunii');
        }
    };

    return {
        actions,
        summary,
        loading,
        error,
        updateActionStatus,
    };
};

// Helper functions
const extractActiveActions = (plots: Plot[]): Action[] => {
    const activeActions: Action[] = [];

    plots.forEach(plot => {
        if (plot.actions) {
            plot.actions
                .filter(action => action.status === 'planned' || action.status === 'in_progress')
                .forEach(action => {
                    activeActions.push({
                        id: action.id,
                        type: action.type,
                        plotId: action.plotId,
                        plot: { id: plot.id, name: plot.name },
                        date: new Date(action.date),
                        status: action.status,
                        description: action.description,
                        notes: action.notes,
                        createdAt: new Date(action.createdAt),
                        updatedAt: new Date(action.updatedAt),
                    });
                });
        }
    });

    // Sort by date (earliest first)
    return activeActions.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const applyFilters = (actions: Action[], filter?: ActiveActionsFilter): Action[] => {
    if (!filter) return actions;

    return actions.filter(action => {
        if (filter.status && !filter.status.includes(action.status)) return false;
        if (filter.plotId && action.plotId !== filter.plotId) return false;
        if (filter.type && !filter.type.includes(action.type)) return false;

        if (filter.dateRange) {
            const actionDate = new Date(action.date);
            if (actionDate < filter.dateRange.start || actionDate > filter.dateRange.end) {
                return false;
            }
        }

        return true;
    });
};