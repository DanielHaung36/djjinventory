import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="1rem" sx={{display:'flex',flexDirection:'column',overflow:'auto',}}>
      <Header title="FAQ" subtitle="常见问题解答" />
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            如何查看当前仓库的库存列表？
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            在“仓库库存”页面顶部，通过“仓库”下拉框选择您想查看的仓库，或者在“关键字”输入框输入 SKU／产品名称进行模糊搜索。点击“查询”按钮后，下方表格会展示符合条件的所有库存记录，包括可用库存、在途库存、库位等信息。
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            如果要将一款新品的期初库存导入，应该怎么操作？
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            您可以使用页面右上角的“新增入库”按钮，弹出入库对话框后，选择对应仓库、填写 SKU、产品名称、入库数量、库位、供应商等信息，然后点击“提交”即可。如果一次性要导入多条记录，也可以在“批量导入”处上传 Excel/CSV 文件，按模板格式填写各行数据，系统会自动解析并完成入库操作。
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            如何为现有库存执行出库操作？
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            在库存表格中找到对应 SKU 行，点击“出库”按钮，弹出出库对话框后，填写出库数量、出库原因和操作人等信息，系统会自动校验可用库存是否充足。如果出库数量合法，点击“确定”后即可完成出库，库存数量会自动扣减，并在“库存流水”中生成一条出库记录。
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            如果需要将一款商品从 A 仓调拨到 B 仓，流程是什么？
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            调拨分为两步：首先在 A 仓对应商品行点击“调拨”按钮，选择“源仓库”为 A 仓、“目标仓库”为 B 仓，并输入调拨数量。系统会先从 A 仓执行一次“TRANSFER_OUT”出库操作，再在 B 仓新增一条“TRANSFER_IN”入库记录。调拨完成后，两边库存都会同步更新，并各自生成流水明细。
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            如何查看某个 SKU 的库存流水明细？
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            在库存表格任意行的“操作”列中，点击“查看流水”按钮，就会跳转到该 SKU 在该仓库下的库存流水页面。流水页面按时间倒序展示每笔入库、出库、调拨、盘点调整等操作的详情，包括操作时间、变动数量、动作类型、操作人和备注，方便您随时追溯历史记录。
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
