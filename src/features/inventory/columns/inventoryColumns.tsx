// inventoryColumns.ts
import React, { useMemo, useRef, useState, createRef } from "react";
import type { MRT_ColumnDef }  from 'material-react-table';
import  { MRT_Cell }  from 'material-react-table';
import { Box, Chip, Typography } from '@mui/material';
import type { InventoryRow } from '../components/InventoryModel';

export const INVENTORY_COLUMNS : MRT_ColumnDef<InventoryRow>[]  = [
      {
        accessorKey: 'djj_code',
        header: 'DJJ Code',
      },
      {
        accessorKey: 'product_name',
        header: 'Product Name',
      },
      {
        accessorKey: 'manufacturer',
        header: 'Manufacturer',
      },
      {
        accessorKey: 'model',
        header: 'Model',
      },
      {
        accessorKey: 'last_update',
        header: 'Last Update',
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleString(),
      },
   {
      accessorKey: 'category',
      header: 'Category',
      enableColumnFilter: true,
      size: 120,
      Cell: ({ cell }) => {
        const val = cell.getValue<InventoryRow['category']>()
        const colorMap: Record<typeof val, 'warning'|'primary'|'success'|'info'> = {
          Machine:    'warning',
          Parts:      'primary',
          Tools:      'success',
          Accessories:'info',
        }
        return (
          <Chip
            label={val}
            size="small"
            variant="filled"
            color={colorMap[val]}
          />
        )
      },
    },
      {
        accessorKey: 'price',
        header: 'Price',
        Cell: ({ cell }) => (
          <Typography>
            {cell
              .getValue<number>()
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
          </Typography>
        ),
      },
     {
      accessorKey: 'regionStore',
      header: 'Region – Store',
      size: 180,
      enableColumnFilter: true,
    },
    {
  accessorKey: 'actualQty',
  header: '在库量',
  enableColumnFilter: true,
  size: 100,
},
{
  accessorKey: 'lockedQty',
  header: '锁定量',
  enableColumnFilter: true,
  size: 100,
},
{
  accessorKey: 'availableQty',
  header: '可用量',
  enableColumnFilter: true,
  size: 100,
  Cell: ({ cell }) => {
    const val = cell.getValue<number>()
    const color = val < 20 ? 'error.main' : 'success.main'
    return (
      <Box
        sx={{
          border: 2,
          borderColor: color,
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
        }}
      >
        <Typography sx={{ color, fontWeight: 'bold' }}>{val}</Typography>
      </Box>
    )
  },
}
 ]
  
