import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { authAPI, setStoredUser } from "../api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = () => {
    navigate({ to: "/Forgotpassword" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(form);
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      setStoredUser(response.data.user);
      navigate({ to: response.data.user.role === "student" ? "/explore" : "/Host" });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5" style={{ background: "linear-gradient(135deg, #071426, #123069)" }}>
      <div className="row g-0 overflow-hidden rounded-5" style={{ maxWidth: 1120, width: "100%", background: "rgba(255,255,255,0.94)", boxShadow: "0 32px 80px rgba(2, 6, 23, 0.35)" }}>
        <div className="col-12 col-lg-6 p-5 text-white" style={{ background: "linear-gradient(145deg, #0d1a34, #2454e6)" }}>
          <span className="d-inline-flex rounded-pill px-3 py-2 mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>EventHub access</span>
          <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}>Step into the campus event network.</h1>
          <p style={{ color: "#dbeafe", lineHeight: 1.8 }}>
            Students discover events instantly. Organizers manage school-specific programs. Superusers oversee the campus-wide experience from one dashboard.
          </p>
        </div>

        <div className="col-12 col-lg-6 p-4 p-lg-5">
          <div className="mx-auto" style={{ maxWidth: 420 }}>
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ color: "#5b75a3", letterSpacing: "0.18em", fontSize: "0.75rem" }}>Login</div>
              <h2 className="fw-bold mb-2" style={{ color: "#102745" }}>Welcome back</h2>
              <p className="mb-0" style={{ color: "#5c6f8f" }}>Use your registration details to access your EventHub dashboard.</p>
            </div>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "#111215", fontSize: "0.84rem", letterSpacing: "0.12em" }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  className="form-control py-3"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: "#5b75a3", fontSize: "0.84rem", letterSpacing: "0.12em" }}>PASSWORD</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control py-3"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((value) => !value)}>
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="btn btn-link p-0 text-decoration-none fw-semibold"
                    style={{ color: "#2454e6", fontSize: "0.9rem" }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button type="submit" className="btn w-100 py-3 fw-bold" disabled={loading} style={{ background: "#2454e6", color: "#fff", borderRadius: 16 }}>
                {loading ? "Logging in..." : "Login to EventHub"}
              </button>
            </form>

            <p className="mt-4 mb-0" style={{ color: "#5c6f8f" }}>
              New here? <Link to="/register" className="fw-semibold text-decoration-none">Create your account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
