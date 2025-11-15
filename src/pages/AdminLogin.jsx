import React, { useEffect, useState } from "react";
import "../assets/css/AdminLogin.css";
import logo from "../assets/images/in4logo.png";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";
import { toggleSidebarTrue } from "../redux/reducers/sidebarReducer";
import { toggleSidebarfalse } from "../redux/reducers/sidebarReducer";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateServerToken } from "../redux/reducers/serverReducer";
import { login } from "../redux/reducers/authReducer";
import { toggleActiveTab } from "../redux/reducers/tabsReducer";
import fetchJSON from "../utils/fetchJSON";

const AdminLogin = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleSidebarfalse());
    dispatch(toggleActiveTab({ activeTab: 1 }));
    dispatch(updateServerToken({ serverToken: "" }));
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberPassword(true);
    }
  }, []);
  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const validateForm = () => {
    let valid = true;
    if (!email) {
      setEmailError("Username is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Username is invalid");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    if (rememberPassword) {
      localStorage.setItem("rememberedEmail", email);
      localStorage.setItem("rememberedPassword", password);
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
    }

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetchJSON(
          "http://13.61.152.64:4000/api/portal/auth/login",
          "POST",
          {
            email,
            password,
          }
        );

        // Handle successful login
        if (response.status === true && response.user) {
          toast.success(response.message || "Login successful!");
          dispatch(toggleSidebarTrue());
          dispatch(
            login({
              user: response.user,
            })
          );
          navigate("/Dashboard");
        } else {
          // Handle login failure with status false
          const errorMessage = response.message || "Login failed. Please try again.";
          toast.error(errorMessage);
        }
      } catch (error) {
        // Handle network errors and API errors
        const errorMessage = error.message || "An error occurred during login. Please try again.";
        toast.error(errorMessage);
        console.error("Login error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left side with logo */}
        <div className="login-logo-section">
          <img src={logo} alt="IN4MSME Logo" className="login-logo" />
        </div>

        {/* Right side with forms */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-card">
              <form className="auth-form">
                <h2>Sign in to account</h2>
                <p className="auth-subtitle">
                  Welcome back! Please sign in to continue
                </p>

                <div className="form-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={email || ""}
                    placeholder="example@healthconnect.com.na"
                    onChange={(e) => {
                      setEmailError("");
                      setEmail(e.target.value);
                    }}
                    className={emailError ? "error-input" : ""}
                  />
                  {emailError && (
                    <span className="error-message">{emailError}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type={passwordShown ? "text" : "password"}
                      value={password || ""}
                      placeholder="Enter your password"
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
                      {passwordShown ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <span className="error-message">{passwordError}</span>
                  )}
                </div>

                <div className="form-actions">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberPassword}
                      onChange={() => setRememberPassword(!rememberPassword)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => navigate("/Submit")}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <div className="loader"></div> : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
