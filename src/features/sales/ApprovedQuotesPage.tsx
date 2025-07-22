import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl
} from '@mui/material'
import { ShoppingCart, CheckCircle, Warning } from '@mui/icons-material'
import { quoteApi } from '../../api/quoteApi'
import type { Quote } from '../../api/quoteApi'
import { orderApi } from '../../api/orderApi'
import type { SalesOrder } from './types/sales-order'
import { useUserRegionAndWarehouses } from '@/hooks/useUserRegionAndWarehouses'
import { useGetRegionsWithWarehousesQuery } from '@/features/inventory/inventoryApi'
import { useAppSelector } from '@/app/hooks'
import { useWebSocket } from '@/hooks/useWebSocket'

const ApprovedQuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [convertedOrder, setConvertedOrder] = useState<SalesOrder | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  
  // 仓库选择相关状态
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null)
  
  // 获取用户权限和仓库信息
  const currentUser = useAppSelector((state) => state.auth.user)
  const { warehouses: userWarehouses } = useUserRegionAndWarehouses()
  const { data: regionsData } = useGetRegionsWithWarehousesQuery()
  
  // 检查是否是管理员
  const isAdmin = currentUser?.user?.role === 'admin' || 
                  currentUser?.user?.role === 'financial_leader'

  // WebSocket连接监听报价单事件
  const quotesWebSocketUrl = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/quotes`
  const { lastMessage } = useWebSocket(quotesWebSocketUrl)

  // 监听WebSocket消息
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'quoteConverted') {
      console.log('📨 [报价单] 收到报价单转换通知:', lastMessage.data)
      const { quoteId } = lastMessage.data
      // 从列表中移除已转换的报价单
      setQuotes(prev => prev.filter(q => q.id !== quoteId))
    }
  }, [lastMessage])

  // 加载已批准的Quotes
  useEffect(() => {
    loadApprovedQuotes()
  }, [])

  const loadApprovedQuotes = async () => {
    try {
      setLoading(true)
      const response = await quoteApi.getApprovedQuotes(1, 50)
      console.log('Approved quotes response:', response) // 调试日志
      
      // 确保response.data存在且是数组
      const quotesData = response.data || []
      console.log('Quotes data:', quotesData) // 调试日志
      
      // 过滤掉已经转换的quotes
      const unconvertedQuotes = quotesData.filter(q => q && !q.convertedToOrder)
      console.log('Unconverted quotes:', unconvertedQuotes) // 调试日志
      
      setQuotes(unconvertedQuotes)
      setError(null)
    } catch (err) {
      console.error('Error loading approved quotes:', err)
      setError(`Failed to load approved quotes: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 获取可用仓库列表
  const getAvailableWarehouses = () => {
    if (isAdmin) {
      // 管理员：获取所有地区的仓库
      return regionsData?.data?.flatMap(region => 
        region.warehouses?.map(warehouse => ({
          ...warehouse,
          regionName: region.name
        })) || []
      ) || []
    } else {
      // 普通用户：只显示自己地区的仓库
      return userWarehouses?.map(warehouse => ({
        ...warehouse,
        regionName: undefined
      })) || []
    }
  }

  // 点击转换按钮，显示仓库选择弹窗
  const handleConvertToOrder = (quoteId: number) => {
    const warehouses = getAvailableWarehouses()
    
    if (warehouses.length === 0) {
      setError('没有可用的仓库，请联系管理员')
      return
    }
    
    setSelectedQuoteId(quoteId)
    setSelectedWarehouseId(null)
    setShowWarehouseDialog(true)
  }

  // 确认转换为订单
  const handleConfirmConvertToOrder = async () => {
    if (!selectedQuoteId || !selectedWarehouseId) return
    
    try {
      setConverting(selectedQuoteId)
      setError(null)
      setShowWarehouseDialog(false)
      
      // 调用转换API，传入仓库ID
      const order = await quoteApi.convertQuoteToOrder(selectedQuoteId, {
        warehouse_id: selectedWarehouseId,
        created_by: currentUser?.user?.id
      })
      
      // 显示成功对话框（WebSocket会自动更新列表）
      setConvertedOrder(order)
      setShowSuccessDialog(true)
      
    } catch (err: any) {
      console.error('Error converting quote to order:', err)
      setError(err.response?.data?.error || 'Failed to convert quote to order')
    } finally {
      setConverting(null)
      setSelectedQuoteId(null)
      setSelectedWarehouseId(null)
    }
  }

  const getQuoteStatusChip = (status: string) => {
    return (
      <Chip 
        label="已批准" 
        color="success" 
        size="small" 
        icon={<CheckCircle fontSize="small" />}
      />
    )
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          待转换订单的报价单
        </Typography>
        <Button
          variant="outlined"
          onClick={loadApprovedQuotes}
          disabled={loading}
        >
          刷新
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 调试信息 */}
      <Alert severity="info" sx={{ mb: 2 }}>
        调试信息: 找到 {quotes.length} 个待转换的报价单
        {quotes.length === 0 && (
          <div>
            <br />
            可能原因:
            <br />
            1. 数据库中没有状态为 "approved" 的报价单
            <br />
            2. 所有报价单都已经转换为订单
            <br />
            3. 数据结构不匹配
          </div>
        )}
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            已批准的报价单 ({quotes.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            以下报价单已通过审批，可以转换为正式订单
          </Typography>

          {quotes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                暂无待转换的报价单
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>报价单号</TableCell>
                    <TableCell>客户</TableCell>
                    <TableCell>销售代表</TableCell>
                    <TableCell>报价日期</TableCell>
                    <TableCell>总金额</TableCell>
                    <TableCell>定金要求</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {quote.quoteNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {quote.customer?.name || `Customer ID: ${quote.customerId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {quote.salesRepUser?.name || `Rep ID: ${quote.salesRepId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(quote.quoteDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          {formatCurrency(quote.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {quote.requiresDeposit ? (
                          <Box>
                            <Typography variant="body2" color="warning.main">
                              需要定金
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(quote.depositAmount)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="success.main">
                            无需定金
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {getQuoteStatusChip(quote.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleConvertToOrder(quote.id)}
                          disabled={converting === quote.id}
                        >
                          {converting === quote.id ? (
                            <>
                              <CircularProgress size={16} />
                              <span style={{ marginLeft: 8 }}>转换中...</span>
                            </>
                          ) : (
                            '转换为订单'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 成功转换对话框 */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            转换成功
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            报价单已成功转换为订单！
          </Typography>
          {convertedOrder && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                订单号: <strong>{convertedOrder.orderNumber}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                状态: <strong>{convertedOrder.status}</strong>
              </Typography>
              {convertedOrder.hasStockIssues && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    注意：部分商品库存不足，订单已创建但标记为等货状态
                  </Typography>
                  {convertedOrder.inventoryWarnings && (
                    <Typography variant="caption" display="block">
                      {convertedOrder.inventoryWarnings}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuccessDialog(false)}>
            确定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 仓库选择对话框 */}
      <Dialog open={showWarehouseDialog} onClose={() => setShowWarehouseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          选择发货仓库
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {isAdmin ? "请选择此订单的发货仓库（所有地区）" : "请选择此订单的发货仓库"}
          </Typography>
          
          <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
            <RadioGroup
              value={selectedWarehouseId || ''}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
            >
              {getAvailableWarehouses().map(warehouse => (
                <FormControlLabel
                  key={warehouse.id}
                  value={warehouse.id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {warehouse.name}
                      </Typography>
                      {warehouse.location && (
                        <Typography variant="body2" color="text.secondary">
                          {warehouse.location}
                        </Typography>
                      )}
                      {warehouse.regionName && (
                        <Chip 
                          label={warehouse.regionName} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ 
                    alignItems: 'flex-start',
                    py: 1,
                    border: '1px solid transparent',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowWarehouseDialog(false)}
            disabled={converting !== null}
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirmConvertToOrder}
            disabled={!selectedWarehouseId || converting !== null}
            variant="contained"
          >
            确认转换为订单
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ApprovedQuotesPage