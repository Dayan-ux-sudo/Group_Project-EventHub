import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { eventsAPI, getStoredUser } from "../api";

export const Route = createFileRoute("/HostPage")({
  component: HostPage,
});

const categoryOptions = [
  { value: "workshop", label: "Workshop" },
  { value: "hackathon", label: "Hackathon" },
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
];

function HostPage() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const search = Route.useSearch();
  const eventId =
    typeof search.eventId === "string" || typeof search.eventId === "number"
      ? String(search.eventId).trim()
      : "";
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "workshop",
    start_time: "",
    end_time: "",
    location: "",
    latitude: "",
    longitude: "",
    school: currentUser?.school?.code || "",
    capacity: 120,
    description: "",
    is_public: true,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const schoolsResponse = await eventsAPI.getSchools();
      const schoolList = Array.isArray(schoolsResponse.data) ? schoolsResponse.data : schoolsResponse.data.results || [];
      setSchools(schoolList);

      if (eventId) {
        const eventResponse = await eventsAPI.getEvent(eventId);
        const event = eventResponse.data;
        setForm({
          title: event.title,
          category: event.category,
          start_time: event.start_time.slice(0, 16),
          end_time: event.end_time.slice(0, 16),
          location: event.location || "",
          latitude: event.latitude || "",
          longitude: event.longitude || "",
          school: event.school?.code || "",
          capacity: event.capacity,
          description: event.description || "",
          is_public: event.is_public,
        });
      }
    };

    fetchData();
  }, [eventId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
      capacity: Number(form.capacity),
    };

    if (eventId) {
      await eventsAPI.updateEvent(eventId, payload);
      setMessage("Event updated successfully.");
    } else {
      await eventsAPI.createEvent(payload);
      setMessage("Event created successfully.");
    }

    setTimeout(() => navigate({ to: "/Host" }), 1000);
  };

  const directionsQuery = form.latitude && form.longitude
    ? `${form.latitude},${form.longitude}`
    : encodeURIComponent(form.location);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#071426", color: "#f8fafc" }}>
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid px-0" style={{ maxWidth: 1040 }}>
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
            <div>
              <div className="text-uppercase fw-semibold mb-2" style={{ color: "#7dd3fc", letterSpacing: "0.16em", fontSize: "0.74rem" }}>
                {eventId ? "Edit event" : "Create event"}
              </div>
              <h1 className="fw-bold mb-2">{eventId ? "Update school event" : "Publish a new school event"}</h1>
              <p className="mb-0" style={{ color: "#dbeafe" }}>
                Organizers can manage description, date and time, location with map integration, capacity, and event category for their school.
              </p>
            </div>
            <button
              type="button"
              className="btn rounded-pill px-4"
              onClick={() => navigate({ to: "/Host" })}
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
            >
              Back to dashboard
            </button>
          </div>

          <div className="rounded-5 p-4 p-lg-5" style={{ background: "#0d1a34", border: "1px solid rgba(255,255,255,0.08)" }}>
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label">Event title</label>
                  <input className="form-control" name="title" value={form.title} onChange={handleChange} required style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">School</label>
                  <select className="form-select" name="school" value={form.school} onChange={handleChange} required disabled={currentUser?.role === "organizer"} style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}>
                    <option value="">Select school</option>
                    {schools.map((school) => (
                      <option key={school.code} value={school.code}>{school.code} - {school.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" name="category" value={form.category} onChange={handleChange} required style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}>
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Start date and time</label>
                  <input type="datetime-local" className="form-control" name="start_time" value={form.start_time} onChange={handleChange} required style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">End date and time</label>
                  <input type="datetime-local" className="form-control" name="end_time" value={form.end_time} onChange={handleChange} required style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-control" name="capacity" value={form.capacity} onChange={handleChange} min="0" style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Venue or location</label>
                  <input className="form-control" name="location" value={form.location} onChange={handleChange} required style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Latitude</label>
                  <input className="form-control" name="latitude" value={form.latitude} onChange={handleChange} placeholder="-1.286389" style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Longitude</label>
                  <input className="form-control" name="longitude" value={form.longitude} onChange={handleChange} placeholder="36.817223" style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="5" name="description" value={form.description} onChange={handleChange} required style={{ background: "#10203f", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}></textarea>
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} id="is_public" />
                    <label className="form-check-label" htmlFor="is_public">Make event visible on the normal users dashboard</label>
                  </div>
                </div>

                <div className="col-12">
                  <div className="rounded-5 overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <iframe
                      title="Location preview"
                      src={`https://maps.google.com/maps?q=${directionsQuery}&z=15&output=embed`}
                      style={{ width: "100%", height: 280, border: 0 }}
                    ></iframe>
                  </div>
                </div>

                <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div style={{ color: "#7dd3fc" }}>{message}</div>
                  <button type="submit" className="btn rounded-pill px-4 py-3" style={{ background: "#38bdf8", color: "#082f49", fontWeight: 700 }}>
                    {eventId ? "Save changes" : "Publish event"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HostPage;
