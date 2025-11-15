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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import fetchJSON from '../utils/fetchJSON';
import { toast } from 'react-toastify';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState({
    id: null,
    question: '',
    answer: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    let filtered = faqs;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question?.toLowerCase().includes(lowercasedQuery) ||
          faq.answer?.toLowerCase().includes(lowercasedQuery)
      );
    }
    setFilteredFaqs(filtered);
  }, [faqs, searchQuery]);

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        "http://13.61.152.64:4000/api/portal/faq/all-faq",
        "GET"
      );
      if (response.faqs) {
        const formatted = response.faqs.map((faq) => ({
          id: faq._id,
          question: faq.question,
          answer: faq.answer,
        }));
        setFaqs(formatted);
        setFilteredFaqs(formatted);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to load FAQs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (faq = null) => {
    if (faq) {
      setIsEdit(true);
      setCurrentFAQ(faq);
    } else {
      setIsEdit(false);
      setCurrentFAQ({ id: null, question: '', answer: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!currentFAQ.question || !currentFAQ.answer) {
      setSnackbarMessage('Please fill out all required fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEdit) {
        const response = await fetchJSON(
          `http://13.61.152.64:4000/api/portal/faq/update-faq/${currentFAQ.id}`,
          "PUT",
          {
            question: currentFAQ.question,
            answer: currentFAQ.answer,
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchFAQs();
        }
      } else {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/faq/create-faq",
          "POST",
          {
            question: currentFAQ.question,
            answer: currentFAQ.answer,
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchFAQs();
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
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const response = await fetchJSON(
          `http://13.61.152.64:4000/api/portal/faq/delete-faq/${id}`,
          "DELETE"
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchFAQs();
        }
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete FAQ.');
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: 'question', headerName: 'Question', width: 300 },
    {
      field: 'answer',
      headerName: 'Answer',
      width: 400,
      renderCell: (params) => (
        <Typography variant="body2" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {params.value}
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
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          FAQs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage frequently asked questions and answers.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5">All FAQs</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add New FAQ
              </Button>
            </Stack>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Search FAQs"
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
                  rows={filteredFaqs}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[25, 50, 100]}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Question"
              variant="outlined"
              fullWidth
              value={currentFAQ.question}
              onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
              required
            />
            <TextField
              label="Answer"
              variant="outlined"
              fullWidth
              multiline
              rows={6}
              value={currentFAQ.answer}
              onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
              required
            />
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
