import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { eventsAPI } from "../api";

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
  const [form, setForm] = useState({
    title: "",
    category: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const eventData = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : 100,
        is_public: true,
      };
      await eventsAPI.createEvent(eventData);
      setSubmitted(true);
    } catch (err) {
      setError("Failed to create event. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#1e2235",
    border: "1px solid #2a3050",
    color: "#f1f5f9",
    borderRadius: 8,
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#101322", color: "#f1f5f9" }}
    >
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid" style={{ maxWidth: 860 }}>

          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="mx-auto mb-3 rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 56, height: 56, background: "rgba(19,55,236,0.15)" }}
            >
              <i className="bi bi-plus-circle-fill text-primary fs-3"></i>
            </div>
            <h2 className="text-white fw-bold mb-2">Organize an Event</h2>
            <p className="text-secondary">
              Share your event with the campus community and start building your audience.
            </p>
          </div>

          {submitted ? (
            <div
              className="rounded-3 p-5 text-center"
              style={{ background: "#151929", border: "1px solid #1e2235" }}
            >
              <div
                className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 72, height: 72, background: "#10b98122" }}
              >
                <i className="bi bi-check-circle-fill text-success fs-1"></i>
              </div>
              <h4 className="text-white fw-bold mb-2">Event Created!</h4>
              <p className="text-secondary mb-4">
                Your event <strong className="text-white">"{form.title}"</strong> has been created successfully.
              </p>
              <button
                className="btn btn-primary px-5 py-2 fw-semibold me-3"
                style={{ background: "#1337ec", border: "none", borderRadius: 8 }}
                onClick={() => navigate({ to: "/explore" })}
              >
                View Events
              </button>
              <button
                className="btn btn-outline-secondary px-5 py-2 fw-semibold"
                style={{ borderRadius: 8 }}
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    title: "",
                    category: "",
                    start_time: "",
                    end_time: "",
                    location: "",
                    capacity: "",
                    description: "",
                  });
                }}
              >
                Create Another
              </button>
            </div>
          ) : (
            <div
              className="rounded-3 p-4 p-lg-5"
              style={{ background: "#151929", border: "1px solid #1e2235" }}
            >
              {error && (
                <div
                  className="rounded-3 p-3 mb-4 d-flex align-items-start gap-2"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <i className="bi bi-exclamation-circle-fill text-danger mt-1" style={{ fontSize: "0.9rem" }}></i>
                  <span className="text-danger" style={{ fontSize: "0.85rem" }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Title */}
                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      placeholder="e.g. Spring Hackathon 2024"
                      style={inputStyle}
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-12 col-md-6">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      Category *
                    </label>
                    <select
                      name="category"
                      className="form-select"
                      style={inputStyle}
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="col-12 col-md-6">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="start_time"
                      className="form-control"
                      style={inputStyle}
                      value={form.start_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div className="col-12 col-md-6">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="end_time"
                      className="form-control"
                      style={inputStyle}
                      value={form.end_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Capacity */}
                  <div className="col-12 col-md-6">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      className="form-control"
                      placeholder="e.g. 100 (0 = unlimited)"
                      style={inputStyle}
                      value={form.capacity}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Location */}
                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      Location / Venue *
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      placeholder="e.g. University Grand Hall, Block A"
                      style={inputStyle}
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows={5}
                      placeholder="Tell attendees what to expect..."
                      style={inputStyle}
                      value={form.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {/* Tips box */}
                  <div className="col-12">
                    <div
                      className="rounded-2 p-3 d-flex gap-3 align-items-start"
                      style={{ background: "rgba(19,55,236,0.1)", border: "1px solid rgba(19,55,236,0.2)" }}
                    >
                      <i className="bi bi-lightbulb-fill text-primary mt-1"></i>
                      <div>
                        <div className="text-white fw-semibold mb-1" style={{ fontSize: "0.88rem" }}>
                          Tips for a great listing
                        </div>
                        <ul className="text-secondary mb-0 ps-3" style={{ fontSize: "0.8rem", lineHeight: 1.8 }}>
                          <li>Include a catchy title that describes the event clearly</li>
                          <li>Mention any prizes, perks, or free resources</li>
                          <li>Set an accurate capacity to manage registrations</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="col-12 d-flex gap-3 justify-content-end">
                    <button
                      type="button"
                      className="btn px-4 py-2"
                      style={{
                        background: "#1e2235",
                        color: "#94a3b8",
                        border: "1px solid #2a3050",
                        borderRadius: 8,
                      }}
                    >
                      Save Draft
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-5 py-2 fw-semibold"
                      style={{ background: loading ? "#0f2aaa" : "#1337ec", border: "none", borderRadius: 8 }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Event...
                        </>
                      ) : (
                        <>
                          Publish Event <i className="bi bi-arrow-right ms-1"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HostPage;