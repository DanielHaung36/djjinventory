import React from 'react';
import NewSalesDashboard from './NewSalesDashboard';
import { Box } from '@mui/material';

export default function SalesOverviewPage() {
  return (
    <Box sx={{
      display: 'flex', 
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'hidden',
      height: "100%",
      minHeight: 0,
      width: "100%",
    }}> 
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: 4,
        overflow: 'auto',
        height: "100%"
      }}>
        <NewSalesDashboard />
      </Box>
    </Box>
  )
}
