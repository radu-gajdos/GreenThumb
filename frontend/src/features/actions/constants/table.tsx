import React from 'react';
import { ColDefType } from '@/components/table/modules/interfaces/ColDefType';
import { Action } from '../interfaces/action';
import ActionsColumn from '@/components/table/modules/ActionsColumn';

export const pagination = true;
export const paginationPageSize = 20;
export const paginationPageSizeSelector = [10, 20, 50, 100];
export const gridOptions = { alwaysMultiSort: true };

export const getColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColDefType<Action>[] => [
  {
    headerName: '#',
    colId: 'rowIndex',
    valueGetter: (params: any) => params.node.rowIndex + 1,
    minWidth: 40,
    sortable: true,
  },
  {
    headerName: 'Tip Acțiune',
    field: 'type',
    sortable: true,
    filter: 'agTextColumnFilter',
    minWidth: 150,
    dataType: 'string',
  },
  {
    headerName: 'Data',
    field: 'createdAt',
    sortable: true,
    filter: 'agDateColumnFilter',
    minWidth: 120,
    dataType: 'date',
    valueFormatter: (params: any) => {
      if (!params.value) return '';
      return new Date(params.value).toLocaleDateString();
    },
  },
  // Dynamic columns based on action type
  {
    headerName: 'Detalii',
    colId: 'details',
    sortable: false,
    filter: false,
    minWidth: 200,
    valueGetter: (params: any) => params.data,
    valueFormatter: (params: any) => {
      if (!params.data) return '';
      
      switch (params.data.type) {
        case 'planting':
          return `${params.data.cropType || ''} ${params.data.variety || ''}`;
        case 'harvesting':
          return `Yield: ${params.data.cropYield || 0} kg`;
        case 'fertilizing':
          return `${params.data.fertilizerType || ''} (${params.data.applicationRate || 0})`;
        case 'treatment':
          return `${params.data.pesticideType || ''} - ${params.data.targetPest || ''}`;
        case 'watering':
          return `${params.data.method || ''} - ${params.data.amount || 0} L`;
        case 'soilReading':
          return `pH: ${params.data.ph || 'N/A'}`;
        default:
          return '';
      }
    },
  },
  {
    headerName: 'Actions',
    minWidth: 130,
    colId: 'actions',
    sortable: false,
    cellRenderer: (params: any) => (
      <ActionsColumn
        onEdit={() => onEdit(params.data.id)}
        onDelete={() => onDelete(params.data.id)}
      />
    ),
    cellClass: 'actionsCell',
  },
];