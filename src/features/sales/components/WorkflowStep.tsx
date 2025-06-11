import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    Typography,
} from "@mui/material";
import type {WorkflowStep } from "../types/sales-order"// Adjust the import path as necessary
import { Edit } from "@mui/icons-material"

interface WorkflowStepProps {
    completedSteps: number;
     workflowSteps: WorkflowStep[]
}
type ViewMode = "list" | "detail" | "create" | "edit-deposit" | "edit-payment" | "edit-shipment" | "close-order"

import {
  ArrowBackIosNew as ArrowBackIcon,
  GetApp as DownloadIcon,
  Description as FileTextIcon,
  CheckCircleOutline as CheckCircleIcon,
  RadioButtonUnchecked as CircleIcon,
  AccessTime as ClockIcon,
  LocalShipping as PackageIcon,

} from "@mui/icons-material"



const TimeLine = ({completedSteps,workflowSteps}: WorkflowStepProps) => {
  
      const [viewMode, setViewMode] = useState<ViewMode>("detail")
    const [selectedStep, setSelectedStep] = useState<number>(4)
    const getStepIcon = (status: WorkflowStep["status"]) => {
      switch (status) {
        case "completed":
          return <CheckCircleIcon sx={{ color: "#10B981", fontSize: 28 }} />
        case "current":
          return <ClockIcon sx={{ color: "#3B82F6", fontSize: 28 }} />
        default:
          return <CircleIcon sx={{ color: "#9CA3AF", fontSize: 28 }} />
      }
    }
  
    
    const getEditButton = (stepId: number) => {
      const editActions = {
        1: () => setViewMode("edit-deposit"),
        3: () => setViewMode("edit-payment"),
        5: () => setViewMode("edit-shipment"),
        6: () => setViewMode("close-order"),
      }

      
    if (editActions[stepId as keyof typeof editActions]) {
      return (
        <button
          onClick={editActions[stepId as keyof typeof editActions]}
          className="ml-2 p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="Edit this stage"
        >
          <Edit className="w-4 h-4" />
        </button>
      )
    }
    return null
  }


    return (
     <Grid item xs={12} lg={4}>
          <Card
            sx={{
              position: "sticky",
              top: 24,
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <CardHeader
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                pb: 2,
              }}
              avatar={<PackageIcon sx={{ color: "white" }} />}
              title={
                <Typography variant="h5" fontWeight="bold">
                  Order Timeline
                </Typography>
              }
              subheader={
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {completedSteps} of {workflowSteps.length} steps completed
                </Typography>
              }
            />
            <CardContent sx={{ p: 0 }}>
              {workflowSteps.map((step, index) => (
                <Box key={step.id}>
                  <Box
                    onClick={() => setSelectedStep(step.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 3,
                      cursor: "pointer",
                      bgcolor: selectedStep === step.id ? "#f0f9ff" : "transparent",
                      borderLeft: selectedStep === step.id ? "4px solid #3B82F6" : "4px solid transparent",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#f8fafc",
                        transform: "translateX(1px)",
                      },
                      position: "relative",
                    }}
                  >
                    <Box display="flex" alignItems="center" mr={3}>
                      {getStepIcon(step.status)}
                    </Box>
                    <Box flexGrow={1} minWidth={0}>
                      <Box sx={{ display: "flex", alignItems: "center",justifyContent: "space-between" }}>
                        <Typography variant="h6" fontWeight="600" mb={0.5}>
                        {step.title}
                      </Typography>
                       {getEditButton(step.id)}
                      </Box>
               
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {step.description}
                      </Typography>
                      {step.date && (
                        <Chip label={step.date} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
                      )}
                    </Box>
                    {index < workflowSteps.length - 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 38,
                          bottom: -40,   // 根据实际间距调整
                          width: 2,
                          height: 80,    // 对应两步骤之间距离
                          bgcolor: step.status === "completed" ? "#10B981" : "#E5E7EB",
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
  )
}

export default TimeLine