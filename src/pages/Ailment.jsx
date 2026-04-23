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
import HealingIcon from '@mui/icons-material/Healing';
import fetchJSON from '../utils/fetchJSON';
import { fetchFormData } from '../utils/fetchFormData';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { usePermissions } from '../utils/usePermissions';

export default function Ailment() {
  const { canRead, canWrite, canDelete } = usePermissions();
  const [ailments, setAilments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filteredAilments, setFilteredAilments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentAilment, setCurrentAilment] = useState({
    id: null,
    title: '',
    description: '',
    teleconsultationCost: '',
    physicalconsultationCost: '',
    consultationType: '',
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
        consultationType:
          ailment.teleconsultationCost !== null && ailment.teleconsultationCost !== undefined
            ? 'tele'
            : (
              ailment.physicalconsultationCost !== null && ailment.physicalconsultationCost !== undefined
                ? 'physical'
                : ''
            ),
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
        consultationType: '',
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
    if (!currentAilment.consultationType) {
      setSnackbarMessage('Please select one consultation type.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const selectedCost =
      currentAilment.consultationType === 'tele'
        ? parseFloat(currentAilment.teleconsultationCost)
        : parseFloat(currentAilment.physicalconsultationCost);

    if (isNaN(selectedCost) || selectedCost < 0) {
      setSnackbarMessage('Please enter a valid consultation cost for the selected type.');
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
            teleconsultationCost:
              currentAilment.consultationType === 'tele'
                ? parseFloat(currentAilment.teleconsultationCost)
                : null,
            physicalconsultationCost:
              currentAilment.consultationType === 'physical'
                ? parseFloat(currentAilment.physicalconsultationCost)
                : null,
            specialization: currentAilment.specialization,
            supportsTeleconsultation: currentAilment.consultationType === 'tele',
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
          currentAilment.consultationType === 'tele'
            ? String(parseFloat(currentAilment.teleconsultationCost))
            : ''
        );
        formData.append(
          'physicalconsultationCost',
          currentAilment.consultationType === 'physical'
            ? String(parseFloat(currentAilment.physicalconsultationCost))
            : ''
        );
        formData.append('specialization', JSON.stringify(currentAilment.specialization));
        formData.append('supportsTeleconsultation', String(currentAilment.consultationType === 'tele'));
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
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
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
      width: 170,
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
      headerName: 'Video supportsTeleconsultation',
      width: 170,
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
    { field: 'specialization', headerName: 'Specializations', width: 250 },
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
          Ailments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all medical ailments and conditions.
        </Typography>
      </Grid>

      {/* Statistics Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <HealingIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" component="div">
                  {ailments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Ailments
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
            <FormControl
              component="fieldset"
              required
            >
              <FormLabel component="legend">Consultation Type (Select one)</FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentAilment.consultationType === 'physical'}
                      onChange={(e) =>
                        setCurrentAilment({
                          ...currentAilment,
                          consultationType: e.target.checked ? 'physical' : '',
                        })
                      }
                    />
                  }
                  label="Physical Consultation"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentAilment.consultationType === 'tele'}
                      onChange={(e) =>
                        setCurrentAilment({
                          ...currentAilment,
                          consultationType: e.target.checked ? 'tele' : '',
                        })
                      }
                    />
                  }
                  label="Teleconsultation"
                />
              </FormGroup>
            </FormControl>
            {currentAilment.consultationType === 'physical' && (
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
                inputProps={{ step: "0.01", min: "0" }}
              />
            )}
            {currentAilment.consultationType === 'tele' && (
              <TextField
                label="Teleconsultation Cost"
                variant="outlined"
                fullWidth
                type="number"
                value={currentAilment.teleconsultationCost}
                onChange={(e) =>
                  setCurrentAilment({ ...currentAilment, teleconsultationCost: e.target.value })
                }
                required
                inputProps={{ step: "0.01", min: "0" }}
              />
            )}
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

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
