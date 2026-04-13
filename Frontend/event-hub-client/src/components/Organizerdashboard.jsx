// src/components/OrganizerDashboard.jsx
// Routes used (must match routeTree.gen.ts exactly):
//   /explore        → Discover
//   /MyEventsPage   → My Events
//   /Host           → Organize  ← this page
//   /HostPage       → Create New Event
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

// ─── Data ────────────────────────────────────────────────────────────────────

const hostedEvents = [
  {
    id: 1,
    title: "Winter Hackathon 2024",
    venue: "Main Engineering Hall",
    status: "published",
    rsvp: 450,
    capacity: 500,
    date: "Dec 12, 2024",
    time: "09:00 AM",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=120&q=80",
  },
  {
    id: 2,
    title: "Annual Music Fest",
    venue: "Campus North Quad",
    status: "draft",
    rsvp: 0,
    capacity: 2000,
    date: "Jan 15, 2025",
    time: "06:00 PM",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&q=80",
  },
  {
    id: 3,
    title: "Career Talk: AI & Future",
    venue: "Student Center Room 4",
    status: "completed",
    rsvp: 120,
    capacity: 120,
    date: "Nov 28, 2024",
    time: "02:30 PM",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&q=80",
  },
  {
    id: 4,
    title: "Sunset Mix & Mingle",
    venue: "University Quad",
    status: "published",
    rsvp: 120,
    capacity: 200,
    date: "Oct 26, 2024",
    time: "06:00 PM",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&q=80",
  },
  {
    id: 5,
    title: "AI & Machine Learning Summit",
    venue: "Science Complex",
    status: "published",
    rsvp: 90,
    capacity: 150,
    date: "Nov 2, 2024",
    time: "09:00 AM",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=120&q=80",
  },
  {
    id: 6,
    title: "Campus 5K Run",
    venue: "Athletics Field",
    status: "completed",
    rsvp: 210,
    capacity: 300,
    date: "Nov 5, 2024",
    time: "07:00 AM",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&q=80",
  },
];

const chartBars = [
  { month: "JAN", pct: 90 },
  { month: "FEB", pct: 75 },
  { month: "MAR", pct: 60 },
  { month: "APR", pct: 40 },
  { month: "MAY", pct: 85 },
  { month: "JUN", pct: 70 },
];

