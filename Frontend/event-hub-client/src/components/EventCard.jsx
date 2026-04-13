import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
 
const categoryColors = {
  workshop: { bg: "#1337ec", text: "#fff" },
  hackathon: { bg: "#f59e0b", text: "#fff" },
  social: { bg: "#0ea5e9", text: "#fff" },
  academic: { bg: "#8b5cf6", text: "#fff" },
  seminar: { bg: "#10b981", text: "#fff" },
  other: { bg: "#555", text: "#fff" },
};
 
function EventCard({ event }) {
  const [liked, setLiked] = useState(false); // Backend doesn't have liked, so default false
  const navigate = useNavigate();
  const cat = categoryColors[event.category] || { bg: "#555", text: "#fff" };
 
  // Format date and time
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
 
  return (
    <div
      className="card h-100 border-0 rounded-3 overflow-hidden"
      style={{
        background: "#151929",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onClick={() => navigate({ to: "/event/$id", params: { id: String(event.id) } })}
    >
      {/* Placeholder for image - backend doesn't have image */}
      <div className="position-relative" style={{ height: 180, background: "#1e2235" }}>
        <div className="d-flex align-items-center justify-content-center h-100">
          <i className="bi bi-calendar-event text-secondary" style={{ fontSize: "3rem" }}></i>
        </div>
        {event.is_upcoming && (
          <span
            className="position-absolute top-0 start-0 m-2 badge text-uppercase"
            style={{ background: "#1337ec", fontSize: "0.65rem", letterSpacing: 1 }}
          >
            Upcoming
          </span>
        )}
        <button
          className="position-absolute top-0 end-0 m-2 btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
          style={{
            width: 34,
            height: 34,
            background: liked ? "rgba(239,68,68,0.9)" : "rgba(30,34,53,0.85)",
            border: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
        >
          <i
            className={`bi ${liked ? "bi-heart-fill" : "bi-heart"} text-white`}
            style={{ fontSize: "0.85rem" }}
          ></i>
        </button>
      </div>
 
      {/* Body */}
      <div className="card-body px-3 pt-3 pb-2">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span
            className="badge text-uppercase"
            style={{
              background: cat.bg,
              color: cat.text,
              fontSize: "0.6rem",
              letterSpacing: 1,
            }}
          >
            {event.category}
          </span>
          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
            {dateStr} &bull; {timeStr}
          </span>
        </div>
        <h6 className="card-title text-white fw-bold mb-1">{event.title}</h6>
        <p
          className="card-text text-secondary mb-3"
          style={{ fontSize: "0.82rem", lineHeight: 1.5 }}
        >
          {event.description}
        </p>
      </div>
 
      {/* Footer */}
      <div className="card-footer border-0 bg-transparent px-3 pb-3 pt-0 d-flex justify-content-between align-items-center">
        <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
          <i className="bi bi-geo-alt"></i> {event.location || 'TBD'}
        </span>
        <span
          className="text-primary fw-semibold d-flex align-items-center gap-1"
          style={{ fontSize: "0.82rem" }}
        >
          Details <i className="bi bi-chevron-right" style={{ fontSize: "0.7rem" }}></i>
        </span>
      </div>
    </div>
  );
}
 
export default EventCard;
