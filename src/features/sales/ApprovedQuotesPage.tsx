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
  DialogActions
} from '@mui/material'
import { ShoppingCart, CheckCircle, Warning } from '@mui/icons-material'
import { quoteApi, Quote } from '../../api/quoteApi'
import { orderApi } from '../../api/orderApi'
import { SalesOrder } from './types/sales-order'

const ApprovedQuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [convertedOrder, setConvertedOrder] = useState<SalesOrder | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // 加载已批准的Quotes
  useEffect(() => {
    loadApprovedQuotes()
  }, [])

  const loadApprovedQuotes = async () => {
    try {
      setLoading(true)
      const response = await quoteApi.getApprovedQuotes(1, 50)
      // 过滤掉已经转换的quotes
      const unconvertedQuotes = response.data.filter(q => !q.convertedToOrder)
      setQuotes(unconvertedQuotes)
      setError(null)
    } catch (err) {
      console.error('Error loading approved quotes:', err)
      setError('Failed to load approved quotes')
    } finally {
      setLoading(false)
    }
  }

  // 转换Quote为Order
  const handleConvertToOrder = async (quoteId: number) => {
    try {
      setConverting(quoteId)
      setError(null)
      
      const order = await quoteApi.convertQuoteToOrder(quoteId)
      
      // 更新quotes列表，移除已转换的quote
      setQuotes(prev => prev.filter(q => q.id !== quoteId))
      
      // 显示成功对话框
      setConvertedOrder(order)
      setShowSuccessDialog(true)
      
    } catch (err: any) {
      console.error('Error converting quote to order:', err)
      setError(err.response?.data?.error || 'Failed to convert quote to order')
    } finally {
      setConverting(null)
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
    </Box>
  )
}

export default ApprovedQuotesPage