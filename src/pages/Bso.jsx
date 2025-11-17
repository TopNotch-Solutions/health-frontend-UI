import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import PaidIcon from '@mui/icons-material/Paid';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';
import { usePermissions } from '../utils/usePermissions';

// Custom theme for a consistent look
const theme = createTheme({
  palette: {
    primary: {
      main: '#1674BB',
    },
    success: {
      main: '#28a745',
    },
    warning: {
      main: '#ffc107',
    },
    error: {
      main: '#dc3545',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default function Bso() {
  const { canRead, canWrite, canDelete } = usePermissions();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/app/transaction/all-transactions",
          "GET"
        );
        if (response.status === true && response.transactions) {
          const formatted = response.transactions.map((transaction) => ({
            ...transaction,
            id: transaction._id,
          }));
          setTransactions(formatted);
          setFilteredTransactions(formatted);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions. Please try again.");
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Update filteredTransactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) => {
          const userId = typeof transaction.userId === 'object' 
            ? transaction.userId._id?.toString() || transaction.userId.fullname || ''
            : transaction.userId?.toString() || '';
          const userFullname = typeof transaction.userId === 'object' 
            ? transaction.userId.fullname || ''
            : '';
          const userEmail = typeof transaction.userId === 'object' 
            ? transaction.userId.email || ''
            : '';
          const walletID = typeof transaction.userId === 'object' 
            ? transaction.userId.walletID || transaction.walletID || ''
            : transaction.walletID || '';
          
          return (
            userId.toLowerCase().includes(lowercasedQuery) ||
            userFullname.toLowerCase().includes(lowercasedQuery) ||
            userEmail.toLowerCase().includes(lowercasedQuery) ||
            walletID.toLowerCase().includes(lowercasedQuery) ||
            transaction.type?.toLowerCase().includes(lowercasedQuery) ||
            transaction.status?.toLowerCase().includes(lowercasedQuery) ||
            transaction.referrence?.toLowerCase().includes(lowercasedQuery) ||
            transaction.amount?.toString().includes(lowercasedQuery)
          );
        }
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((transaction) => transaction.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((transaction) => transaction.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterType, filterStatus]);

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <AccountBalanceWalletIcon fontSize="small" color="success" />;
      case 'withdrawal':
        return <AttachMoneyIcon fontSize="small" color="error" />;
      case 'earning':
        return <SavingsIcon fontSize="small" color="primary" />;
      case 'transfer':
        return <SwapHorizIcon fontSize="small" color="warning" />;
      default:
        return <PaidIcon fontSize="small" />;
    }
  };

  // Get status color for Chip component
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Column definitions for the DataGrid
  const transactionColumns = [
    { 
      field: '_id', 
      headerName: 'ID', 
      width: 100,
      renderCell: (params) => params.value?.substring(0, 8) || params.value
    },
    { 
      field: 'userId', 
      headerName: 'User', 
      width: 150,
      renderCell: (params) => {
        if (typeof params.value === 'object' && params.value) {
          return params.value.fullname || params.value.email || params.value._id || 'N/A';
        }
        return params.value || 'N/A';
      }
    },
    { 
      field: 'walletID', 
      headerName: 'Wallet ID', 
      width: 100,
      renderCell: (params) => {
        // Check if walletID is in the userId object (populated) or in the transaction
        if (typeof params.row.userId === 'object' && params.row.userId?.walletID) {
          return params.row.userId.walletID;
        }
        return params.value || 'N/A';
      }
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          N${(params.value || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getTypeIcon(params.value)}
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 } }}
          icon={
            params.value === 'completed' ? (
              <CheckCircleOutlineIcon fontSize="small" />
            ) : params.value === 'pending' ? (
              <HourglassEmptyIcon fontSize="small" />
            ) : (
              <ErrorOutlineIcon fontSize="small" />
            )
          }
        />
      ),
    },
    {
      field: 'time',
      headerName: 'Time',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()} {new Date(params.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      ),
    },
    { 
      field: 'referrence', 
      headerName: 'Reference', 
      width: 180,
      renderCell: (params) => params.value || 'N/A'
    },
  ];

  // Statistics calculation
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
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
          <Typography gutterBottom>
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all financial transactions on the platform.
          </Typography>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AutorenewIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckCircleOutlineIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Transactions
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <HourglassEmptyIcon color="warning" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Transactions
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ErrorOutlineIcon color="error" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.failed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed Transactions
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <Card raised>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                  All Transactions
                </Typography>
                {/* <Button
                    variant="outlined"
                    color="error"
                    startIcon={<AutorenewIcon />}
                    onClick={() => setTransactions([])}
                    disabled={transactions.length === 0}
                  >
                    Clear History
                  </Button> */}
              </Stack>

              {/* Search and Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Search transactions"
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
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filterType}
                      label="Type"
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="deposit">Deposit</MenuItem>
                      <MenuItem value="withdrawal">Withdrawal</MenuItem>
                      <MenuItem value="earning">Earning</MenuItem>
                      <MenuItem value="transfer">Transfer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ height: 600, width: '100%', overflowX: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <DataGrid
                    rows={filteredTransactions}
                    columns={transactionColumns}
                    getRowId={(row) => row.id || row._id}
                    loading={isLoading}
                  sx={{
                    '& .MuiDataGrid-root': {
                      fontFamily: 'Roboto, sans-serif',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(22, 116, 187, 0.04)',
                    },
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 25,
                      },
                    },
                    sorting: {
                      sortModel: [{ field: 'time', sort: 'desc' }],
                    },
                  }}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                    autoHeight={false}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}