import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { eventsAPI, getStoredUser } from "../api";

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ schools: [], events: [], user_role: "" });
  const [search, setSearch] = useState("");
  const user = getStoredUser();

  const loadSummary = async () => {
    try {
      const response = await eventsAPI.getOrganizerDashboard();
      setSummary(response.data);
    } catch {
      navigate({ to: "/login" });
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const visibleEvents = useMemo(() => {
    return summary.events.filter((event) => {
      const haystack = `${event.title} ${event.location} ${event.school?.name || ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search, summary.events]);

  const handleDelete = async (eventId) => {
    await eventsAPI.deleteEvent(eventId);
    loadSummary();
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#071426", color: "#f8fafc" }}>
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid px-0" style={{ maxWidth: 1320 }}>
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
            <div>
              <div className="text-uppercase fw-semibold mb-2" style={{ color: "#7dd3fc", letterSpacing: "0.16em", fontSize: "0.74rem" }}>
                {summary.user_role === "superuser_manager" ? "Superuser dashboard" : "Organizer dashboard"}
              </div>
              <h1 className="fw-bold mb-2">
                {summary.user_role === "superuser_manager"
                  ? "Oversee schools and organizers"
                  : `Manage ${user?.school?.name || "your school"} events`}
              </h1>
              <p className="mb-0" style={{ color: "#dbeafe", maxWidth: 760 }}>
                Organizers can create, edit, and manage school-specific events with descriptions, date and time, location, map coordinates, capacity, and categories. Superusers can oversee all schools and their admins from the same dashboard.
              </p>
            </div>
            <button
              type="button"
              className="btn rounded-pill px-4"
              onClick={() => navigate({ to: "/HostPage" })}
              style={{ background: "#38bdf8", color: "#082f49", fontWeight: 700 }}
            >
              Create event
            </button>
          </div>

          <div className="row g-4 mb-5">
            {[
              { label: "Schools", value: summary.schools.length, icon: "bi-buildings" },
              { label: "Managed events", value: summary.events.length, icon: "bi-calendar2-event" },
              { label: "Organizers", value: summary.schools.filter((school) => school.admin).length, icon: "bi-person-badge" },
            ].map((card) => (
              <div key={card.label} className="col-12 col-md-4">
                <div className="rounded-5 p-4 h-100" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, background: "rgba(56, 189, 248, 0.12)", color: "#7dd3fc" }}>
                      <i className={`bi ${card.icon} fs-4`}></i>
                    </div>
                    <div className="display-6 fw-bold mb-0">{card.value}</div>
                  </div>
                  <div style={{ color: "#dbeafe" }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-5 p-4 mb-5" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h2 className="fw-bold mb-1">Schools and admins</h2>
                <div style={{ color: "#cbd5e1" }}>Schools created here also reflect on the normal users dashboard.</div>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Search managed events"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ maxWidth: 320, background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
              />
            </div>

            <div className="row g-4">
              {summary.schools.map((school) => (
                <div key={school.code} className="col-12 col-xl-6">
                  <div className="rounded-5 overflow-hidden h-100" style={{ background: "#112244" }}>
                    <div
                      style={{
                        minHeight: 200,
                        backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.16), rgba(2,6,23,0.88)), url(${school.background_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "end",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="badge rounded-pill" style={{ background: "rgba(125, 211, 252, 0.18)", color: "#e0f2fe" }}>{school.code}</span>
                        <span style={{ color: "#e0f2fe" }}>{school.event_count} events</span>
                      </div>
                      <h3 className="fw-bold mb-2">{school.name}</h3>
                      <div style={{ color: "#dbeafe" }}>{school.admin?.full_name || "No school admin"} • {school.admin?.email || "Unassigned"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-5 p-4" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h2 className="fw-bold mb-1">Managed events</h2>
                <div style={{ color: "#cbd5e1" }}>These events reflect automatically on the student dashboard.</div>
              </div>
              <button
                type="button"
                className="btn rounded-pill px-4"
                onClick={() => navigate({ to: "/HostPage" })}
                style={{ background: "rgba(56, 189, 248, 0.16)", color: "#e0f2fe", border: "1px solid rgba(56, 189, 248, 0.24)" }}
              >
                Add another event
              </button>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ color: "#f8fafc" }}>
                <thead>
                  <tr style={{ color: "#7dd3fc" }}>
                    <th>Event</th>
                    <th>School</th>
                    <th>Date</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEvents.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <div className="fw-semibold">{event.title}</div>
                        <div style={{ color: "#cbd5e1", fontSize: "0.84rem" }}>{event.location}</div>
                      </td>
                      <td>{event.school?.code}</td>
                      <td>{new Date(event.start_time).toLocaleString()}</td>
                      <td>{event.attendee_count}/{event.capacity === 0 ? "Unlimited" : event.capacity}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => navigate({ to: "/HostPage", search: { eventId: event.id } })}
                            style={{ background: "rgba(56, 189, 248, 0.16)", color: "#e0f2fe" }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleDelete(event.id)}
                            style={{ background: "#ef4444", color: "#fff" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrganizerDashboard;
