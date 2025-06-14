/**
 * Types for Active Actions Modal - Using real Action entity
 */

// Base Action entity interface (matching your entity exactly)
export interface Action {
  id: string;
  type: string;
  plotId: string;
  plot?: {
    id: string;
    name: string;
  };
  date: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Simple filters based on real properties
export interface ActiveActionsFilter {
  status?: Action['status'][];
  plotId?: string;
  type?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ActiveActionsSummary {
  total: number;
  byStatus: Record<Action['status'], number>;
  byType: Record<string, number>;
  overdueCount: number;
  todayCount: number;
  thisWeekCount: number;
}

export interface ActiveActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: ActiveActionsFilter;
}