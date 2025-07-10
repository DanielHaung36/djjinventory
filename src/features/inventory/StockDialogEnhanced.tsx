import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// 导入API hooks
import { 
  useStockInMutation,
  useStockOutMutation,
  useGetProductStockQuery,
  type RegionInventoryListItem,
  type StockMovementRequest 
} from './inventoryApi';

type DialogMode = 'in' | 'out' | null;

interface StockDialogEnhancedProps {
  mode: DialogMode;
  product: RegionInventoryListItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export const StockDialogEnhanced: React.FC<StockDialogEnhancedProps> = ({
  mode,
  product,
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');

  // API hooks
  const [stockIn, { isLoading: isStockInLoading }] = useStockInMutation();
  const [stockOut, { isLoading: isStockOutLoading }] = useStockOutMutation();
  
  // 获取产品详细库存信息（包含仓库信息）
  const { 
    data: productStockData, 
    isLoading: isLoadingStock,
    error: stockError 
  } = useGetProductStockQuery(
    product?.product_id || 0, 
    { skip: !product?.product_id || !open }
  );

  const isSubmitting = isStockInLoading || isStockOutLoading;

  // 重置表单
  useEffect(() => {
    if (open && product) {
      setQty(1);
      setNote('');
      setSelectedWarehouseId('');
    }
  }, [open, product]);

  // 自动选择第一个仓库
  useEffect(() => {
    if (productStockData?.warehouses && productStockData.warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(productStockData.warehouses[0].warehouse_id);
    }
  }, [productStockData, selectedWarehouseId]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setQty(1);
      setNote('');
      setSelectedWarehouseId('');
    }
  };

  const handleConfirm = async () => {
    if (!product || !selectedWarehouseId) return;

    try {
      const request: StockMovementRequest = {
        product_id: product.product_id,
        warehouse_id: selectedWarehouseId as number,
        quantity: qty,
        tx_type: mode === 'in' ? 'IN' : 'OUT',
        note: note || undefined,
      };

      let result;
      if (mode === 'in') {
        result = await stockIn(request).unwrap();
      } else {
        result = await stockOut(request).unwrap();
      }

      if (result.success) {
        onSuccess(result.message);
      } else {
        onError(result.message || '操作失败');
      }
    } catch (error: any) {
      console.error('Stock operation error:', error);
      onError(
        error?.data?.message || 
        error?.message || 
        `${mode === 'in' ? '入库' : '出库'}操作失败`
      );
    }
  };

  // 获取当前选中仓库的库存信息
  const selectedWarehouse = productStockData?.warehouses?.find(
    w => w.warehouse_id === selectedWarehouseId
  );

  // 验证数量
  const isQtyInvalid = qty < 1 || (mode === 'out' && selectedWarehouse && qty > selectedWarehouse.available);

  const getHelperText = () => {
    if (!selectedWarehouse) return '';
    
    if (mode === 'in') {
      return `当前库存：${selectedWarehouse.on_hand}，预留：${selectedWarehouse.reserved}`;
    } else {
      return `可用库存：${selectedWarehouse.available}（总库存：${selectedWarehouse.on_hand}，预留：${selectedWarehouse.reserved}）`;
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6">
          {mode === 'in' ? '入库' : '出库'} — {product.product_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          产品编码：{product.product_code}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          disabled={isSubmitting}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* 错误提示 */}
        {stockError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            无法加载库存信息
          </Alert>
        )}

        {/* 加载状态 */}
        {isLoadingStock && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 1 }}>加载库存信息...</Typography>
          </Box>
        )}

        {/* 仓库选择 */}
        {productStockData?.warehouses && (
          <FormControl fullWidth margin="normal">
            <InputLabel>选择仓库</InputLabel>
            <Select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value as number)}
              label="选择仓库"
              disabled={isSubmitting}
            >
              {productStockData.warehouses.map((warehouse) => (
                <MenuItem key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                  {warehouse.warehouse_name} 
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    (可用: {warehouse.available})
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* 数量输入 */}
        <TextField
          label="数量"
          type="number"
          fullWidth
          margin="normal"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          error={isQtyInvalid}
          helperText={getHelperText()}
          inputProps={{
            min: 1,
            max: mode === 'out' ? selectedWarehouse?.available : undefined,
          }}
          disabled={isSubmitting}
        />

        {/* 备注输入 */}
        <TextField
          label="备注（可选）"
          multiline
          rows={3}
          fullWidth
          margin="normal"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSubmitting}
          placeholder={`请输入${mode === 'in' ? '入库' : '出库'}原因或备注信息...`}
        />

        {/* 库存总览信息 */}
        {productStockData && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                地区库存总览：
              </Typography>
              <Box display="flex" gap={2}>
                <Typography variant="body2">
                  总库存：<strong>{productStockData.total_on_hand}</strong>
                </Typography>
                <Typography variant="body2">
                  预留：<strong>{productStockData.total_reserved}</strong>
                </Typography>
                <Typography variant="body2">
                  可用：<strong>{productStockData.total_available}</strong>
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isQtyInvalid || isSubmitting || !selectedWarehouseId}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} />
            ) : undefined
          }
        >
          {isSubmitting ? '处理中...' : '确定'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};