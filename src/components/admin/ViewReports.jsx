import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import DownloadButton from "../../components/commons/DownloadButton";
import ExportButton from "../../components/commons/ExportButton";

const ViewReports = ({ selectedRow }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  const EmployeeReport = () => {
    useEffect(() => {
      if (selectedRow) {
        const fetchData = async () => {
          fetch("https://dt.mtc.com.na:4000/contracts/staffContracts")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.log(err));
        };
        fetchData();
      }
    }, [selectedRow]);


    const columns = [
      { field: "id", headerName: "#", width: 60 },
      { field: "DeviceName", headerName: "NAME", width: 250 },
      { field: "PackageName", headerName: "PACKAGE", width: 250 },
      { field: "FixedAssetCode", headerName: "IMEI", width: 180 },
      { field: "StaffPrice", headerName: "PRICE", width: 160 },
      { field: "MSISDN", headerName: "MSISDN", width: 180 },
      { field: "UpfrontPayment", headerName: "UPFRONT PAYMENT", width: 180 },
      { field: "BillingDate", headerName: "ALLOCATION DATE", width: 180 },
    ];

    const rows = data.map((contract, index) => ({
      id: index + 1,
      DeviceName: contract.DeviceName,
      PackageName: contract.PackageName,
      FixedAssetCode: contract.FixedAssetCode,
      StaffPrice: "N$ " + contract.StaffPrice,
      MSISDN: contract.MSISDN,
      UpfrontPayment: "N$ " + contract.UpfrontPayment,
      BillingDate: contract.BillingDate,
    }));

    return (
      <Box sx={{ width: "auto" }}>
        <div className="d-flex justify-content-end mb-4">
          <ExportButton data={data} fileName="EmployeeReport" />
        </div>
        <Box
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: "green",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1674BB",
              borderBottom: "none",
              color: "white",
            },
            "& .MuiDataGrid-virtualScroller": {
              //   backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              //   backgroundColor: colors.grey[900],
            },
            "& .MuiCheckbox-root": {
              color: `green !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `green !important`,
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            disableRowSelectionOnClick
          />
        </Box>
      </Box>
    );
  };

  const IndividualEmployeeReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const InactiveEmployeesReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const InternalBenefitsReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const UtilisationReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const BenefitUsageReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const ActiveEmployeesReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const renderReport = () => {
    switch (selectedRow.id) {
      case 1:
        return <EmployeeReport />;
      case 2:
        return <IndividualEmployeeReport />;
      case 3:
        return <InactiveEmployeesReport />;
      case 4:
        return <InternalBenefitsReport />;
      case 5:
        return <UtilisationReport />;
      case 6:
        return <BenefitUsageReport />;
      case 7:
        return <ActiveEmployeesReport />;
      default:
        return <div>No report selected</div>;
    }
  };

  return <Box sx={{ width: "100%" }}>{selectedRow && renderReport()}</Box>;
};

export default ViewReports;
