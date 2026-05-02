/* @refresh reset */
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HealingIcon from '@mui/icons-material/Healing';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import fetchJSON from '../utils/fetchJSON';
import { fetchFormData } from '../utils/fetchFormData';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { usePermissions } from '../utils/usePermissions';

const API_BASE = 'https://apihealthconnect.kopanovertex.com';

const PACKAGE_PROVIDERS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'social worker', label: 'Social worker' },
  { value: 'pharmacist', label: 'Pharmacist' },
];

function formatProviderLabel(provider) {
  if (!provider || typeof provider !== 'string') return '';
  const found = PACKAGE_PROVIDERS.find((p) => p.value === provider.toLowerCase());
  return found ? found.label : provider;
}

export default function Ailment() {
  const { canRead, canWrite, canDelete } = usePermissions();
  const [viewMode, setViewMode] = useState('ailments');
  const [ailments, setAilments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filteredAilments, setFilteredAilments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [packageCount, setPackageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPackageQuery, setSearchPackageQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [isPackageEdit, setIsPackageEdit] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({
    id: null,
    provider: '',
    amount: '',
    consultations: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentAilment, setCurrentAilment] = useState({
    id: null,
    title: '',
    description: '',
    teleconsultationCost: '',
    physicalconsultationCost: '',
    specialization: [],
    supportsTeleconsultation: false,
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchAilments();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    let filtered = ailments;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ailment) =>
          ailment.title?.toLowerCase().includes(lowercasedQuery) ||
          ailment.description?.toLowerCase().includes(lowercasedQuery)
      );
    }
    setFilteredAilments(filtered);
  }, [ailments, searchQuery]);

  useEffect(() => {
    let filtered = packages;
    if (searchPackageQuery) {
      const q = searchPackageQuery.toLowerCase();
      filtered = filtered.filter((pkg) => {
        const provider = pkg.providerLabel?.toLowerCase() ?? '';
        const raw = pkg.provider?.toLowerCase() ?? '';
        const amt = String(pkg.amount ?? '');
        const cons = String(pkg.consultations ?? '');
        return (
          provider.includes(q) ||
          raw.includes(q) ||
          amt.includes(q) ||
          cons.includes(q)
        );
      });
    }
    setFilteredPackages(filtered);
  }, [packages, searchPackageQuery]);

  useEffect(() => {
    if (viewMode !== 'packages') return;
    fetchPackages();
    fetchPackageCount();
  }, [viewMode]);

  const fetchAilments = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/portal/aligment/all-alignments",
        "GET"
      );
      if (response.ailments) {
        console.log('Raw API response:', response.ailments); // Debug: see what API returns
        const formatted = response.ailments.map((ailment) => {
          const teleconsultationCost =
            typeof ailment.teleconsultationCost === 'number'
              ? ailment.teleconsultationCost
              : (
                ailment.teleconsultationCost !== undefined &&
                ailment.teleconsultationCost !== null
                  ? parseFloat(ailment.teleconsultationCost)
                  : null
              );

          const physicalconsultationCost =
            typeof ailment.physicalconsultationCost === 'number'
              ? ailment.physicalconsultationCost
              : (
                ailment.physicalconsultationCost !== undefined &&
                ailment.physicalconsultationCost !== null
                  ? parseFloat(ailment.physicalconsultationCost)
                  : null
              );
          
          return {
            id: ailment._id,
            title: ailment.title || '',
            description: ailment.description || '',
            teleconsultationCost,
            physicalconsultationCost,
            supportsTeleconsultation: Boolean(ailment.supportsTeleconsultation),
            image: ailment.image || '',
            specialization: Array.isArray(ailment.specialization) 
              ? ailment.specialization.map(spec => spec?.title || spec || 'N/A').join(', ')
              : (ailment.specialization?.title || ailment.specialization || 'N/A'),
            specializationIds: Array.isArray(ailment.specialization)
              ? ailment.specialization.map(spec => typeof spec === 'object' ? spec._id : spec)
              : [typeof ailment.specialization === 'object' ? ailment.specialization._id : ailment.specialization].filter(Boolean),
          };
        });
        console.log('Formatted ailments:', formatted); // Debug log
        setAilments(formatted);
        setFilteredAilments(formatted);
      }
    } catch (error) {
      console.error("Error fetching ailments:", error);
      toast.error("Failed to load ailments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/portal/specialization/all-specializations",
        "GET"
      );
      if (response.specializations) {
        setSpecializations(response.specializations);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const fetchPackageCount = async () => {
    try {
      const response = await fetchJSON(
        `${API_BASE}/api/portal/packages/count`,
        'GET'
      );
      // Backend: { status: "SUCCESS", count: number }
      setPackageCount(typeof response.count === 'number' ? response.count : 0);
    } catch (error) {
      console.error('Error fetching package count:', error);
      toast.error('Failed to load package count.');
    }
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        `${API_BASE}/api/portal/packages/all`,
        "GET"
      );
      const raw = Array.isArray(response)
        ? response
        : response?.packages ?? response?.data ?? [];
      const formatted = raw.map((pkg) => {
        const providerRaw = pkg.provider ?? '';
        return {
          id: pkg._id || pkg.id,
          provider: typeof providerRaw === 'string' ? providerRaw : String(providerRaw ?? ''),
          providerLabel: formatProviderLabel(String(providerRaw ?? '')),
          amount:
            pkg.amount !== undefined && pkg.amount !== null ? pkg.amount : null,
          consultations:
            pkg.consultations !== undefined && pkg.consultations !== null
              ? pkg.consultations
              : null,
        };
      });
      setPackages(formatted);
      setFilteredPackages(formatted);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPackageDialog = (pkg = null) => {
    // Only treat as edit when given a package row (has id). Avoid mistaking click events for rows.
    if (pkg != null && pkg.id != null && pkg.id !== '') {
      setIsPackageEdit(true);
      setCurrentPackage({
        id: pkg.id,
        provider: typeof pkg.provider === 'string' ? pkg.provider : String(pkg.provider ?? ''),
        amount:
          pkg.amount !== null && pkg.amount !== undefined ? String(pkg.amount) : '',
        consultations:
          pkg.consultations !== null && pkg.consultations !== undefined
            ? String(pkg.consultations)
            : '',
      });
    } else {
      setIsPackageEdit(false);
      setCurrentPackage({
        id: null,
        provider: '',
        amount: '',
        consultations: '',
      });
    }
    setPackageDialogOpen(true);
  };

  const handleClosePackageDialog = () => {
    setPackageDialogOpen(false);
    setIsPackageEdit(false);
  };

  const handleSubmitPackage = async () => {
    if (!currentPackage.provider) {
      setSnackbarMessage('Please select a provider.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const amountNum = parseFloat(currentPackage.amount);
    if (
      currentPackage.amount === '' ||
      currentPackage.amount == null ||
      isNaN(amountNum) ||
      amountNum < 0
    ) {
      setSnackbarMessage('Amount is required and must be a valid non-negative number.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const consultationsNum = parseInt(String(currentPackage.consultations), 10);
    if (
      currentPackage.consultations === '' ||
      currentPackage.consultations == null ||
      !Number.isFinite(consultationsNum) ||
      consultationsNum < 1
    ) {
      setSnackbarMessage('Consultations is required and must be a whole number of at least 1.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const body = {
        provider: currentPackage.provider,
        amount: amountNum,
        consultations: consultationsNum,
      };
      if (isPackageEdit) {
        await fetchJSON(
          `${API_BASE}/api/portal/packages/update/${currentPackage.id}`,
          'PUT',
          body
        );
        setSnackbarMessage('Package updated successfully.');
      } else {
        await fetchJSON(
          `${API_BASE}/api/portal/packages/create`,
          'POST',
          body
        );
        setSnackbarMessage('Package created successfully.');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClosePackageDialog();
      await fetchPackages();
      await fetchPackageCount();
    } catch (error) {
      setSnackbarMessage(
        error.message || (isPackageEdit ? 'Failed to update package.' : 'Failed to create package.')
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeletePackage = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this package?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await fetchJSON(
          `${API_BASE}/api/portal/packages/delete/${id}`,
          'DELETE'
        );
        setSnackbarMessage('Package deleted successfully.');
        setSnackbarSeverity('success');
        await fetchPackages();
        await fetchPackageCount();
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete package.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleOpenDialog = (ailment = null) => {
    if (ailment) {
      setIsEdit(true);
      setCurrentAilment({
        id: ailment.id,
        title: ailment.title,
        description: ailment.description,
        teleconsultationCost:
          ailment.teleconsultationCost !== null && ailment.teleconsultationCost !== undefined
            ? ailment.teleconsultationCost
            : '',
        physicalconsultationCost:
          ailment.physicalconsultationCost !== null && ailment.physicalconsultationCost !== undefined
            ? ailment.physicalconsultationCost
            : '',
        specialization: Array.isArray(ailment.specializationIds) ? ailment.specializationIds : [],
        supportsTeleconsultation: Boolean(ailment.supportsTeleconsultation),
        image: ailment.image || '',
      });
      setImageFile(null);
    } else {
      setIsEdit(false);
      setCurrentAilment({
        id: null,
        title: '',
        description: '',
        teleconsultationCost: '',
        physicalconsultationCost: '',
        specialization: [],
        supportsTeleconsultation: false,
        image: '',
      });
      setImageFile(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (
      !currentAilment.title ||
      !currentAilment.description ||
      !currentAilment.specialization ||
      currentAilment.specialization.length === 0
    ) {
      setSnackbarMessage(
        'Please fill out all required fields and select at least one specialization.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const physicalCost = parseFloat(currentAilment.physicalconsultationCost);
    if (isNaN(physicalCost) || physicalCost < 0.01) {
      setSnackbarMessage('Physical consultation cost is required and must be at least 0.01.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const teleCostRaw = currentAilment.teleconsultationCost;
    const hasTeleCost = teleCostRaw !== '' && teleCostRaw !== null && teleCostRaw !== undefined;
    const teleCost = hasTeleCost ? parseFloat(teleCostRaw) : null;

    if (hasTeleCost && (isNaN(teleCost) || teleCost < 0)) {
      setSnackbarMessage('Teleconsultation cost must be a valid positive value.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (currentAilment.supportsTeleconsultation && (teleCost === null || isNaN(teleCost) || teleCost < 0.01)) {
      setSnackbarMessage('Teleconsultation cost is required when teleconsultation is enabled.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEdit) {
        const response = await fetchJSON(
          `https://apihealthconnect.kopanovertex.com/api/portal/aligment/update-alignment/${currentAilment.id}`,
          "PUT",
          {
            title: currentAilment.title,
            description: currentAilment.description,
            teleconsultationCost: hasTeleCost ? teleCost : null,
            physicalconsultationCost: physicalCost,
            specialization: currentAilment.specialization,
            supportsTeleconsultation: Boolean(currentAilment.supportsTeleconsultation),
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
        }
      } else {
        if (!imageFile) {
          setSnackbarMessage('Please upload an image for the ailment.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }

        const formData = new FormData();
        formData.append('title', currentAilment.title);
        formData.append('description', currentAilment.description);
        formData.append(
          'teleconsultationCost',
          hasTeleCost ? String(teleCost) : ''
        );
        formData.append(
          'physicalconsultationCost',
          String(physicalCost)
        );
        formData.append('specialization', JSON.stringify(currentAilment.specialization));
        formData.append('supportsTeleconsultation', String(Boolean(currentAilment.supportsTeleconsultation)));
        formData.append('image', imageFile);

        const response = await fetchFormData(
          "https://apihealthconnect.kopanovertex.com/api/portal/aligment/create-alignment",
          "POST",
          formData
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
        }
      }
      setSnackbarOpen(true);
      handleCloseDialog();
      setImageFile(null);
    } catch (error) {
      setSnackbarMessage(error.message || 'An error occurred. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this ailment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetchJSON(
          `https://apihealthconnect.kopanovertex.com/api/portal/aligment/delete-alignment/${id}`,
          "DELETE"
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete ailment.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleUpdateImage = async () => {
    if (!imageFile) {
      setSnackbarMessage('Please select an image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetchFormData(
        `https://apihealthconnect.kopanovertex.com/api/portal/aligment/update-ailment-image/${currentAilment.id}`,
        "PUT",
        formData
      );

      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Ailment image updated successfully.');
        setSnackbarSeverity('success');
      }

      setSnackbarOpen(true);
      setImageFile(null);
      fetchAilments();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update ailment image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: 150 },
    { field: 'description', headerName: 'Description', width: 150 },
    {
      field: 'physicalconsultationCost',
      headerName: 'Physical Consultation Cost',
      width: 200,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return 'N$0.00';
        }
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) {
          return 'N$0.00';
        }
        return `N$${numValue.toFixed(2)}`;
      }
    },
    {
      field: 'teleconsultationCost',
      headerName: 'Teleconsultation Cost',
      width: 140,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return 'N$0.00';
        }
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) {
          return 'N$0.00';
        }
        return `N$${numValue.toFixed(2)}`;
      }
    },
    {
      field: 'supportsTeleconsultation',
      headerName: 'Teleconsultation',
      width: 130,
      renderCell: (params) => {
        const isEnabled = Boolean(params.value);
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isEnabled ? 'success.main' : 'error.main',
            }}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Typography>
        );
      },
    },
    { field: 'specialization', headerName: 'Specializations', width: 190 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const packageColumns = [
    {
      field: 'providerLabel',
      headerName: 'Provider',
      minWidth: 280,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 260,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return '—';
        }
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) {
          return '—';
        }
        return `N$${numValue.toFixed(2)}`;
      },
    },
    {
      field: 'consultations',
      headerName: 'Consultations',
      width: 140,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return '—';
        }
        const n = typeof value === 'number' ? value : parseInt(String(value), 10);
        return Number.isFinite(n) ? String(n) : '—';
      },
    },
    {
      field: 'packageActions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPackageDialog(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePackage(params.row.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          {viewMode === 'ailments' ? 'Ailments' : 'Packages'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {viewMode === 'ailments'
            ? 'Manage all medical ailments and conditions.'
            : 'Manage health packages.'}
        </Typography>
        <Box
          sx={{
            width: '100%',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Tabs
            value={viewMode}
            onChange={(e, v) => setViewMode(v)}
            variant="fullWidth"
            aria-label="Switch between ailments and packages"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
            }}
          >
            <Tab label="Ailments" value="ailments" />
            <Tab label="Packages" value="packages" />
          </Tabs>
        </Box>
      </Grid>

      {/* Statistics Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              {viewMode === 'ailments' ? (
                <HealingIcon color="primary" fontSize="large" />
              ) : (
                <Inventory2Icon color="primary" fontSize="large" />
              )}
              <Box>
                <Typography variant="h4" component="div">
                  {viewMode === 'ailments' ? ailments.length : packageCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewMode === 'ailments' ? 'Total Ailments' : 'Total Packages'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            {viewMode === 'ailments' ? (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5">All Ailments</Typography>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                    >
                      Add New
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search ailments"
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

                <Box sx={{ height: 600, width: '100%' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredAilments}
                      columns={columns}
                      getRowId={(row) => row.id}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </Box>
              </>
            ) : (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5">All Packages</Typography>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenPackageDialog()}
                    >
                      Add Package
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search packages"
                    variant="outlined"
                    value={searchPackageQuery}
                    onChange={(e) => setSearchPackageQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <IconButton sx={{ pr: 1, color: 'text.secondary' }}>
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredPackages}
                      columns={packageColumns}
                      getRowId={(row) => row.id}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Ailment' : 'Add New Ailment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {isEdit && currentAilment.image && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Current Image
                </Typography>
                <Box
                  component="img"
                  src={`https://apihealthconnect.kopanovertex.com/ailments/${currentAilment.image}`}
                  alt={currentAilment.title}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={currentAilment.title}
              onChange={(e) => setCurrentAilment({ ...currentAilment, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={currentAilment.description}
              onChange={(e) => setCurrentAilment({ ...currentAilment, description: e.target.value })}
              required
            />
            <TextField
              label="Physical Consultation Cost"
              variant="outlined"
              fullWidth
              type="number"
              value={currentAilment.physicalconsultationCost}
              onChange={(e) =>
                setCurrentAilment({ ...currentAilment, physicalconsultationCost: e.target.value })
              }
              required
              inputProps={{ step: "0.01", min: "0.01" }}
              helperText="Required"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(currentAilment.supportsTeleconsultation)}
                  onChange={(e) =>
                    setCurrentAilment({
                      ...currentAilment,
                      supportsTeleconsultation: e.target.checked,
                    })
                  }
                />
              }
              label="Supports Teleconsultation"
            />
            <TextField
              label="Teleconsultation Cost"
              variant="outlined"
              fullWidth
              type="number"
              value={currentAilment.teleconsultationCost}
              onChange={(e) =>
                setCurrentAilment({ ...currentAilment, teleconsultationCost: e.target.value })
              }
              required={Boolean(currentAilment.supportsTeleconsultation)}
              inputProps={{ step: "0.01", min: "0" }}
              helperText={currentAilment.supportsTeleconsultation ? 'Required when teleconsultation is enabled' : 'Optional'}
            />
            {!isEdit && (
              <>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setSnackbarMessage('Only image files are allowed.');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                        e.target.value = null;
                        return;
                      }
                      setImageFile(file);
                    }}
                  />
                </Button>
                {imageFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected image: {imageFile.name}
                  </Typography>
                )}
              </>
            )}
            {isEdit && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Change Image
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="outlined" component="label">
                    Choose New Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          setSnackbarMessage('Only image files are allowed.');
                          setSnackbarSeverity('error');
                          setSnackbarOpen(true);
                          e.target.value = null;
                          return;
                        }
                        setImageFile(file);
                      }}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateImage}
                    disabled={!imageFile}
                  >
                    Update Image
                  </Button>
                </Stack>
                {imageFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selected image: {imageFile.name}
                  </Typography>
                )}
              </Box>
            )}
            <FormControl fullWidth required component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>Specializations</FormLabel>
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Grid container spacing={1}>
                  {specializations.map((spec) => (
                    <Grid item xs={12} sm={6} md={4} key={spec._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Array.isArray(currentAilment.specialization) && currentAilment.specialization.includes(spec._id)}
                            onChange={(e) => {
                              const currentSpecs = Array.isArray(currentAilment.specialization) 
                                ? currentAilment.specialization 
                                : [];
                              const newSpecs = e.target.checked
                                ? [...currentSpecs, spec._id]
                                : currentSpecs.filter(id => id !== spec._id);
                              setCurrentAilment({ ...currentAilment, specialization: newSpecs });
                            }}
                            size="small"
                          />
                        }
                        label={spec.title}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={packageDialogOpen} onClose={handleClosePackageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isPackageEdit ? 'Edit Package' : 'Add Package'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="package-provider-label">Provider</InputLabel>
              <Select
                labelId="package-provider-label"
                label="Provider"
                value={currentPackage.provider}
                onChange={(e) =>
                  setCurrentPackage({ ...currentPackage, provider: e.target.value })
                }
              >
                {PACKAGE_PROVIDERS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              fullWidth
              type="number"
              required
              value={currentPackage.amount}
              onChange={(e) => setCurrentPackage({ ...currentPackage, amount: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              label="Consultations"
              fullWidth
              type="number"
              required
              value={currentPackage.consultations}
              onChange={(e) =>
                setCurrentPackage({ ...currentPackage, consultations: e.target.value })
              }
              inputProps={{ step: '1', min: '1' }}
              helperText="Number of consultations included in the package"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePackageDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitPackage}>
            {isPackageEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
