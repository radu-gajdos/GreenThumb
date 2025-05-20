import React from 'react';
import { PickersCalendarHeaderProps } from '@mui/x-date-pickers/PickersCalendarHeader';
import { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export const CustomHeader = (props: PickersCalendarHeaderProps) => {
  const { 
    currentMonth, 
    onMonthChange,
    reduceAnimations,
    views,
    onViewChange,
    minDate,
    maxDate 
  } = props;

  const handlePrevMonthClick = () => {
    onMonthChange((currentMonth as Dayjs).subtract(1, 'month'));
  };

  const handleNextMonthClick = () => {
    onMonthChange((currentMonth as Dayjs).add(1, 'month'));
  };

  const handleYearSelectorOpen = () => {
    if (onViewChange && views.includes('year')) {
      onViewChange('year');
    }
  };

  const isPrevMonthDisabled = minDate 
    ? (currentMonth as Dayjs).startOf('month').isBefore(minDate)
    : false;

  const isNextMonthDisabled = maxDate 
    ? (currentMonth as Dayjs).endOf('month').isAfter(maxDate)
    : false;

  const handleViewToggle = () => {
    if (onViewChange) {
      const newView = props.view === 'day' ? 'year' : 'day';
      onViewChange(newView);
    }
  };

  return (
    <div className="flex items-center justify-between p-0">
      {/* Previous month */}
      <button
        type="button"
        disabled={isPrevMonthDisabled}
        onClick={handlePrevMonthClick}
        className="...button-classes..."
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Year selector */}
      <button
        type="button"
        onClick={handleViewToggle}
        className="...button-classes..."
      >
        <span>{(currentMonth as Dayjs).format('MMMM YYYY')}</span>
        {props.view === 'year' ? 
          <ChevronUp className="h-4 w-4 ml-1" /> : 
          <ChevronDown className="h-4 w-4 ml-1" />
        }
      </button>

      {/* Next month */}
      <button
        type="button"
        disabled={isNextMonthDisabled}
        onClick={handleNextMonthClick}
        className="...button-classes..."
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};
