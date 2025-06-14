import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker as MUIDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ro';
import { CustomHeader } from '../date/CalendarHeader';
import { CalendarIcon as LucideCalendarIcon } from "lucide-react";

interface DatePickerProps {
    value: Date|null|undefined;
    onValueChange: (value: any) => void;
}

const DateTimePicker: React.FC<DatePickerProps> = ({ value, onValueChange }) => {
    const onChange = (date: Dayjs|null|undefined) => {
        if(date?.isValid()){
            onValueChange(date ? date.toDate() : null);
        }
    }

    const CalendarIcon = (props: any) => {
        const { ownerState, ...rest } = props;
        return <LucideCalendarIcon {...rest} />;
    };
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ro" >
            <MUIDateTimePicker
                defaultValue={null}
                value={value ? dayjs(value) : null}
                format="DD/MM/YYYY HH:mm"
                onChange={onChange}
                showDaysOutsideCurrentMonth={true}
                dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}`}
                reduceAnimations={true}
                minDateTime={dayjs()}
                slots={{
                    openPickerIcon: CalendarIcon,
                    calendarHeader: CustomHeader
                }}
                slotProps={{
                    field: { clearable: true, onClear: () => onChange(null) },
                    inputAdornment: {
                        position: 'start',
                    },
                    textField: {
                        sx: {
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgb(209, 213, 219)', // gray-300
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgb(156, 163, 175)', // gray-400
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#3b82f6', // blue-500
                                    borderWidth: '1px',
                                },
                                '&.Mui-error fieldset': {
                                    borderColor: 'rgb(209, 213, 219)', // Elimină roșul de la eroare
                                }
                            }
                        }
                    }
                }}
            />
        </LocalizationProvider>
    );
};

export default DateTimePicker;