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
  Avatar,
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CircularProgress from '@mui/material/CircularProgress';
import { useSelector } from 'react-redux';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';

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

export default function User() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState({
    id: null,
    firstName: '',
    lastName: '',
    cellphoneNumber: '',
    email: '',
    password: '',
    department: '',
    role: 'admin',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/auth/all-users",
          "GET"
        );
        if (response.status === true && response.users) {
          const formattedUsers = response.users.map((user) => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.cellphoneNumber,
            email: user.email,
            department: user.department,
            profileImage: user.profileImage,
            role: user.role === 'super admin' ? 'Super admin' : user.role === 'health provider' ? 'Health Provider' : 'Admin',
            createdAt: user.createdAt || new Date().toISOString(),
          }));
          setAdmins(formattedUsers);
          setFilteredAdmins(formattedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Update filteredAdmins whenever admins, searchQuery, or filterRole change
  useEffect(() => {
    let filtered = admins;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.firstName.toLowerCase().includes(lowercasedQuery) ||
          admin.lastName.toLowerCase().includes(lowercasedQuery) ||
          admin.email.toLowerCase().includes(lowercasedQuery) ||
          admin.department.toLowerCase().includes(lowercasedQuery) ||
          admin.role.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((admin) => admin.role === filterRole);
    }

    setFilteredAdmins(filtered);
  }, [admins, searchQuery, filterRole]);

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      setIsEdit(true);
      setCurrentAdmin(admin);
    } else {
      setIsEdit(false);
      setCurrentAdmin({
        id: null,
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        password: '',
        department: '',
        role: 'Admin',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentAdmin.firstName || !currentAdmin.lastName || !currentAdmin.email || !currentAdmin.department) {
      setSnackbarMessage('Please fill out all required fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!isEdit && !currentAdmin.password) {
      setSnackbarMessage('Password is required for new users.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEdit) {
        // Update user - Note: Backend doesn't have update endpoint yet, so this is a placeholder
        setSnackbarMessage('Update functionality coming soon!');
        setSnackbarSeverity('warning');
      } else {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/auth/create-portal-user",
          "POST",
          {
            firstName: currentAdmin.firstName,
            lastName: currentAdmin.lastName,
            cellphoneNumber: currentAdmin.cellphoneNumber,
            email: currentAdmin.email,
            password: currentAdmin.password,
            role: currentAdmin.role.toLowerCase(),
            department: currentAdmin.department,
          }
        );
        
        if (response.message) {
          setSnackbarMessage(response.message || 'Administrator added successfully!');
          setSnackbarSeverity('success');
          // Refresh users list
          const usersResponse = await fetchJSON(
            "http://13.61.152.64:4000/api/portal/auth/all-users",
            "GET"
          );
          if (usersResponse.status === true && usersResponse.users) {
            const formattedUsers = usersResponse.users.map((user) => ({
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              contactNumber: user.cellphoneNumber,
              email: user.email,
              department: user.department,
              profileImage: user.profileImage,
              role: user.role === 'super admin' ? 'Super admin' : user.role === 'health provider' ? 'Health Provider' : 'Admin',
              createdAt: user.createdAt || new Date().toISOString(),
            }));
            setAdmins(formattedUsers);
            setFilteredAdmins(formattedUsers);
          }
        }
      }
      setSnackbarOpen(true);
      handleCloseDialog();
    } catch (error) {
      setSnackbarMessage(error.message || 'An error occurred. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = (id) => {
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    setSnackbarMessage('Administrator deleted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const getRoleColor = (role) => {
    return role === 'Super admin' ? 'primary' : 'default';
  };

  // Column definitions for the DataGrid
  const adminColumns = [
    {
      field: 'profileImage',
      headerName: 'Avatar',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const firstName = params.row.firstName || '';
        const lastName = params.row.lastName || '';
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        const initials = (firstInitial + lastInitial) || (firstInitial || lastInitial) || 'U';
        const profileImageUrl = params.row.profileImage 
          ? `http://13.61.152.64:4000/images/${params.row.profileImage}` 
          : null;
        
        return (
          <Avatar
            src={profileImageUrl}
            alt={`${firstName} ${lastName}`}
            sx={{
              bgcolor: profileImageUrl ? undefined : '#1674BB',
              width: 40,
              height: 40,
            }}
          >
            {!profileImageUrl && initials}
          </Avatar>
        );
      },
    },
    { field: 'id', headerName: 'ID', width: 80, renderCell: (params) => params.value?.substring(0, 8) || params.value },
    { field: 'firstName', headerName: 'First Name', width: 100 },
    { field: 'lastName', headerName: 'Last Name', width: 100 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'contactNumber', headerName: 'Contact', width: 120 },
    { field: 'department', headerName: 'Department', width: 120 },
    {
      field: 'role',
      headerName: 'Role',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getRoleColor(params.value)}
          size="small"
          icon={params.value === 'Super admin' ? <SupervisorAccountIcon /> : <AccountCircleIcon />}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Added On',
      width: 150,
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
              handleOpenDialog(params.row);
            }}
            title="Edit"
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
            title="Delete"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Statistics calculation
  const stats = {
    total: admins.length,
    superAdmins: admins.filter((admin) => admin.role === 'Super admin').length,
    admins: admins.filter((admin) => admin.role === 'Admin').length,
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid item xs={12}>
          <Typography gutterBottom>
            Administrator Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all user accounts with administrative privileges.
          </Typography>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <SupervisorAccountIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Administrators
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <SupervisorAccountIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.superAdmins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Super Admins
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccountCircleIcon color="action" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.admins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regular Admins
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Administrators Table */}
        <Grid item xs={12}>
          <Card raised>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                  All Administrators
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add New Admin
                </Button>
              </Stack>

              {/* Search and Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Search administrators"
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={filterRole}
                      label="Role"
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="Super admin">Super Admin</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Health Provider">Health Provider</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ height: 600, width: '100%' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <DataGrid
                    rows={filteredAdmins}
                    columns={adminColumns}
                    getRowId={(row) => row.id}
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
                      sortModel: [{ field: 'createdAt', sort: 'desc' }],
                    },
                  }}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Admin Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{isEdit ? 'Edit Administrator' : 'Add New Administrator'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="firstName"
              label="First Name"
              variant="outlined"
              fullWidth
              value={currentAdmin.firstName}
              onChange={handleChange}
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              variant="outlined"
              fullWidth
              value={currentAdmin.lastName}
              onChange={handleChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={currentAdmin.email}
              onChange={handleChange}
              required
            />
            <TextField
              name="cellphoneNumber"
              label="Contact Number"
              variant="outlined"
              fullWidth
              value={currentAdmin.cellphoneNumber}
              onChange={handleChange}
              required
            />
            <TextField
              name="department"
              label="Department"
              variant="outlined"
              fullWidth
              value={currentAdmin.department}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={currentAdmin.role}
                label="Role"
                onChange={handleChange}
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super admin">Super Admin</MenuItem>
                <MenuItem value="health provider">Health Provider</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={currentAdmin.password}
              onChange={handleChange}
              required
              disabled={isEdit}
              helperText={isEdit ? "Password cannot be changed here." : ""}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={isEdit ? <EditIcon /> : <PersonAddIcon />}
          >
            {isEdit ? 'Update Admin' : 'Add Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}