import React from "react";

function Footer() {
  return (
    <footer
      className="mt-auto py-4 px-4 px-lg-5"
      style={{
        background: "#0d1020",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          {/* Brand */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-2"
              style={{ width: 28, height: 28, background: "#1337ec" }}
            >
              <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "0.8rem" }}></i>
            </div>
            <span className="text-white fw-semibold">CampusEvents</span>
            <span className="text-secondary ms-2" style={{ fontSize: "0.82rem" }}>
              &copy; 2026 CampusEvents. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div className="d-flex gap-4">
            <a href="#" className="text-secondary text-decoration-none" style={{ fontSize: "0.82rem" }}>
              Privacy Policy
            </a>
            <a href="#" className="text-secondary text-decoration-none" style={{ fontSize: "0.82rem" }}>
              Terms of Service
            </a>
            <a href="#" className="text-secondary text-decoration-none" style={{ fontSize: "0.82rem" }}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer
