import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState } from "react";

export const Route = createFileRoute('/Forgotpassword')({
  component: ForgotPasswordPage,
})

const STEP = {
  EMAIL: "email",
  CODE: "code",
  RESET: "reset",
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Global styles (injected once via <style>) ────────────────────────────────
const globalStyles = `
  .auth-input:focus {
    background: #1e2235 !important;
    border-color: #1337ec !important;
    box-shadow: 0 0 0 3px rgba(19,55,236,0.2) !important;
    color: #f1f5f9 !important;
  }
  .auth-input::placeholder { color: #475569 !important; }
  .auth-input { transition: border-color 0.2s, box-shadow 0.2s; }
  .fp-primary-btn { transition: background 0.2s, opacity 0.2s; }
  .fp-primary-btn:hover:not(:disabled) { background: #1030d0 !important; }
  .fp-primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .fp-ghost-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: color 0.15s;
  }
  .fp-ghost-btn:hover { color: #93c5fd !important; }
`;

const inputBase = {
  background: "#1e2235",
  border: "1px solid #2a3050",
  color: "#f1f5f9",
  borderRadius: 10,
  padding: "12px 16px",
  fontSize: "0.95rem",
};

// ─── PageShell — defined OUTSIDE the page component to prevent remounts ───────
function PageShell({ children }) {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "#101322" }}>
      <style>{globalStyles}</style>

      {/* Top bar */}
      <div
        className="px-3 px-sm-4 px-lg-5 py-3 py-sm-4 d-flex align-items-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Plain <a> — avoids the <Link>/<link> void-element error entirely */}
        <a href="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
            style={{ width: 34, height: 34, background: "#1337ec" }}
          >
            <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "1rem" }}></i>
          </div>
          <span className="fw-bold text-white fs-5">CampusEvents</span>
        </a>
      </div>

      {/* Centre content vertically + horizontally */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center px-3 py-4 py-sm-5">
        <div className="w-100" style={{ maxWidth: 460 }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-center py-3 text-secondary"
        style={{ fontSize: "0.78rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        © 2024 CampusEvents. All rights reserved.&nbsp;·&nbsp;
        <a href="#" className="text-secondary text-decoration-none">Privacy Policy</a>&nbsp;·&nbsp;
        <a href="#" className="text-secondary text-decoration-none">Terms of Service</a>
      </div>
    </div>
  );
}

// ─── Reusable primitives ──────────────────────────────────────────────────────
function Card({ children }) {
  return (
    <div
      className="rounded-4 p-4 p-sm-5"
      style={{
        background: "#151929",
        border: "1px solid #1e2235",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}

function CardIcon({ icon }) {
  return (
    <div
      className="mx-auto mb-3 rounded-3 d-flex align-items-center justify-content-center"
      style={{ width: 56, height: 56, background: "rgba(19,55,236,0.15)" }}
    >
      <i className={`bi ${icon} text-primary fs-3`}></i>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="rounded-3 p-3 mb-4 d-flex align-items-start gap-2"
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
    >
      <i
        className="bi bi-exclamation-circle-fill text-danger mt-1"
        style={{ fontSize: "0.9rem", flexShrink: 0 }}
      ></i>
      <span className="text-danger" style={{ fontSize: "0.85rem" }}>{message}</span>
    </div>
  );
}

function PrimaryButton({ loading, loadingText, onClick, children }) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2 fp-primary-btn"
      disabled={loading}
      onClick={onClick}
      style={{
        background: "#1337ec",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: "1rem",
        boxShadow: "0 4px 20px rgba(19,55,236,0.4)",
      }}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {loadingText}
        </>
      ) : children}
    </button>
  );
}

function BackToSignIn({ onClick }) {
  return (
    <p className="text-center mt-4 mb-0">
      <button
        type="button"
        className="fp-ghost-btn text-secondary d-inline-flex align-items-center gap-1"
        style={{ fontSize: "0.88rem" }}
        onClick={onClick}
      >
        <i className="bi bi-arrow-left"></i>
        Back to Sign In
      </button>
    </p>
  );
}

// ─── Password strength bar ────────────────────────────────────────────────────
function StrengthBar({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const levels = [
    { label: "Weak",   color: "#ef4444" },
    { label: "Fair",   color: "#f97316" },
    { label: "Good",   color: "#eab308" },
    { label: "Strong", color: "#22c55e" },
  ];
  const { label, color } = levels[Math.max(score - 1, 0)];

  return (
    <div className="mt-2">
      <div className="d-flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 4,
              background: i <= score ? color : "#2a3050",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <p className="mb-0" style={{ fontSize: "0.78rem", color }}>{label} password</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep]             = useState(STEP.EMAIL);
  const [email, setEmail]           = useState("");
  const [code, setCode]             = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError]   = useState("");
  const [loading, setLoading]       = useState(false);

  const [passwords, setPasswords]       = useState({ password: "", confirm: "" });
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [resetError, setResetError]     = useState("");
  const [resetDone, setResetDone]       = useState(false);

  const goToLogin = () => navigate({ to: "/login" });

  // Step 1: Send email to backend
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { 
      setEmailError("Please enter your email address."); 
      return; 
    }
    
    setEmailError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Reset code sent to email:", data);
        setStep(STEP.CODE);
      } else {
        setEmailError(data.email?.[0] || data.detail || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Error:", error);
      setEmailError("Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) { 
      setCodeError("Please enter a valid 6-digit code."); 
      return; 
    }
    
    setCodeError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep(STEP.RESET);
      } else {
        setCodeError(data.detail || data.non_field_errors?.[0] || "Invalid code");
      }
    } catch (error) {
      console.error("Error:", error);
      setCodeError("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.password.length < 8) { 
      setResetError("Password must be at least 8 characters."); 
      return; 
    }
    if (passwords.password !== passwords.confirm) { 
      setResetError("Passwords don't match."); 
      return; 
    }
    
    setResetError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          code, 
          password: passwords.password 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetDone(true);
      } else {
        setResetError(data.detail || data.password?.[0] || data.non_field_errors?.[0] || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error:", error);
      setResetError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1 — Enter email ────────────────────────────────────────────────────
  if (step === STEP.EMAIL) {
    return (
      <PageShell>
        <Card>
          <div className="text-center mb-4">
            <CardIcon icon="bi-shield-lock-fill" />
            <h4 className="text-white fw-bold mb-1">Forgot your password?</h4>
            <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          <ErrorBanner message={emailError} />

          <form onSubmit={handleEmailSubmit} noValidate>
            <div className="mb-4">
              <label
                className="form-label text-secondary fw-semibold"
                style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}
              >
                EMAIL ADDRESS
              </label>
              <div className="position-relative">
                <span
                  className="position-absolute d-flex align-items-center"
                  style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}
                >
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control auth-input w-100"
                  placeholder="student@campus.com"
                  style={{ ...inputBase, paddingLeft: 42 }}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <PrimaryButton loading={loading} loadingText="Sending code...">
              <i className="bi bi-send-fill"></i>
              Send Reset Code
            </PrimaryButton>
          </form>

          <BackToSignIn onClick={goToLogin} />
        </Card>
      </PageShell>
    );
  }

  // ── STEP 2 — Enter reset code ─────────────────────────────────────────────────
  if (step === STEP.CODE) {
    return (
      <PageShell>
        <Card>
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: 56, height: 56,
                background: "rgba(19,55,236,0.15)",
              }}
            >
              <i className="bi bi-info-circle-fill text-primary fs-3"></i>
            </div>
            <h4 className="text-white fw-bold mb-1">Check your email</h4>
            <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
              We sent a 6-digit code to
            </p>
            <p className="fw-semibold mb-4" style={{ color: "#93c5fd", fontSize: "0.95rem", wordBreak: "break-all" }}>
              {email}
            </p>
          </div>

          <ErrorBanner message={codeError} />

          <form onSubmit={handleCodeSubmit} noValidate>
            <div className="mb-4">
              <label
                className="form-label text-secondary fw-semibold"
                style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}
              >
                RESET CODE
              </label>
              <input
                type="text"
                className="form-control auth-input w-100 text-center"
                placeholder="000000"
                maxLength="6"
                style={{ ...inputBase, fontSize: "1.8rem", letterSpacing: "0.4em", fontWeight: "bold" }}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setCodeError(""); }}
                required
                autoFocus
              />
              <small className="text-secondary d-block mt-2" style={{ fontSize: "0.75rem" }}>
                Enter the 6-digit code from your email
              </small>
            </div>

            <PrimaryButton loading={loading} loadingText="Verifying...">
              <i className="bi bi-check-circle"></i>
              Verify Code
            </PrimaryButton>
          </form>

          <p className="text-center mt-4 text-secondary" style={{ fontSize: "0.85rem" }}>
            Didn't receive the code?{" "}
            <button
              type="button"
              className="fp-ghost-btn text-primary fw-semibold"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                setStep(STEP.EMAIL);
                setCode("");
                setCodeError("");
              }}
            >
              Try a different email
            </button>
          </p>

          <BackToSignIn onClick={goToLogin} />
        </Card>
      </PageShell>
    );
  }

  // ── STEP 3 — Set new password ───────────────────────────────────────────────
  return (
    <PageShell>
      <Card>
        {resetDone ? (
          /* Success */
          (<div className="text-center">
            <div
              className="mx-auto mb-4 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: 64, height: 64,
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
            >
              <i className="bi bi-check-circle-fill fs-2" style={{ color: "#22c55e" }}></i>
            </div>
            <h4 className="text-white fw-bold mb-2">Password updated!</h4>
            <p className="text-secondary mb-4" style={{ fontSize: "0.9rem" }}>
              Your password has been reset successfully. You can now sign in with your new credentials.
            </p>
            <PrimaryButton onClick={goToLogin}>
              <i className="bi bi-box-arrow-in-right"></i>
              Sign In
            </PrimaryButton>
          </div>)
        ) : (
          /* New password form */
          (<>
            <div className="text-center mb-4">
              <CardIcon icon="bi-key-fill" />
              <h4 className="text-white fw-bold mb-1">Set new password</h4>
              <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                Choose a strong password for{" "}
                <span style={{ color: "#93c5fd" }}>{email || "your account"}</span>
              </p>
            </div>
            <ErrorBanner message={resetError} />
            <form onSubmit={handleResetSubmit} noValidate>
              {/* New password */}
              <div className="mb-3">
                <label
                  className="form-label text-secondary fw-semibold"
                  style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}
                >
                  NEW PASSWORD
                </label>
                <div className="position-relative">
                  <span
                    className="position-absolute d-flex align-items-center"
                    style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}
                  >
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    className="form-control auth-input w-100"
                    placeholder="At least 8 characters with uppercase & number"
                    style={{ ...inputBase, paddingLeft: 42, paddingRight: 44 }}
                    value={passwords.password}
                    onChange={(e) => { setPasswords({ ...passwords, password: e.target.value }); setResetError(""); }}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="fp-ghost-btn position-absolute d-flex align-items-center"
                    style={{ right: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                {passwords.password.length > 0 && <StrengthBar password={passwords.password} />}
              </div>

              {/* Confirm password */}
              <div className="mb-4">
                <label
                  className="form-label text-secondary fw-semibold"
                  style={{ fontSize: "0.82rem", letterSpacing: 0.5 }}
                >
                  CONFIRM PASSWORD
                </label>
                <div className="position-relative">
                  <span
                    className="position-absolute d-flex align-items-center"
                    style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}
                  >
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control auth-input w-100"
                    placeholder="Re-enter your new password"
                    style={{
                      ...inputBase,
                      paddingLeft: 42,
                      paddingRight: 44,
                      borderColor:
                        passwords.confirm && passwords.confirm !== passwords.password
                          ? "rgba(239,68,68,0.5)"
                          : passwords.confirm && passwords.confirm === passwords.password
                          ? "rgba(34,197,94,0.5)"
                          : "#2a3050",
                    }}
                    value={passwords.confirm}
                    onChange={(e) => { setPasswords({ ...passwords, confirm: e.target.value }); setResetError(""); }}
                    required
                  />
                  <button
                    type="button"
                    className="fp-ghost-btn position-absolute d-flex align-items-center"
                    style={{ right: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                {passwords.confirm && passwords.confirm === passwords.password && (
                  <p className="mt-1 mb-0 d-flex align-items-center gap-1" style={{ color: "#22c55e", fontSize: "0.8rem" }}>
                    <i className="bi bi-check-circle-fill"></i> Passwords match
                  </p>
                )}
              </div>

              <PrimaryButton loading={loading} loadingText="Updating password...">
                <i className="bi bi-check2-circle"></i>
                Update Password
              </PrimaryButton>
            </form>
            <BackToSignIn onClick={goToLogin} />
          </>)
        )}
      </Card>
    </PageShell>
  )
}

export default ForgotPasswordPage;