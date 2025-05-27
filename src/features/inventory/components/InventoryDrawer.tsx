
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { BarcodeSVG } from "../../barcodegenerator/BarcodeSVG";
import { WarehouseLabel } from "../../barcodegenerator/LabelPrinter";
import CloseIcon from "@mui/icons-material/Close";
import type{ InventoryRow } from "./InventoryModel";


interface DetailDrawerProps {
  open: boolean;
  row: InventoryRow | null;
  onClose: () => void;
}

// 固定显示四行，然后按列自适应展开
const DETAIL_ROWS = 4;

const DetailDrawer: React.FC<DetailDrawerProps> = ({ open, row, onClose }) => {
  if (!row) return null;
  // 准备要展示的字段
  const items = [
    { label: "DJJ Code", value: row.djj_code },
    { label: "Product", value: row.product_name },
    { label: "Manufacturer", value: row.manufacturer },
    { label: "Model", value: row.model },
    {
      label: "Last Update",
      value: new Date(row.last_update).toLocaleString(),
    },
    { label: "Category", value: row.category },
    {
      label: "Price",
      value: row.price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
    },
    { label: "Region – Store", value: row.regionStore },
    { label: "在库量", value: row.actualQty },
    { label: "锁定量", value: row.lockedQty },
    { label: "可用量", value: row.availableQty },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          // xs 屏幕时撑满，sm 及以上时 600px
          width: { xs: "100%", sm: "75rem" },
          p: 2,
        },
      }}
    >
      {/* 头部 */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Inventory Details
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* CSS Grid：固定四行，按列填充 */}
      <Box
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(${DETAIL_ROWS}, auto)`,
          gap: 5,
        }}
      >
        {items.map(({ label, value }) => (
          <Box key={label}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              textAlign={'center'}
              sx={{ textTransform: "uppercase", fontSize: 15 }}
            >
              {label}
            </Typography>
            <Typography
              variant="body1"
         
              sx={{ fontWeight: 500, mt: 1, textAlign: "center" }}
            >
              {value ?? "\u00A0"}
            </Typography>
          </Box>
        ))}
      </Box>
         <Divider sx={{ mb: 2 }} />
        <Box className="barcodebox">
             <Typography
              variant="subtitle1"
              color="text.secondary"
              textAlign={'center'}
              sx={{ textTransform: "uppercase", fontSize: 15 ,mt:"1rem"}}
            >
              Barcode Image
            </Typography>
            <Box className="svgimage" textAlign={'center'} sx={{mt:"1rem"}}>
               <BarcodeSVG  value={row.djj_code } width={240} height={50}/>
                <WarehouseLabel    
                    widthMm={50}
                    heightMm={30}
                    dpi={200}
                    brand="DJJ"
                    brandEn=""
                    title={row.product_name}
                    entitle={""}
                    infoTable={[
                        [`型号: ${row.model}`, `Model: ${row.model}`],
                        [`供应商: ${row.manufacturer}`, `Supplier: ${row.manufacturer}`],
                        [`时间: ${row.last_update}`, `Inbound Time: ${row.last_update}`]
                    ]}
                    barcodeValue={row.djj_code}
                    qrcodeValue={row.djj_code} ></WarehouseLabel>
            </Box>
        </Box>

    </Drawer>
  );
};

export default DetailDrawer;