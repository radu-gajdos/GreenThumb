/**
 * Calendar types and interfaces
 */

import { Action } from '@/features/actions/interfaces/action';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  color: string;
  borderColor: string;
  textColor: string;
  action: Action;
  plotName: string;
  plotId: string;
}

export interface CalendarFilters {
  actionTypes: string[];
  plotIds: string[];
  statusTypes: string[];
  showOverdue: boolean;
}

export interface CalendarStats {
  totalEvents: number;
  todayEvents: number;
  thisWeekEvents: number;
  overdueEvents: number;
  completedThisMonth: number;
}

export interface CalendarViewType {
  id: string;
  name: string;
  icon: string;
  fullCalendarView: string;
}

export interface PlotOption {
  id: string;
  name: string;
  color: string;
}

export interface ActionTypeOption {
  type: string;
  label: string;
  color: string;
  count: number;
}