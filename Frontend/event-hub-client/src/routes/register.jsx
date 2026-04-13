import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { authAPI } from "../api";

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await authAPI.register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      // After registration, redirect to login
      navigate({ to: "/login" });
    } catch (err) {
      setError("Registration failed. Please try again.");
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
      box-shadow: 0 0 0 3px rgba(19,55,236,0.2) !important;
      color: #f1f5f9 !important;
    }
    .auth-input::placeholder { color: #475569 !important; }
  `;

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "#101322" }}>
      <style>{focusStyle}</style>

      {/* Top bar */}
      <div
        className="px-4 px-lg-5 py-4 d-flex align-items-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{ width: 34, height: 34, background: "#1337ec" }}
          >
            <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "1rem" }}></i>
          </div>
          <span className="fw-bold text-white fs-5">EventHub</span>
        </div>
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center px-3 py-5">
        <div className="w-100" style={{ maxWidth: 460 }}>
          <div
            className="rounded-4 p-4 p-lg-5"
            style={{
              background: "#151929",
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
                <i className="bi bi-person-plus-fill text-primary fs-3"></i>
              </div>
              <h4 className="text-white fw-bold mb-1">Create your account</h4>
              <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                Join thousands of students on CampusEvents
              </p>
            </div>

            {/* Error */}
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
              {/* Full name */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}>
                  FULL NAME
                </label>
                <div className="position-relative">
                  <span className="position-absolute d-flex align-items-center" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="full_name"
                    className="form-control auth-input w-100"
                    placeholder="John Paul"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}>
                  EMAIL ADDRESS
                </label>
                <div className="position-relative">
                  <span className="position-absolute d-flex align-items-center" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control auth-input w-100"
                    placeholder="student@campus.com"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}>
                  PASSWORD
                </label>
                <div className="position-relative">
                  <span className="position-absolute d-flex align-items-center" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control auth-input w-100"
                    placeholder="Min. 6 characters"
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
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="d-flex gap-1 mb-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded-pill flex-grow-1"
                          style={{
                            height: 4,
                            background: i <= strength ? strengthColor[strength] : "#1e2235",
                            transition: "background 0.3s",
                          }}
                        ></div>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: strengthColor[strength] }}>
                      {strengthLabel[strength]} password
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}>
                  CONFIRM PASSWORD
                </label>
                <div className="position-relative">
                  <span className="position-absolute d-flex align-items-center" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm"
                    className="form-control auth-input w-100"
                    placeholder="Re-enter your password"
                    style={{
                      ...inputStyle,
                      paddingLeft: 42,
                      borderColor: form.confirm && form.confirm !== form.password ? "#ef4444" : "#2a3050",
                    }}
                    value={form.confirm}
                    onChange={handleChange}
                    required
                  />
                  {form.confirm && (
                    <span className="position-absolute d-flex align-items-center" style={{ right: 14, top: "50%", transform: "translateY(-50%)" }}>
                      <i
                        className={`bi ${form.confirm === form.password ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"}`}
                        style={{ fontSize: "0.9rem" }}
                      ></i>
                    </span>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="d-flex align-items-start gap-2 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="form-check-input mt-1"
                  style={{ background: "#1e2235", borderColor: "#2a3050", width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
                  required
                />
                <label htmlFor="terms" className="text-secondary mb-0" style={{ fontSize: "0.82rem", cursor: "pointer", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <a href="#" className="text-primary text-decoration-none">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
                </label>
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
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check-fill"></i>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-secondary mt-4 mb-0" style={{ fontSize: "0.88rem" }}>
              Already have an account?{" "}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div
        className="text-center py-3 text-secondary"
        style={{ fontSize: "0.78rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        © 2024 CampusEvents. All rights reserved.
      </div>
    </div>
  );
}

export default RegisterPage;