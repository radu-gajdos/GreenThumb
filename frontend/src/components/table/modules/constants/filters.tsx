import { ColDefType } from "../interfaces/ColDefType";

export interface FilterOption {
    label: string
    value: FilterType
}
 // Helper pentru a păstra type safety
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'empty';

export type FilterType = 
    | 'empty' 
    | 'equals' 
    | 'notEqual' 
    | 'lessThan' 
    | 'lessThanOrEqual' 
    | 'greaterThan' 
    | 'greaterThanOrEqual' 
    | 'inRange' 
    | 'contains' 
    | 'notContains' 
    | 'startsWith' 
    | 'endsWith' 
    | 'blank' 
    | 'notBlank'
 
export const TEXT_FILTERS: FilterOption[] = [
    { label: 'Contains', value: 'contains' },
    { label: 'Not Contains', value: 'notContains' },
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equal', value: 'notEqual' },
    { label: 'Starts With', value: 'startsWith' },
    { label: 'Ends With', value: 'endsWith' },
    { label: 'Blank', value: 'blank' },
    { label: 'Not Blank', value: 'notBlank' }
]
 
export const NUMBER_FILTERS: FilterOption[] = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equal', value: 'notEqual' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Less Than or Equal', value: 'lessThanOrEqual' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Greater Than or Equal', value: 'greaterThanOrEqual' },
    { label: 'In Range', value: 'inRange' },
    { label: 'Blank', value: 'blank' },
    { label: 'Not Blank', value: 'notBlank' }
]
 
export const DATE_FILTERS: FilterOption[] = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equal', value: 'notEqual' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Less Than or Equal', value: 'lessThanOrEqual' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Greater Than or Equal', value: 'greaterThanOrEqual' },
    { label: 'In Range', value: 'inRange' },
    { label: 'Blank', value: 'blank' },
    { label: 'Not Blank', value: 'notBlank' }
]
 
export const BOOLEAN_FILTERS: FilterOption[] = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equal', value: 'notEqual' },
    { label: 'Blank', value: 'blank' },
    { label: 'Not Blank', value: 'notBlank' }
]
 
export const EMPTY_FILTERS: FilterOption[] = [
    { label: 'Blank', value: 'blank' },
    { label: 'Not Blank', value: 'notBlank' }
]

export const FILTERS_BY_TYPE: Record<DataType, FilterOption[]> = {
   string: TEXT_FILTERS,
   number: NUMBER_FILTERS,
   date: DATE_FILTERS,
   boolean: BOOLEAN_FILTERS,
   empty: EMPTY_FILTERS
} as const

export function getFiltersForType(type: DataType): FilterOption[] {
    return FILTERS_BY_TYPE[type]
}
 // Funcție helper pentru a accesa proprietăți nested
export const getNestedValue = (obj: any, path: string) => {
   return path.split('.').reduce((current, key) => {
       return current?.[key];
   }, obj);
};

export function getTypeForField(field: string, columns: ColDefType<any>[]): DataType {
   const column = columns.find(col => col.field === field);
   return column?.dataType as DataType || 'string'; // default la text dacă nu e specificat
}

export function getFiltersForField(field: string, columns: ColDefType<any>[]): FilterOption[] {
    const isSetFilter = columns.find(col => col.field === field)?.filter === 'agSetColumnFilter';
    if (isSetFilter) {
        return [{ label: 'Equals', value: 'equals' }];
    }
    const type = getTypeForField(field, columns);
    return FILTERS_BY_TYPE[type];
}

export type CellValue = string | number | null | undefined | string[] | number[];
export type FilterColumnType = string;