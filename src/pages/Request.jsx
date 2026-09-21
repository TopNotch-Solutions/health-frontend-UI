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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import PaymentsIcon from '@mui/icons-material/Payments';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HomeIcon from '@mui/icons-material/Home';
import HealingIcon from '@mui/icons-material/Healing';
import SearchIcon from '@mui/icons-material/Search';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const API_FILES_BASE = 'https://apihealthconnect.kopanovertex.com/images/';
const BRAND = '#1674BB';

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
};

const getProfileImageUrl = (filename) =>
  filename ? `${API_FILES_BASE}${filename}` : undefined;

const InfoChip = ({ icon, label }) => (
  <Chip
    icon={icon}
    label={label}
    size="small"
    variant="outlined"
    sx={{
      borderColor: 'rgba(22, 116, 187, 0.2)',
      bgcolor: 'rgba(22, 116, 187, 0.04)',
      '& .MuiChip-icon': { color: BRAND },
    }}
  />
);

const MetaItem = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        fontSize: '0.68rem',
        display: 'block',
        mb: 0.35,
      }}
    >
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
      {formatValue(value)}
    </Typography>
  </Box>
);

const PersonCard = ({ title, person, accent, emptyLabel, extra }) => {
  const initials = person?.fullname
    ? person.fullname
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : '?';

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
          color: '#fff',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>
        {person ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={getProfileImageUrl(person.profileImage)}
                sx={{ width: 52, height: 52, bgcolor: accent, fontWeight: 600 }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {formatValue(person.fullname)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {formatValue(person.role)}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">{formatValue(person.cellphoneNumber)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {formatValue(person.email)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                <Typography variant="body2">
                  {[person.address, person.cityTown || person.town, person.region]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </Typography>
              </Stack>
            </Stack>

            {extra}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {emptyLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');

  // Request detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequestStats();

    // Initialize socket connection
    const newSocket = io('https://apihealthconnect.kopanovertex.com', {
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
        'https://apihealthconnect.kopanovertex.com/api/portal/request/stats',
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

  const handleViewRequest = async (requestId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedRequest(null);
    try {
      const response = await fetchJSON(
        `https://apihealthconnect.kopanovertex.com/api/portal/request/${requestId}`,
        'GET'
      );
      if (response.status && response.request) {
        setSelectedRequest(response.request);
      } else {
        toast.error(response.message || 'Failed to load request details.');
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error(error.message || 'Failed to load request details.');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedRequest(null);
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const formatPatientLocation = (request) => {
    if (request.address) {
      return (
        `${request.address.route || ''}, ${request.address.locality || ''}, ${request.address.administrative_area_level_1 || ''}`
          .replace(/^,\s*|,\s*$/g, '')
          .trim() || '—'
      );
    }
    if (request.locationTracking?.patientLocation) {
      return (
        `${request.locationTracking.patientLocation.latitude?.toFixed(4) || ''}, ${request.locationTracking.patientLocation.longitude?.toFixed(4) || ''}`
          .replace(/^,\s*|,\s*$/g, '')
          .trim() || '—'
      );
    }
    return '—';
  };

  const formatProviderLocation = (request) => {
    if (!request.providerId) return 'Not assigned';
    if (request.locationTracking?.providerLocation) {
      return (
        `${request.locationTracking.providerLocation.latitude?.toFixed(4) || ''}, ${request.locationTracking.providerLocation.longitude?.toFixed(4) || ''}`
          .replace(/^,\s*|,\s*$/g, '')
          .trim() || 'Not available'
      );
    }
    return 'Not available';
  };

  const filteredRequests = recentRequests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const patientName = request.patientId?.fullname?.toLowerCase() || '';
    const providerName = request.providerId?.fullname?.toLowerCase() || '';
    const status = request.status?.toLowerCase() || '';
    const urgency = (request.urgency || 'medium').toLowerCase();
    const patientLocation = formatPatientLocation(request).toLowerCase();
    const providerLocation = formatProviderLocation(request).toLowerCase();
    const created = request.createdAt
      ? new Date(request.createdAt).toLocaleString().toLowerCase()
      : '';

    return (
      patientName.includes(query) ||
      providerName.includes(query) ||
      status.includes(query) ||
      urgency.includes(query) ||
      patientLocation.includes(query) ||
      providerLocation.includes(query) ||
      created.includes(query)
    );
  });

  const patient = selectedRequest?.patientId;
  const provider = selectedRequest?.providerId;
  const ailment = selectedRequest?.ailmentCategoryId;
  const address = selectedRequest?.address;
  const cancellation = selectedRequest?.cancellation;

  const patientAddress = address
    ? [address.route, address.locality, address.administrative_area_level_1]
        .filter(Boolean)
        .join(', ') || '—'
    : '—';

  const consultationModeLabel =
    selectedRequest?.consultationMode === 'video_consultation'
      ? 'Video consultation'
      : selectedRequest?.consultationMode === 'house_visit'
      ? 'House visit'
      : selectedRequest?.consultationMode || '—';

  const isVideo = selectedRequest?.consultationMode === 'video_consultation';

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
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: '#fff',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2.5,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              background: 'linear-gradient(180deg, #f8fbfe 0%, #ffffff 100%)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Recent Requests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredRequests.length} of {recentRequests.length} shown
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search patient, provider, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                minWidth: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress sx={{ color: BRAND }} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      'Patient',
                      'Provider',
                      'Patient Location',
                      'Provider Location',
                      'Status',
                      'Urgency',
                      'Created',
                      'View',
                    ].map((header) => (
                      <TableCell
                        key={header}
                        align={header === 'View' ? 'center' : 'left'}
                        sx={{
                          bgcolor: '#f4f7fb',
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? 'No requests match your search.'
                            : 'No recent requests'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => {
                      const patientLocation = formatPatientLocation(request);
                      const providerLocation = formatProviderLocation(request);
                      const patientName = request.patientId?.fullname || 'Unknown';
                      const providerName = request.providerId?.fullname;

                      return (
                        <TableRow
                          key={request._id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  bgcolor: BRAND,
                                }}
                              >
                                {getInitials(patientName)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {patientName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {providerName ? (
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <Avatar
                                  sx={{
                                    width: 34,
                                    height: 34,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    bgcolor: '#0f766e',
                                  }}
                                >
                                  {getInitials(providerName)}
                                </Avatar>
                                <Typography variant="body2" fontWeight={500}>
                                  {providerName}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not assigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={patientLocation}
                            >
                              {patientLocation}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 180 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={providerLocation}
                            >
                              {providerLocation}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(request.status)}
                              label={(request.status || '').replace(/_/g, ' ')}
                              color={getStatusColor(request.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.urgency || 'medium'}
                              size="small"
                              variant="outlined"
                              color={
                                request.urgency === 'emergency'
                                  ? 'error'
                                  : request.urgency === 'high'
                                  ? 'warning'
                                  : 'default'
                              }
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {request.createdAt
                                ? new Date(request.createdAt).toLocaleString()
                                : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRequest(request._id)}
                              aria-label="View request details"
                              sx={{
                                color: BRAND,
                                bgcolor: 'rgba(22, 116, 187, 0.08)',
                                '&:hover': { bgcolor: 'rgba(22, 116, 187, 0.16)' },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grid>

      {/* Request Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18)',
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            m: 0,
            p: 0,
            background: `linear-gradient(135deg, ${BRAND} 0%, #0f5a94 55%, #0b4673 100%)`,
            color: '#fff',
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 2.5,
              position: 'relative',
            }}
          >
          <IconButton
            onClick={handleCloseDetail}
            aria-label="Close"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.12)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.2 }}>
            Consultation Request
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ pr: 5, mb: 1.5 }}>
            {ailment?.title || 'Request Details'}
          </Typography>

          {!detailLoading && selectedRequest && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={getStatusIcon(selectedRequest.status)}
                label={selectedRequest.status?.replace(/_/g, ' ')}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  textTransform: 'capitalize',
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />
              <Chip
                icon={isVideo ? <VideoCallIcon /> : <HomeIcon />}
                label={consultationModeLabel}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />
              <Chip
                icon={<PaymentsIcon />}
                label={
                  selectedRequest.consultationCost != null
                    ? `N$ ${selectedRequest.consultationCost}`
                    : 'No cost'
                }
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />
            </Stack>
          )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: '#f7f9fc' }}>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: BRAND }} />
            </Box>
          ) : selectedRequest ? (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <PersonCard
                    title="Patient"
                    person={patient}
                    accent={BRAND}
                    emptyLabel="Patient information not available."
                    extra={
                      patient ? (
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 1.5,
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <MetaItem label="National ID" value={patient.nationalId} />
                          <MetaItem label="Gender" value={patient.gender} />
                          <MetaItem label="Date of Birth" value={formatDate(patient.dateOfBirth) || '—'} />
                        </Box>
                      ) : null
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <PersonCard
                    title="Provider"
                    person={provider}
                    accent="#0f766e"
                    emptyLabel="No provider assigned yet."
                    extra={
                      provider ? (
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 1.5,
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <MetaItem label="HPCNA" value={provider.hpcnaNumber} />
                          <MetaItem label="Experience" value={provider.yearsOfExperience} />
                          <MetaItem label="Zone" value={provider.operationalZone} />
                          <MetaItem label="Qualification" value={provider.finalQualification} />
                          <Box sx={{ gridColumn: '1 / -1' }}>
                            <MetaItem label="Specializations" value={provider.specializations} />
                          </Box>
                        </Box>
                      ) : null
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#fff',
                      p: { xs: 2, sm: 2.5 },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <HealingIcon sx={{ color: BRAND }} />
                      <Typography variant="subtitle1" fontWeight={700}>
                        Consultation
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                          md: '1fr 1fr 1fr',
                        },
                        gap: 2,
                      }}
                    >
                      <MetaItem label="Ailment" value={ailment?.title} />
                      <MetaItem label="Provider Type" value={ailment?.provider} />
                      <MetaItem label="Payment Method" value={selectedRequest.paymentMethod} />
                      <MetaItem label="Payment Status" value={selectedRequest.paymentStatus} />
                      <MetaItem
                        label="Preferred Time"
                        value={formatDate(selectedRequest.preferredTime) || '—'}
                      />
                      <MetaItem
                        label="Estimated Arrival"
                        value={selectedRequest.providerResponse?.estimatedArrival}
                      />
                      <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: '1 / -1' } }}>
                        <MetaItem label="Visit Address" value={patientAddress} />
                      </Box>
                      {ailment?.description && (
                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: '1 / -1' } }}>
                          <MetaItem label="Description" value={ailment.description} />
                        </Box>
                      )}
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 2.5 }}
                    >
                      <InfoChip
                        icon={<AccessTimeIcon />}
                        label={`Created ${formatDate(selectedRequest.createdAt) || '—'}`}
                      />
                      <InfoChip
                        icon={<AccessTimeIcon />}
                        label={`Updated ${formatDate(selectedRequest.updatedAt) || '—'}`}
                      />
                    </Stack>
                  </Box>
                </Grid>

                {cancellation?.cancelledAt && (
                  <Grid item xs={12}>
                    <Alert
                      severity="error"
                      variant="outlined"
                      sx={{ borderRadius: 3, bgcolor: 'rgba(220, 53, 69, 0.04)' }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Cancellation
                      </Typography>
                      <Typography variant="body2">
                        Cancelled by {formatValue(cancellation.cancelledBy)} on{' '}
                        {formatDate(cancellation.cancelledAt) || '—'}
                        {cancellation.reason ? ` — ${cancellation.reason}` : ''}
                        {cancellation.refundAmount != null
                          ? ` · Refund N$ ${cancellation.refundAmount}`
                          : ''}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No request details available.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
