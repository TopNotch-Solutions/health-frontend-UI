import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from "@mui/material";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { DataGrid } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { IconButton, Chip, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';
import { usePermissions } from '../utils/usePermissions';
import Swal from 'sweetalert2';

// Create a custom MUI theme for a cohesive look, consistent with the Profile page.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1674BB', // Using the original blue
    },
    success: {
      main: '#28a745', // Success green
    },
    warning: {
      main: '#ffc107', // Warning yellow
    },
    error: {
      main: '#dc3545', // Error red
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function Notifications() {
  const currentUser = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { canRead, canWrite, canDelete } = usePermissions();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [appUsers, setAppUsers] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    recipientType: 'all', // 'all' or 'single'
    userId: '',
    title: '',
    message: '',
    type: 'alert',
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?._id) {
        setNotifications([]);
        return;
      }
      try {
        const response = await fetchJSON(
          `http://13.61.152.64:4000/api/portal/notification/all-notifications/${currentUser._id}`,
          'GET'
        );
        if (response.status === true && response.data) {
          // Normalize notifications: ensure all have an 'id' field
          const normalized = (response.data || []).map((notification) => ({
            ...notification,
            id: notification._id || notification.id,
          }));
          setNotifications(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        toast.error("Failed to load notifications. Please try again.");
        setNotifications([]);
      }
    };
  
    fetchNotifications();
  }, [currentUser]);

  // Fetch app users when send dialog opens
  useEffect(() => {
    const fetchAppUsers = async () => {
      if (sendDialogOpen && notificationForm.recipientType === 'single') {
        try {
          const response = await fetchJSON(
            'http://13.61.152.64:4000/api/app/auth/all-users',
            'GET'
          );
          if (response.status === true && response.users) {
            setAppUsers(response.users);
          }
        } catch (error) {
          console.error("Error fetching app users:", error);
          toast.error("Failed to load users. Please try again.");
        }
      }
    };
    fetchAppUsers();
  }, [sendDialogOpen, notificationForm.recipientType]);
  // Update filteredNotifications whenever notifications, searchQuery, or filters change
  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title?.toLowerCase().includes(lowercasedQuery) ||
        notification.description?.toLowerCase().includes(lowercasedQuery) ||
        (notification.userId && notification.userId.toString().includes(lowercasedQuery))
      );
    }

    // Apply read filter
    if (filterRead !== 'all') {
      const isRead = filterRead === 'viewed';
      filtered = filtered.filter(notification => notification.read === isRead);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterRead]);

  // Column definitions for the DataGrid
  const notificationColumns = [
    {
      field: '_id',
      headerName: 'ID',
      width: 80
    },
    {
      field: 'userId',
      headerName: 'User ID',
      width: 100
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!params.row.read && (
            <Badge color="primary" variant="dot" />
          )}
          <Typography variant="body2" sx={{ fontWeight: params.row.read ? 400 : 600 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {params.value || 'No description'}
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()} {new Date(params.value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Typography>
      )
    },
    {
      field: 'read',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Read" : "Unread"}
          color={params.value ? "default" : "primary"}
          size="small"
          variant={params.value ? "outlined" : "filled"}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(params.row);
            }}
            title="View Details"
          >
            <NotificationsIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(params.row.id);
            }}
            disabled={params.row.read}
            title="Mark as Read"
          >
            <MarkEmailReadIcon fontSize="small" />
          </IconButton>
          {canDelete && (
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
          )}
        </Box>
      )
    }
  ];

  // Statistics calculation
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
  };

  // Action handlers
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetchJSON(
        `http://13.61.152.64:4000/api/portal/notification/mark-read/${id}`,
        'PUT'
      );
      if (response.status === true) {
        setNotifications(prev => prev.map(notification =>
          (notification.id === id || notification._id === id) ? { ...notification, read: true } : notification
        ));
        setMessage('Notification marked as read');
        setOpen(true);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetchJSON(
        `http://13.61.152.64:4000/api/portal/notification/delete/${id}`,
        'DELETE'
      );
      if (response.status === true) {
        setNotifications(prev => prev.filter(notification => 
          notification.id !== id && notification._id !== id
        ));
        setMessage('Notification deleted successfully');
        setOpen(true);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification. Please try again.");
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
    // Mark as read when viewed
    if (!notification.read) {
      handleMarkAsRead(notification.id || notification._id);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        fetchJSON(
          `http://13.61.152.64:4000/api/portal/notification/mark-read/${notification.id || notification._id}`,
          'PUT'
        )
      );
      await Promise.all(updatePromises);
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setMessage('All notifications marked as read');
      setOpen(true);
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read. Please try again.");
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete all notifications? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = notifications.map(notification =>
          fetchJSON(
            `http://13.61.152.64:4000/api/portal/notification/delete/${notification.id || notification._id}`,
            'DELETE'
          )
        );
        await Promise.all(deletePromises);
        setNotifications([]);
        setMessage('All notifications deleted');
        setOpen(true);
        Swal.fire({
          title: 'Deleted!',
          text: 'All notifications have been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error deleting all notifications:", error);
        toast.error("Failed to delete all notifications. Please try again.");
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleOpenSendDialog = () => {
    setNotificationForm({
      recipientType: 'all',
      userId: '',
      title: '',
      message: '',
      type: 'alert',
    });
    setSendDialogOpen(true);
  };

  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setNotificationForm({
      recipientType: 'all',
      userId: '',
      title: '',
      message: '',
      type: 'alert',
    });
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in both title and message.');
      return;
    }

    if (notificationForm.recipientType === 'single' && !notificationForm.userId) {
      toast.error('Please select a user.');
      return;
    }

    try {
      let response;
      if (notificationForm.recipientType === 'all') {
        response = await fetchJSON(
          'http://13.61.152.64:4000/api/portal/notification/send-to-all-users',
          'POST',
          {
            title: notificationForm.title,
            message: notificationForm.message,
            type: notificationForm.type,
          }
        );
      } else {
        response = await fetchJSON(
          'http://13.61.152.64:4000/api/portal/notification/send-to-user',
          'POST',
          {
            userId: notificationForm.userId,
            title: notificationForm.title,
            message: notificationForm.message,
            type: notificationForm.type,
          }
        );
      }

      if (response.status === true) {
        toast.success(response.message || 'Notification sent successfully!');
        handleCloseSendDialog();
        setMessage(response.message || 'Notification sent successfully!');
        setOpen(true);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error.message || 'Failed to send notification. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid item xs={12}>
          <Typography gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and view all system notifications and user communications.
          </Typography>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <NotificationsIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notifications
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
                <Badge badgeContent={stats.unread} color="primary">
                  <EmailIcon color="action" fontSize="large" />
                </Badge>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.unread}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unread Notifications
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>


        {/* Notifications Table */}
        <Grid item xs={12} md={12}>
          <Card raised>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                  All Notifications
                </Typography>
                <Stack direction="row" spacing={2}>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={handleOpenSendDialog}
                    >
                      Send Notification
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<MarkEmailReadIcon />}
                    onClick={handleMarkAllAsRead}
                    disabled={stats.unread === 0}
                  >
                    Mark All Read
                  </Button>
                  {canDelete && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteAll}
                      disabled={notifications.length === 0}
                    >
                      Delete All
                    </Button>
                  )}
                </Stack>
              </Stack>

              {/* Search and Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search notifications"
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterRead}
                      label="Status"
                      onChange={(e) => setFilterRead(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="unread">Unread</MenuItem>
                      <MenuItem value="viewed">Read</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={filteredNotifications}
                  columns={notificationColumns}
                  getRowId={(row) => row.id || row._id}
                  onRowClick={(params) => handleViewDetails(params.row)}
                  sx={{
                    "& .MuiDataGrid-root": {
                      fontFamily: "Montserrat, sans-serif",
                      cursor: "pointer",
                    },
                    "& .MuiDataGrid-row": {
                      cursor: "pointer",
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: "rgba(22, 116, 187, 0.04)",
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
                    sorting: {
                      sortModel: [{ field: 'createdAt', sort: 'desc' }],
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

      {/* Notification Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {selectedNotification?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description:
                </Typography>
                <Typography variant="body1">
                  {selectedNotification.description || 'No description available'}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {selectedNotification.userId && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID:
                    </Typography>
                    <Typography variant="body2">
                      {selectedNotification.userId}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.read ? 'Read' : 'Unread'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At:
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.createdAt ? 
                      `${new Date(selectedNotification.createdAt).toLocaleDateString()} at ${new Date(selectedNotification.createdAt).toLocaleTimeString()}` :
                      'Date not available'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
          {selectedNotification && !selectedNotification.read && (
            <Button
              variant="contained"
              startIcon={<MarkEmailReadIcon />}
              onClick={() => {
                handleMarkAsRead(selectedNotification.id || selectedNotification._id);
                setDetailDialogOpen(false);
              }}
            >
              Mark as Read
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onClose={handleCloseSendDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Recipient</FormLabel>
              <RadioGroup
                value={notificationForm.recipientType}
                onChange={(e) => setNotificationForm({ ...notificationForm, recipientType: e.target.value, userId: '' })}
              >
                <FormControlLabel value="all" control={<Radio />} label="All Users" />
                <FormControlLabel value="single" control={<Radio />} label="Single User" />
              </RadioGroup>
            </FormControl>

            {notificationForm.recipientType === 'single' && (
              <FormControl fullWidth required>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={notificationForm.userId}
                  label="Select User"
                  onChange={(e) => setNotificationForm({ ...notificationForm, userId: e.target.value })}
                >
                  {appUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.fullname || user.email || user.walletID} ({user.role || 'N/A'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={notificationForm.type}
                label="Type"
                onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
              >
                <MenuItem value="alert">Alert</MenuItem>
                <MenuItem value="reminder">Reminder</MenuItem>
                <MenuItem value="promotion">Promotion</MenuItem>
                <MenuItem value="welcome">Welcome</MenuItem>
                <MenuItem value="app_update">App Update</MenuItem>
                <MenuItem value="maintenance_scheduled">Maintenance Scheduled</MenuItem>
                <MenuItem value="emergency_alert">Emergency Alert</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              required
              value={notificationForm.title}
              onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
              inputProps={{ maxLength: 100 }}
              helperText={`${notificationForm.title.length}/100 characters`}
            />

            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={4}
              value={notificationForm.message}
              onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
              inputProps={{ maxLength: 500 }}
              helperText={`${notificationForm.message.length}/500 characters`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSendNotification} startIcon={<SendIcon />}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default Notifications;