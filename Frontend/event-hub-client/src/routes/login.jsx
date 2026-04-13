import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { authAPI } from "../api";

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
 
function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
 
    try {
      const response = await authAPI.login(form);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Dispatch a custom event to notify navbar of login
      window.dispatchEvent(new Event('auth-changed'));
      
      navigate({ to: "/explore" });
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const inputStyle = {
    background: "#1e2235",
    border: "1px solid #2a3050",
    color: "#f1f5f9",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: "0.95rem",
  };
 
  const focusStyle = `
    .auth-input:focus {
      background: #1e2235 !important;
      border-color: #1337ec !important;
      box-shadow: 0 0 0 3px #f1f5f9 !important; 
      color: #f1f5f9 !important;
    }
    .auth-input::placeholder { color: #475569 !important; }
    .auth-input { transition: border-color 0.2s, box-shadow 0.2s; }
  `;
 
  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: "#280760" }}
    >
      <style>{focusStyle}</style>
 
      {/* Top bar */}
      <div
        className="px-4 px-lg-5 py-4 d-flex align-items-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{ width: 34, height: 34, background: "#95a5f6" }}
          >
            <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "1rem" }}></i>
          </div>
          <span className="fw-bold text-white fs-5">EventHub</span>
        </div>
      </div>
 
      {/* Main content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center px-3 py-5">
        <div className="w-100" style={{ maxWidth: 460 }}>
 
          {/* Card */}
          <div
            className="rounded-4 p-4 p-lg-5"
            style={{
              background: "#131621",
              border: "1px solid #1e2235",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="mx-auto mb-3 rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 56, height: 56, background: "rgba(19,55,236,0.15)" }}
              >
                <i className="bi bi-person-fill text-primary fs-3"></i>
              </div>
              <h4 className="text-white fw-bold mb-1">Welcome back</h4>
              <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                Sign in to access your event dashboard
              </p>
            </div>
 
            {/* Error alert */}
            {error && (
              <div
                className="rounded-3 p-3 mb-4 d-flex align-items-start gap-2"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <i className="bi bi-exclamation-circle-fill text-danger mt-1" style={{ fontSize: "0.9rem" }}></i>
                <span className="text-danger" style={{ fontSize: "0.85rem" }}>{error}</span>
              </div>
            )}
 
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold" style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}>
                  EMAIL ADDRESS
                </label>
                <div className="position-relative">
                  <span
                    className="position-absolute d-flex align-items-center"
                    style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}
                  >
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control auth-input w-100"
                    placeholder="your@email.com"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
 
              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-secondary fw-semibold mb-0" style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}>
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/Forgotpassword" })}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#264dfa",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="position-relative">
                  <span
                    className="position-absolute d-flex align-items-center"
                    style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}
                  >
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control auth-input w-100"
                    placeholder="Enter your password"
                    style={{ ...inputStyle, paddingLeft: 42, paddingRight: 44 }}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="position-absolute border-0 bg-transparent d-flex align-items-center"
                    style={{ right: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>
 
          
 
              {/* Submit */}
              <button
                type="submit"
                className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
                style={{
                  background: loading ? "#0f2aaa" : "#1337ec",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(19,55,236,0.4)",
                  transition: "background 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>
 
                     
 
            {/* Register link */}
            <p className="text-center text-secondary mt-4 mb-0" style={{ fontSize: "0.88rem" }}>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default LoginPage;
      