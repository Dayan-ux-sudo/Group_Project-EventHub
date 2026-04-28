import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { authAPI, eventsAPI } from "../api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    school: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      const response = await eventsAPI.getSchools();
      setSchools(Array.isArray(response.data) ? response.data : response.data.results || []);
    };

    fetchSchools();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authAPI.register({
        full_name: form.full_name,
        email: form.email,
        school: form.school || null,
        password: form.password,
      });
      navigate({ to: "/login" });
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5" style={{ background: "linear-gradient(135deg, #071426, #123069)" }}>
      <div className="row g-0 overflow-hidden rounded-5" style={{ maxWidth: 1180, width: "100%", background: "rgba(255,255,255,0.95)", boxShadow: "0 32px 80px rgba(2, 6, 23, 0.35)" }}>
        <div className="col-12 col-lg-6 p-5 text-white" style={{ background: "linear-gradient(155deg, #123069, #38bdf8)" }}>
          <span className="d-inline-flex rounded-pill px-3 py-2 mb-4" style={{ background: "rgba(145, 138, 138, 0.12)" }}>Join EventHub</span>
          <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2.2rem, 4vw, 3.7rem)" }}>Register once, then move through campus life with clarity.</h1>
          <p style={{ color: "#e0f2fe", lineHeight: 1.8 }}>
            After registration an enrollment token is sent to your email confirming that you have successfully enrolled to EventHub-Campus Event Management System.
          </p>
        </div>

        <div className="col-12 col-lg-6 p-4 p-lg-5">
          <div className="mx-auto" style={{ maxWidth: 430 }}>
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ color: "#5b75a3", letterSpacing: "0.18em", fontSize: "0.75rem" }}>Register</div>
              <h2 className="fw-bold mb-2" style={{ color: "#102745" }}>Create your account</h2>
              <p className="mb-0" style={{ color: "#5c6f8f" }}>Your details will appear later in the avatar dropdown profile summary.</p>
            </div>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full name</label>
                <input className="form-control  py-3  opacity-100 text-black" value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email address</label>
                <input type="email" className="form-control py-3 opacity-100 text-black" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">School</label>
                <select className="form-select py-3 opacity-100 text-black" value={form.school} onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))}>
                  <option value="">Select your school</option>
                  {schools.map((school) => (
                    <option key={school.code} value={school.code}>{school.code} - {school.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input type="password" className="form-control py-3" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm password</label>
                <input type="password" className="form-control py-3" value={form.confirm} onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))} required />
              </div>

              <button type="submit" className="btn w-100 py-3 fw-bold" disabled={loading} style={{ background: "#2454e6", color: "#fff", borderRadius: 16 }}>
                {loading ? "Creating account..." : "Create EventHub account"}
              </button>
            </form>

            <p className="mt-4 mb-0" style={{ color: "#5c6f8f" }}>
              Already have an account? <Link to="/login" className="fw-semibold text-decoration-none">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
