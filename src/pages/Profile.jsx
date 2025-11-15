import { React, useState, useRef, useEffect } from "react";
import "../assets/css/profile.css"; // Keep original CSS for custom styles
import { useTheme, useMediaQuery, createTheme, ThemeProvider } from "@mui/material";
import profile from "../assets/images/blank-profile-picture-973460_960_720.webp";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Stack from "@mui/material/Stack";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useDispatch, useSelector } from "react-redux";
import { login, updateUser } from "../redux/reducers/authReducer";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import fetchJSON from "../utils/fetchJSON";
import { fetchFormData } from "../utils/fetchFormData";

// Create a custom MUI theme for a cohesive look
const theme = createTheme({
  palette: {
    primary: {
      main: '#1674BB', // Using the original blue
    },
    secondary: {
      main: '#6c757d', // A new secondary color
    },
    success: {
      main: '#282926', // Success green
    },
    error: {
      main: '#dc3545', // Error red
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function Profile() {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [currentPasswordShown, setCurrentPasswordShown] = useState(false);
  const [newPasswordShown, setNewPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const [profilePic, setProfilePic] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [contactNumber, setContactNumber] = useState(currentUser?.cellphoneNumber || "");
  const [department, setDepartment] = useState(currentUser?.department || "");
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setEmail(currentUser.email || "");
      setContactNumber(currentUser.cellphoneNumber || "");
      setDepartment(currentUser.department || "");
      if (currentUser.profileImage) {
        setProfilePic(`http://13.61.152.64:4000/images/${currentUser.profileImage}`);
      }
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (!allowedExtensions.exec(file.name)) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: `Please upload a valid image file with .jpg, .jpeg, or .png extension.`,
          showConfirmButton: false,
          timer: 4000,
        });
        setSelectedFile(null);
        return;
      }

      if (!validMimeTypes.includes(file.type)) {
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setNewProfilePic(URL.createObjectURL(file));
    }
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setNewProfilePic("");
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !currentUser?._id) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const response = await fetchFormData(
        `http://13.61.152.64:4000/api/portal/auth/upload-profile-image/${currentUser._id}`,
        "PATCH",
        formData
      );

      if (response.status === true && response.user) {
        dispatch(updateUser({ user: response.user }));
        setProfilePic(`http://13.61.152.64:4000/images/${response.user.profileImage}`);
        Swal.fire({
          position: "center",
          icon: "success",
          title: response.message || "Profile image uploaded successfully!",
          showConfirmButton: false,
          timer: 4000,
        });
        setSelectedFile(null);
        setNewProfilePic("");
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: response?.message || "Failed to upload profile image. Please try again.",
          showConfirmButton: false,
          timer: 4000,
        });
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: error.message || "Failed to upload profile image. Please try again.",
        showConfirmButton: false,
        timer: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCameraClick = () => {
    inputRef.current.click();
  };

  const handlePasswordChange = async () => {
    if (!currentUser?._id) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "User information not available. Please log in again.",
        showConfirmButton: false,
        timer: 4000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Passwords do not match!",
        showConfirmButton: false,
        timer: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchJSON(
        `http://13.61.152.64:4000/api/portal/auth/update-password/${currentUser._id}`,
        "PUT",
        { currentPassword, newPassword, confirmPassword }
      );

      if (response.status === true) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: response.message || "Password changed successfully!",
          showConfirmButton: false,
          timer: 4000,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: response?.message || "Failed to change password. Please try again.",
          showConfirmButton: false,
          timer: 4000,
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: error.message || "Failed to change password. Please try again.",
        showConfirmButton: false,
        timer: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserDetailsChange = async () => {
    if (!currentUser?._id) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "User information not available. Please log in again.",
        showConfirmButton: false,
        timer: 4000,
      });
      return;
    }

    if (!firstName || !lastName || !email || !contactNumber || !department) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Input fields cannot be empty",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (
      firstName === currentUser.firstName &&
      lastName === currentUser.lastName &&
      email === currentUser.email &&
      contactNumber === currentUser.cellphoneNumber &&
      department === currentUser.department
    ) {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "You have not made any changes",
        showConfirmButton: false,
        timer: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchJSON(
        `http://13.61.152.64:4000/api/portal/auth/update-user/${currentUser._id}`,
        "PUT",
        { firstName, lastName, email, cellphoneNumber: contactNumber, department }
      );

      if (response.status === true && response.user) {
        dispatch(updateUser({ user: response.user }));
        Swal.fire({
          position: "center",
          icon: "success",
          title: response.message || "Details updated successfully!",
          showConfirmButton: false,
          timer: 4000,
        });
        setIsEditing(false);
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: response?.message || "Failed to update user details. Please try again.",
          showConfirmButton: false,
          timer: 4000,
        });
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: error.message || "Failed to update user details. Please try again.",
        showConfirmButton: false,
        timer: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const departmentsOption = [
    { value: "Human Resources" },
    { value: "Finance" },
    { value: "Marketing" },
    { value: "Sales" },
    { value: "Operations" },
    { value: "Information Technology" },
    { value: "Research and Development" },
    { value: "Customer Service" },
    { value: "Legal" },
    { value: "Administration" },
  ];

  return (
    <ThemeProvider theme={theme}>
      {isSubmitting ? (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
          <Grid item xs={12}>
            <Typography gutterBottom>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your personal information and account settings.
            </Typography>
          </Grid>

          {/* Profile and Role Section */}
          <Grid item xs={12} md={4}>
            <Card raised sx={{ p: 2 }}>
              <CardContent>
                <Stack direction="column" spacing={3} alignItems="center">
                  <div style={{ position: 'relative' }}>
                    <img
                      src={selectedFile ? newProfilePic : profilePic || profile}
                      alt="Profile"
                      style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        padding: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                      }}
                      onClick={selectedFile ? clearFileInput : handleCameraClick}
                    >
                      {selectedFile ? <CloseIcon color="primary" /> : <CameraAltIcon color="primary" />}
                    </div>
                    <input type="file" style={{ display: "none" }} ref={inputRef} onChange={handleFileChange} />
                  </div>
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    {currentUser?.firstName || ""} {currentUser?.lastName || ""}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Role: {currentUser?.role || ""}
                  </Typography>
                  {selectedFile && (
                    <Button variant="contained" color="success" onClick={handleFileUpload}>
                      Upload Image
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information Section */}
          <Grid item xs={12} md={8}>
            <Card raised sx={{ p: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Personal Information</Typography>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outlined"
                    color={isEditing ? 'error' : 'primary'}
                    endIcon={isEditing ? <DeleteIcon /> : <EditIcon />}
                  >
                    {isEditing ? "Undo" : "Edit"}
                  </Button>
                </Stack>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={!isEditing}
                    >
                      {departmentsOption.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  {isEditing && (
                    <Grid item xs={12} sm={6}>
                     <Button
                    variant="contained"
                    color="success"
                    onClick={handleUserDetailsChange}
                    fullWidth
                    sx={{ p: 1.8 }}
                  >
                    Save Changes
                  </Button>
                  </Grid>
                  )}
                  
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Information Section */}
          <Grid item xs={12}>
            <Card raised sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">Security Information</Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={currentPasswordShown ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button onClick={() => setCurrentPasswordShown(!currentPasswordShown)}>
                              {currentPasswordShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}></Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={newPasswordShown ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button onClick={() => setNewPasswordShown(!newPasswordShown)}>
                              {newPasswordShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}></Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={confirmPasswordShown ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button onClick={() => setConfirmPasswordShown(!confirmPasswordShown)}>
                              {confirmPasswordShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                {currentPassword && newPassword && confirmPassword && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handlePasswordChange}
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Change Password
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </ThemeProvider>
  );
}

export default Profile;