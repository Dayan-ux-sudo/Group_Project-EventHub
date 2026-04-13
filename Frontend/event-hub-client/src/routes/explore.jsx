import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from "react";
import CategoryFilter from "../components/CategoryFilter";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { eventsAPI } from "../api";

 export const Route = createFileRoute('/explore')({
  component: ExplorePage,
})

 
function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getEvents();
        // Handle both array and paginated responses
        const eventsData = Array.isArray(response.data) ? response.data : response.data.results || [];
        setEvents(eventsData);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
 
  const filtered = events.filter((e) => {
    const matchCat = activeCategory === "ALL" || e.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
 
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#101322", color: "#f1f5f9" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#101322", color: "#f1f5f9" }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle display-4 text-danger mb-3"></i>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }
 
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#101322", color: "#f1f5f9" }}
    >
      
 
      <main className="flex-grow-1 px-3 px-lg-5 py-5">
        <div className="container-fluid" style={{ maxWidth: 1280 }}>
 
          {/* Hero */}
          <section className="text-center mb-5">
            <h1
              className="display-5 fw-extrabold text-white mb-3"
              style={{ fontWeight: 800 }}
            >
              Discover Campus Life
            </h1>
            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: 560, fontSize: "1.05rem" }}>
              Find workshops, hackathons, and social mixers happening around your campus today.
            </p>
            {/* Search bar */}
            <div className="mx-auto" style={{ maxWidth: 680 }}>
              <div
                className="d-flex align-items-center rounded-3 p-2"
                style={{
                  background: "#1e2235",
                  border: "1px solid #2a3050",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                <i className="bi bi-search text-secondary ms-2 me-2 fs-5"></i>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent text-white"
                  placeholder="Search for events, clubs, or speakers..."
                  style={{ fontSize: "1rem" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="btn btn-primary px-4 py-2 fw-semibold rounded-2"
                  style={{ background: "#1337ec", border: "none" }}
                >
                  Search
                </button>
              </div>
            </div>
          </section>
 
          {/* Category filter */}
          <section className="mb-5">
            <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          </section>
 
          {/* Upcoming Events */}
          <section>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Upcoming Events</h5>
              <a href="#" className="text-primary text-decoration-none" style={{ fontSize: "0.9rem" }}>
                View all <i className="bi bi-arrow-right"></i>
              </a>
            </div>
 
            {filtered.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x display-4 text-secondary mb-3 d-block"></i>
                <p className="text-secondary">No events found matching your search.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filtered.map((event) => (
                  <div key={event.id} className="col-12 col-sm-6 col-lg-4">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
 
      <Footer />
    </div>
  );
}
 
export default ExplorePage;
