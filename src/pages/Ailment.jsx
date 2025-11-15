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
import fetchJSON from '../utils/fetchJSON';
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
    cost: '',
    specialization: '',
  });
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
        "http://13.61.152.64:4000/api/portal/aligment/all-alignments",
        "GET"
      );
      if (response.ailments) {
        const formatted = response.ailments.map((ailment) => ({
          id: ailment._id,
          title: ailment.title,
          description: ailment.description,
          cost: ailment.cost,
          specialization: ailment.specialization?.title || ailment.specialization || 'N/A',
          specializationId: typeof ailment.specialization === 'object' ? ailment.specialization._id : ailment.specialization,
        }));
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
        "http://13.61.152.64:4000/api/portal/specialization/all-specializations",
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
        cost: ailment.cost,
        specialization: ailment.specializationId || '',
      });
    } else {
      setIsEdit(false);
      setCurrentAilment({ id: null, title: '', description: '', cost: '', specialization: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!currentAilment.title || !currentAilment.description || !currentAilment.cost || !currentAilment.specialization) {
      setSnackbarMessage('Please fill out all required fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEdit) {
        const response = await fetchJSON(
          `http://13.61.152.64:4000/api/portal/aligment/update-alignment/${currentAilment.id}`,
          "PUT",
          {
            title: currentAilment.title,
            description: currentAilment.description,
            cost: currentAilment.cost,
            specialization: currentAilment.specialization,
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
        }
      } else {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/aligment/create-alignment",
          "POST",
          {
            title: currentAilment.title,
            description: currentAilment.description,
            cost: currentAilment.cost,
            specialization: currentAilment.specialization,
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
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
          `http://13.61.152.64:4000/api/portal/aligment/delete-alignment/${id}`,
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

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'cost', headerName: 'Cost', width: 120 },
    { field: 'specialization', headerName: 'Specialization', width: 200 },
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
              label="Cost"
              variant="outlined"
              fullWidth
              type="number"
              value={currentAilment.cost}
              onChange={(e) => setCurrentAilment({ ...currentAilment, cost: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={currentAilment.specialization}
                label="Specialization"
                onChange={(e) => setCurrentAilment({ ...currentAilment, specialization: e.target.value })}
                required
              >
                {specializations.map((spec) => (
                  <MenuItem key={spec._id} value={spec._id}>
                    {spec.title}
                  </MenuItem>
                ))}
              </Select>
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
