import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from "@mui/material";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import DownloadIcon from '@mui/icons-material/Download';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from "@mui/material/Box";
import { DataGrid } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { IconButton, CircularProgress, Backdrop } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';

// Create a custom MUI theme for a cohesive look, consistent with the Profile page.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1674BB', // Using the original blue
    },
    success: {
      main: '#28a745', // Success green
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});


function Reporting() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update filteredRows whenever rows or searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const newFilteredRows = rows.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(lowercasedQuery)
        )
      );
      setFilteredRows(newFilteredRows);
    } else {
      setFilteredRows(rows);
    }
  }, [rows, searchQuery]);


  // Column definitions for the DataGrid
  const userColumns = [
    { field: '_id', headerName: 'User ID', width: 150 },
    { field: 'fullname', headerName: 'Full Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'cellphoneNumber', headerName: 'Phone', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'walletID', headerName: 'Wallet ID', width: 150 },
    { field: 'balance', headerName: 'Balance', width: 120, type: 'number' },
    { field: 'createdAt', headerName: 'Created', width: 180, renderCell: (params) => new Date(params.value).toLocaleDateString() },
  ];

  const adminColumns = [
    { field: '_id', headerName: 'Admin ID', width: 150 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'cellphoneNumber', headerName: 'Phone', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'department', headerName: 'Department', width: 200 },
    { field: 'createdAt', headerName: 'Created', width: 180, renderCell: (params) => new Date(params.value).toLocaleDateString() },
  ];

  const transactionColumns = [
    { field: '_id', headerName: 'Transaction ID', width: 150 },
    { field: 'userId', headerName: 'User', width: 200, renderCell: (params) => params.value?.fullname || params.value || 'N/A' },
    { field: 'amount', headerName: 'Amount', width: 120, type: 'number', renderCell: (params) => `N$${params.value?.toFixed(2) || '0.00'}` },
    { field: 'walletID', headerName: 'Wallet ID', width: 150 },
    { field: 'time', headerName: 'Time', width: 200, renderCell: (params) => new Date(params.value).toLocaleString() },
    { field: 'referrence', headerName: 'Reference', width: 180 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'status', headerName: 'Status', width: 120, cellClassName: (params) => `status-${params.value?.toLowerCase() || ''}` },
  ];

  const issueColumns = [
    { field: '_id', headerName: 'Issue ID', width: 150 },
    { field: 'userId', headerName: 'Reported By', width: 200, renderCell: (params) => params.value?.fullname || params.value || 'N/A' },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'description', headerName: 'Description', width: 350 },
    { field: 'status', headerName: 'Status', width: 120, cellClassName: (params) => `status-${params.value?.toLowerCase().replace(/\s/g, '') || ''}` },
    { field: 'date', headerName: 'Date', width: 180, renderCell: (params) => new Date(params.value).toLocaleDateString() },
  ];

  const specializationColumns = [
    { field: '_id', headerName: 'ID', width: 150 },
    { field: 'title', headerName: 'Title', width: 300 },
    { field: 'description', headerName: 'Description', width: 400 },
    { field: 'createdAt', headerName: 'Created', width: 180, renderCell: (params) => new Date(params.value).toLocaleDateString() },
  ];

  const ailmentColumns = [
    { field: '_id', headerName: 'ID', width: 150 },
    { field: 'title', headerName: 'Title', width: 250 },
    { field: 'description', headerName: 'Description', width: 350 },
    { field: 'specialization', headerName: 'Specialization', width: 200, renderCell: (params) => params.value?.title || 'N/A' },
    { field: 'createdAt', headerName: 'Created', width: 180, renderCell: (params) => new Date(params.value).toLocaleDateString() },
  ];

  const faqColumns = [
    { field: '_id', headerName: 'ID', width: 150 },
    { field: 'question', headerName: 'Question', width: 300 },
    { field: 'answer', headerName: 'Answer', width: 400 },
    { field: 'createdAt', headerName: 'Created', width: 180, renderCell: (params) => new Date(params.value).toLocaleDateString() },
  ];

  // Function to handle the card click and set up the table view
  const handleViewRecords = async (reportType) => {
    setIsLoading(true);
    setSelectedReport(reportType);
    setSearchQuery('');
    
    try {
      let data = [];
      let cols = [];
      let response;

      switch (reportType) {
        case 'users':
          response = await fetchJSON("http://13.61.152.64:4000/api/app/auth/all-users", "GET");
          if (response.status === true && response.users) {
            data = response.users.map((user, index) => ({
              ...user,
              id: user._id || index,
            }));
          }
          cols = userColumns;
          break;
        case 'admins':
          response = await fetchJSON("http://13.61.152.64:4000/api/portal/auth/all-users", "GET");
          if (response.status === true && response.users) {
            data = response.users.map((user, index) => ({
              ...user,
              id: user._id || index,
            }));
          }
          cols = adminColumns;
          break;
        case 'transactions':
          response = await fetchJSON("http://13.61.152.64:4000/api/app/transaction/all-transactions", "GET");
          if (response.status === true && response.transactions) {
            data = response.transactions.map((transaction, index) => ({
              ...transaction,
              id: transaction._id || index,
            }));
          }
          cols = transactionColumns;
          break;
        case 'issues':
          response = await fetchJSON("http://13.61.152.64:4000/api/app/issue/all-issues", "GET");
          if (response.status === true && response.issues) {
            data = response.issues.map((issue, index) => ({
              ...issue,
              id: issue._id || index,
            }));
          }
          cols = issueColumns;
          break;
        case 'specializations':
          response = await fetchJSON("http://13.61.152.64:4000/api/portal/specialization/all-specializations", "GET");
          if (response.specializations) {
            data = response.specializations.map((spec, index) => ({
              ...spec,
              id: spec._id || index,
            }));
          }
          cols = specializationColumns;
          break;
        case 'ailments':
          response = await fetchJSON("http://13.61.152.64:4000/api/portal/aligment/all-alignments", "GET");
          if (response.ailments) {
            data = response.ailments.map((ailment, index) => ({
              ...ailment,
              id: ailment._id || index,
            }));
          }
          cols = ailmentColumns;
          break;
        case 'faqs':
          response = await fetchJSON("http://13.61.152.64:4000/api/portal/faq/all-faq", "GET");
          if (response.faqs) {
            data = response.faqs.map((faq, index) => ({
              ...faq,
              id: faq._id || index,
            }));
          }
          cols = faqColumns;
          break;
        default:
          break;
      }
      
      setRows(data);
      setColumns(cols);
    } catch (error) {
      console.error(`Error fetching ${reportType}:`, error);
      toast.error(`Failed to load ${reportType} data. Please try again.`);
      setRows([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the download action
  const handleDownload = (reportName) => {
    try {
      const dataToExport = filteredRows.length > 0 ? filteredRows : rows;
      
      if (dataToExport.length === 0) {
        toast.error("No data to download");
        return;
      }

      // Convert data to CSV
      const headers = columns.map(col => col.headerName || col.field);
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(row => {
          return columns.map(col => {
            const value = row[col.field];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object' && value !== null) {
              // Handle nested objects (like userId.fullname, specialization.title)
              if (value.fullname) return value.fullname;
              if (value.title) return value.title;
              if (value.email) return value.email;
              if (Array.isArray(value)) return value.join('; ');
              // For other objects, try to stringify or return empty
              return '';
            }
            // Format dates
            if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
              return new Date(value).toLocaleDateString();
            }
            // Escape commas and quotes in CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',');
        })
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportName}_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage(`"${reportName}" report downloaded successfully!`);
      setOpen(true);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and download various reports for system management from both app and portal.
          </Typography>
        </Grid>

        {/* Conditional rendering for cards or data grid */}
        {selectedReport === null ? (
          <>
            {/* Card for All App Users */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        App Users
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Download a comprehensive list of all registered users on the application.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('users')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card for All Admins */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        Admins
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Retrieve a detailed report of all users with administrator privileges.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('admins')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card for Transactions */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        Transactions
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Export a full log of all financial transactions within the application.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('transactions')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card for Reported Issues */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        Reported Issues
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Access a list of all issues and bugs reported by app users.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('issues')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card for Specializations */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        Specializations
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        View all medical specializations available in the system.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('specializations')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card for Ailments */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        Ailments
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Export a comprehensive list of all ailments and conditions.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('ailments')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card for FAQs */}
            <Grid item xs={12} sm={6} md={3}>
              <Card raised sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%' }}>
                  <Stack direction="column" justifyContent="space-between" height="100%">
                    <div>
                      <Typography variant="h6" component="div">
                        FAQs
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Download all frequently asked questions and their answers.
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewRecords('faqs')}
                    >
                      View & Download
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                {selectedReport} Records
              </Typography>
              <Box
  sx={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <Button
    variant="contained"
    color="primary"
    endIcon={<DownloadIcon />}
    onClick={() => handleDownload(selectedReport)}
    sx={{ mr: 2 }}
    disabled={filteredRows.length === 0}
  >
    Download {searchQuery ? `Filtered` : ''}
  </Button>
  <Button variant="outlined" onClick={() => setSelectedReport(null)}>
    Back to Reports
  </Button>
</Box>
            </Stack>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Search records"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <IconButton sx={{ pr: 1, color: 'text.secondary' }}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box sx={{ height: 500, width: "100%" }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    getRowId={(row) => row.id || row._id}
                    loading={isLoading}
                    sx={{
                      "& .MuiDataGrid-root": {
                        fontFamily: "Montserrat, sans-serif",
                      },
                      "& .status-pending": {
                        color: "rgb(234, 156, 0)",
                      },
                      "& .status-failed": {
                        color: "red",
                      },
                      "& .status-completed": {
                        color: "green",
                      },
                      "& .status-open": {
                         color: "rgb(234, 156, 0)",
                      },
                      "& .status-inprogress": {
                        color: "blue",
                      },
                      "& .status-resolved": {
                        color: "green",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        fontWeight: 800,
                        fontFamily: "Montserrat, sans-serif",
                      },
                      "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 600,
                        fontFamily: "Montserrat, sans-serif",
                      },
                      "& .MuiDataGrid-cell": {
                        fontWeight: 400,
                        fontFamily: "Montserrat, sans-serif",
                      },
                    }}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 25,
                        },
                      },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </Box>
           
          </Grid>
        )}
      </Grid>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default Reporting;
