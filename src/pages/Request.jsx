import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

export default function Request() {
  const [isLoading, setIsLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  
  // Socket data
  const [onlineUsers, setOnlineUsers] = useState({
    total: 0,
    byRole: {
      patient: 0,
      doctor: 0,
      nurse: 0,
      physiotherapist: 0,
      'social worker': 0,
    },
    totalSockets: 0,
  });

  // Request statistics
  const [requestStats, setRequestStats] = useState({
    total: 0,
    searching: 0,
    pending: 0,
    accepted: 0,
    enRoute: 0,
    arrived: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    expired: 0,
    rejected: 0,
  });

  // User statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    patients: 0,
    healthProviders: 0,
    doctors: 0,
    nurses: 0,
    physiotherapists: 0,
    socialWorkers: 0,
  });

  // Recent requests
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchRequestStats();
    
    // Initialize socket connection
    const newSocket = io('http://13.61.152.64:4000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    newSocket.on('onlineUsersUpdate', (data) => {
      setOnlineUsers({
        total: data.total || 0,
        byRole: data.byRole || {},
        totalSockets: data.total || 0,
      });
    });

    setSocket(newSocket);

    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchRequestStats();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const fetchRequestStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        'http://13.61.152.64:4000/api/portal/request/stats',
        'GET'
      );

      if (response.status === true && response.stats) {
        const stats = response.stats;
        
        // Update request stats
        setRequestStats({
          total: stats.requests?.total || 0,
          searching: stats.requests?.searching || 0,
          pending: stats.requests?.pending || 0,
          accepted: stats.requests?.accepted || 0,
          enRoute: stats.requests?.enRoute || 0,
          arrived: stats.requests?.arrived || 0,
          inProgress: stats.requests?.inProgress || 0,
          completed: stats.requests?.completed || 0,
          cancelled: stats.requests?.cancelled || 0,
          expired: stats.requests?.expired || 0,
          rejected: stats.requests?.rejected || 0,
        });

        // Update user stats
        setUserStats({
          total: stats.users?.total || 0,
          patients: stats.users?.patients || 0,
          healthProviders: stats.users?.healthProviders || 0,
          doctors: stats.users?.doctors || 0,
          nurses: stats.users?.nurses || 0,
          physiotherapists: stats.users?.physiotherapists || 0,
          socialWorkers: stats.users?.socialWorkers || 0,
        });

        // Update socket data if available
        if (stats.socket) {
          setSocketConnected(stats.socket.isConnected || false);
          setOnlineUsers({
            total: stats.socket.totalOnline || 0,
            byRole: stats.socket.byRole || {},
            totalSockets: stats.socket.totalSockets || 0,
          });
        }

        // Update recent requests
        if (stats.recentRequests) {
          setRecentRequests(stats.recentRequests);
        }
      }
    } catch (error) {
      console.error('Error fetching request stats:', error);
      toast.error('Failed to load request statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      searching: 'info',
      pending: 'warning',
      accepted: 'primary',
      en_route: 'primary',
      arrived: 'success',
      in_progress: 'secondary',
      completed: 'success',
      cancelled: 'error',
      expired: 'default',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      case 'pending':
      case 'searching':
        return <PendingIcon fontSize="small" />;
      default:
        return <AccessTimeIcon fontSize="small" />;
    }
  };

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Request Monitoring
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor socket connections, active users, and consultation requests in real-time.
        </Typography>
      </Grid>

      {/* Socket Connection Status */}
      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              {socketConnected ? (
                <WifiIcon color="success" fontSize="large" />
              ) : (
                <WifiOffIcon color="error" fontSize="large" />
              )}
              <Box>
                <Typography variant="h4" component="div">
                  {socketConnected ? 'Connected' : 'Disconnected'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Socket Status
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Online Users */}
      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PeopleIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? '...' : onlineUsers.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Patients */}
      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PersonIcon color="success" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? '...' : userStats.patients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Health Providers */}
      <Grid item xs={12} sm={6} md={3}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocalHospitalIcon color="error" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {isLoading ? '...' : userStats.healthProviders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Health Providers
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Active Users by Role */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Users by Role
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Patients</Typography>
                <Chip label={onlineUsers.byRole.patient || 0} color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Doctors</Typography>
                <Chip label={onlineUsers.byRole.doctor || 0} color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Nurses</Typography>
                <Chip label={onlineUsers.byRole.nurse || 0} color="info" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Physiotherapists</Typography>
                <Chip label={onlineUsers.byRole.physiotherapist || 0} color="secondary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Social Workers</Typography>
                <Chip label={onlineUsers.byRole['social worker'] || 0} color="warning" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Request Statistics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Request Statistics
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Total Requests</Typography>
                <Chip label={requestStats.total} color="default" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Searching</Typography>
                <Chip label={requestStats.searching} color="info" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Pending</Typography>
                <Chip label={requestStats.pending} color="warning" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Accepted</Typography>
                <Chip label={requestStats.accepted} color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>In Progress</Typography>
                <Chip label={requestStats.inProgress} color="secondary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Completed</Typography>
                <Chip label={requestStats.completed} color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Cancelled</Typography>
                <Chip label={requestStats.cancelled} color="error" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Requests Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Requests
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Patient Location</TableCell>
                      <TableCell>Provider Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Urgency</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No recent requests
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentRequests.map((request) => {
                        // Format patient location
                        const patientLocation = request.address
                          ? `${request.address.route || ''}, ${request.address.locality || ''}, ${request.address.administrative_area_level_1 || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'N/A'
                          : (request.locationTracking?.patientLocation
                              ? `${request.locationTracking.patientLocation.latitude?.toFixed(4) || ''}, ${request.locationTracking.patientLocation.longitude?.toFixed(4) || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'N/A'
                              : 'N/A');

                        // Format provider location
                        const providerLocation = request.locationTracking?.providerLocation
                          ? `${request.locationTracking.providerLocation.latitude?.toFixed(4) || ''}, ${request.locationTracking.providerLocation.longitude?.toFixed(4) || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'Not available'
                          : 'Not available';

                        return (
                          <TableRow key={request._id}>
                            <TableCell>
                              {request.patientId?.fullname || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {request.providerId?.fullname || 'Not assigned'}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {patientLocation}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {request.providerId ? providerLocation : 'Not assigned'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(request.status)}
                                label={request.status}
                                color={getStatusColor(request.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={request.urgency || 'medium'}
                                size="small"
                                color={
                                  request.urgency === 'emergency'
                                    ? 'error'
                                    : request.urgency === 'high'
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(request.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

