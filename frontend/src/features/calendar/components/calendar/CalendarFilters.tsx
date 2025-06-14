import React, { useState } from 'react';
import { Filter, X, MapPin, Activity, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarFilters, PlotOption, ActionTypeOption } from '../../types/calendar';

interface CalendarFiltersProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  plotOptions: PlotOption[];
  actionTypeOptions: ActionTypeOption[];
}

const CalendarFiltersComponent: React.FC<CalendarFiltersProps> = ({
  filters,
  onFiltersChange,
  plotOptions,
  actionTypeOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'planned', label: 'Planificat', color: '#3b82f6' },
    { value: 'in_progress', label: 'În progres', color: '#f59e0b' },
    { value: 'completed', label: 'Completat', color: '#22c55e' },
    { value: 'cancelled', label: 'Anulat', color: '#ef4444' },
  ];

  const toggleFilter = (
    filterType: keyof CalendarFilters,
    value: string
  ) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues,
    });
  };

  const toggleOverdue = () => {
    onFiltersChange({
      ...filters,
      showOverdue: !filters.showOverdue,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      actionTypes: [],
      plotIds: [],
      statusTypes: [],
      showOverdue: true,
    });
  };

  const activeFiltersCount = 
    filters.actionTypes.length + 
    filters.plotIds.length + 
    filters.statusTypes.length + 
    (filters.showOverdue ? 0 : 1);

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filtre</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Șterge filtrele
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtre Calendar
        </h3>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Șterge toate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Types Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Tipuri Acțiuni
        </h4>
        <div className="flex flex-wrap gap-2">
          {actionTypeOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => toggleFilter('actionTypes', option.type)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${filters.actionTypes.includes(option.type)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={{
                backgroundColor: filters.actionTypes.includes(option.type) 
                  ? option.color 
                  : undefined,
              }}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Plots Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Terenuri
        </h4>
        <div className="flex flex-wrap gap-2">
          {plotOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleFilter('plotIds', option.id)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${filters.plotIds.includes(option.id)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={{
                backgroundColor: filters.plotIds.includes(option.id) 
                  ? option.color 
                  : undefined,
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <CheckSquare className="w-4 h-4 mr-2" />
          Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleFilter('statusTypes', option.value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${filters.statusTypes.includes(option.value)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={{
                backgroundColor: filters.statusTypes.includes(option.value) 
                  ? option.color 
                  : undefined,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Afișează Întârziate</p>
          <p className="text-xs text-gray-500">Include acțiunile care au trecut de termen</p>
        </div>
        <button
          onClick={toggleOverdue}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${filters.showOverdue ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${filters.showOverdue ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default CalendarFiltersComponent;