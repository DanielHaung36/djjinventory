import React from 'react'
import { MaterialReactTable, useMaterialReactTable,MRT_TablePagination,MRT_ToolbarAlertBanner  } from 'material-react-table'
import { MenuItem } from '@mui/material'

import { INVENTORY_COLUMNS } from '../columns/inventoryColumns'
import type { InventoryRow } from './InventoryModel'

type Props = { data: InventoryRow[]; onRowClick: (item: any) => void }

export const InventoryTable:React.FC<Props> = ( {data,onRowClick }) =>{
    const table = useMaterialReactTable<InventoryRow>({
           columns: INVENTORY_COLUMNS,
            data,
            enableColumnFilters: true,
            muiTableBodyRowProps: ({ row }) => ({
            onClick: () => onRowClick(row.original),
            sx: { cursor: 'pointer' },
            }),
            renderRowActionMenuItems: ({ closeMenu, row }) => [
            <MenuItem key="in" onClick={() => { onRowClick(row.original); closeMenu(); }}>入库</MenuItem>,
            <MenuItem key="out" onClick={() => { onRowClick(row.original); closeMenu(); }}>出库</MenuItem>,
            <MenuItem key="info" onClick={() => { onRowClick(row.original); closeMenu(); }}>查看详情</MenuItem>,
            ],
  });

        return (
            <>
            <MaterialReactTable table={table} />
            <MRT_TablePagination table={table} />
            <MRT_ToolbarAlertBanner table={table} />
            </>
        );
}
