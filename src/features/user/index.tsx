import {useState} from 'react'
import { Box, Typography, useTheme,Button } from "@mui/material";
import { DataGrid, type GridRowSelectionModel,type GridCallbackDetails  } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";



const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "accessLevel",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              access === "admin"
                ? colors.greenAccent[600]
                : access === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {access === "manager" && <SecurityOutlinedIcon />}
            {access === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {access}
            </Typography>
          </Box>
        );
      },
    },
  ];
  const navigate = useNavigate();
  const [rows, setRows] = useState(mockDataTeam);
  // 用 state 保存选中的 id
  const [selectionModel, setSelectionModel] = useState<number[]>([]);

  // 获取选中的用户数据
  const selectedRows = rows.filter(row => selectionModel.includes(row.id));


  // 示例事件
  const handleEditStaff = () => {
    if (selectedRows.length === 0) {
      alert('请先选择一行');
      return;
    }
    // 这里只取第一个
    const user = selectedRows[0];
    console.log('选中的用户：', user);
    // ...后续操作
    navigate('/team/edit', { state: { user } }); // 传递user对象
  };

    // 示例事件
  const handleAddStaff = () => {
    if (selectedRows.length === 0) {
      alert('请先选择一行');
      return;
    }
    // 这里只取第一个
    const user = selectedRows[0];
    console.log('选中的用户：', user);
    // ...后续操作
    navigate('/team/create')
  };
  const handleDeleteStaff = () => {
    if (selectedRows.length === 0) {
      alert('请先选择一行');
      return;
    }
    // 多选就批量删
    console.log('选中的所有用户：', selectedRows);
    // ...后续操作
  };


  return (
    <Box p="2rem" sx={{bgcolor:theme.palette.background.paper,display:"flex",flexDirection:'column',overflow:'auto',  flex:1,}}>
      <Header  title="TEAM" subtitle="Managing the Team Members" />
      <Box gap={'0.5rem'}  sx={{display:'flex', justifyContent:'flex-end'}}>
            <Button variant="outlined" color="success"  onClick={()=>{handleAddStaff()}}>Add Staff</Button>
            <Button variant="outlined" onClick={()=>{handleEditStaff()}}>Edit Staff</Button>
            <Button variant="outlined" color="error" >Delete Staff</Button>
      </Box>
      <Box
        m="40px 0 0 0"
        height="100%"
        sx={{
          display:"flex",flexDirection:'column',
        
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={mockDataTeam} columns={columns}         onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
            console.log(rowSelectionModel);
            console.log(details);
            console.log(rowSelectionModel.ids);
            
            setSelectionModel(Array.from(rowSelectionModel.ids))
        }}  />
      </Box>
    </Box>
  );
};

export default Team;