const PAGE_SIZE = 3;

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP = {
  published: { label: "PUBLISHED", bg: "rgba(19,55,236,0.12)", color: "#6390ff" },
  draft:     { label: "DRAFT",     bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  completed: { label: "COMPLETED", bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "3px 10px",
        borderRadius: 20,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ─── RSVP progress cell ───────────────────────────────────────────────────────

function RsvpCell({ rsvp, capacity }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((rsvp / capacity) * 100)) : 0;
  return (
    <div>
      <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
        {rsvp.toLocaleString()} / {capacity.toLocaleString()}
      </span>
      <div style={{ width: 96, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#1337ec", borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({ icon, title, danger = false, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32,
        borderRadius: 8,
        border: `1px solid ${hovered && danger ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)"}`,
        background: hovered ? (danger ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.04)",
        color: hovered ? (danger ? "#ef4444" : "#f1f5f9") : "#64748b",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        fontSize: "0.85rem",
        transition: "all 0.15s",
      }}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function EventRow({ event, onDelete }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: hovered ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.15s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={event.image} alt={event.title} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#1e2235" }} />
          <div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#f1f5f9" }}>{event.title}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
              <i className="bi bi-geo-alt me-1" />{event.venue}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "16px 20px" }}><StatusBadge status={event.status} /></td>
      <td style={{ padding: "16px 20px" }}><RsvpCell rsvp={event.rsvp} capacity={event.capacity} /></td>
      <td style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "0.82rem", color: "#e2e8f0" }}>{event.date}</div>
        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{event.time}</div>
      </td>
      <td style={{ padding: "16px 20px", textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <ActionBtn icon="bi-pencil"  title="Edit event"   onClick={() => navigate({ to: "/HostPage" })} />
          <ActionBtn icon="bi-trash3"  title="Delete event" danger onClick={() => onDelete(event.id)} />
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination button ────────────────────────────────────────────────────────

function PaginBtn({ disabled, onClick, icon }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        color: "#94a3b8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.8rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "all 0.15s",
      }}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}

// ─── Style constants ──────────────────────────────────────────────────────────

const CARD = {
  background: "#161929",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: 24,
};

const LABEL = {
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const SELECT = {
  background: "#1e2235",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8,
  color: "#94a3b8",
  fontSize: "0.75rem",
  padding: "5px 10px",
  fontFamily: "'Lexend', sans-serif",
  cursor: "pointer",
  outline: "none",
};

// ─── Main component ───────────────────────────────────────────────────────────

function OrganizerDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(0);
  const [rows,        setRows]        = useState(hostedEvents);
  const [deleteModal, setDeleteModal] = useState(null);

  // Derived
  const filtered = rows.filter((e) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Upcoming"  && e.status !== "completed") ||
      (filter === "Completed" && e.status === "completed");
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalRsvp  = rows.reduce((s, e) => s + e.rsvp, 0);
  const published  = rows.filter((e) => e.status === "published").length;
  const completed  = rows.filter((e) => e.status === "completed").length;
  const avgFill    = Math.round(rows.reduce((s, e) => s + (e.rsvp / e.capacity) * 100, 0) / rows.length);

  const handleDelete  = (id) => setDeleteModal(id);
  const confirmDelete = () => {
    setRows((prev) => prev.filter((e) => e.id !== deleteModal));
    setDeleteModal(null);
    setPage(0);
  };

  // Nav links — paths from routeTree.gen.ts
  const navLinks = [
    { to: "/explore",      label: "Discover"  },
    { to: "/MyEventsPage", label: "My Events" },
    { to: "/Host",         label: "Organize"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#101322", color: "#f1f5f9", fontFamily: "'Lexend', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <nav style={{ background: "rgba(16,19,34,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 1050, padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

        {/* Brand */}
        <Link to="/explore" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "#1337ec", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "1rem" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>CampusEvents</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ textDecoration: "none", color: to === "/Host" ? "#1337ec" : "#94a3b8", fontWeight: to === "/Host" ? 700 : 500, fontSize: "0.88rem" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: "0 1 280px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "0.8rem", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{ width: "100%", background: "#1e2235", border: "none", borderRadius: 10, color: "#f1f5f9", fontSize: "0.82rem", padding: "8px 14px 8px 32px", fontFamily: "'Lexend', sans-serif", outline: "none" }}
          />
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => navigate({ to: "/HostPage" })}
            style={{ background: "#1337ec", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Lexend', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <i className="bi bi-plus-lg" /> Create New Event
          </button>
          <button style={{ width: 38, height: 38, background: "#1e2235", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-bell" />
          </button>
          <div onClick={() => navigate({ to: "/MyEventsPage" })} style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #1337ec", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}>
            <img src={user?.avatar || "https://i.pravatar.cc/40?img=47"} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </nav>

      {/* ══════════════════════ PAGE BODY ══════════════════════ */}
      <div style={{ flex: 1, padding: "32px 28px", maxWidth: 1200, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>Organizer Dashboard</h1>
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 4, marginBottom: 0 }}>
            Manage and track all your campus events in one place
          </p>
        </div>

        {/* ── Row 1: stat card + chart ─────────────────────────────────────── */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-4">
            <div style={CARD}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={LABEL}>Total RSVPs</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="bi bi-people-fill" style={{ fontSize: "1.1rem" }} />
                </div>
              </div>
              <div style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>{totalRsvp.toLocaleString()}</div>
              <div style={{ marginTop: 12, fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>
                <i className="bi bi-graph-up-arrow me-1" />+12%{" "}
                <span style={{ color: "#64748b", fontWeight: 400 }}>vs last month</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div style={CARD}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Attendance Capacity Trends</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 3 }}>Average 85% utilization across all venues</div>
                </div>
                <select style={SELECT}><option>Last 6 Months</option><option>Last Year</option></select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110, padding: "0 4px" }}>
                {chartBars.map(({ month, pct }) => (
                  <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", position: "relative" }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80%", background: "rgba(19,55,236,0.12)", borderRadius: "4px 4px 0 0" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct * 0.8}%`, background: "linear-gradient(to top,#1337ec,#4d6fff)", borderRadius: "4px 4px 0 0", transition: "height 0.5s ease" }} />
                    </div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Stat pills ────────────────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Events", value: rows.length,  icon: "bi-calendar-event", color: "#1337ec" },
            { label: "Published",    value: published,    icon: "bi-broadcast",       color: "#10b981" },
            { label: "Completed",    value: completed,    icon: "bi-check-circle",    color: "#94a3b8" },
            { label: "Avg Fill Rate",value: `${avgFill}%`,icon: "bi-percent",         color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div style={{ background: "#161929", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + "22", color: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Events Table ─────────────────────────────────────────────────── */}
        <div style={{ ...CARD, padding: 0, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>Hosted Events</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 3 }}>Detailed list of your upcoming and past campus activities</div>
            </div>
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: 3 }}>
              {["All", "Upcoming", "Completed"].map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(0); }}
                  style={{ padding: "5px 14px", borderRadius: 7, border: "none", fontFamily: "'Lexend', sans-serif", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", background: filter === f ? "#161929" : "transparent", color: filter === f ? "#f1f5f9" : "#64748b", boxShadow: filter === f ? "0 1px 4px rgba(0,0,0,0.3)" : "none", transition: "all 0.15s" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.025)" }}>
                  {["Event Details", "Status", "RSVPs", "Date", "Actions"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 20px", fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: i === 4 ? "right" : "left", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length > 0 ? pageRows.map((event) => (
                  <EventRow key={event.id} event={event} onDelete={handleDelete} />
                )) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                      <i className="bi bi-calendar-x" style={{ fontSize: "2.5rem", opacity: 0.3, display: "block", marginBottom: 10 }} />
                      No events match your filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "14px 24px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Showing {pageRows.length} of {filtered.length} events</span>
            <div style={{ display: "flex", gap: 8 }}>
              <PaginBtn disabled={page === 0}             onClick={() => setPage((p) => p - 1)} icon="bi-chevron-left"  />
              <PaginBtn disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} icon="bi-chevron-right" />
            </div>
          </div>
        </div>

        {/* ── CTA Banner ───────────────────────────────────────────────────── */}
        <div style={{ ...CARD, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Ready to host something new?</div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 3 }}>Create a new event and start collecting RSVPs instantly</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigate({ to: "/explore" })} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#94a3b8", padding: "9px 18px", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Lexend', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-compass" /> Browse Events
            </button>
            <button onClick={() => navigate({ to: "/HostPage" })} style={{ background: "#1337ec", border: "none", borderRadius: 10, color: "#fff", padding: "9px 18px", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Lexend', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-plus-lg" /> Create New Event
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════ DELETE MODAL ══════════════════════ */}
      {deleteModal !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setDeleteModal(null)}>
          <div style={{ background: "#161929", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239,68,68,0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 16 }}>
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>Delete Event?</div>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: 24 }}>
              This action cannot be undone. The event and all its RSVPs will be permanently removed.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "9px 0", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "#94a3b8", fontFamily: "'Lexend', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "9px 0", background: "#ef4444", border: "none", borderRadius: 9, color: "#fff", fontFamily: "'Lexend', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer style={{ background: "#0d1020", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 28px", marginTop: "auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#1337ec", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: "0.8rem" }} />
            </div>
            <span style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>CampusEvents</span>
            <span style={{ color: "#64748b", fontSize: "0.8rem", marginLeft: 8 }}>© 2024 CampusEvents. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Contact Support"].map((l) => (
              <a key={l} href="#" style={{ color: "#64748b", fontSize: "0.8rem", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default OrganizerDashboard;