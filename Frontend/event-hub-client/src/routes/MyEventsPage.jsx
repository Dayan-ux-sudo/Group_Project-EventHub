import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { eventsAPI } from "../api";

export const Route = createFileRoute("/MyEventsPage")({
  component: MyEventsPage,
});

function MyEventsPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const [cancelError, setCancelError] = useState("");

  const loadRegistrations = async () => {
    try {
      const response = await eventsAPI.getMyRegistrations();
      setRegistrations(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch {
      setRegistrations([]);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleDeleteBooking = async (eventId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete the event");
    if (!shouldDelete) {
      return;
    }

    try {
      setCancelError("");
      setCancellingEventId(eventId);
      await eventsAPI.cancelRsvp(eventId);
      await loadRegistrations();
    } catch {
      setCancelError("Unable to delete this booking right now.");
    } finally {
      setCancellingEventId(null);
    }
  };

  const now = Date.now();
  const upcoming = registrations.filter((item) => new Date(item.event.start_time).getTime() >= now);
  const past = registrations.filter((item) => new Date(item.event.start_time).getTime() < now);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#071426", color: "#f8fafc" }}>
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
            <div>
              <div className="text-uppercase fw-semibold mb-2" style={{ color: "#7dd3fc", letterSpacing: "0.16em", fontSize: "0.74rem" }}>
                My dashboard
              </div>
              <h1 className="fw-bold mb-1">My RSVPs and event history</h1>
              <p className="mb-0" style={{ color: "#d7e7f6" }}>
                Track where you are attending and what you have already joined across EventHub.
              </p>
            </div>
            <button
              type="button"
              className="btn rounded-pill px-4"
              onClick={() => navigate({ to: "/explore" })}
              style={{ background: "#38bdf8", color: "#082f49", fontWeight: 700 }}
            >
              Browse more events
            </button>
          </div>

          <div className="row g-4 mb-5">
            {[
              { label: "Upcoming", value: upcoming.length, icon: "bi-calendar-check" },
              { label: "Past", value: past.length, icon: "bi-clock-history" },
              { label: "Total RSVPs", value: registrations.length, icon: "bi-people" },
            ].map((stat) => (
              <div key={stat.label} className="col-12 col-md-4">
                <div className="rounded-5 p-4 h-100" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: 56, height: 56, background: "rgba(56, 189, 248, 0.12)", color: "#7dd3fc" }}
                    >
                      <i className={`bi ${stat.icon} fs-4`}></i>
                    </div>
                    <div className="display-6 fw-bold mb-0">{stat.value}</div>
                  </div>
                  <div style={{ color: "#dbeafe" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {[{ title: "Upcoming", items: upcoming }, { title: "Past", items: past }].map((group) => (
              <div key={group.title} className="col-12 col-xl-6">
                <div className="rounded-5 p-4 h-100" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h2 className="fw-bold mb-4">{group.title}</h2>
                  {cancelError ? (
                    <div
                      className="alert py-2 px-3 mb-3"
                      style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fecaca", border: "1px solid rgba(239, 68, 68, 0.35)" }}
                    >
                      {cancelError}
                    </div>
                  ) : null}
                  <div className="d-flex flex-column gap-3">
                    {group.items.map((registration) => (
                      <div
                        key={registration.id}
                        className="w-100 text-start rounded-4 border-0 p-4"
                        style={{ background: "rgba(56, 189, 248, 0.06)", color: "#fff" }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <button
                            type="button"
                            onClick={() => navigate({ to: "/EventDetailPage", search: { eventId: registration.event.id } })}
                            className="text-start border-0 bg-transparent p-0 flex-grow-1"
                            style={{ color: "#fff" }}
                          >
                            <div className="mb-2" style={{ color: "#7dd3fc", textTransform: "capitalize", fontSize: "0.82rem" }}>
                              {registration.event.school_code} - {registration.event.category}
                            </div>
                            <h3 className="fw-bold mb-2" style={{ fontSize: "1.15rem" }}>{registration.event.title}</h3>
                            <div style={{ color: "#dbeafe", fontSize: "0.9rem", lineHeight: 1.7 }}>
                              {new Date(registration.event.start_time).toLocaleString()} - {registration.event.location}
                            </div>
                          </button>
                          <div className="d-flex flex-column align-items-end gap-2">
                            <span className="badge rounded-pill" style={{ background: "#10b981", color: "#ecfeff" }}>
                              {registration.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(registration.event.id)}
                              disabled={cancellingEventId === registration.event.id}
                              className="btn btn-sm"
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#fecaca",
                                border: "1px solid rgba(239, 68, 68, 0.35)",
                              }}
                            >
                              {cancellingEventId === registration.event.id ? "Deleting..." : "Delete booking"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {group.items.length === 0 ? <div style={{ color: "#cbd5e1" }}>No {group.title.toLowerCase()} events yet.</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyEventsPage;
