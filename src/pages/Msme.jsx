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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupIcon from '@mui/icons-material/Group';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

export default function Registration() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    fullname: '',
    cellphoneNumber: '',
    walletID: '',
    balance: 0.0,
    PreviousBalance: 0.0,
    address: '',
    role: 'passager',
    driverIDFront: '',
    driverIDback: '',
    licenseFront: '',
    licenseBack: '',
    frontSeats: '',
    licensePlate: '',
    rearSeats: '',
    badge: '',
    drivingZone: '',
    profileImage: '',
    verifiedCellphoneNumber: '',
    carModel: '',
    visibility: 'Offline',
    accountDeactivation: false,
    isDocumentVerified: false,
    isDocumentsSubmitted: false,
    isDriverProfileImageVerified: false,
    isAccountVerified: false,
    dateProfileImageUpdated: null,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUserForRejection, setSelectedUserForRejection] = useState(null);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedUserForDocuments, setSelectedUserForDocuments] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON('http://localhost:4000/api/app/auth/all-users');
      if (response.status && response.users) {
        // Normalize user data - map _id to id for DataGrid
        const normalizedUsers = response.users.map(user => ({
          ...user,
          id: user._id || user.id,
        }));
        setUsers(normalizedUsers);
        setFilteredUsers(normalizedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Update filteredUsers based on search and filters
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullname?.toLowerCase().includes(lowercasedQuery) ||
          user.cellphoneNumber.toLowerCase().includes(lowercasedQuery) ||
          user.walletID.toLowerCase().includes(lowercasedQuery) ||
          user.address?.toLowerCase().includes(lowercasedQuery) ||
          user.role.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filterRole]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setIsEdit(true);
      setCurrentUser(user);
    } else {
      setIsEdit(false);
      setCurrentUser({
        id: null,
        fullname: '',
        cellphoneNumber: '',
        walletID: '',
        balance: 0.0,
        PreviousBalance: 0.0,
        address: '',
        role: 'passager',
        driverIDFront: '',
        driverIDback: '',
        licenseFront: '',
        licenseBack: '',
        frontSeats: '',
        licensePlate: '',
        rearSeats: '',
        badge: '',
        drivingZone: '',
        profileImage: '',
        verifiedCellphoneNumber: '',
        carModel: '',
        visibility: 'Offline',
        accountDeactivation: false,
        isDocumentVerified: false,
        isDocumentsSubmitted: false,
        isDriverProfileImageVerified: false,
        isAccountVerified: false,
        dateProfileImageUpdated: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!currentUser.cellphoneNumber || !currentUser.walletID || !currentUser.verifiedCellphoneNumber) {
      setSnackbarMessage('Cellphone Number, Wallet ID, and Verified Cellphone Number are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (isEdit) {
      setUsers((prev) =>
        prev.map((user) => (user.id === currentUser.id ? currentUser : user))
      );
      setSnackbarMessage('User updated successfully!');
    } else {
      const newUser = {
        ...currentUser,
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      };
      setUsers((prev) => [...prev, newUser]);
      setSnackbarMessage('User added successfully!');
    }
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setSnackbarMessage('User deleted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleApproveDocuments = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetchJSON(
        `http://localhost:4000/api/app/auth/approve-documents/${userId}`,
        'PATCH'
      );
      if (response.status) {
        toast.success('Documents approved successfully!');
        await fetchUsers(); // Refresh users list
      }
    } catch (error) {
      console.error('Error approving documents:', error);
      toast.error(error.message || 'Failed to approve documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectDocuments = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetchJSON(
        `http://localhost:4000/api/app/auth/reject-documents/${selectedUserForRejection}`,
        'PATCH',
        { reason: rejectionReason }
      );
      if (response.status) {
        toast.success('Documents rejected. Notification sent to user.');
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedUserForRejection(null);
        await fetchUsers(); // Refresh users list
      }
    } catch (error) {
      console.error('Error rejecting documents:', error);
      toast.error(error.message || 'Failed to reject documents');
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectDialog = (userId) => {
    setSelectedUserForRejection(userId);
    setRejectDialogOpen(true);
  };

  const openDocumentsDialog = (user) => {
    setSelectedUserForDocuments(user);
    setDocumentsDialogOpen(true);
  };

  const isHealthProvider = (role) => {
    return ['doctor', 'nurse', 'physiotherapist', 'social worker'].includes(role);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'patient':
        return <AccountCircleIcon />;
      case 'doctor':
      case 'nurse':
      case 'physiotherapist':
      case 'social worker':
        return <LocalHospitalIcon />;
      default:
        return <AccountCircleIcon />;
    }
  };

  // Column definitions for the DataGrid
  const userColumns = [
    {
      field: 'profileImage',
      headerName: 'Avatar',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar 
          src={params.row.profileImage ? `http://localhost:4000/images/${params.row.profileImage}` : undefined}
          alt={params.row.fullname}
        >
          {params.row.fullname ? params.row.fullname.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      ),
    },
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'fullname', headerName: 'Full Name', width: 150 },
    { field: 'cellphoneNumber', headerName: 'Phone', width: 150 },
    { field: 'walletID', headerName: 'Wallet ID', width: 150 },
    { field: 'balance', headerName: 'Balance', width: 120, renderCell: (params) => `$${params.value.toFixed(2)}` },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'driver' ? 'primary' : 'default'}
          size="small"
          icon={getRoleIcon(params.value)}
        />
      ),
    },
    {
      field: 'visibility',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Online' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'isAccountVerified',
      headerName: 'Verified',
      width: 100,
      renderCell: (params) => (
        params.value ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />
      ),
    },
    {
      field: 'isDocumentVerified',
      headerName: 'Doc Status',
      width: 120,
      renderCell: (params) => {
        if (!isHealthProvider(params.row.role)) {
          return <Typography variant="body2" color="text.secondary">-</Typography>;
        }
        return params.value ? (
          <Chip label="Verified" color="success" size="small" icon={<CheckCircleIcon />} />
        ) : (
          <Chip label="Pending" color="warning" size="small" />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isHealthProvider(params.row.role) && params.row.isDocumentsSubmitted && !params.row.isDocumentVerified && (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openDocumentsDialog(params.row);
                }}
                title="View Documents"
                color="info"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveDocuments(params.row.id || params.row._id);
                }}
                title="Approve Documents"
                color="success"
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openRejectDialog(params.row.id || params.row._id);
                }}
                title="Reject Documents"
                color="error"
              >
                <ThumbDownIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {isHealthProvider(params.row.role) && params.row.isDocumentsSubmitted && params.row.isDocumentVerified && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openDocumentsDialog(params.row);
              }}
              title="View Documents"
              color="info"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          )}
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
        </Box>
      ),
    },
  ];

  // Statistics calculation
  const stats = {
    total: users.length,
    patients: users.filter((user) => user.role === 'patient').length,
    healthProviders: users.filter((user) => isHealthProvider(user.role)).length,
    pendingVerification: users.filter((user) => isHealthProvider(user.role) && user.isDocumentsSubmitted && !user.isDocumentVerified).length,
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid item xs={12}>
          <Typography gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all registered app users, including passengers, drivers, and fleets.
          </Typography>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccountCircleIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
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
                <AccountCircleIcon color="action" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.patients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patients
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
                <LocalHospitalIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.healthProviders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Health Providers
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
                <GroupIcon color="warning" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.pendingVerification}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Verification
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Users Table */}
        <Grid item xs={12}>
          <Card raised>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                  All Users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add New User
                </Button>
              </Stack>

              {/* Search and Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Search users"
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
                      <MenuItem value="patient">Patient</MenuItem>
                      <MenuItem value="doctor">Doctor</MenuItem>
                      <MenuItem value="nurse">Nurse</MenuItem>
                      <MenuItem value="physiotherapist">Physiotherapist</MenuItem>
                      <MenuItem value="social worker">Social Worker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={filteredUsers}
                  columns={userColumns}
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
                  }}
                  pageSizeOptions={[25, 50, 100]}
                  disableRowSelectionOnClick
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6">General Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fullname"
                label="Full Name"
                variant="outlined"
                fullWidth
                value={currentUser.fullname || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cellphoneNumber"
                label="Cellphone Number"
                variant="outlined"
                fullWidth
                value={currentUser.cellphoneNumber || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="walletID"
                label="Wallet ID"
                variant="outlined"
                fullWidth
                value={currentUser.walletID || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Address"
                variant="outlined"
                fullWidth
                value={currentUser.address || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="balance"
                label="Balance"
                type="number"
                variant="outlined"
                fullWidth
                value={currentUser.balance}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="PreviousBalance"
                label="Previous Balance"
                type="number"
                variant="outlined"
                fullWidth
                value={currentUser.PreviousBalance}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={currentUser.role}
                  label="Role"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="physiotherapist">Physiotherapist</MenuItem>
                  <MenuItem value="social worker">Social Worker</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="verifiedCellphoneNumber"
                label="Verified Cellphone Number"
                variant="outlined"
                fullWidth
                value={currentUser.verifiedCellphoneNumber || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select
                  name="visibility"
                  value={currentUser.visibility}
                  label="Visibility"
                  onChange={handleChange}
                >
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isAccountVerified"
                      checked={currentUser.isAccountVerified}
                      onChange={handleChange}
                    />
                  }
                  label="Account Verified"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="accountDeactivation"
                      checked={currentUser.accountDeactivation}
                      onChange={handleChange}
                    />
                  }
                  label="Account Deactivated"
                />
              </FormGroup>
            </Grid>
            
            {isHealthProvider(currentUser.role) && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">Health Provider Details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="hpcnaNumber"
                    label="HPCNA Number"
                    variant="outlined"
                    fullWidth
                    value={currentUser.hpcnaNumber || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="operationalZone"
                    label="Operational Zone"
                    variant="outlined"
                    fullWidth
                    value={currentUser.operationalZone || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isDocumentVerified"
                          checked={currentUser.isDocumentVerified}
                          onChange={handleChange}
                          disabled
                        />
                      }
                      label="Documents Verified"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isDocumentsSubmitted"
                          checked={currentUser.isDocumentsSubmitted}
                          onChange={handleChange}
                          disabled
                        />
                      }
                      label="Documents Submitted"
                    />
                  </FormGroup>
                </Grid>

                {/* Displaying images for editing */}
                {isEdit && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2 }}>Submitted Documents</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">ID Document Front</Typography>
                        {currentUser.idDocumentFront && (
                          <img src={`http://localhost:4000/images/${currentUser.idDocumentFront}`} alt="ID Document Front" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                        )}
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">ID Document Back</Typography>
                        {currentUser.idDocumentBack && (
                          <img src={`http://localhost:4000/images/${currentUser.idDocumentBack}`} alt="ID Document Back" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                        )}
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">Primary Qualification</Typography>
                        {currentUser.primaryQualification && (
                          <img src={`http://localhost:4000/images/${currentUser.primaryQualification}`} alt="Primary Qualification" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                        )}
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">Annual Qualification</Typography>
                        {currentUser.annualQualification && (
                          <img src={`http://localhost:4000/images/${currentUser.annualQualification}`} alt="Annual Qualification" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                        )}
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">Profile Image</Typography>
                        {currentUser.profileImage && (
                          <img src={`http://localhost:4000/images/${currentUser.profileImage}`} alt="Profile Image" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={isEdit ? <EditIcon /> : <PersonAddIcon />}
          >
            {isEdit ? 'Update User' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Documents Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectionReason('');
          setSelectedUserForRejection(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Documents</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting the documents. This reason will be sent to the user via notification.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason('');
              setSelectedUserForRejection(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectDocuments}
            disabled={!rejectionReason.trim()}
          >
            Reject Documents
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Documents Dialog */}
      <Dialog
        open={documentsDialogOpen}
        onClose={() => {
          setDocumentsDialogOpen(false);
          setSelectedUserForDocuments(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Documents - {selectedUserForDocuments?.fullname || 'User'}
        </DialogTitle>
        <DialogContent>
          {selectedUserForDocuments && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>ID Document Front</Typography>
                {selectedUserForDocuments.idDocumentFront ? (
                  <img
                    src={`http://localhost:4000/images/${selectedUserForDocuments.idDocumentFront}`}
                    alt="ID Document Front"
                    style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">Not provided</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>ID Document Back</Typography>
                {selectedUserForDocuments.idDocumentBack ? (
                  <img
                    src={`http://localhost:4000/images/${selectedUserForDocuments.idDocumentBack}`}
                    alt="ID Document Back"
                    style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">Not provided</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Primary Qualification</Typography>
                {selectedUserForDocuments.primaryQualification ? (
                  <img
                    src={`http://localhost:4000/images/${selectedUserForDocuments.primaryQualification}`}
                    alt="Primary Qualification"
                    style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">Not provided</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Annual Qualification</Typography>
                {selectedUserForDocuments.annualQualification ? (
                  <img
                    src={`http://localhost:4000/images/${selectedUserForDocuments.annualQualification}`}
                    alt="Annual Qualification"
                    style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">Not provided</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Profile Image</Typography>
                {selectedUserForDocuments.profileImage ? (
                  <img
                    src={`http://localhost:4000/images/${selectedUserForDocuments.profileImage}`}
                    alt="Profile Image"
                    style={{ width: '100%', height: 'auto', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">Not provided</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDocumentsDialogOpen(false);
            setSelectedUserForDocuments(null);
          }}>
            Close
          </Button>
          {selectedUserForDocuments && !selectedUserForDocuments.isDocumentVerified && selectedUserForDocuments.isDocumentsSubmitted && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApproveDocuments(selectedUserForDocuments.id || selectedUserForDocuments._id);
                  setDocumentsDialogOpen(false);
                  setSelectedUserForDocuments(null);
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setDocumentsDialogOpen(false);
                  openRejectDialog(selectedUserForDocuments.id || selectedUserForDocuments._id);
                  setSelectedUserForDocuments(null);
                }}
              >
                Reject
              </Button>
            </>
          )}
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

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ThemeProvider>
  );
}