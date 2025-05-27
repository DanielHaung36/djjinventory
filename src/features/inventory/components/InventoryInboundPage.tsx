import { memo, useState, useCallback } from "react";
import type { FC, ReactNode } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Drawer,
  Checkbox,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  IconButton,
  Popover,
  Tooltip,
  Fade,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDropzone } from "react-dropzone";
import { DescriptionField } from "../../../components/form/DescriptionField";
export interface IProps {
  children?: ReactNode;
}
import type{ InboundItem } from "../../../components/form/boundModel";
import { InboundTable } from "../../../components/form/InboundTable";

// 提交给后端的表单数据结构
export interface InboundFormPayload {
  orderNo: string;
  headerVin?: string;
  headerSerial?: string;
  addLoan?: boolean;
  items: InboundItem[];
  description: string;
}

// 假数据：订单列表
const fakeOrders = [
  { value: "ORD-001", label: "Order 001" },
  { value: "ORD-002", label: "Order 002" },
];
// 假数据：每个订单对应的物料，包括类型
const fakeOrderItemsMap: Record<
  string,
  Array<{ id: string; name: string; type: string }>
> = {
  "ORD-001": [
    { id: "item1", name: "Widget A", type: "Host" },
    { id: "item2", name: "Widget B", type: "Accessory" },
  ],
  "ORD-002": [
    { id: "item3", name: "Gadget X", type: "Accessory" },
    { id: "item4", name: "Gadget Y", type: "Host" },
  ],
};

