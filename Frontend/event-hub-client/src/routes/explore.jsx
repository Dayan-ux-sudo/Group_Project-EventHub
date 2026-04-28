import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";

import eventHubIcon from "../assets/eventhub-icon.png";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { eventsAPI } from "../api";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, schoolsResponse] = await Promise.all([
          eventsAPI.getEvents(),
          eventsAPI.getSchools(),
        ]);
        const eventResults = Array.isArray(eventsResponse.data) ? eventsResponse.data : eventsResponse.data.results || [];
        const schoolResults = Array.isArray(schoolsResponse.data) ? schoolsResponse.data : schoolsResponse.data.results || [];
        setEvents(eventResults);
        setSchools(schoolResults);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = activeCategory === "all" || event.category === activeCategory;
      const haystack = `${event.title} ${event.description} ${event.location} ${event.school?.name || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, events, searchQuery]);

  const categories = ["all", "workshop", "social", "academic", "seminar", "hackathon", "other"];

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#071426", color: "#f8fafc" }}>
      <Navbar />

      <main className="flex-grow-1">
        <section
          className="px-3 px-lg-5 py-5"
          style={{
            background:
              `linear-gradient(135deg, rgba(5, 18, 43, 0.96), rgba(10, 39, 89, 0.88)), url(${eventHubIcon})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6% center",
            backgroundSize: "320px",
          }}
        >
          <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
            <div className="row align-items-center g-4">
              <div className="col-12 col-xl-7">
                
                <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2.4rem, 5vw, 4.4rem)", lineHeight: 1.02 }}>
                  Discover schools, events, and campus moments from one place.
                </h1>
                
              </div>
              <div className="col-12 col-xl-5">
                <div className="rounded-5 p-4" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(14px)" }}>
                  <div className="input-group input-group-lg mb-3">
                    <span className="input-group-text border-0" style={{ background: "#0f2448", color: "#7dd3fc" }}>
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 text-white"
                      placeholder="Search school events, categories, or locations"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      style={{ background: "#0f2448" }}
                    />
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className="btn btn-sm rounded-pill px-3"
                        style={{
                          background: activeCategory === category ? "#38bdf8" : "rgba(255,255,255,0.08)",
                          color: activeCategory === category ? "#082f49" : "#e0f2fe",
                          border: "1px solid rgba(255,255,255,0.12)",
                          textTransform: "capitalize",
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 px-lg-5 py-5">
          <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <div className="text-uppercase fw-semibold mb-2" style={{ color: "#7dd3fc", letterSpacing: "0.16em", fontSize: "0.74rem" }}>
                  Schools
                </div>
                <h2 className="fw-bold mb-0">Explore by school</h2>
              </div>
              <div style={{ color: "#cbd5e1" }}>{schools.length} schools live on EventHub</div>
            </div>

            <div className="row g-4">
              {schools.map((school) => (
                <div key={school.code} className="col-12 col-md-6 col-xl-4">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/SchoolEventsPage", search: { school: school.code } })}
                    className="w-100 text-start border-0 rounded-5 overflow-hidden p-0"
                    style={{
                      background: "#0b1730",
                      boxShadow: "0 18px 48px rgba(2, 6, 23, 0.25)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateY(-8px)";
                      event.currentTarget.style.boxShadow = "0 26px 54px rgba(14, 116, 144, 0.25)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0)";
                      event.currentTarget.style.boxShadow = "0 18px 48px rgba(2, 6, 23, 0.25)";
                    }}
                  >
                    <div
                      style={{
                        minHeight: 280,
                        backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.18), rgba(2,6,23,0.88)), url(${school.background_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 28,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "end",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="badge rounded-pill" style={{ background: "rgba(125, 211, 252, 0.18)", color: "#e0f2fe" }}>
                          {school.code}
                        </span>
                        <span style={{ color: "#e2e8f0", fontSize: "0.84rem" }}>{school.event_count} events</span>
                      </div>
                      <h3 className="fw-bold mb-2" style={{ fontSize: "1.4rem" }}>{school.name}</h3>
                      <p className="mb-3" style={{ color: "#dbeafe", fontSize: "0.92rem", lineHeight: 1.7 }}>
                        {school.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div style={{ color: "#7dd3fc", fontSize: "0.78rem" }}>Organizer</div>
                          <div className="fw-semibold text-white">{school.admin?.full_name || "Awaiting assignment"}</div>
                        </div>
                        <span className="text-white fw-semibold">
                          View events <i className="bi bi-arrow-right-short"></i>
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-3 px-lg-5 pb-5">
          <div className="container-fluid px-0" style={{ maxWidth: 1280 }}>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <div className="text-uppercase fw-semibold mb-2" style={{ color: "#7dd3fc", letterSpacing: "0.16em", fontSize: "0.74rem" }}>
                  Live Events
                </div>
              
              </div>
              <div style={{ color: "#cbd5e1" }}>{filteredEvents.length} matching events</div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-info"></div>
              </div>
            ) : (
              <div className="row g-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="col-12 col-md-6 col-xl-4">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ExplorePage;
