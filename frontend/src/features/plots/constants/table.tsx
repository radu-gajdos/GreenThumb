import React from 'react';
import { ColDefType } from '@/components/table/modules/interfaces/ColDefType';
import { Plot } from '../interfaces/plot';
import ActionsColumn from '@/components/table/modules/ActionsColumn';

export const pagination = true;
export const paginationPageSize = 20;
export const paginationPageSizeSelector = [10, 20, 50, 100];
export const gridOptions = { alwaysMultiSort: true };

export const getColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onNameClick: (id: string) => void
): ColDefType<Plot>[] => [
  {
    headerName: '#',
    colId: 'rowIndex',
    valueGetter: (params: any) => params.node.rowIndex + 1,
    minWidth: 40,
    sortable: true,
  },
  {
    headerName: 'Nume',
    field: 'name',
    sortable: true,
    filter: 'agTextColumnFilter',
    minWidth: 150,
    dataType: 'string',
    cellRenderer: (params: any) => (
      <span
        onClick={() => params.context.onNameClick(params.data.id)}
        className="text-primary hover:text-primary/20 underline text-left w-full cursor-pointer hover:bg-primary/20 px-1 py-1 rounded transition-colors"
      >
        {params.value}
      </span>
    ),
  },
  {
    headerName: 'Dimensiune (ha)',
    field: 'size',
    sortable: true,
    filter: 'agNumberColumnFilter',
    minWidth: 120,
    dataType: 'number',
  },
  {
    headerName: 'Tip sol',
    field: 'soilType',
    sortable: true,
    filter: 'agTextColumnFilter',
    minWidth: 150,
    dataType: 'string',
  },
  {
    headerName: 'Topografie',
    field: 'topography',
    sortable: true,
    filter: 'agTextColumnFilter',
    minWidth: 150,
    dataType: 'string',
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