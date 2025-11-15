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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { usePermissions } from '../utils/usePermissions';

export default function Specialization() {
  const { canRead, canWrite, canDelete } = usePermissions();
  const [specializations, setSpecializations] = useState([]);
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSpecialization, setCurrentSpecialization] = useState({
    id: null,
    title: '',
    description: '',
    role: [],
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    let filtered = specializations;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (spec) =>
          spec.title?.toLowerCase().includes(lowercasedQuery) ||
          spec.description?.toLowerCase().includes(lowercasedQuery) ||
          (Array.isArray(spec.role) 
            ? spec.role.some(r => r?.toLowerCase().includes(lowercasedQuery))
            : spec.role?.toLowerCase().includes(lowercasedQuery))
      );
    }
    setFilteredSpecializations(filtered);
  }, [specializations, searchQuery]);

  const fetchSpecializations = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        "http://13.61.152.64:4000/api/portal/specialization/all-specializations",
        "GET"
      );
      if (response.specializations) {
        const formatted = response.specializations.map((spec) => ({
          id: spec._id,
          title: spec.title,
          description: spec.description,
          role: Array.isArray(spec.role) ? spec.role : [spec.role].filter(Boolean),
        }));
        setSpecializations(formatted);
        setFilteredSpecializations(formatted);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to load specializations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (spec = null) => {
    if (spec) {
      setIsEdit(true);
      setCurrentSpecialization({
        ...spec,
        role: Array.isArray(spec.role) ? spec.role : [spec.role].filter(Boolean),
      });
    } else {
      setIsEdit(false);
      setCurrentSpecialization({ id: null, title: '', description: '', role: [] });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    const roleArray = Array.isArray(currentSpecialization.role) 
      ? currentSpecialization.role 
      : [currentSpecialization.role].filter(Boolean);
    
    if (!currentSpecialization.title || !currentSpecialization.description || roleArray.length === 0) {
      setSnackbarMessage('Please fill out all required fields and select at least one category.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const roleArray = Array.isArray(currentSpecialization.role) 
        ? currentSpecialization.role 
        : [currentSpecialization.role].filter(Boolean);
      
      if (isEdit) {
        const response = await fetchJSON(
          `http://13.61.152.64:4000/api/portal/specialization/update-specialization/${currentSpecialization.id}`,
          "PUT",
          {
            title: currentSpecialization.title,
            description: currentSpecialization.description,
            role: roleArray,
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchSpecializations();
        }
      } else {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/specialization/add-new-specialization",
          "POST",
          {
            title: currentSpecialization.title,
            description: currentSpecialization.description,
            role: roleArray,
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchSpecializations();
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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this specialization?',
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
          `http://13.61.152.64:4000/api/portal/specialization/delete-specialization/${id}`,
          "DELETE"
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchSpecializations();
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete specialization.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    { 
      field: 'role', 
      headerName: 'Categories', 
      width: 250,
      renderCell: (params) => {
        const roleMap = {
          'doctor': 'Doctor',
          'nurse': 'Nurse',
          'physiotherapist': 'Physiotherapist',
          'social worker': 'Social Worker'
        };
        const roles = Array.isArray(params.value) ? params.value : [params.value].filter(Boolean);
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {roles.map((role, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}
              >
                {roleMap[role] || role}
              </Typography>
            ))}
          </Box>
        );
      }
    },
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

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Specializations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all medical specializations and categories.
        </Typography>
      </Grid>

      {/* Statistics Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocalHospitalIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {specializations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Specializations
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5">All Specializations</Typography>
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
                label="Search specializations"
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
                  rows={filteredSpecializations}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[25, 50, 100]}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Specialization' : 'Add New Specialization'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={currentSpecialization.title}
              onChange={(e) => setCurrentSpecialization({ ...currentSpecialization, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={currentSpecialization.description}
              onChange={(e) => setCurrentSpecialization({ ...currentSpecialization, description: e.target.value })}
              required
            />
            <FormControl fullWidth required component="fieldset">
              <FormLabel component="legend">Categories (Health Provider Roles)</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Array.isArray(currentSpecialization.role) && currentSpecialization.role.includes('doctor')}
                      onChange={(e) => {
                        const currentRoles = Array.isArray(currentSpecialization.role) 
                          ? currentSpecialization.role 
                          : [];
                        const newRoles = e.target.checked
                          ? [...currentRoles, 'doctor']
                          : currentRoles.filter(role => role !== 'doctor');
                        setCurrentSpecialization({ ...currentSpecialization, role: newRoles });
                      }}
                    />
                  }
                  label="Doctor"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Array.isArray(currentSpecialization.role) && currentSpecialization.role.includes('nurse')}
                      onChange={(e) => {
                        const currentRoles = Array.isArray(currentSpecialization.role) 
                          ? currentSpecialization.role 
                          : [];
                        const newRoles = e.target.checked
                          ? [...currentRoles, 'nurse']
                          : currentRoles.filter(role => role !== 'nurse');
                        setCurrentSpecialization({ ...currentSpecialization, role: newRoles });
                      }}
                    />
                  }
                  label="Nurse"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Array.isArray(currentSpecialization.role) && currentSpecialization.role.includes('physiotherapist')}
                      onChange={(e) => {
                        const currentRoles = Array.isArray(currentSpecialization.role) 
                          ? currentSpecialization.role 
                          : [];
                        const newRoles = e.target.checked
                          ? [...currentRoles, 'physiotherapist']
                          : currentRoles.filter(role => role !== 'physiotherapist');
                        setCurrentSpecialization({ ...currentSpecialization, role: newRoles });
                      }}
                    />
                  }
                  label="Physiotherapist"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Array.isArray(currentSpecialization.role) && currentSpecialization.role.includes('social worker')}
                      onChange={(e) => {
                        const currentRoles = Array.isArray(currentSpecialization.role) 
                          ? currentSpecialization.role 
                          : [];
                        const newRoles = e.target.checked
                          ? [...currentRoles, 'social worker']
                          : currentRoles.filter(role => role !== 'social worker');
                        setCurrentSpecialization({ ...currentSpecialization, role: newRoles });
                      }}
                    />
                  }
                  label="Social Worker"
                />
              </FormGroup>
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

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
