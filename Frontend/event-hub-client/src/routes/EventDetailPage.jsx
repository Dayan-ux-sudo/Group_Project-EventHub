import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { eventsAPI } from "../api";

export const Route = createFileRoute("/EventDetailPage")({
  component: EventDetailPage,
});

const normalizeAttendees = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  if (Array.isArray(payload?.attendees)) {
    return payload.attendees;
  }
  return [];
};

function EventDetailPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const eventId =
    typeof search.eventId === "string" || typeof search.eventId === "number"
      ? String(search.eventId).trim()
      : "";
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [rsvpState, setRsvpState] = useState("");
  const [loadError, setLoadError] = useState("");

  const loadEvent = async () => {
    if (!eventId) {
      return;
    }

    try {
      const [eventResponse, attendeesResponse] = await Promise.all([
        eventsAPI.getEvent(eventId),
        eventsAPI.getAttendees(eventId),
      ]);
      setEvent(eventResponse.data);
      setAttendees(normalizeAttendees(attendeesResponse.data));
      setLoadError("");
    } catch (error) {
      setLoadError("Unable to load this event right now.");
      console.error("Failed to load event details", error);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const capacityFill = useMemo(() => {
    if (!event?.capacity || event.capacity === 0) {
      return 0;
    }
    return Math.min((attendees.length / event.capacity) * 100, 100);
  }, [attendees.length, event]);

  const handleRSVP = async () => {
    if (!eventId) {
      return;
    }

    try {
      await eventsAPI.rsvp(eventId);
      setRsvpState("registered");
      await loadEvent();
    } catch (error) {
      console.error("Unable to RSVP for event", error);
    }
  };

  if (!event) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#071426" }}>
        {loadError ? (
          <div className="text-center px-3">
            <div className="mb-3" style={{ color: "#fca5a5" }}>{loadError}</div>
            <button
              type="button"
              className="btn btn-sm rounded-pill"
              onClick={() => navigate({ to: "/explore" })}
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Back to explore
            </button>
          </div>
        ) : (
          <div className="spinner-border text-info"></div>
        )}
      </div>
    );
  }

  const directionsUrl =
    event.latitude && event.longitude
      ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || "")}`;
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const attendeesCount = attendees.length;
  const safeAttendees = Array.isArray(attendees) ? attendees : [];
  const remainingMilliseconds = startDate.getTime() - Date.now();
  const remainingMinutes = Math.max(0, Math.floor(remainingMilliseconds / (1000 * 60)));
  const remainingDays = Math.floor(remainingMinutes / (60 * 24));
  const remainingHours = Math.floor((remainingMinutes % (60 * 24)) / 60);
  const remainingMins = remainingMinutes % 60;
  const eventIsLive = remainingMilliseconds <= 0;
  const calendarMonth = startDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const calendarDay = startDate.toLocaleDateString("en-US", { day: "2-digit" });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#071426", color: "#f8fafc" }}>
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
          <button
            type="button"
            className="btn btn-sm rounded-pill mb-4"
            onClick={() => navigate({ to: "/SchoolEventsPage", search: { school: event.school?.code || "" } })}
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <i className="bi bi-arrow-left me-2"></i>{event.school?.code || "Back"}
          </button>

          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div
                className="rounded-5 p-5 mb-4"
                style={{
                  minHeight: 340,
                  backgroundImage: `linear-gradient(140deg, rgba(10, 18, 54, 0.28), rgba(3, 9, 36, 0.88)), url(${event.school?.background_image || ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="badge rounded-pill mb-3" style={{ background: "rgba(56, 189, 248, 0.18)", color: "#e0f2fe", textTransform: "capitalize" }}>
                  {event.category}
                </span>
                <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2rem, 3vw, 3.5rem)" }}>{event.title}</h1>
                <p style={{ maxWidth: 720, color: "#d9e6f2", fontSize: "1rem", lineHeight: 1.8 }}>{event.description}</p>
              </div>

              <div className="rounded-5 p-4 mb-4" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="fw-bold mb-3">Event details</h3>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>Date and time</div>
                    <div className="fw-semibold mt-1">{startDate.toLocaleString()} - {endDate.toLocaleTimeString()}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>Venue</div>
                    <div className="fw-semibold mt-1">{event.location || "To be announced"}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>Organizer</div>
                    <div className="fw-semibold mt-1">{event.organizer?.full_name || event.organizer?.email}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>School</div>
                    <div className="fw-semibold mt-1">{event.school?.name}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>Attendees</div>
                    <div className="fw-semibold mt-1">{attendeesCount} attending</div>
                  </div>
                </div>
              </div>

              <div className="rounded-5 p-4" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fw-bold mb-0">Attendees</h3>
                  <span style={{ color: "#cbd5e1" }}>{safeAttendees.length} going</span>
                </div>
                <div className="d-flex flex-wrap gap-3">
                  {safeAttendees.map((attendee, index) => {
                    const attendeeUser = attendee?.user || {};
                    const attendeeName = attendeeUser.full_name || attendeeUser.email || "Event attendee";
                    const attendeeInitial = attendeeName[0]?.toUpperCase() || "E";

                    return (
                      <div
                        key={`${attendeeUser.id || "attendee"}-${attendee.created_at || index}`}
                        className="d-flex align-items-center gap-3 rounded-pill px-3 py-2"
                        style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.12)" }}
                      >
                        {attendeeUser.avatar_url ? (
                          <img
                            src={attendeeUser.avatar_url}
                            alt={attendeeName}
                            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 38, height: 38, background: "#2454e6", color: "#fff", fontWeight: 700 }}>
                            {attendeeInitial}
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold">{attendeeName}</div>
                          <div style={{ color: "#7dd3fc", fontSize: "0.78rem" }}>{attendee.status || "attending"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="rounded-5 p-4 mb-4" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="rounded-4 p-3 mb-4" style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-center rounded-4 overflow-hidden" style={{ width: 68, border: "1px solid rgba(255,255,255,0.25)" }}>
                      <div style={{ background: "#38bdf8", color: "#082f49", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 0" }}>
                        {calendarMonth}
                      </div>
                      <div className="fw-bold" style={{ fontSize: "1.45rem", lineHeight: 1.1, padding: "8px 0 10px" }}>
                        {calendarDay}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>Time remaining</div>
                      <div className="fw-bold mt-1">
                        {eventIsLive ? "Event is live now" : `${remainingDays}d ${remainingHours}h ${remainingMins}m`}
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: "0.84rem" }}>{startDate.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: "#cbd5e1" }}>Venue</span>
                  <span style={{ color: "#7dd3fc" }}>{event.location || "TBA"}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: "#cbd5e1" }}>Capacity</span>
                  <span style={{ color: "#7dd3fc" }}>
                    {attendeesCount}/{event.capacity === 0 ? "Unlimited" : event.capacity}
                  </span>
                </div>
                <div className="rounded-pill mb-3" style={{ height: 8, background: "#142643" }}>
                  <div className="rounded-pill" style={{ height: "100%", width: `${capacityFill}%`, background: "linear-gradient(90deg, #38bdf8, #2454e6)" }}></div>
                </div>
                <div className="mb-2" style={{ color: "#dbeafe" }}>Spots left: {event.spots_left}</div>
                <div className="mb-4" style={{ color: "#dbeafe" }}>Attendees: {attendeesCount}</div>
                <button
                  type="button"
                  className="btn w-100 fw-bold py-3 mb-3"
                  onClick={handleRSVP}
                  style={{ background: rsvpState === "registered" ? "#10b981" : "#38bdf8", color: "#082f49", border: "none", borderRadius: 18 }}
                >
                  {rsvpState === "registered" ? "You are registered" : "RSVP easily"}
                </button>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn w-100 py-3"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: 18 }}
                >
                  Open map directions
                </a>
              </div>

              <div className="rounded-5 overflow-hidden" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
                <iframe
                  title="Event map"
                  src={`https://maps.google.com/maps?q=${event.latitude || ""},${event.longitude || ""}&z=15&output=embed`}
                  style={{ width: "100%", height: 260, border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EventDetailPage;
