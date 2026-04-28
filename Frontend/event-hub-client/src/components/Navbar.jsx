import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { authAPI, clearStoredUser, getStoredUser, setStoredUser } from "../api";

function NavLinkItem({ to, children }) {
  const routerState = useRouterState();
  const isActive = routerState.location.pathname === to;

  return (
    <Link
      to={to}
      className="text-decoration-none"
      style={{
        color: isActive ? "#f8fafc" : "#bfd3ea",
        fontWeight: isActive ? 700 : 500,
        fontSize: "0.92rem",
      }}
    >
      {children}
    </Link>
  );
}

function AvatarPreview({ user }) {
  const initials = useMemo(() => {
    const source = user?.full_name || user?.email || "EH";
    return source
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name || user.email}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  return <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{initials}</span>;
}

function Navbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
        localStorage.setItem("eventhub_user", JSON.stringify(response.data));
      } catch {
        setUser(getStoredUser());
      }
    };

    syncUser();

    const handleAuthChange = () => {
      setUser(getStoredUser());
      syncUser();
    };

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setDropdownOpen(false);
    navigate({ to: "/login" });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("avatar_size", String(user?.avatar_size || 44));

    try {
      setSaving(true);
      const response = await authAPI.updateProfile(formData);
      setUser(response.data);
      setStoredUser(response.data);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSizeChange = async (event) => {
    const avatarSize = event.target.value;
    const formData = new FormData();
    formData.append("avatar_size", avatarSize);

    try {
      setSaving(true);
      const response = await authAPI.updateProfile(formData);
      setUser(response.data);
      setStoredUser(response.data);
    } finally {
      setSaving(false);
    }
  };

  const avatarSize = user?.avatar_size || 44;

  return (
    <nav
      className="navbar navbar-expand-lg px-3 px-lg-5 py-3"
      style={{
        background: "linear-gradient(90deg, rgba(5,24,54,0.97), rgba(16,45,98,0.94))",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="container-fluid px-0 d-flex align-items-center">
        <button
          className="navbar-toggler border-0 shadow-none d-lg-none me-2 order-1"
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-white fs-4`}></i>
        </button>

        <div className={`collapse navbar-collapse order-3 order-lg-2 ${mobileOpen ? "show" : ""}`}>
          <div className="navbar-nav me-auto align-items-lg-center gap-3 gap-lg-4 mt-3 mt-lg-0">
            <NavLinkItem to="/explore">Dashboard</NavLinkItem>
            {user && <NavLinkItem to="/MyEventsPage">My Events</NavLinkItem>}
            {user?.role === "organizer" || user?.role === "superuser_manager" ? <NavLinkItem to="/Host">Organizer Dashboard</NavLinkItem> : null}
            {user ? (
              <button
                type="button"
                onClick={() => navigate({ to: user.role === "student" ? "/explore" : "/Host" })}
                className="btn fw-semibold px-3"
                style={{ background: "#f8fafc", color: "#123069", borderRadius: 999 }}
              >
                {user.role === "student" ? "Browse Schools" : "Manage Schools"}
              </button>
            ) : (
              <Link
                to="/login"
                className="btn fw-semibold px-4"
                style={{ background: "#f8fafc", color: "#123069", borderRadius: 999 }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 ms-auto order-2 order-lg-3">
          <Link to="/explore" className="text-decoration-none d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: 42,
                height: 42,
                background: "linear-gradient(135deg, #38bdf8, #2454e6)",
              }}
            >
              <i className="bi bi-stars text-white"></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: "1rem" }}>EventHub</div>
              <div style={{ color: "#cfe2ff", fontSize: "0.72rem", letterSpacing: "0.08em" }}>Campus Event Management</div>
            </div>
          </Link>

          {user ? (
            <div className="position-relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #2454e6, #38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor: "pointer",
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.28)",
                }}
              >
                <AvatarPreview user={user} />
              </button>

              {dropdownOpen && (
                <div
                  className="position-absolute mt-3"
                  style={{
                    right: 0,
                    width: 320,
                    background: "#0d1a34",
                    border: "1px solid rgba(148, 163, 184, 0.24)",
                    borderRadius: 20,
                    padding: 18,
                    boxShadow: "0 26px 54px rgba(2, 6, 23, 0.46)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "linear-gradient(135deg, #2454e6, #38bdf8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <AvatarPreview user={user} />
                    </div>
                    <div>
                      <div className="text-white fw-bold">{user.full_name || "EventHub User"}</div>
                      <div style={{ color: "#d9e6f2", fontSize: "0.88rem" }}>{user.email}</div>
                      <div style={{ color: "#7dd3fc", fontSize: "0.78rem" }}>
                        {user.school?.name || "Campus community"} - {user.role}
                      </div>
                    </div>
                  </div>

                  <label className="d-block text-white fw-semibold mb-2" style={{ fontSize: "0.84rem" }}>
                    Upload profile picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control mb-3"
                    onChange={handleAvatarChange}
                    style={{ background: "#10203f", color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}
                  />

                  <label className="d-flex justify-content-between align-items-center text-white fw-semibold mb-2" style={{ fontSize: "0.84rem" }}>
                    <span>Avatar size</span>
                    <span style={{ color: "#93c5fd" }}>{avatarSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="36"
                    max="72"
                    step="2"
                    value={avatarSize}
                    onChange={handleAvatarSizeChange}
                    className="form-range mb-3"
                  />

                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => navigate({ to: "/MyEventsPage" })}
                      style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      My Activity
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={handleLogout}
                      style={{ background: "#ef4444", color: "#fff", border: "none" }}
                    >
                      Logout
                    </button>
                  </div>

                  {saving && <div className="mt-3" style={{ color: "#93c5fd", fontSize: "0.82rem" }}>Saving profile changes...</div>}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
