import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { eventsAPI } from "../api";

export const Route = createFileRoute("/SchoolEventsPage")({
  component: SchoolEventsPage,
});

function SchoolEventsPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const schoolCode =
    typeof search.school === "string" || typeof search.school === "number"
      ? String(search.school).trim()
      : "";
  const [schools, setSchools] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookingEventId, setBookingEventId] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingDialog, setBookingDialog] = useState({ open: false, title: "" });

  const parseListResponse = (response) => (Array.isArray(response.data) ? response.data : response.data.results || []);

  const loadSchoolEvents = async () => {
    const [schoolsResponse, eventsResponse] = await Promise.all([
      eventsAPI.getSchools(),
      eventsAPI.getEvents({ school: schoolCode }),
    ]);
    setSchools(parseListResponse(schoolsResponse));
    setEvents(parseListResponse(eventsResponse));
  };

  useEffect(() => {
    loadSchoolEvents();
  }, [schoolCode]);

  const school = useMemo(() => schools.find((item) => item.code === schoolCode), [schoolCode, schools]);

  const handleBookEvent = async (eventId) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      navigate({ to: "/login" });
      return;
    }

    const targetEvent = events.find((item) => item.id === eventId);

    try {
      setBookingError("");
      setBookingEventId(eventId);
      await eventsAPI.rsvp(eventId);

      // Optimistic local update so spots/attendee count reflect booking immediately.
      setEvents((current) =>
        current.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                attendee_count: (Number(event.attendee_count) || 0) + 1,
                spots_left:
                  typeof event.spots_left === "number"
                    ? Math.max(0, event.spots_left - 1)
                    : event.spots_left,
              },
        ),
      );

      setBookingDialog({ open: true, title: targetEvent?.title || "Event" });
      await loadSchoolEvents();
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate({ to: "/login" });
        return;
      }
      setBookingError("Unable to book this event right now.");
    } finally {
      setBookingEventId(null);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#071426", color: "#f8fafc" }}>
      <Navbar />

      <main className="flex-grow-1">
        <section
          className="px-3 px-lg-5 py-5"
          style={{
            minHeight: 420,
            backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.35), rgba(2,6,23,0.92)), url(${school?.background_image || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
            <button
              type="button"
              className="btn btn-sm rounded-pill mb-4"
              onClick={() => navigate({ to: "/explore" })}
              style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to schools
            </button>
            <span className="badge rounded-pill mb-3" style={{ background: "rgba(125, 211, 252, 0.18)", color: "#e0f2fe" }}>
              {school?.code}
            </span>
            <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2.3rem, 4vw, 4rem)" }}>{school?.name}</h1>
            <p style={{ maxWidth: 760, color: "#dceaf8", fontSize: "1.02rem", lineHeight: 1.8 }}>
              {school?.description}
            </p>
            <div className="d-flex flex-wrap gap-4 mt-4">
              <div>
                <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>School organizer</div>
                <div className="fw-semibold">{school?.admin?.full_name || "Awaiting assignment"}</div>
              </div>
              <div>
                <div style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>Active events</div>
                <div className="fw-semibold">{events.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 px-lg-5 py-5">
          <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
            {bookingError ? (
              <div className="alert mb-4" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fecaca", border: "1px solid rgba(239, 68, 68, 0.35)" }}>
                {bookingError}
              </div>
            ) : null}
            <div className="row g-4">
              {events.map((event) => (
                <div key={event.id} className="col-12">
                  <div
                    className="w-100 text-start rounded-5 p-4"
                    style={{ background: "#0d1a34", color: "#fff", boxShadow: "0 18px 36px rgba(2, 6, 23, 0.22)" }}
                  >
                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
                      <div>
                        <span className="badge rounded-pill mb-3" style={{ background: "rgba(56, 189, 248, 0.16)", color: "#bae6fd", textTransform: "capitalize" }}>
                          {event.category}
                        </span>
                        <h3 className="fw-bold mb-2">{event.title}</h3>
                        <p className="mb-3" style={{ color: "#cbd5e1", lineHeight: 1.7 }}>{event.description}</p>
                        <div className="d-flex flex-wrap gap-4" style={{ color: "#e2e8f0", fontSize: "0.92rem" }}>
                          <span><i className="bi bi-calendar3 me-2 text-info"></i>{new Date(event.start_time).toLocaleString()}</span>
                          <span><i className="bi bi-geo-alt me-2 text-info"></i>{event.location}</span>
                          <span><i className="bi bi-people me-2 text-info"></i>{event.attendee_count} attending</span>
                        </div>
                      </div>
                      <div className="d-flex flex-column justify-content-between align-items-lg-end">
                        <div style={{ color: "#7dd3fc" }}>{event.spots_left} spots left</div>
                        <button
                          type="button"
                          onClick={() => handleBookEvent(event.id)}
                          disabled={bookingEventId === event.id}
                          className="btn btn-sm fw-semibold px-3 py-2 mt-2"
                          style={{
                            background: bookingEventId === event.id ? "rgba(56, 189, 248, 0.22)" : "#22c55e",
                            color: "#ecfeff",
                            border: "none",
                            borderRadius: 999,
                            minWidth: 134,
                          }}
                        >
                          {bookingEventId === event.id ? "Booking..." : "Book Event"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {bookingDialog.open ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
          style={{ background: "rgba(2, 6, 23, 0.72)", zIndex: 1200 }}
        >
          <div
            className="rounded-5 p-4 p-lg-5 text-center"
            style={{ width: "min(430px, 100%)", background: "#0d1a34", border: "1px solid rgba(34, 197, 94, 0.45)" }}
          >
            <div className="mb-3">
              <i className="bi bi-check-circle-fill" style={{ color: "#22c55e", fontSize: "3rem" }}></i>
            </div>
            <h3 className="fw-bold mb-2 text-white">
              Succesfully Booked{" "}
              <i className="bi bi-check-circle-fill" style={{ color: "#22c55e", fontSize: "1.05rem" }}></i>
            </h3>
            <p className="mb-4" style={{ color: "#cbd5e1" }}>
              {bookingDialog.title} has been added to My Events.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn fw-semibold px-4"
                onClick={() => setBookingDialog({ open: false, title: "" })}
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 999 }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn fw-semibold px-4"
                onClick={() => {
                  setBookingDialog({ open: false, title: "" });
                  navigate({ to: "/MyEventsPage" });
                }}
                style={{ background: "#22c55e", color: "#042f1a", borderRadius: 999 }}
              >
                Go to My Events
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SchoolEventsPage;
