// src/components/ProductDetails.tsx

import React, { useState, ChangeEvent } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  Button,
  CardMedia,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudDownload as DownloadIcon,
  WarningAmber as WarningIcon,
  BrokenImage as BrokenImageIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export interface LogEntry {
  date: string;
  type: 'Inbound' | 'Outbound' | 'Adjustment';
  qty: number;
  warehouse: string;
  operator: string;
  reference: string;
  notes: string;
}

export interface ApprovalEntry {
  step: string;
  approver: string;
  status: string;
  time: string;
  comment: string;
}

export interface AttachmentEntry {
  name: string;
  type: string;
  size: string;
  uploaded: string;
}

export interface Product {
  photoUrl?: string;
  djj_code: string;
  product_name: string;
  manufacturer: string;
  model: string;
  last_update: string;
  category: string;
  price: number;
  regionStore: string;
  actualQty: number;
  lockedQty: number;
  availableQty: number;
}

interface ProductDetailsProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

const TAB_KEYS = [
  'basic',
  'specs',
  'inventory',
  'logs',
  'approvals',
  'attachments',
] as const;

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  open,
  onClose,
  product,
}) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [tab, setTab] = useState<typeof TAB_KEYS[number]>('basic');
  const [filter, setFilter] = useState('');
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([]);

  // 假数据：日志 & 审批
  const logData: LogEntry[] = [
    {
      date: '2025/05/14 10:00',
      type: 'Inbound',
      qty: 10,
      warehouse: 'Brisbane – A',
      operator: 'Alice',
      reference: 'PO-001',
      notes: 'New stock',
    },
    {
      date: '2025/05/15 14:30',
      type: 'Outbound',
      qty: 5,
      warehouse: 'Brisbane – A',
      operator: 'Bob',
      reference: 'SO-123',
      notes: 'Sold',
    },
  ];
  const approvalData: ApprovalEntry[] = [
    {
      step: 'Request',
      approver: 'Manager',
      status: 'Approved',
      time: '2025/05/14 11:00',
      comment: 'OK',
    },
    {
      step: 'Finance',
      approver: 'CFO',
      status: 'Pending',
      time: '',
      comment: '',
    },
  ];

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [
      ...prev,
      {
        name: file.name,
        type: file.name.split('.').pop()!.toUpperCase(),
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploaded: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{
      sx: {
        width: isMdUp ? 800 : '100vw',
        height: '100%',
        p: 0,
      }
    }}>
      {/* 头部 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ flex: 1 }}>
          Product Details
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 图片或占位 */}
      {product.photoUrl ? (
        <CardMedia
          component="img"
          height={isMdUp ? 200 : 150}
          image={product.photoUrl}
          alt={product.product_name}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: isMdUp ? 200 : 150,
            bgcolor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrokenImageIcon sx={{ fontSize: isMdUp ? 80 : 48, color: '#bbb' }} />
        </Box>
      )}

      {/* 面包屑 */}
      <Box px={2} pt={1}>
        <Breadcrumbs separator="›" sx={{ fontSize: 14 }}>
          <Link color="inherit" href="#">
            Inventory
          </Link>
          <Link color="inherit" href="#">
            Overview
          </Link>
          <Typography color="text.secondary">Details</Typography>
        </Breadcrumbs>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2, mt: 1 }}
      >
        {TAB_KEYS.map((key) => (
          <Tab
            key={key}
            label={{
              basic: '基本信息',
              specs: '技术参数',
              inventory: '库存',
              logs: '日志',
              approvals: '审批',
              attachments: '附件',
            }[key]}
            value={key}
          />
        ))}
      </Tabs>

      {/* 内容区 */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
        {/* —— 基本信息 —— */}
        {tab === 'basic' && (
          <Grid container spacing={2} mb={2}>
            {[
              ['DJJ Code', product.djj_code],
              ['Product', product.product_name],
              ['Manufacturer', product.manufacturer],
              ['Model', product.model],
              ['Category', product.category],
              ['Price', `$${product.price.toLocaleString()}`],
              ['Region-Store', product.regionStore],
              [
                'Last Update',
                new Date(product.last_update).toLocaleString(),
              ],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} key={label as string}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: 12, textTransform: 'uppercase' }}
                >
                  {label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}

        {/* —— 技术参数 —— */}
        {tab === 'specs' && (
          <Typography>暂无技术参数</Typography>
        )}

        {/* —— 库存 —— */}
        {tab === 'inventory' && (
          <Table component={Paper}>
            <TableHead>
              <TableRow>
                {['在库量', '锁定量', '可用量'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ background: '#fafbfc', position: 'sticky', top: 0 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>{product.actualQty}</TableCell>
                <TableCell>{product.lockedQty}</TableCell>
                <TableCell>
                  {product.availableQty < 5 && (
                    <WarningIcon
                      color="error"
                      sx={{ verticalAlign: 'middle', mr: 1 }}
                    />
                  )}
                  {product.availableQty}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {/* —— 日志 —— */}
        {tab === 'logs' && (
          <Table component={Paper} sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                {[
                  'Time',
                  'Type',
                  'Qty',
                  'Warehouse',
                  'Operator',
                  'Ref',
                  'Notes',
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ background: '#fafbfc', position: 'sticky', top: 0 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {logData.map((log, i) => (
                <TableRow key={i} hover>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      px={1}
                      py={0.25}
                      borderRadius={1}
                      bgcolor={{
                        Inbound: '#28a745',
                        Outbound: '#fd7e14',
                        Adjustment: '#6c757d',
                      }[log.type]}
                      color="#fff"
                      fontSize={12}
                    >
                      {log.type}
                    </Box>
                  </TableCell>
                  <TableCell>{log.qty}</TableCell>
                  <TableCell>{log.warehouse}</TableCell>
                  <TableCell>{log.operator}</TableCell>
                  <TableCell>{log.reference}</TableCell>
                  <TableCell>{log.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* —— 审批 —— */}
        {tab === 'approvals' && (
          <>
            <TextField
              fullWidth
              placeholder="Filter step..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Table component={Paper}>
              <TableHead>
                <TableRow>
                  {['Step', 'Approver', 'Status', 'Time', 'Comment'].map(
                    (h) => (
                      <TableCell key={h} sx={{ background: '#fafbfc' }}>
                        {h}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {approvalData
                  .filter((a) =>
                    a.step.toLowerCase().includes(filter.toLowerCase())
                  )
                  .map((a, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{a.step}</TableCell>
                      <TableCell>{a.approver}</TableCell>
                      <TableCell>{a.status}</TableCell>
                      <TableCell>{a.time}</TableCell>
                      <TableCell>{a.comment}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* —— 附件 —— */}
        {tab === 'attachments' && (
          <>
            <Table component={Paper}>
              <TableHead>
                <TableRow>
                  {['Name', 'Type', 'Size', 'Uploaded', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ background: '#fafbfc' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attachments.map((att, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{att.name}</TableCell>
                    <TableCell>{att.type}</TableCell>
                    <TableCell>{att.size}</TableCell>
                    <TableCell>{att.uploaded}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, j) => j !== i)
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>
                document.getElementById('fileInput')?.click()
              }
            >
              Upload File
            </Button>
            <input
              id="fileInput"
              type="file"
              hidden
              onChange={handleFile}
            />
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default ProductDetails;
