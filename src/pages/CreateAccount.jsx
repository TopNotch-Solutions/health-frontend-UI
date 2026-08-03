import React, { useEffect, useState } from "react";
import "../assets/css/AdminLogin.css";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { toggleSidebarfalse } from "../redux/reducers/sidebarReducer";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import fetchJSON from "../utils/fetchJSON";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleSidebarfalse());
  }, [dispatch]);

  const validateForm = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setAccountStatus(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Public endpoint — no auth token required
      const result = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/auth/check-account",
        "POST",
        { email }
      );

      setAccountStatus(result);

      if (result.exists) {
        toast.success(result.message || "Account found.");
      } else {
        toast.error(
          result.message || "No account found with this email."
        );
      }
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to check account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="login-wrapper-centered">
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-card">
              <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Check an account</h2>
                <p className="auth-subtitle">
                  Enter your email to check whether an account already exists
                </p>

                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    placeholder="example@healthconnect.com.na"
                    onChange={(e) => {
                      setEmailError("");
                      setAccountStatus(null);
                      setEmail(e.target.value);
                    }}
                    className={emailError ? "error-input" : ""}
                    disabled={isSubmitting}
                  />
                  {emailError && (
                    <span className="error-message">{emailError}</span>
                  )}
                </div>

                {accountStatus && (
                  <div
                    className="form-field"
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: 8,
                      backgroundColor: accountStatus.exists
                        ? "rgba(0, 149, 72, 0.08)"
                        : "rgba(220, 38, 38, 0.08)",
                      color: accountStatus.exists ? "#009548" : "#dc2626",
                      fontSize: "0.9rem",
                    }}
                  >
                    {accountStatus.message ||
                      (accountStatus.exists
                        ? "Account found."
                        : "No account found with this email.")}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-button submit-button-green"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="loader"></div>
                  ) : (
                    "Check account"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
