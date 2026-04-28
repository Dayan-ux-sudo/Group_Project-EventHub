import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState } from "react";

export const Route = createFileRoute('/Forgotpassword')({
  component: ForgotPasswordPage,
})

const STEP = {
  EMAIL: "email",
  SENT: "sent",
  RESET: "reset",
};

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
        className="px-3 px-sm-4 px-lg-5 py-3 py-sm-4 d-flex align-items-center justify-content-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Plain <a> — avoids the <Link>/<link> void-element error entirely */}
          <a href="/" className="d-flex align-items-center justify-content-center gap-3 text-decoration-none text-center">
          <div
            className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
            style={{ width: 42, height: 42, background: "#1337ec" }}
          >
            <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "1.15rem" }}></i>
          </div>
          <span className="fw-bold text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
            CampusEvents
          </span>
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
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading]       = useState(false);

  const [passwords, setPasswords]       = useState({ password: "", confirm: "" });
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [resetError, setResetError]     = useState("");
  const [resetDone, setResetDone]       = useState(false);

  const goToLogin = () => navigate({ to: "/login" });

  // Step 1
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Please enter your email address."); return; }
    setEmailError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(STEP.SENT); }, 1400);
  };

  // Step 3
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (passwords.password.length < 8) { setResetError("Password must be at least 8 characters."); return; }
    if (passwords.password !== passwords.confirm) { setResetError("Passwords don't match."); return; }
    setResetError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setResetDone(true); }, 1400);
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
              No worries — enter your email and we'll send a reset link.
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

            <PrimaryButton loading={loading} loadingText="Sending link...">
              <i className="bi bi-send-fill"></i>
              Send Reset Link
            </PrimaryButton>
          </form>

          <BackToSignIn onClick={goToLogin} />
        </Card>

        <div
          className="rounded-3 p-3 mt-3 d-flex align-items-center gap-2"
          style={{ background: "rgba(19,55,236,0.08)", border: "1px solid rgba(19,55,236,0.2)" }}
        >
          <i className="bi bi-info-circle-fill text-primary flex-shrink-0"></i>
          <span className="text-secondary" style={{ fontSize: "0.8rem" }}>
            Demo: any valid email will trigger the confirmation screen.
          </span>
        </div>
      </PageShell>
    );
  }

  // ── STEP 2 — Email sent ─────────────────────────────────────────────────────
  if (step === STEP.SENT) {
    return (
      <PageShell>
        <Card>
          <div className="text-center">
            <div
              className="mx-auto mb-4 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: 64, height: 64,
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
            >
              <i className="bi bi-envelope-check-fill fs-2" style={{ color: "#22c55e" }}></i>
            </div>

            <h4 className="text-white fw-bold mb-2">Check your inbox</h4>
            <p className="text-secondary mb-1" style={{ fontSize: "0.92rem" }}>
              We sent a password reset link to
            </p>
            <p className="fw-semibold mb-4" style={{ color: "#93c5fd", fontSize: "0.95rem", wordBreak: "break-all" }}>
              {email}
            </p>

            <div
              className="rounded-3 p-3 mb-4 text-start"
              style={{ background: "#1a1f33", border: "1px solid #2a3050" }}
            >
              {[
                { icon: "bi-1-circle", text: "Open the email from CampusEvents" },
                { icon: "bi-2-circle", text: 'Click the "Reset password" button' },
                { icon: "bi-3-circle", text: "Choose a strong new password" },
              ].map(({ icon, text }) => (
                <div key={icon} className="d-flex align-items-center gap-3 py-2">
                  <i className={`bi ${icon} text-primary`} style={{ fontSize: "1.1rem", flexShrink: 0 }}></i>
                  <span className="text-secondary" style={{ fontSize: "0.88rem" }}>{text}</span>
                </div>
              ))}
            </div>

            <p className="text-secondary mb-4" style={{ fontSize: "0.85rem" }}>
              Didn't receive it?{" "}
              <button
                type="button"
                className="fp-ghost-btn text-primary fw-semibold"
                style={{ fontSize: "0.85rem" }}
                onClick={() => setStep(STEP.EMAIL)}
              >
                Resend email
              </button>
              {" "}or{" "}
              <button
                type="button"
                className="fp-ghost-btn text-primary fw-semibold"
                style={{ fontSize: "0.85rem" }}
                onClick={() => { setEmail(""); setStep(STEP.EMAIL); }}
              >
                try a different address
              </button>
            </p>

            {/* Demo shortcut to simulate email link click */}
            <button
              type="button"
              className="btn w-100 fw-semibold py-2 mb-4"
              style={{
                background: "rgba(19,55,236,0.15)",
                border: "1px solid rgba(19,55,236,0.35)",
                color: "#93c5fd",
                borderRadius: 10,
                fontSize: "0.88rem",
              }}
              onClick={() => setStep(STEP.RESET)}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Demo: simulate clicking the reset link →
            </button>

            <button
              type="button"
              className="fp-ghost-btn text-secondary d-inline-flex align-items-center gap-1"
              style={{ fontSize: "0.88rem" }}
              onClick={goToLogin}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Sign In
            </button>
          </div>
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
              Your password has been reset. You can now sign in with your new credentials.
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
                    placeholder="At least 8 characters"
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
