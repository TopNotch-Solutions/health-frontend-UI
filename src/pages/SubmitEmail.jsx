import React, { useState } from "react";
import "../assets/css/AdminLogin.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import fetchJSON from "../utils/fetchJSON";

function SubmitEmail() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Public endpoint — no auth token; usable by users who are not logged in
      const accountCheck = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/auth/check-account",
        "POST",
        { email }
      );

      if (!accountCheck.exists) {
        toast.error(
          accountCheck.message || "No account found with this email."
        );
        return;
      }

      const data = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/auth/admin/forgot-password",
        "POST",
        { email }
      );

      setEmail("");
      toast.success(
        data.message ||
          "Password reset instructions have been sent to your email."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Network error. Please check your network connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  onClick={() => navigate("/")}
                  className="back-button"
                >
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
