import React from 'react';
import { Box, Button, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import FileTextIcon from '@mui/icons-material/Description';
import type { SalesOrder, WorkflowStep } from "../types/sales-order"// Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface DetailHeaderProps {
    order: SalesOrder;
    workflowSteps: WorkflowStep[]
}


const DetailHeader = ({order,workflowSteps}: DetailHeaderProps) => {
    const navigate = useNavigate();
    const onBack = () => {
        navigate("/sales/overview");
    };
     const completedSteps = workflowSteps.filter((step) => step.status === "completed").length

      const progressPercentage = (completedSteps / workflowSteps.length) * 100

  return (
        <Box className="header" display="flex" alignItems="center">
          <IconButton
            onClick={onBack}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box flexGrow={1} ml={3}>
            <Typography variant="h3" component="h1" fontWeight="bold">
              {order.orderNumber}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 0.5 }}>
              Track order progress and manage workflow
            </Typography>

            {/* Progress Bar */}
            <Box mt={2} maxWidth={400}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Progress</Typography>
                <Typography variant="body2">{Math.round(progressPercentage)}% Complete</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#10B981",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<FileTextIcon />}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              Edit Order
            </Button>
          </Stack>
        </Box>
  )
}

export default DetailHeader