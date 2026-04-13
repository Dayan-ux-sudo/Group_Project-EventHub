import React, { useState, useEffect } from "react";
import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { eventsAPI } from "../api";

export const Route = createFileRoute("/EventDetailPage")({
  component: EventDetailPage,
});

const categoryColors = {
  workshop: "#1337ec",
  hackathon: "#f59e0b",
  social: "#0ea5e9",
  academic: "#8b5cf6",
  seminar: "#10b981",
  other: "#555",
};

function EventDetailPage() {
  const { id } = useParams({ from: "/event/$id" });
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpDone, setRsvpDone] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [eventResponse, attendeesResponse] = await Promise.all([
          eventsAPI.getEvent(id),
          eventsAPI.getAttendees(id),
        ]);
        setEvent(eventResponse.data);
        setAttendees(attendeesResponse.data);
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRSVP = async () => {
    try {
      await eventsAPI.rsvp(id, { status: 'attending' });
      setRsvpDone(true);
      // Refresh attendees
      const attendeesResponse = await eventsAPI.getAttendees(id);
      setAttendees(attendeesResponse.data);
    } catch (err) {
      console.error('RSVP failed', err);
      // Handle error (e.g., not authenticated)
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#101322", color: "#f1f5f9" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div
        className="d-flex flex-column min-vh-100 align-items-center justify-content-center"
        style={{ background: "#101322", color: "#fff" }}
      >
        <h3>{error || 'Event not found'}</h3>
        <Link to="/explore" className="btn btn-primary mt-3">
          Back to Explore
        </Link>
      </div>
    );
  }

  const catColor = categoryColors[event.category] || "#1337ec";
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const dateStr = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = `${startDate.toLocaleTimeString(`en-US`, { hour: `numeric`, minute: `2-digit`, hour12: true })} - ${endDate.toLocaleTimeString(`en-US`, { hour: `numeric`, minute: `2-digit`, hour12: true })}`;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#101322", color: "#f1f5f9" }}
    >
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-4">
        <div className="container-fluid" style={{ maxWidth: 1280 }}>

          {/* Breadcrumb */}
          <nav className="mb-4" aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: "0.85rem" }}>
              <li className="breadcrumb-item">
                <Link to="/explore" className="text-secondary text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item text-secondary">
                Events
              </li>
              <li
                className="breadcrumb-item active text-white fw-semibold"
                aria-current="page"
              >
                {event.title}
              </li>
            </ol>
          </nav>

          <div className="row g-4">
            {/* LEFT COLUMN */}
            <div className="col-12 col-lg-8">
              {/* Hero image placeholder */}
              <div className="position-relative rounded-3 overflow-hidden mb-4" style={{ height: 380, background: "#1e2235" }}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <i className="bi bi-calendar-event text-secondary" style={{ fontSize: "5rem" }}></i>
                </div>
                <span
                  className="position-absolute bottom-0 start-0 m-3 badge text-uppercase"
                  style={{
                    background: catColor,
                    fontSize: "0.7rem",
                    letterSpacing: 1.5,
                    padding: "6px 12px",
                  }}
                >
                  {event.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-white fw-bold mb-4" style={{ fontSize: "2rem" }}>
                {event.title}
              </h1>

              {/* Date & Location row */}
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-2"
                    style={{ width: 44, height: 44, background: "rgba(19,55,236,0.15)" }}
                  >
                    <i className="bi bi-calendar3 text-primary fs-5"></i>
                  </div>
                  <div>
                    <div className="text-white fw-semibold">{dateStr}</div>
                    <div className="text-secondary" style={{ fontSize: "0.82rem" }}>
                      {timeStr}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-2"
                    style={{ width: 44, height: 44, background: "rgba(19,55,236,0.15)" }}
                  >
                    <i className="bi bi-geo-alt text-primary fs-5"></i>
                  </div>
                  <div>
                    <div className="text-white fw-semibold">{event.location || "TBD"}</div>
                    <div className="text-secondary" style={{ fontSize: "0.82rem" }}>
                      {event.location || 'Location TBD'}
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="mb-4">
                <h5 className="text-white fw-bold mb-3">About the Event</h5>
                <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                  {event.description}
                </p>
              </div>

              {/* Attendees */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-white fw-bold mb-0">Attendees</h5>
                  <a href="#" className="text-primary text-decoration-none" style={{ fontSize: "0.85rem" }}>
                    View all
                  </a>
                </div>
                <div className="d-flex align-items-center gap-3">
                  {/* Placeholder avatars */}
                  <div className="d-flex">
                    {attendees.slice(0, 4).map((attendee, i) => (
                      <div
                        key={i}
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                        style={{
                          width: 38,
                          height: 38,
                          background: "#1e2235",
                          marginLeft: i > 0 ? -10 : 0,
                          fontSize: "0.72rem",
                          border: "2px solid #101322",
                          position: "relative",
                        }}
                      >
                        {attendee.user.full_name ? attendee.user.full_name[0].toUpperCase() : attendee.user.email[0].toUpperCase()}
                      </div>
                    ))}
                    {attendees.length > 4 && (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                        style={{
                          width: 38,
                          height: 38,
                          background: "#1e2235",
                          marginLeft: -10,
                          fontSize: "0.72rem",
                          border: "2px solid #101322",
                          position: "relative",
                        }}
                      >
                        +{attendees.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="mb-0 text-secondary" style={{ fontSize: "0.9rem" }}>
                    <strong className="text-white">{attendees.length} students</strong> are going
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – Sidebar */}
            <div className="col-12 col-lg-4">
              {/* RSVP Card */}
              <div
                className="rounded-3 p-4 mb-3"
                style={{ background: "#151929", border: "1px solid #1e2235" }}
              >
                {/* Capacity */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
                    Capacity Status
                  </span>
                  <span className="text-primary fw-semibold" style={{ fontSize: "0.85rem" }}>
                    {attendees.length}/{event.capacity === 0 ? 'Unlimited' : event.capacity} spots filled
                  </span>
                </div>
                <div
                  className="rounded-pill mb-4"
                  style={{ height: 6, background: "#1e2235" }}
                >
                  <div
                    className="rounded-pill"
                    style={{
                      width: `${event.capacity === 0 ? 0 : Math.min((attendees.length / event.capacity) * 100, 100)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #1337ec, #0ea5e9)",
                    }}
                  ></div>
                </div>

                {/* RSVP button */}
                <button
                  className="btn w-100 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 py-3"
                  style={{
                    background: rsvpDone ? "#10b981" : "#1337ec",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: "1rem",
                  }}
                  onClick={handleRSVP}
                  disabled={rsvpDone}
                >
                  <i className={`bi ${rsvpDone ? `bi-check-circle-fill` : `bi-person-check-fill`}`}></i>
                  {rsvpDone ? "You're registered!" : "RSVP & Join Event"}
                </button>

                {/* Share button */}
                <button
                  className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-3"
                  style={{
                    background: "#1e2235",
                    color: "#f1f5f9",
                    border: "1px solid #2a3050",
                    borderRadius: 10,
                    fontSize: "0.95rem",
                  }}
                >
                  <i className="bi bi-share"></i>
                  Share with Friends
                </button>

                <p className="text-secondary text-center mt-3 mb-0" style={{ fontSize: "0.78rem" }}>
                  Spots left: {event.spots_left}
                </p>
              </div>

              {/* Location card */}
              <div
                className="rounded-3 p-3 mb-3"
                style={{ background: "#151929", border: "1px solid #1e2235" }}
              >
                <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-primary"></i>
                  EVENT LOCATION
                </h6>
                {/* Map placeholder */}
                <div
                  className="rounded-2 mb-3 overflow-hidden d-flex align-items-center justify-content-center"
                  style={{ height: 140, background: "#1a1f35", position: "relative" }}
                >
                  <div className="text-secondary">Map</div>
                </div>
                <div className="fw-semibold text-white mb-1" style={{ fontSize: "0.9rem" }}>
                  {event.location || 'Location TBD'}
                </div>
                <div className="text-secondary mb-2" style={{ fontSize: "0.78rem" }}>
                  {event.location || 'Address TBD'}
                </div>
                <a href="#" className="text-primary text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-diamond-fill" style={{ fontSize: "0.5rem" }}></i>
                  Get Directions
                </a>
              </div>

              {/* Organizer */}
              <div
                className="rounded-3 p-3 d-flex align-items-center gap-3"
                style={{ background: "rgba(19,55,236,0.12)", border: "1px solid rgba(19,55,236,0.25)" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 44, height: 44, background: "rgba(19,55,236,0.2)" }}
                >
                  <i className="bi bi-person-fill text-primary fs-5"></i>
                </div>
                <div>
                  <div className="text-white fw-semibold" style={{ fontSize: "0.9rem" }}>
                    Organized by
                  </div>
                  <div className="text-secondary" style={{ fontSize: "0.78rem" }}>
                    {event.organizer.full_name || event.organizer.email}
                  </div>
                </div>
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
