import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import fetchJSON from "../utils/fetchJSON";
import { fetchFormData } from "../utils/fetchFormData";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { usePermissions } from "../utils/usePermissions";

export default function Adverts() {
  const { canRead, canWrite, canDelete } = usePermissions();

  const [adverts, setAdverts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const [currentAdvertId, setCurrentAdvertId] = useState(null);

  const [newDescription, setNewDescription] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (canRead) {
      fetchAdverts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  const fetchAdverts = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/portal/adverts/retrieve-all-adverts",
        "GET"
      );
      if (response.adverts) {
        setAdverts(response.adverts);
      }
    } catch (error) {
      console.error("Error fetching adverts:", error);
      toast.error("Failed to load adverts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setCurrentAdvertId(null);
    setNewDescription("");
    setNewImageFile(null);
    setCreateDialogOpen(true);
  };

  const handleCreateAdvert = async () => {
    if (!newDescription || !newImageFile) {
      setSnackbarMessage("Description and image are required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("description", newDescription);
    formData.append("image", newImageFile);

    try {
      const response = await fetchFormData(
        "https://apihealthconnect.kopanovertex.com/api/portal/adverts/create-adverts",
        "POST",
        formData
      );

      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Advert created successfully.");
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
      setCreateDialogOpen(false);
      setNewDescription("");
      setNewImageFile(null);
      fetchAdverts();
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to create advert.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const openEditDialog = (advert) => {
    setCurrentAdvertId(advert._id);
    setNewDescription(advert.description || "");
    setEditDialogOpen(true);
  };

  const handleUpdateDescription = async () => {
    if (!newDescription) {
      setSnackbarMessage("Description is required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetchJSON(
        `https://apihealthconnect.kopanovertex.com/api/portal/adverts/update-description/${currentAdvertId}`,
        "PATCH",
        { description: newDescription }
      );

      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Advert updated successfully.");
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
      setEditDialogOpen(false);
      setNewDescription("");
      fetchAdverts();
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to update description.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const openImageDialog = (advert) => {
    setCurrentAdvertId(advert._id);
    setNewImageFile(null);
    setImageDialogOpen(true);
  };

  const handleUpdateImage = async () => {
    if (!newImageFile) {
      setSnackbarMessage("Please select an image.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("image", newImageFile);

    try {
      const response = await fetchFormData(
        `https://apihealthconnect.kopanovertex.com/api/portal/adverts/update-image/${currentAdvertId}`,
        "PATCH",
        formData
      );

      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Advert image updated successfully.");
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
      setImageDialogOpen(false);
      setNewImageFile(null);
      fetchAdverts();
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to update image.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this advert?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetchJSON(
        `https://apihealthconnect.kopanovertex.com/api/portal/adverts/remove-advert/${id}`,
        "DELETE"
      );

      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Advert deleted successfully.");
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
      fetchAdverts();
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to delete advert.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Adverts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage portal adverts (create, update and delete).
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h5">All Adverts</Typography>
              {canWrite && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                >
                  Add New Advert
                </Button>
              )}
            </Stack>

            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
              </Box>
            ) : adverts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No adverts available.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {adverts.map((advert) => (
                  <Grid item xs={12} sm={6} md={4} key={advert._id}>
                    <Card>
                      {advert.image && (
                        <CardMedia
                          component="img"
                          height="160"
                          image={`https://apihealthconnect.kopanovertex.com/adverts/${advert.image}`}
                          alt={advert.description}
                        />
                      )}
                      <CardContent>
                        <Typography
                          variant="body1"
                          gutterBottom
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {advert.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {canWrite && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(advert)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => openImageDialog(advert)}
                              >
                                <ImageIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(advert._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Create advert dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Advert</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
            />
            <Button variant="outlined" component="label">
              Choose Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewImageFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
            {newImageFile && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {newImageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAdvert}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit description dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Advert Description</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateDescription}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update image dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Advert Image</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Button variant="outlined" component="label">
              Choose Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewImageFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
            {newImageFile && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {newImageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateImage}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
