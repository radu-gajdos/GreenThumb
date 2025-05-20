import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ro';
import { CustomHeader } from '../date/CalendarHeader';
import { styled } from '@mui/material';
import { CalendarIcon as LucideCalendarIcon } from "lucide-react";

interface DatePickerProps {
    value: Date | null | undefined;
    onValueChange: (value: any) => void;
}

const StyledDatePicker = styled(MUIDatePicker)(({ theme }) => ({
    '& .MuiInputBase-root': {
        backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : 'inherit',
        color: theme.palette.mode === 'dark' ? '#e5e7eb' : 'inherit',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.mode === 'dark' ? '#4b5563' : undefined,
    },
    '& .MuiSvgIcon-root': {
        color: theme.palette.mode === 'dark' ? '#e5e7eb' : undefined,
    },
    '& .MuiPickersDay-root': {
        color: theme.palette.mode === 'dark' ? '#e5e7eb' : undefined,
        '&.Mui-selected': {
            backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : undefined,
        },
    },
    '& .MuiPickersCalendarHeader-root, & .MuiPickersSlideTransition-root': {
        backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : undefined,
    },
}));


const DatePicker: React.FC<DatePickerProps> = ({ value, onValueChange }) => {
    const onChange = (date: Dayjs | null | undefined) => {
        if (date?.isValid()) {
            onValueChange(date ? date.toDate() : null);
        }
    }

    const CalendarIcon = (props: any) => {
        const { ownerState, ...rest } = props; // Eliminăm ownerState
        return <LucideCalendarIcon {...rest} />;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ro" >
            <StyledDatePicker
                defaultValue={null}
                value={value ? dayjs(value) : null}
                format="DD/MM/YYYY"
                onChange={onChange}
                showDaysOutsideCurrentMonth={true}
                dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}`}
                reduceAnimations={true}
                slots={{
                    openPickerIcon: CalendarIcon,
                    calendarHeader: CustomHeader
                }}
                slotProps={{
                    field: { clearable: true, onClear: () => onChange(null) },
                    inputAdornment: {
                        position: 'start',
                    }
                }}
            />
        </LocalizationProvider>
    );
};

export default DatePicker;