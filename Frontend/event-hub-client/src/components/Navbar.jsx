import React, { useState, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
 
// NavLink equivalent using tanstack router
function NavLinkItem({ to, children, className }) {
  const routerState = useRouterState();
  const isActive = routerState.location.pathname === to;
  const resolvedClass = typeof className === "function" ? className({ isActive }) : className;
  return (
    <Link to={to} className={resolvedClass}>
      {children}
    </Link>
  );
}
 
function Navbar({ searchValue, onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      // In a real app, you might fetch user profile here
      setUser({ email: 'user@example.com' }); // Placeholder
    }
  }, []);
 
  const handleSearch = (e) => {
    e.preventDefault();
    navigate({ to: "/explore" });
  };
 
  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate({ to: "/login" });
  };
 
  return (
    <nav
      className="navbar navbar-expand-md sticky-top px-3 px-lg-5"
      style={{
        background: "rgba(16,19,34,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        zIndex: 1050,
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/explore">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{ width: 34, height: 34, background: "#1337ec" }}
          >
            <i className="bi bi-rocket-takeoff-fill text-white fs-6"></i>
          </div>
          <span className="fw-bold text-white fs-5">EventHub</span>
        </Link>
 
        <form className="d-flex d-md-none mx-2 flex-grow-1" onSubmit={handleSearch} style={{ maxWidth: 200 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text border-0" style={{ background: "#1e2235" }}>
              <i className="bi bi-search text-secondary"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 text-white"
              placeholder="Search events..."
              style={{ background: "#1e2235" }}
              value={searchValue || ""}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
        </form>
 
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: "#aaa" }}
        >
          <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} fs-4`}></i>
        </button>
 
        <div className={`collapse navbar-collapse ${mobileOpen ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-1 gap-md-4">
            <li className="nav-item">
              <NavLinkItem
                className={({ isActive }) =>
                  `nav-link fw-semibold ${isActive ? "text-primary" : "text-secondary"}`
                }
                to="/explore"
              >
                Discover
              </NavLinkItem>
            </li>
            {user && (
              <li className="nav-item">
                <NavLinkItem
                  className={({ isActive }) =>
                    `nav-link fw-medium ${isActive ? "text-primary" : "text-secondary"}`
                  }
                  to="/MyEventsPage"
                >
                  My Events
                </NavLinkItem>
              </li>
            )}
            {user && (
              <li className="nav-item">
                <NavLinkItem
                  className={({ isActive }) =>
                    `nav-link fw-medium ${isActive ? "text-primary" : "text-secondary"}`
                  }
                  to="/HostPage"
                >
                  Host Event
                </NavLinkItem>
              </li>
            )}
          </ul>
 
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn border-0 d-flex align-items-center gap-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ background: "transparent", color: "#f1f5f9" }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32, background: "#1337ec" }}
                  >
                    <i className="bi bi-person-fill text-white fs-6"></i>
                  </div>
                  <span className="d-none d-md-inline fw-medium">Profile</span>
                  <i className={`bi bi-chevron-${dropdownOpen ? "up" : "down"}`}></i>
                </button>
                {dropdownOpen && (
                  <ul
                    className="dropdown-menu show"
                    style={{
                      background: "#1e2235",
                      border: "1px solid #2a3050",
                      borderRadius: 8,
                      minWidth: 180,
                    }}
                  >
                    <li>
                      <Link
                        to="/profile"
                        className="dropdown-item text-secondary"
                        style={{ padding: "10px 16px" }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/MyEventsPage"
                        className="dropdown-item text-secondary"
                        style={{ padding: "10px 16px" }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-calendar me-2"></i>My Events
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" style={{ borderColor: "#2a3050" }} />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-secondary"
                        style={{ padding: "10px 16px", border: "none", background: "none", width: "100%", textAlign: "left" }}
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn fw-semibold px-4 py-2"
                style={{ background: "#1337ec", color: "#fff", border: "none", borderRadius: 8 }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
