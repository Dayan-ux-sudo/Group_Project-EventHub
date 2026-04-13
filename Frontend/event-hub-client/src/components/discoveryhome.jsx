import React, { useState } from "react";
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
 
function DiscoveryHome({ searchValue, onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
 
  const handleSearch = (e) => {
    e.preventDefault();
    navigate({ to: "/explore" });
  };
 
  return (
    <nav
      className="navbar navbar-expand-md sticky-top px-3 px-lg-5"
      style={{
        background: "rgba(16,19,34,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        zIndex: 1050,
      }}
    >
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{ width: 34, height: 34, background: "#1337ec" }}
          >
            <i className="bi bi-rocket-takeoff-fill text-white fs-6"></i>
          </div>
          <span className="fw-bold text-white fs-5">CampusEvents</span>
        </Link>
 
        {/* Mobile search */}
        <form
          className="d-flex d-md-none mx-2 flex-grow-1"
          onSubmit={handleSearch}
          style={{ maxWidth: 200 }}
        >
          <div className="input-group input-group-sm">
            <span
              className="input-group-text border-0"
              style={{ background: "#1e2235" }}
            >
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
          {/* Center nav links */}
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
            <li className="nav-item">
              <NavLinkItem
                className={({ isActive }) =>
                  `nav-link fw-medium ${isActive ? "text-primary" : "text-secondary"}`
                }
                to="/my-events"
              >
                My Events
              </NavLinkItem>
            </li>
            <li className="nav-item">
              <NavLinkItem
                className={({ isActive }) =>
                  `nav-link fw-medium ${isActive ? "text-primary" : "text-secondary"}`
                }
                to="/host"
              >
                Organize
              </NavLinkItem>
            </li>
          </ul>
 
          {/* Desktop search */}
          <form
            className="d-none d-md-flex me-3"
            onSubmit={handleSearch}
            style={{ width: 260 }}
          >
            <div className="input-group">
              <span
                className="input-group-text border-0"
                style={{ background: "#1e2235" }}
              >
                <i className="bi bi-search text-secondary small"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 text-white small"
                placeholder="Search events..."
                style={{ background: "#1e2235" }}
                value={searchValue || ""}
                onChange={(e) =>
                  onSearchChange && onSearchChange(e.target.value)
                }
              />
            </div>
          </form>
 
          {/* Right icons */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm rounded-2 d-flex align-items-center justify-content-center"
              style={{
                width: 38,
                height: 38,
                background: "#1e2235",
                color: "#aaa",
              }}
            >
              <i className="bi bi-bell"></i>
            </button>
            <div
              className="rounded-circle overflow-hidden border border-primary"
              style={{ width: 38, height: 38, borderWidth: "2px !important" }}
            >
              <img
                src="https://i.pravatar.cc/40?img=47"
                alt="avatar"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
 
export default DiscoveryHome;