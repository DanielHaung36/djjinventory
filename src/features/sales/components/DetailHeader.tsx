import React from 'react';
import { useState } from 'react';
import { Box, Button, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import FileTextIcon from '@mui/icons-material/Description';
import type { SalesOrder } from "../types/sales-order"
import { ORDER_STATUS_FLOW } from "../constants/order-status"
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipboardList, Plus, Download, FileText } from 'lucide-react';
import type { ViewMode } from '../Salesorderdetail'; // Adjust the import path as necessary
interface DetailHeaderProps {
    order: SalesOrder;
    setIsPickingListOpen: (open: boolean) => void;
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}


const DetailHeader = ({ order, setIsPickingListOpen, setViewMode }: DetailHeaderProps) => {
    const navigate = useNavigate();
    const onBack = () => {
        navigate("/sales/overview");
    };
    
    // 动态计算进度
    const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status as any);
    const completedSteps = Math.max(0, currentStatusIndex + (order.status === 'order_closed' ? 1 : 0));
    const totalSteps = ORDER_STATUS_FLOW.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

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
                    onClick={() => setIsPickingListOpen(true)}
                    variant="contained"
                    startIcon={<ClipboardList size={16} />}
                    sx={{
                        backgroundColor: '#f97316',
                        '&:hover': { backgroundColor: "#ea580c" },
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Picking List
                </Button>

                <Button
                    onClick={() => setViewMode('create')}
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    sx={{
                        backgroundColor: '#22c55e',
                        '&:hover': { backgroundColor: '#16a34a' },
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    New Order
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<Download size={16} />}
                    sx={{
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Export PDF
                </Button>

                <Button
                    variant="contained"
                    startIcon={<FileText size={16} />}
                    sx={{
                        backgroundColor: 'white',
                        color: 'indigo',
                        '&:hover': { backgroundColor: '#dfdada' },
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Edit Order
                </Button>
            </Stack>
        </Box>
    )
}

export default DetailHeader