import React, { useState } from "react";
import "../assets/css/AdminLogin.css";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchOAuthToken } from "../utils/fectchOAuthToken";

function SubmitEmail() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const serverToken = useSelector((state) => state.server.serverToken);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");

    if (validateForm()) {
      const tokenData = await fetchOAuthToken();
      if (tokenData.access_token) {
        try {
          setIsSubmitting(true);
          const response = await fetch("https://dt.mtc.com.na:4000/auth/admin/forgot-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenData.access_token}`,
            },
            body: JSON.stringify({
              email
            }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
              setIsSubmitting(false);
              setEmail("");
              toast.success(data.message);
              
          } else {
            setIsSubmitting(false);
            toast.error("Username not found in our database. Verify username and try again!");
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

  const validateForm = () => {
    let valid = true;
    if (!email) {
      setEmailError("Username is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Username is invalid");
      valid = false;
    }
    return valid;
  };
  return (
    <div className="login-container">
      <div className="login-wrapper-centered">
        <div className="login-form-section">
          <div className="login-form-wrapper">
            
            <div className="login-card">
              <form onSubmit={handleSubmit} className="auth-form">
                <h2>Reset Password</h2>
                <p className="auth-subtitle">
                  Enter your email address below. If we find your account, 
                  we'll send password reset instructions to your email.
                </p>

                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
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

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="loader"></div>
                  ) : (
                    "Submit"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="back-button"
                >
                  {/* <ArrowBackIosNewIcon sx={{ fontSize: 16, marginRight: 1 }} /> */}
                  Back to Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitEmail;