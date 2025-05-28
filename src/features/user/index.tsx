import { useState } from 'react'
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid, type GridRowSelectionModel ,type GridCallbackDetails} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
export interface User {
  id?: number; // 可选，如果你有id字段
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  role: string;
  address1: string;
  address2: string;
}
const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      renderCell: ({ row }) => `${row.firstName} ${row.lastName}`,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "contact",
      headerName: "Contact",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
    },
    {
      field: "address1",
      headerName: "Address 1",
      flex: 1,
    },
    {
      field: "address2",
      headerName: "Address 2",
      flex: 1,
    },
    {
      field: "RoleLevel",
      headerName: "Role Level",
      flex: 1,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[600]
                : role === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "manager" && <SecurityOutlinedIcon />}
            {role === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
  ];

  const navigate = useNavigate();
  const [rows, setRows] = useState(mockDataTeam);
  const [selectionModel, setSelectionModel] = useState<number[]>([]);

// 选中用户
  const selectedRows = rows.filter(row => selectionModel.includes(row.id));

  const handleEditStaff = () => {
    if (selectedRows.length === 0) {
      alert('请先选择一行');
      return;
    }
    const user = selectedRows[0];
    navigate('/team/edit', { state: { user } }); // 传递user对象
  };

  // 新增不需要选中
  const handleAddStaff = () => {
    navigate('/team/create')
  };

  const handleDeleteStaff = () => {
    if (selectedRows.length === 0) {
      alert('请先选择一行');
      return;
    }
    // 这里只演示 log
    console.log('选中的所有用户：', selectedRows);
  };

  return (
    <Box p="2rem" sx={{ bgcolor: theme.palette.background.paper, display: "flex", flexDirection: 'column', overflow: 'auto', flex: 1 }}>
      <Header title="TEAM" subtitle="Managing the Team Members" />
      <Box gap={'0.5rem'} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="success" onClick={handleAddStaff}>Add Staff</Button>
        <Button variant="outlined" onClick={handleEditStaff}>Edit Staff</Button>
        <Button variant="outlined" color="error" onClick={handleDeleteStaff}>Delete Staff</Button>
      </Box>
      <Box
        m="40px 0 0 0"
        height="100%"
        sx={{
          display: "flex", flexDirection: 'column',
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
      <DataGrid
      checkboxSelection
      rows={rows}
      columns={columns}
      onRowSelectionModelChange={(rowSelectionModel) => {
        // rowSelectionModel.ids 是个 Set
          const ids = Array.from(rowSelectionModel.ids ?? []);
          setSelectionModel(ids as number[]);
        
        // setSelectionModel(rowSelectionModel as number[]);
      }}
    />
      </Box>
    </Box>
  );
};

export default Team;
