import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { CellValue, FilterColumnType, FilterType } from '../constants/filters';
import MultiSelect from '@/components/ui/multiSelect';

interface FilterValueFieldProps {
    value: CellValue;
    onChange: (value: CellValue) => void;
    filterColumnType: FilterColumnType; // agTextColumnFilter
    filterType: FilterType; // contains, equals, etc.
    uniqueValues: CellValue[];
    inDialogMode?: boolean; // New prop to determine if we're in a dialog
}

const FilterValueField: React.FC<FilterValueFieldProps> = ({ 
    value, 
    onChange, 
    filterColumnType, 
    filterType, 
    uniqueValues,
    inDialogMode = false
}) => {
    const [filterValue, setFilterValue] = useState<CellValue>(value);

    useEffect(() => {
        onChange(filterValue);
    }, [filterValue]);

    if(["empty", "blank", "notBlank"].includes(filterType)){
        return <></>;
    }

    const className = inDialogMode ? "w-full" : "w-[260px] h-9";

    if(filterColumnType == 'agSetColumnFilter') { // special filter type
        return (
            <div className={inDialogMode ? "w-full" : ""}>
                <MultiSelect
                    options={uniqueValues.map((value) => ({ label: value, value }))}
                    value={filterValue as any[]}
                    onChange={(value: any[]) => setFilterValue(value)}
                    placeholder="Search value..."
                />
            </div>
        );
    }

    return (
        <div className={inDialogMode ? "w-full" : ""}>
            <Input
                placeholder="Enter value..."
                // @ts-ignore
                value={filterValue || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
                className={className}
            />
        </div>
    );
};

export default FilterValueField;