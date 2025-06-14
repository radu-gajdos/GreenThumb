import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List, RefreshCw } from 'lucide-react';

interface Props {
    view: 'month' | 'week' | 'list';
    isRefreshing: boolean;
    onRefresh: () => void;
    onNavigatePrevious: () => void;
    onNavigateNext: () => void;
    onNavigateToday: () => void;
    onViewChange: (view: 'month' | 'week' | 'list') => void;
    title: string;
}

const CalendarToolbar: React.FC<Props> = ({
    view, isRefreshing, onRefresh,
    onNavigatePrevious, onNavigateNext, onNavigateToday,
    onViewChange, title
}) => (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={onNavigatePrevious} className="p-2">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onNavigateToday}>Astăzi</Button>
                <Button variant="outline" size="sm" onClick={onNavigateNext} className="p-2">
                    <ChevronRight className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-800 capitalize ml-4">{title}</h2>
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="ml-4">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* View Switcher */}
            <div className="flex items-center space-x-2">
                <Button variant={view === 'month' ? 'default' : 'outline'} size="sm" onClick={() => onViewChange('month')}>
                    <Grid3X3 className="w-4 h-4" /><span className="hidden sm:inline">Lună</span>
                </Button>
                <Button variant={view === 'week' ? 'default' : 'outline'} size="sm" onClick={() => onViewChange('week')}>
                    <CalendarIcon className="w-4 h-4" /><span className="hidden sm:inline">Săptămână</span>
                </Button>
                <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => onViewChange('list')}>
                    <List className="w-4 h-4" /><span className="hidden sm:inline">Listă</span>
                </Button>
            </div>
        </div>
    </div>
);

export default CalendarToolbar;
