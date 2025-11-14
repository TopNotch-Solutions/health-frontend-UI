import React, { useEffect, useState } from "react";
import "../assets/css/AdminLogin.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";
import { toggleSidebarfalse } from "../redux/reducers/sidebarReducer";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOAuthToken } from "../utils/fectchOAuthToken";

function ForgotPassword() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [passwordConfirmShown, setPasswordConfirmShown] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const token = queryParams.get('token');
  const serverToken = useSelector((state) => state.server.serverToken);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleSidebarfalse());
  }, []);

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };
  const toggleConfirmPassword = () => {
    setPasswordConfirmShown(!passwordConfirmShown);
  };

  const validateForm = () => {
    let valid = true;
    if (password.length <= 7) {
      setPasswordError("Chacters should not be less than 8");
      valid = false;
    }
    if (confirmPassword.length <= 7) {
      setConfirmPasswordError("Chacters should not be less than 8");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Confirm password does not match is password");
      valid = false;
    }
    return valid;
  };
  console.log(userId,token)
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setConfirmPasswordError("");
    setPasswordError("");

    if (validateForm()) {
      const tokenData = await fetchOAuthToken();
      if (tokenData.access_token) {
        try {
          setIsSubmitting(true);
          const response = await fetch("https://dt.mtc.com.na:4000/auth/admin/newPassword", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenData.access_token}`
            },
            
            body: JSON.stringify({
              newPassword:password,
              confirmPassword,
              token,
              userId
            }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            setIsSubmitting(false);
            setPassword("");
            setConfirmPassword("");
            setSuccess(true);
            toast.success(data.message);
          } else {
            setIsSubmitting(false);
            toast.error(data.message);
          }
        } catch (error) {
          setIsSubmitting(false);
          toast.error(
            "Network error. Please check your network connection and try again",
            "Please check your network connection and try again"
          );
        }
      }
      
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper-centered">
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <h1 className="login-title">IN4MSME Portal</h1>
            
            <div className="login-card">
              {success ? (
                <div className="auth-form text-center">
                  <h2>Password Reset Successful!</h2>
                  <p className="auth-subtitle">
                    Your password has been successfully updated.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="back-button"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="auth-form">
                  <h2>Create New Password</h2>
                  <p className="auth-subtitle">
                    Please enter your new password below
                  </p>

                  <div className="form-field">
                    <label>New Password</label>
                    <div className="password-input">
                      <input
                        type={passwordShown ? "text" : "password"}
                        value={password}
                        placeholder="Enter new password"
                        onChange={(e) => {
                          setPasswordError("");
                          setPassword(e.target.value);
                        }}
                        className={passwordError ? "error-input" : ""}
                      />
                      <button 
                        type="button"
                        className="toggle-password"
                        onClick={togglePassword}
                      >
                        {passwordShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </button>
                    </div>
                    {passwordError && (
                      <span className="error-message">{passwordError}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>Confirm Password</label>
                    <div className="password-input">
                      <input
                        type={passwordConfirmShown ? "text" : "password"}
                        value={confirmPassword}
                        placeholder="Confirm new password"
                        onChange={(e) => {
                          setConfirmPasswordError("");
                          setConfirmPassword(e.target.value);
                        }}
                        className={confirmPasswordError ? "error-input" : ""}
                      />
                      <button 
                        type="button"
                        className="toggle-password"
                        onClick={toggleConfirmPassword}
                      >
                        {passwordConfirmShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <span className="error-message">{confirmPasswordError}</span>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="loader"></div>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
