import React, { memo, useCallback } from "react";

import {
  Box,
  Typography,
  TextField,

} from "@mui/material";
// ------------------ DescriptionField.tsx ------------------
export interface DescriptionFieldProps {
  descriptTitle?:string;
  defaultValue: string;
  onBlur: (value: string) => void;
}
export const DescriptionField: React.FC<DescriptionFieldProps> = memo(
  ({ descriptTitle="Product Description", defaultValue, onBlur }) => (
    <Box sx={{ px: 2, mb: 3, display: "flex", flexDirection: "column" }}>
      <Typography sx={{ mb: 1 }}>{descriptTitle}</Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        defaultValue={defaultValue}
        onBlur={e => onBlur(e.target.value)}
      />
    </Box>
  )
);
DescriptionField.displayName = "DescriptionField";