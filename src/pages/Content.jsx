import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  TextField,
  IconButton,
  Chip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import useFetch from '../utils/fetch';
import Swal from 'sweetalert2';

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

// Mock Data for issues, based on the provided mongoose schema
const mockIssues = [
  {
    id: 1,
    userId: 'user-001',
    title: 'Login Page Error',
    description: 'When trying to log in with correct credentials, the page shows a "Network Error" message.',
    status: 'Open',
    date: '2023-08-28T10:00:00Z',
  },
  {
    id: 2,
    userId: 'user-002',
    title: 'Profile Picture Upload Failure',
    description: 'The profile picture upload functionality seems to be broken. It gets stuck at 99%.',
    status: 'In Progress',
    date: '2023-08-27T14:30:00Z',
  },
  {
    id: 3,
    userId: 'user-003',
    title: 'Incorrect Billing Calculation',
    description: 'My last bill was overcharged by $5. The calculation seems to be wrong for my subscription plan.',
    status: 'Closed',
    date: '2023-08-25T11:45:00Z',
  },
  {
    id: 4,
    userId: 'user-001',
    title: 'Dashboard Widgets Not Loading',
    description: 'The widgets on the main dashboard page are not loading. They just show a spinning circle indefinitely.',
    status: 'Open',
    date: '2023-08-29T09:15:00Z',
  },
  {
    id: 5,
    userId: 'user-004',
    title: 'Spam Messages in Inbox',
    description: 'I am receiving a high volume of unsolicited spam messages in my inbox.',
    status: 'Open',
    date: '2023-08-29T11:22:00Z',
  },
];

export default function Content() {
  const { data, loading, error, request } = useFetch();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Update filteredIssues whenever issues, searchQuery, or filters change
  useEffect(() => {
  const fetchIssues = async () => {
    try {
      const response = await request('/portal/issues/all-issues', 'GET');
      if (response.status === 'SUCCESS') {
        setIssues(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    }
  };

  fetchIssues();
}, []);
  useEffect(() => {
    let filtered = issues;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(lowercasedQuery) ||
          issue.description.toLowerCase().includes(lowercasedQuery) ||
          issue.userId.toLowerCase().includes(lowercasedQuery) ||
          issue.status.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((issue) => issue.status === filterStatus);
    }

    setFilteredIssues(filtered);
  }, [issues, searchQuery, filterStatus]);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <ReportProblemIcon fontSize="small" color="error" />;
      case 'In Progress':
        return <HourglassEmptyIcon fontSize="small" color="warning" />;
      case 'Closed':
        return <CheckCircleIcon fontSize="small" color="success" />;
      default:
        return <ReportProblemIcon fontSize="small" />;
    }
  };

  // Get status color for Chip component
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'error';
      case 'In Progress':
        return 'warning';
      case 'Closed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Column definitions for the DataGrid
  const issueColumns = [
    { field: '_id', headerName: 'ID', width: 80 },
    { field: 'userId', headerName: 'User ID', width: 100 },
    {
      field: 'title',
      headerName: 'Title',
      width: 190,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 330,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 } }}
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditIssue(params.row);
            }}
            title="Update Status"
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {/* <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
            title="Delete Issue"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton> */}
        </Box>
      ),
    },
  ];

  // Statistics calculation
  const stats = {
    id: issues._id,
    total: issues.length,
    open: issues.filter((issue) => issue.status === 'Open').length,
    inProgress: issues.filter((issue) => issue.status === 'In Progress').length,
    closed: issues.filter((issue) => issue.status === 'Closed').length,
  };

  // Action handlers
  const handleEditIssue = (issue) => {
    console.log('Editing issue:', issue);
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = async() => {
    try{
      const response = await request(`/portal/issues/update-issue/${selectedIssue._id}`, 'PUT', { status: newStatus });
      if (response.status === 'SUCCESS') {
        setEditDialogOpen(false);
        Swal.fire({
          position: "center",
          icon: "success",  
          title: "Issue status updated successfully!",
          showConfirmButton: false,
          timer: 4000,
        });
        window.location.reload();
    }else{
      setEditDialogOpen(false);
      Swal.fire({
        position: "center",
        icon: "error",  
        title: "Failed to update issue status!",
        showConfirmButton: false,
        timer: 4000,
      });
    }
    
    }catch(error){
      setEditDialogOpen(false);
      console.error("Error updating issue status:", error);
      Swal.fire({
        position: "center",
        icon: "error",  
        title: "An error occurred while updating issue status!",
        showConfirmButton: false,
        timer: 4000,
      });
    }
    
  };

  const handleDelete = (id) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
    setSnackbarMessage('Issue deleted successfully!');
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid item xs={12}>
          <Typography gutterBottom>
            Issue Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all reported user issues and bugs.
          </Typography>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ReportProblemIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Issues
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
                <ReportProblemIcon color="error" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.open}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Issues
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
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issues In Progress
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
                <CheckCircleIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.closed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Closed Issues
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Issues Table */}
        <Grid item xs={12}md={12}>
          <Card raised>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                  All Issues
                </Typography>
              </Stack>

              {/* Search and Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={9}>
                  <TextField
                    fullWidth
                    label="Search issues"
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {/* <Grid item xs={12} md={3}>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setIssues([])}
                    disabled={issues.length === 0}
                    fullWidth
                  >
                    Delete All
                  </Button>
                </Grid> */}
              </Grid>

              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={filteredIssues}
                  columns={issueColumns}
                  getRowId={(row) => row._id}
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
                      sortModel: [{ field: 'date', sort: 'desc' }],
                    },
                  }}
                  pageSizeOptions={[25, 50, 100]}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Status Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Issue Status
        </DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedIssue.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedIssue.description}</Typography>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={newStatus === selectedIssue?.status}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}