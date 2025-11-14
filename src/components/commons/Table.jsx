import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton,  useTheme } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useNavigate } from "react-router-dom";

function Table(){
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {
    fetch("https://dt.mtc.com.na:4000/devices/staffHandsets")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));

    // fetch("http://localhost:3001/staffmember")
    //   .then((res) => res.json())
    //   .then((data) => setEmployeeData(data))
    //   .catch((err) => console.log(err));
  }, []);

  const columns = [
    { field: "id", headerName: "#", width: 50 },
    { field: "DeviceType", headerName: "NAME", width: 100 },
    { field: "EmployeeName", headerName: "EMPLOYEE", width: 150 },
    { field: "DeviceName", headerName: "ASSET", width: 150 },
    { field: "AllocationDate", headerName: "ALLOCATION DATE", width: 140 },
    { field: "AllocationCheck", headerName: "ALLOCATION CHECK", width: 150 },
    { field: "PaymentEndDate", headerName: "RETURN DUE DATE", width: 120 },
  ];

  const rows = [
    { id: 1, registrationName: "Top Notch Solution", email: "topnotchsolutions1@gmail.com", region: "Ohangwena", town: "Oshikango", primaryIndustry: "Information Technology", annualTurnover: "200 000", foundersName: "Robert Tomas", status: "Pending", action: "" },
    { id: 2, registrationName: "Prime Tech Innovations", email: "primetechinnovations@gmail.com", region: "Khomas", town: "Windhoek", primaryIndustry: "Software Development", annualTurnover: "500 000", foundersName: "Alice Johnson", status: "Approved", action: "" },
    { id: 3, registrationName: "Future Solutions", email: "futuresolutions@gmail.com", region: "Erongo", town: "Swakopmund", primaryIndustry: "Consulting", annualTurnover: "300 000", foundersName: "John Doe", status: "Rejected", action: "" },
    { id: 4, registrationName: "Green Energy Corp", email: "greenenergycorp@gmail.com", region: "Oshana", town: "Oshakati", primaryIndustry: "Renewable Energy", annualTurnover: "750 000", foundersName: "Jane Smith", status: "Pending", action: "" },
    { id: 5, registrationName: "Health Tech Solutions", email: "healthtechsolutions@gmail.com", region: "Kavango", town: "Rundu", primaryIndustry: "Healthcare Technology", annualTurnover: "400 000", foundersName: "Michael Brown", status: "Approved", action: "" },
    { id: 6, registrationName: "EduTech Innovators", email: "edutechinnovators@gmail.com", region: "Zambezi", town: "Katima Mulilo", primaryIndustry: "Educational Technology", annualTurnover: "150 000", foundersName: "Emily White", status: "Rejected", action: "" },
    { id: 7, registrationName: "Agri Solutions", email: "agrisolutions@gmail.com", region: "Omusati", town: "Outapi", primaryIndustry: "Agriculture", annualTurnover: "350 000", foundersName: "Peter Green", status: "Pending", action: "" },
    { id: 8, registrationName: "Finance Hub", email: "financehub@gmail.com", region: "Karas", town: "Keetmanshoop", primaryIndustry: "Financial Services", annualTurnover: "600 000", foundersName: "Laura Black", status: "Approved", action: "" },
  ];

  // const handleRowClick = (row) => {
  //   navigate(`/employee/${row.id}`); // Use navigate instead of history.push
  // };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        paddingLeft={"20px"}
        height={"0px"}
      ></Box>
      <div
        style={{
          width: "98%",
          marginTop: "30px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Box
          m="40px 0 0 0"
          height="100%"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: 'white',
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor:'grey',
              borderBottom: "grey",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: 'white',
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: 'grey',
            },
            "& .MuiCheckbox-root": {
              color: `#292929 !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `grey !important`,
            },
          }}
        >
          
          <Box>
          Allocation
            <IconButton>
              <DownloadOutlinedIcon
                sx={{ fontSize: "26px", color:'red' }}
              />
            </IconButton>
          </Box>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            // onRowClick={handleRowClick}
          />
        </Box>
      </div>
    </Box>
  );
};

export default Table;
