import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Chip,
  LinearProgress,
  Grid,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Assignment,
  Person,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { useApproveOrderActionMutation, useRejectOrderActionMutation } from '../salesApi';
import type { SalesOrderAdminItem } from '../../../lib/types/sales-order-admin';

interface AdminOrderApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  order: SalesOrderAdminItem | null;
  onOrderUpdate?: () => void;
}

const APPROVAL_ACTIONS = [
  { value: 'deposit_payment', label: 'Approve Deposit Payment', description: 'Approve and proceed to deposit received' },
  { value: 'final_payment', label: 'Approve Final Payment', description: 'Approve and proceed to final payment received' },
  { value: 'pd_complete', label: 'Approve PD Completion', description: 'Approve and mark PD inspection complete' },
  { value: 'ship', label: 'Approve Shipment', description: 'Approve and mark as shipped' },
  { value: 'deliver', label: 'Approve Delivery', description: 'Approve and mark as delivered' },
];

const AdminOrderApprovalDialog: React.FC<AdminOrderApprovalDialogProps> = ({
  open,
  onClose,
  order,
  onOrderUpdate
}) => {
  const [action, setAction] = useState('');
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // RTK Query mutations
  const [approveOrderAction, { isLoading: isApproving }] = useApproveOrderActionMutation();
  const [rejectOrderAction, { isLoading: isRejecting }] = useRejectOrderActionMutation();

  const loading = isApproving || isRejecting;

  const handleReset = () => {
    setAction('');
    setComments('');
    setRejectionReason('');
    setApprovalType(null);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleApprove = async () => {
    if (!order || !action) return;

    setError(null);
    setSuccess(null);

    try {
      const numericOrderId = parseInt(order.id.replace(/\D/g, '')) || parseInt(order.id);
      
      if (approvalType === 'approve') {
        await approveOrderAction({
          id: numericOrderId,
          action,
          comments,
        }).unwrap();
        setSuccess(`Order ${order.orderNumber} action "${action}" approved successfully`);
      } else if (approvalType === 'reject') {
        await rejectOrderAction({
          id: numericOrderId,
          action,
          reason: rejectionReason,
          comments,
        }).unwrap();
        setSuccess(`Order ${order.orderNumber} action "${action}" rejected successfully`);
      }

      // Wait a moment to show success message
      setTimeout(() => {
        onOrderUpdate?.();
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error('Approval action failed:', err);
      setError(err?.data?.error || err?.message || 'Approval action failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'info';
      case 'deposit_received':
        return 'warning';
      case 'final_payment_received':
        return 'success';
      case 'pre_delivery_inspection':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'order_closed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Assignment color="primary" />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Order Approval
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {order && (
          <>
            {/* Order Information */}
            <Box mb={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Order Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Assignment fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Order Number:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {order.orderNumber}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Customer:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {order.customer}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Order Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Total:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: order.currency 
                      }).format(order.totalAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Current Status:
                    </Typography>
                    <Chip
                      label={formatStatus(order.currentStatus)}
                      color={getStatusColor(order.currentStatus) as any}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Loading Progress */}
            {loading && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Processing approval action...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {/* Approval Actions */}
            {!success && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Approval Actions
                </Typography>

                {/* Action Selection */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Action</InputLabel>
                  <Select
                    value={action}
                    label="Select Action"
                    onChange={(e) => setAction(e.target.value)}
                    disabled={loading}
                  >
                    {APPROVAL_ACTIONS.map((act) => (
                      <MenuItem key={act.value} value={act.value}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {act.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {act.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {action && (
                  <>
                    {/* Approval Type Selection */}
                    <Box display="flex" gap={2} sx={{ mb: 2 }}>
                      <Button
                        variant={approvalType === 'approve' ? 'contained' : 'outlined'}
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => setApprovalType('approve')}
                        disabled={loading}
                        fullWidth
                      >
                        Approve
                      </Button>
                      <Button
                        variant={approvalType === 'reject' ? 'contained' : 'outlined'}
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => setApprovalType('reject')}
                        disabled={loading}
                        fullWidth
                      >
                        Reject
                      </Button>
                    </Box>

                    {/* Rejection Reason (if rejecting) */}
                    {approvalType === 'reject' && (
                      <TextField
                        fullWidth
                        label="Rejection Reason"
                        placeholder="Please provide reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                        disabled={loading}
                        error={approvalType === 'reject' && !rejectionReason}
                        helperText={approvalType === 'reject' && !rejectionReason ? 'Rejection reason is required' : ''}
                      />
                    )}

                    {/* Comments */}
                    <TextField
                      fullWidth
                      label="Additional Comments (Optional)"
                      placeholder="Add any additional notes or comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      multiline
                      rows={3}
                      disabled={loading}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {!success && (
          <Button
            onClick={handleApprove}
            variant="contained"
            disabled={loading || !action || !approvalType || (approvalType === 'reject' && !rejectionReason)}
            color={approvalType === 'approve' ? 'success' : 'error'}
            startIcon={approvalType === 'approve' ? <CheckCircle /> : <Cancel />}
          >
            {loading ? 'Processing...' : `${approvalType === 'approve' ? 'Approve' : 'Reject'} Action`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminOrderApprovalDialog;