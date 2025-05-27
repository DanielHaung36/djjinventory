import React, { memo } from 'react';
import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { InboundItem } from './boundModel';

export interface SelectedItemsTableProps {
  items: InboundItem[];
  updateItem: (id: string, field: keyof InboundItem, value: any) => void;
  deleteItem: (id: string) => void;
}

export const InboundTable: React.FC<SelectedItemsTableProps> = memo(
  ({ items, updateItem, deleteItem }) => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>Item</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>VIN (Host)</TableCell>
            <TableCell>Remark</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row) => (
            <TableRow key={row.id}>
              <TableCell colSpan={2}>{row.name}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: '6rem' }}
                  value={row.qty}
                  onChange={(e) => updateItem(row.id, 'qty', Number(e.target.value))}
                />
              </TableCell>
              <TableCell>
                {row.type === 'Host' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter VIN"
                      value={row.vin || ''}
                      onChange={(e) => updateItem(row.id, 'vin', e.target.value)}
                    />
                    <TextField
                      size="small"
                      placeholder="Enter Serial"
                      value={row.serial || ''}
                      onChange={(e) => updateItem(row.id, 'serial', e.target.value)}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!row.addLoan}
                          onChange={(e) => updateItem(row.id, 'addLoan', e.target.checked)}
                        />
                      }
                      label="Add Loan"
                    />
                  </Box>
                ) : (
                  <em>—</em>
                )}
              </TableCell>
              <TableCell>
                <TextField
                  multiline
                  size="small"
                  value={row.remark || ''}
                  onChange={(e) => updateItem(row.id, 'remark', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => deleteItem(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
);
InboundTable.displayName = 'SelectedItemsTable';