const InventoryInboundPage: FC<IProps> = memo(function ({ children }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  // 图片上传
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  // 全局 Loan
  // VIN & Serial at header

  // 放大图片的锚点
  const [anchorEl, setAnchorEl] = useState(null);
  const [previewImg, setPreviewImg] = useState("");

  // 预览大图打开
  const handlePreview = (event: React.MouseEvent<HTMLElement>, file: File) => {
    setAnchorEl(event.currentTarget);
    setPreviewImg(URL.createObjectURL(file));
  };
  // 关闭
  const handleClose = () => {
    setAnchorEl(null);
    setPreviewImg("");
  };

  // 订单相关
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<
    (typeof fakeOrderItemsMap)["ORD-001"]
  >([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({});

  // 表单状态
  const [orderNo, setOrderNo] = useState<string>("");
  const [headerVin, setHeaderVin] = useState<string>("");
  const [headerSerial, setHeaderSerial] = useState<string>("");
  const [addLoan, setAddLoan] = useState<boolean>(false);
  const [mainItems, setMainItems] = useState<InboundItem[]>([]);
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  // 手动添加
  const [manualOpen, setManualOpen] = useState(false);
  const [manualProduct, setManualProduct] = useState("");
  const [manualType, setManualType] = useState("Accessory");
  const [manualQty, setManualQty] = useState(1);
  const [manualPrice, setManualPrice] = useState(0);
  const [manualRemark, setManualRemark] = useState("");
  const [manualVin, setManualVin] = useState("");
  const [manualSerial, setManualSerial] = useState("");

  // 订单变化
  const handleOrderChange = (no: string) => {
    if (no.length === 0) {
      return;
    }
    setOrderNo(no);
    const items = fakeOrderItemsMap[no] || [];
    setOrderItems(items);
    setSelectedMap({});
    setQtyMap({});
    setRemarkMap({});
    setDrawerOpen(true);
  };

  // 删除行
  const handleDelete = (id: string) => {
    setMainItems(mainItems.filter((item) => item.id !== id));
  };

  // 更新行字段
  const updateItem = useCallback(
    (id: string, field: keyof InboundItem, v: any) => {
      setMainItems((items) =>
        items.map((i) => (i.id === id ? { ...i, [field]: v } : i))
      );
    },
    []
  );

  const deleteItem = useCallback((id: string) => {
    setMainItems((items) => items.filter((i) => i.id !== id));
  }, []);

  // 构建并提交表单
  const handleSubmit = async () => {
    const payload: InboundFormPayload = {
      orderNo,
      headerVin,
      headerSerial,
      addLoan,
      items: mainItems,
      description,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    files.forEach((file) => formData.append("files", file));

    // —— 调试用：打印出所有键值对 ——
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // try {
    //   const res = await fetch("/api/inbound", {
    //     method: "POST",
    //     body: formData,
    //   });
    //   if (!res.ok) throw new Error(res.statusText);
    //   const result = await res.json();
    //   console.log("提交成功", result);
    //   // TODO: 重置表单或页面跳转
    // } catch (error) {
    //   console.error("提交失败", error);
    // }
  };

  return (
    <Box
      className="container"
      maxWidth="false"
      sx={{
        mt: 2,
        margin: "0 auto",
        maxWidth: "80vw",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%", // 继承自 MainLayout 的 flex 容器高度
        overflow: "hidden",
      }}
    >
      <Box
        className="container-items"
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1, // 占满剩余高度
          width: "100%",
          height: "100%",
          overflowY: "auto", // 只有这里滚
          my: 3,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            flexGrow: 1,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              m: 2,
            }}
          >
            <Typography variant={isMdUp ? "h4" : "h5"}>Inbound Form</Typography>
            <Button variant="contained">+ Inbound</Button>
          </Box>

          <Box display={"flex"}>
            {/* Information Section: Order, VIN, Serial, Loan */}
            <Typography variant="h6" sx={{ px: 2, mb: 1 }}>
              Information
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              px: 2,
              mb: 3,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", flex: 1 }}>
              <Autocomplete
                fullWidth
                size="small"
                options={fakeOrders}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.label
                }
                // 允许输入不存在于 options 的值（freeSolo），比如用户直接输入订单号
                freeSolo
                value={
                  // 如果 orderNo 恰好和 options 匹配，则展示该对象，否则直接展示 orderNo 字符串（保证回填效果）
                  fakeOrders.find((o) => o.value === orderNo) ||
                  (orderNo ? { value: orderNo, label: orderNo } : null)
                }
                onChange={(_, newValue) => {
                  // 处理对象和字符串两种可能
                  if (typeof newValue === "string") {
                    setOrderNo(newValue);
                    handleOrderChange(newValue); // 如果有逻辑，比如拉明细
                  } else if (newValue && typeof newValue === "object") {
                    setOrderNo(newValue.value);
                    handleOrderChange(newValue.value);
                  } else {
                    setOrderNo("");
                    handleOrderChange("");
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Order Number"
                    placeholder="Type or select order number"
                    margin="dense"
                    onChange={(e) => {
                      setOrderNo(e.target.value);
                    }}
                  />
                )}
              />
            </Box>
            {/* <Box sx={{ flex:1 }}>
              <Typography variant="body2">VIN Number</Typography>
              <TextField fullWidth value={headerVin} onChange={e=>setHeaderVin(e.target.value)} margin="dense" />
            </Box>
            <Box sx={{ flex:1 }}>
              <Typography variant="body2">Serial Number</Typography>
              <TextField fullWidth value={headerSerial} onChange={e=>setHeaderSerial(e.target.value)} margin="dense" />
            </Box>
            <Box sx={{ flex:1 }}>
              <FormControlLabel
                control={<Switch checked={addLoan} onChange={()=>setAddLoan(!addLoan)} />}
                label="Add Loan"
              />
            </Box> */}
            <Box sx={{ flex: 1, textAlign: "right" }}>
              <Button variant="outlined" onClick={() => setManualOpen(true)}>
                + Add Item
              </Button>
            </Box>
          </Box>

          {/* Selected Items Table */}
          {mainItems.length > 0 && (
            // <Box
            //   sx={{ px: 2, mb: 3, display: "flex", flexDirection: "column" }}
            // >
            //   <Typography variant="h6">Selected Items</Typography>
            //   <TableContainer component={Paper} variant="outlined">
            //     <Table size="small">
            //       <TableHead>
            //         <TableRow sx={{ textAlign: "center" }}>
            //           <TableCell colSpan={2}>Item</TableCell>
            //           <TableCell>Type</TableCell>
            //           <TableCell>Qty</TableCell>
            //           <TableCell>VIN (Host)</TableCell>
            //           <TableCell>Remark</TableCell>
            //           <TableCell>Action</TableCell>
            //         </TableRow>
            //       </TableHead>
            //       <TableBody>
            //         {mainItems.map((row) => (
            //           <TableRow key={row.id}>
            //             <TableCell colSpan={2}>{row.name}</TableCell>
            //             <TableCell>{row.type}</TableCell>
            //             <TableCell colSpan={1}>
            //               <TextField
            //                 sx={{ width: "6rem" }}
            //                 type="number"
            //                 value={row.qty}
            //                 onChange={(e) =>
            //                   updateItem(
            //                     row.id,
            //                     "qty",
            //                     Number(e.target.value)
            //                   )
            //                 }
            //                 size="small"
            //               />
            //             </TableCell>
            //             <TableCell>
            //               {row.type === "Host" ? (
            //                 <Box
            //                   sx={{
            //                     display: "flex",
            //                     alignItems: "center",
            //                     gap: 1, // 间距
            //                   }}
            //                 >
            //                   <TextField
            //                     value={row.vin || ""}
            //                     onChange={(e) =>
            //                       updateItem(row.id, "vin", e.target.value)
            //                     }
            //                     size="small"
            //                     placeholder="Enter VIN Number"
            //                     sx={{}}
            //                   />
            //                   <TextField
            //                     value={row.serial || ""}
            //                     onChange={(e) =>
            //                       updateItem(
            //                         row.id,
            //                         "serial",
            //                         e.target.value
            //                       )
            //                     }
            //                     size="small"
            //                     placeholder="Enter Serial Number"
            //                     sx={{}}
            //                   />
            //                   <FormControlLabel
            //                     sx={{ marginLeft: "0.2rem" }}
            //                     control={
            //                       <Switch
            //                         checked={!!row.addLoan}
            //                         onChange={(e) =>
            //                           updateItem(
            //                             row.id,
            //                             "addLoan",
            //                             e.target.checked
            //                           )
            //                         }
            //                       />
            //                     }
            //                     label="Add Loan"
            //                   />
            //                 </Box>
            //               ) : (
            //                 <em>—</em>
            //               )}
            //             </TableCell>
            //             <TableCell>
            //               <TextField
            //                 value={row.remark || ""}
            //                 multiline
            //                 onChange={(e) =>
            //                   updateItem(row.id, "remark", e.target.value)
            //                 }
            //                 size="small"
            //               />
            //             </TableCell>
            //             <TableCell>
            //               <IconButton onClick={() => handleDelete(row.id)}>
            //                 <DeleteIcon />
            //               </IconButton>
            //             </TableCell>
            //           </TableRow>
            //         ))}
            //       </TableBody>
            //     </Table>
            //   </TableContainer>
            // </Box>
            // {/* 用统一的 InboundTable 渲染表格 */}
             <Box
              sx={{ px: 2, mb: 3, display: "flex", flexDirection: "column" }}
            >
              <InboundTable items={mainItems} updateItem={updateItem} deleteItem={deleteItem}></InboundTable>
              </Box>
          )}

          <Divider sx={{ display: "flex", mb: 3 }} />

          {/* Description Section */}
          <Box sx={{ display: "flex", px: 2, mb: 3, flexDirection: "column" }}>
              <DescriptionField
                defaultValue={description}
                onBlur={setDescription}
              />
          </Box>
          <Box sx={{ display: "flex", px: 2, mb: 3, flexDirection: "column" }}>
            {/* Images Section */}
            <Typography variant="h6" sx={{ px: 0, mb: 1 }}>
              Images
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed",
                borderColor: "grey.400",
                borderRadius: 1,
                p: 4,
                textAlign: "center",
                bgcolor: isDragActive ? "grey.100" : "transparent",
                mb: 3,
              }}
            >
              <input {...getInputProps()} />
              <Button variant="outlined">Add File</Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Or drag and drop files
              </Typography>
            </Box>
            {/* 文件列表展示 */}
            {files.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {files.map((file, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      bgcolor: "#f6f8fa",
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    {file.type.startsWith("image/") && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginRight: 12,
                          boxShadow: "0 1px 8px #ccc",
                          cursor: "pointer",
                        }}
                        onClick={(e) => handlePreview(e, file)}
                      />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <Tooltip title="删除">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteFiles(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
            {/* 预览大图 */}
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: "center", horizontal: "right" }}
              transformOrigin={{ vertical: "center", horizontal: "left" }}
              PaperProps={{
                sx: { p: 1, borderRadius: 2, boxShadow: "0 6px 32px #aaa" },
              }}
              TransitionComponent={Fade}
            >
              {previewImg && (
                <img
                  src={previewImg}
                  alt="preview"
                  style={{
                    width: 320,
                    height: 320,
                    objectFit: "contain",
                    display: "block",
                    borderRadius: 12,
                    background: "#f7f7f7",
                  }}
                />
              )}
            </Popover>
          </Box>
          <CardActions
            sx={{
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 4,
            }}
          >
            <Button
              variant="contained"
              onSubmit={(prop) => {
                console.log(prop);
                handleSubmit();
              }}
            >
              Save
            </Button>
            <Button variant="outlined" color="error">
              Cancel
            </Button>
          </CardActions>
        </Box>

        {/* Drawer: Order Items */}
        {
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <Box
              sx={{
                display: "flex",
                width: "60vw",
                p: 2,
                gap: 2,
                flexDirection: "column", // ← 关键：改成纵向排列
              }}
            >
              <Typography>Select Items for {orderNo}</Typography>
              {orderItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Checkbox
                    checked={!!selectedMap[item.id]}
                    onChange={(e) =>
                      setSelectedMap({
                        ...selectedMap,
                        [item.id]: e.target.checked,
                      })
                    }
                  />
                  <Typography sx={{ flex: 2, textWrap: "nowrap" }}>
                    {item.name}
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    disabled={!selectedMap[item.id]}
                    placeholder="Qty"
                    sx={{ mr: 1, flex: 1 }}
                    onChange={(e) =>
                      setQtyMap({
                        ...qtyMap,
                        [item.id]: Number(e.target.value),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    multiline
                    disabled={!selectedMap[item.id]}
                    placeholder="Remark"
                    sx={{ flex: 3 }}
                    onChange={(e) =>
                      setRemarkMap({ ...remarkMap, [item.id]: e.target.value })
                    }
                  />
                </Box>
              ))}
              <Box sx={{ display: "flex" }} textAlign="right" mt={2} mb={2}>
                <Button onClick={() => setDrawerOpen(false)} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    const picked: InboundItem[] = orderItems
                      .filter((it) => selectedMap[it.id])
                      .map((it) => ({
                        id: it.id,
                        name: it.name,
                        type: it.type === "Host" ? "Host" : "Accessory",
                        qty: qtyMap[it.id] || 0,
                        price: 0,
                        remark: remarkMap[it.id] || "",
                      }));
                    setMainItems([...mainItems, ...picked]);
                    setDrawerOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </Box>
            </Box>
          </Drawer>
        }

        {/* Dialog: Manual Add Item */}
        {
          <Dialog open={manualOpen} onClose={() => setManualOpen(false)}>
            <DialogTitle>Manual Add Item</DialogTitle>
            <DialogContent>
              <TextField
                select
                fullWidth
                label="Select Product"
                value={manualProduct}
                onChange={(e) => setManualProduct(e.target.value)}
                margin="dense"
              >
                {fakeOrders.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Type"
                value={manualType}
                onChange={(e) => setManualType(e.target.value)}
                margin="dense"
              >
                <MenuItem value="Accessory">Accessory</MenuItem>
                <MenuItem value="Host">Host</MenuItem>
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={manualQty}
                onChange={(e) => setManualQty(Number(e.target.value))}
                margin="dense"
              />
              {manualType === "Host" && (
                <Box my={"1rem"}>
                  <Box display={"flex"}>
                    <TextField
                      sx={{ mt: "0.5rem", mr: "0.5rem" }}
                      fullWidth
                      label="VIN Number"
                      value={manualVin}
                      onChange={(e) => setManualVin(e.target.value)}
                      margin="dense"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={addLoan}
                          onChange={() => setAddLoan(!addLoan)}
                        />
                      }
                      label="Add Loan"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Serial Number"
                    value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                    margin="dense"
                  />
                </Box>
              )}
              <TextField
                fullWidth
                label="Remark"
                multiline
                value={manualRemark}
                onChange={(e) => setManualRemark(e.target.value)}
                margin="dense"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setManualOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (manualProduct && manualQty > 0) {
                    setMainItems([
                      ...mainItems,
                      {
                        id: Date.now().toString(),
                        name: manualProduct,
                        type: manualType === "Host" ? "Host" : "Accessory",
                        qty: manualQty,
                        price: manualPrice,
                        remark: manualRemark,
                        vin: manualType === "Host" ? manualVin : undefined,
                        serial:
                          manualType === "Host" ? manualSerial : undefined,
                      },
                    ]);
                  }
                  setManualOpen(false);
                }}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        }
      </Box>
    </Box>
  );
});

export default InventoryInboundPage;
InventoryInboundPage.displayName = "InboundPage";
