import React from 'react';
import { ColDefType } from '@/components/table/modules/interfaces/ColDefType';
import { Action } from '../interfaces/action';
import ActionsColumn from '@/components/table/modules/ActionsColumn';
import { lazyT } from '@/lib/lazyT';

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
    headerName: lazyT('actionTable.type')(),
    field: 'type',
    sortable: true,
    filter: 'agTextColumnFilter',
    minWidth: 150,
    dataType: 'string',
  },
  {
    headerName: lazyT('actionTable.date')(),
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
  {
    headerName: lazyT('actionTable.details')(),
    colId: 'details',
    sortable: false,
    filter: false,
    minWidth: 200,
    valueGetter: (params: any) => params.data,
    valueFormatter: (params: any) => {
      const d = params.data;
      if (!d) return '';

      switch (d.type) {
        case 'planting':
          return `${d.cropType || ''} ${d.variety || ''}`;
        case 'harvesting':
          return `${lazyT('actionTable.yield')()}: ${d.cropYield || 0} ${lazyT('actionTable.kg')()}`;
        case 'fertilizing':
          return `${d.fertilizerType || ''} (${d.applicationRate || 0})`;
        case 'treatment':
          return `${d.pesticideType || ''} - ${d.targetPest || ''}`;
        case 'watering':
          return `${d.method || ''} - ${d.amount || 0} L`;
        case 'soil_reading':
          return `pH: ${d.ph ?? lazyT('actionTable.na')()}`;
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
