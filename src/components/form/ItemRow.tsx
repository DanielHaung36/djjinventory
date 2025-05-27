import React, { memo, useCallback } from "react";
import {
  TextField,
  Button,
  TableRow,
  TableCell,

} from "@mui/material";


export interface ItemRowProps<T> {
  item: T;
  onChange: (id: string, field: keyof T, value: any) => void;
  onDelete: (id: string) => void;
}
export const ItemRow = memo(<T extends { id: string; name: string }>(
  props: ItemRowProps<T> & { columns: Array<keyof T> }
) => {
  const { item, onChange, onDelete, columns } = props;
  return (
    <TableRow>
      <TableCell>{item.name}</TableCell>
      {columns.map(col =>
        col !== "name" && col !== "id" ? (
          <TableCell key={String(col)}>
            <TextField
              size="small"
              value={(item[col] as any) ?? ""}
              onChange={e => onChange(item.id, col, e.target.value)}
            />
          </TableCell>
        ) : null
      )}
      <TableCell>
        <Button color="error" onClick={() => onDelete(item.id)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
});
ItemRow.displayName = "ItemRow";