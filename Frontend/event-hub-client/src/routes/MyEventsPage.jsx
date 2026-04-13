import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/MyEventsPage")({
  component: MyEventsPage,
});
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import events from "../components/EventsData";

const tabs = ["Upcoming", "Past", "Saved"];

function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const navigate = useNavigate();

  // For demo: upcoming = first 3, saved = last 2
  const upcoming = events.slice(0, 3);
  const past = events.slice(3, 5);
  const saved = events.slice(4);

  const displayed =
    activeTab === "Upcoming" ? upcoming : activeTab === "Past" ? past : saved;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#101322", color: "#f1f5f9" }}
    >
      <Navbar />

      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid" style={{ maxWidth: 1280 }}>

          {/* Page header */}
          <div className="mb-4">
            <h2 className="text-white fw-bold mb-1">My Events</h2>
            <p className="text-secondary">Track your registrations, saved events, and history.</p>
          </div>

          {/* Stats row */}
          <div className="row g-3 mb-5">
            {[
              { label: "Upcoming", value: upcoming.length, icon: "bi-calendar-check", color: "#1337ec" },
              { label: "Attended", value: past.length, icon: "bi-check2-circle", color: "#10b981" },
              { label: "Saved", value: saved.length, icon: "bi-heart-fill", color: "#ef4444" },
            ].map((stat) => (
              <div key={stat.label} className="col-6 col-md-4 col-lg-3">
                <div
                  className="rounded-3 p-3 d-flex align-items-center gap-3"
                  style={{ background: "#151929", border: "1px solid #1e2235" }}
                >
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      background: `${stat.color}22`,
                    }}
                  >
                    <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: "1.2rem" }}></i>
                  </div>
                  <div>
                    <div className="text-white fw-bold fs-4 lh-1">{stat.value}</div>
                    <div className="text-secondary" style={{ fontSize: "0.8rem" }}>{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            className="d-flex gap-1 mb-4 rounded-2 p-1"
            style={{ background: "#151929", width: "fit-content" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                className="btn btn-sm px-4 py-2 rounded-2"
                style={{
                  background: activeTab === tab ? "#1337ec" : "transparent",
                  color: activeTab === tab ? "#fff" : "#94a3b8",
                  border: "none",
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Events list */}
          <div className="d-flex flex-column gap-3">
            {displayed.map((event) => (
              <div
                key={event.id}
                className="rounded-3 p-3 d-flex flex-column flex-sm-row gap-3 align-items-start align-items-sm-center"
                style={{
                  background: "#151929",
                  border: "1px solid #1e2235",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1337ec55")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2235")}
                onClick={() => navigate({ to: "/event/$id", params: { id: String(event.id) } })}
              >
                {/* Thumbnail */}
                <div
                  className="rounded-2 overflow-hidden flex-shrink-0"
                  style={{ width: 80, height: 80 }}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="badge text-uppercase"
                      style={{ background: "#1337ec22", color: "#7ea4ff", fontSize: "0.6rem", letterSpacing: 1 }}
                    >
                      {event.category}
                    </span>
                    <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
                      {event.date} &bull; {event.time}
                    </span>
                  </div>
                  <h6 className="text-white fw-semibold mb-1">{event.title}</h6>
                  <div className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
                    <i className="bi bi-geo-alt"></i> {event.location}
                  </div>
                </div>

                {/* Action */}
                <div className="d-flex gap-2 flex-shrink-0">
                  {activeTab === "Upcoming" && (
                    <span
                      className="badge d-flex align-items-center gap-1"
                      style={{ background: "#10b98122", color: "#10b981", fontSize: "0.75rem", padding: "6px 12px" }}
                    >
                      <i className="bi bi-check-circle-fill"></i> Registered
                    </span>
                  )}
                  <button
                    className="btn btn-sm"
                    style={{
                      background: "#1e2235",
                      color: "#94a3b8",
                      border: "none",
                      fontSize: "0.8rem",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: "/event/$id", params: { id: String(event.id) } });
                    }}
                  >
                    View <i className="bi bi-chevron-right"></i>
                  </button>
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