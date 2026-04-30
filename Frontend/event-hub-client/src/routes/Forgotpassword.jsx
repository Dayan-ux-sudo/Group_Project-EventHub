import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";

export const Route = createFileRoute("/Forgotpassword")({
  component: ForgotPasswordPage,
});

const STEP = {
  EMAIL: "email",
  SENT: "sent",
  RESET: "reset",
};

function StrengthBar({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const levels = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Good", color: "#eab308" },
    { label: "Strong", color: "#22c55e" },
  ];

  const activeLevel = levels[Math.max(score - 1, 0)] || levels[0];

  return (
    <div className="mt-2">
      <div className="d-flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: level <= score ? activeLevel.color : "#d4dcf0",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </div>
      <p className="mb-0" style={{ fontSize: "0.78rem", color: activeLevel.color }}>
        {activeLevel.label} password
      </p>
    </div>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const goToLogin = () => navigate({ to: "/login" });

  const handleEmailSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    setEmailError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(STEP.SENT);
    }, 1400);
  };

  const handleResetSubmit = (event) => {
    event.preventDefault();

    if (passwords.password.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }

    if (passwords.password !== passwords.confirm) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResetDone(true);
    }, 1400);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{ background: "linear-gradient(135deg, #071426, #123069)" }}
    >
      <div
        className="row g-0 overflow-hidden rounded-5"
        style={{
          maxWidth: 1120,
          width: "100%",
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 32px 80px rgba(2, 6, 23, 0.35)",
        }}
      >
        <div
          className="col-12 col-lg-6 p-5 text-white"
          style={{ background: "linear-gradient(145deg, #0d1a34, #2454e6)" }}
        >
          <span
            className="d-inline-flex rounded-pill px-3 py-2 mb-4"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            Account recovery
          </span>

          <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)" }}>
            Recover your account with confidence.
          </h1>

          <p style={{ color: "#dbeafe", lineHeight: 1.8 }}>
            Enter your email, verify the reset link, then create a strong password to get
            back into your EventHub dashboard.
          </p>

          <div
            className="rounded-4 p-4 mt-4"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-shield-lock-fill" style={{ fontSize: "1.2rem" }}></i>
              <span className="fw-semibold">Recovery steps</span>
            </div>
            <div className="small" style={{ color: "#dbeafe", lineHeight: 1.8 }}>
              <div>1. Request a reset link with your email.</div>
              <div>2. Confirm the link from your inbox.</div>
              <div>3. Set your new password and sign in.</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 p-4 p-lg-5">
          <div className="mx-auto" style={{ maxWidth: 430 }}>
            {step === STEP.EMAIL ? (
              <>
                <div className="mb-4">
                  <div
                    className="text-uppercase fw-semibold mb-2"
                    style={{ color: "#5b75a3", letterSpacing: "0.18em", fontSize: "0.75rem" }}
                  >
                    Password reset
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: "#102745" }}>
                    Forgot your password?
                  </h2>
                  <p className="mb-0" style={{ color: "#5c6f8f" }}>
                    Enter your email address and we will send you a reset link.
                  </p>
                </div>

                {emailError ? <div className="alert alert-danger">{emailError}</div> : null}

                <form onSubmit={handleEmailSubmit} noValidate>
                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#111215", fontSize: "0.84rem", letterSpacing: "0.12em" }}
                    >
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      className="form-control py-3"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setEmailError("");
                      }}
                      placeholder="student@campus.com"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-3 fw-bold"
                    disabled={loading}
                    style={{ background: "#2454e6", color: "#fff", borderRadius: 16 }}
                  >
                    {loading ? "Sending link..." : "Send reset link"}
                  </button>
                </form>

                <p className="mt-4 mb-0 text-center" style={{ color: "#5c6f8f" }}>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 fw-semibold"
                    style={{ color: "#2454e6" }}
                    onClick={goToLogin}
                  >
                    Back to Sign In
                  </button>
                </p>
              </>
            ) : null}

            {step === STEP.SENT ? (
              <>
                <div className="text-center mb-4">
                  <div
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 72, height: 72, background: "rgba(34,197,94,0.15)" }}
                  >
                    <i className="bi bi-envelope-check-fill" style={{ color: "#16a34a", fontSize: "1.8rem" }}></i>
                  </div>
                  <div
                    className="text-uppercase fw-semibold mb-2"
                    style={{ color: "#5b75a3", letterSpacing: "0.18em", fontSize: "0.75rem" }}
                  >
                    Email sent
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: "#102745" }}>
                    Check your inbox
                  </h2>
                  <p className="mb-1" style={{ color: "#5c6f8f" }}>
                    We sent a reset link to:
                  </p>
                  <p className="fw-semibold mb-0" style={{ color: "#2454e6", wordBreak: "break-word" }}>
                    {email}
                  </p>
                </div>

                <div
                  className="rounded-4 p-3 mb-4"
                  style={{ background: "#eef3ff", border: "1px solid #d9e4ff" }}
                >
                  <div className="d-flex align-items-center gap-2 py-1" style={{ color: "#364a72" }}>
                    <i className="bi bi-1-circle"></i>
                    <span style={{ fontSize: "0.88rem" }}>Open the email from EventHub.</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 py-1" style={{ color: "#364a72" }}>
                    <i className="bi bi-2-circle"></i>
                    <span style={{ fontSize: "0.88rem" }}>Click the reset password button.</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 py-1" style={{ color: "#364a72" }}>
                    <i className="bi bi-3-circle"></i>
                    <span style={{ fontSize: "0.88rem" }}>Create your new password.</span>
                  </div>
                </div>

                
                <div className="text-center mb-2" style={{ color: "#5c6f8f", fontSize: "0.9rem" }}>
                  Did not receive it?
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    style={{ borderRadius: 12 }}
                    onClick={() => setStep(STEP.EMAIL)}
                  >
                    Resend email
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: 12 }}
                    onClick={() => {
                      setEmail("");
                      setStep(STEP.EMAIL);
                    }}
                  >
                    Try another email
                  </button>
                </div>

                <p className="mt-4 mb-0 text-center" style={{ color: "#5c6f8f" }}>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 fw-semibold"
                    style={{ color: "#2454e6" }}
                    onClick={goToLogin}
                  >
                    Back to Login
                  </button>
                </p>
              </>
            ) : null}

            {step === STEP.RESET ? (
              resetDone ? (
                <>
                  <div className="text-center mb-4">
                    <div
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: 72, height: 72, background: "rgba(34,197,94,0.15)" }}
                    >
                      <i className="bi bi-check-circle-fill" style={{ color: "#16a34a", fontSize: "1.8rem" }}></i>
                    </div>
                    <div
                      className="text-uppercase fw-semibold mb-2"
                      style={{ color: "#5b75a3", letterSpacing: "0.18em", fontSize: "0.75rem" }}
                    >
                      Success
                    </div>
                    <h2 className="fw-bold mb-2" style={{ color: "#102745" }}>
                      Password updated
                    </h2>
                    <p className="mb-0" style={{ color: "#5c6f8f" }}>
                      Your password is updated. You can sign in now.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn w-100 py-3 fw-bold"
                    style={{ background: "#2454e6", color: "#fff", borderRadius: 16 }}
                    onClick={goToLogin}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div
                      className="text-uppercase fw-semibold mb-2"
                      style={{ color: "#5b75a3", letterSpacing: "0.18em", fontSize: "0.75rem" }}
                    >
                      New password
                    </div>
                    <h2 className="fw-bold mb-2" style={{ color: "#102745" }}>
                      Set your new password
                    </h2>
                    <p className="mb-0" style={{ color: "#5c6f8f" }}>
                      Choose a strong password for {email || "your account"}.
                    </p>
                  </div>

                  {resetError ? <div className="alert alert-danger">{resetError}</div> : null}

                  <form onSubmit={handleResetSubmit} noValidate>
                    <div className="mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "#111215", fontSize: "0.84rem", letterSpacing: "0.12em" }}
                      >
                        NEW PASSWORD
                      </label>

                      <div className="input-group">
                        <input
                          type={showPw ? "text" : "password"}
                          className="form-control py-3"
                          placeholder="At least 8 characters"
                          value={passwords.password}
                          onChange={(event) => {
                            setPasswords((current) => ({ ...current, password: event.target.value }));
                            setResetError("");
                          }}
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPw((value) => !value)}
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>

                      {passwords.password ? <StrengthBar password={passwords.password} /> : null}
                    </div>

                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "#111215", fontSize: "0.84rem", letterSpacing: "0.12em" }}
                      >
                        CONFIRM PASSWORD
                      </label>

                      <div className="input-group">
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="form-control py-3"
                          placeholder="Re-enter your new password"
                          value={passwords.confirm}
                          onChange={(event) => {
                            setPasswords((current) => ({ ...current, confirm: event.target.value }));
                            setResetError("");
                          }}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirm((value) => !value)}
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>

                      {passwords.confirm && passwords.confirm === passwords.password ? (
                        <p className="mt-2 mb-0" style={{ color: "#16a34a", fontSize: "0.84rem" }}>
                          Passwords match
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-3 fw-bold"
                      disabled={loading}
                      style={{ background: "#2454e6", color: "#fff", borderRadius: 16 }}
                    >
                      {loading ? "Updating password..." : "Update password"}
                    </button>
                  </form>

                  <p className="mt-4 mb-0 text-center" style={{ color: "#5c6f8f" }}>
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none p-0 fw-semibold"
                      style={{ color: "#2454e6" }}
                      onClick={goToLogin}
                    >
                      Back to Login
                    </button>
                  </p>
                </>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
